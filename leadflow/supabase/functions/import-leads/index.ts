import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LeadData {
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string;
  company: string | null;
  position: string;
  website: string | null;
  status: string;
  priority: string;
  source: string;
  deal_value: number | null;
  notes: string;
  is_favorite: boolean;
  is_irrelevant: boolean;
}

async function importLeads(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase configuration" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth token
    const token = authHeader.split(" ")[1];
    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Invalid authorization token" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { leads } = body;

    if (!Array.isArray(leads) || leads.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid leads data" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Prepare leads for insertion with user_id
    const leadsToInsert = leads.map((lead: any) => ({
      user_id: user.id,
      first_name: lead.first_name,
      last_name: lead.last_name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      position: lead.position,
      website: lead.website,
      status: lead.status || "new",
      priority: lead.priority || "medium",
      source: lead.source || "leadhunter",
      deal_value: lead.deal_value,
      notes: lead.notes,
      is_favorite: false,
      is_irrelevant: false,
    }));

    // Batch insert in chunks of 100 to avoid payload size limits
    const chunkSize = 100;
    let totalInserted = 0;
    let errors = [];

    for (let i = 0; i < leadsToInsert.length; i += chunkSize) {
      const chunk = leadsToInsert.slice(i, i + chunkSize);

      const { data, error } = await supabase
        .from("leads")
        .insert(chunk)
        .select();

      if (error) {
        errors.push(`Chunk ${Math.floor(i / chunkSize) + 1}: ${error.message}`);
      } else {
        totalInserted += data?.length || 0;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Imported ${totalInserted} leads`,
        total: leadsToInsert.length,
        inserted: totalInserted,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
}

serve(importLeads);
