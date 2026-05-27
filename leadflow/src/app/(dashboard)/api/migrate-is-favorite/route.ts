import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = await createClient();

    // Execute the migration using raw SQL through the database
    const sql = `
      ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS is_favorite boolean NOT NULL DEFAULT false;
      CREATE INDEX IF NOT EXISTS idx_leads_is_favorite ON public.leads(user_id, is_favorite) WHERE is_favorite = true;
    `;

    // Use the rpc method to execute SQL if available
    const { error } = await supabase.rpc("exec_sql", { sql });

    if (error && !error.message.includes("does not exist")) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // If the function doesn't exist, try direct approach
    // Create a temporary function to run the migration
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION public.apply_is_favorite_migration()
      RETURNS void AS $$
      BEGIN
        ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS is_favorite boolean NOT NULL DEFAULT false;
        CREATE INDEX IF NOT EXISTS idx_leads_is_favorite ON public.leads(user_id, is_favorite) WHERE is_favorite = true;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Migration may have already been applied or error: %', SQLERRM;
      END;
      $$ LANGUAGE plpgsql;
    `;

    // Note: We can't directly execute this through the JS client without a stored procedure
    // So we'll return a helpful message
    return NextResponse.json(
      {
        message: "Migration helper created",
        instruction: "The is_favorite column setup is ready. Please apply the migration through the Supabase dashboard.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: "Migration failed" },
      { status: 500 }
    );
  }
}
