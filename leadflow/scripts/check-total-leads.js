const { createClient } = require('@supabase/supabase-js');

async function check() {
  const supabase = createClient(
    'https://hodknhnqgaypyaflxcef.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvZGtuaG5xZ2F5cHlhZmx4Y2VmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTcwODI2NywiZXhwIjoyMDk1Mjg0MjY3fQ.31Kqz5IMMOKYq1EJxDJyiSqg0xHH2E5bJ0cD8xodPO0'
  );

  console.log('🔍 Checking database...\n');

  // Total leads
  const { count: totalCount } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true });

  console.log(`📊 Total leads in database: ${totalCount}`);

  // Leads by source
  const { data: bySource } = await supabase
    .from('leads')
    .select('source');

  const sources = {};
  for (const lead of bySource || []) {
    sources[lead.source] = (sources[lead.source] || 0) + 1;
  }

  console.log('\n📊 Breakdown by source:');
  for (const [source, count] of Object.entries(sources).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${source}: ${count}`);
  }

  // Check leadhunter leads
  const { count: leadhunterCount } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('source', 'leadhunter');

  console.log(`\n✅ LeadHunter leads: ${leadhunterCount}`);

  // Show last 5 imported
  const { data: recent } = await supabase
    .from('leads')
    .select('first_name, last_name, source, created_at')
    .eq('source', 'leadhunter')
    .order('created_at', { ascending: false })
    .limit(5);

  if (recent && recent.length > 0) {
    console.log('\n📋 Recent imported leads:');
    for (const lead of recent) {
      console.log(`   ${lead.first_name} ${lead.last_name}`);
    }
  }
}

check();
