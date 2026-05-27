import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Execute the migration SQL
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS is_favorite boolean NOT NULL DEFAULT false;
        CREATE INDEX IF NOT EXISTS idx_leads_is_favorite ON public.leads(user_id, is_favorite) WHERE is_favorite = true;
      `
    })

    if (error && !error.message.includes('does not exist')) {
      throw error
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Migration applied successfully'
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (err) {
    console.error('Migration error:', err)
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
