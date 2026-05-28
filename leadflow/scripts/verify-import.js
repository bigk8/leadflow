const { createClient } = require('@supabase/supabase-js');

async function verify() {
  const supabase = createClient(
    'https://hodknhnqgaypyaflxcef.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvZGtuaG5xZ2F5cHlhZmx4Y2VmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTcwODI2NywiZXhwIjoyMDk1Mjg0MjY3fQ.31Kqz5IMMOKYq1EJxDJyiSqg0xHH2E5bJ0cD8xodPO0'
  );

  const { data } = await supabase
    .from('leads')
    .select('position, status, priority')
    .eq('source', 'leadhunter');

  console.log('\n📊 IMPORT VERIFICATION\n');
  console.log(`✅ Total leads imported: ${data.length}\n`);

  const byPosition = {};
  const byStatus = {};
  const byPriority = {};

  for (const lead of data) {
    byPosition[lead.position] = (byPosition[lead.position] || 0) + 1;
    byStatus[lead.status] = (byStatus[lead.status] || 0) + 1;
    byPriority[lead.priority] = (byPriority[lead.priority] || 0) + 1;
  }

  console.log('📋 By Position:');
  for (const [pos, count] of Object.entries(byPosition)) {
    console.log(`   ${pos}: ${count}`);
  }

  console.log('\n🏷️  By Status:');
  for (const [status, count] of Object.entries(byStatus)) {
    console.log(`   ${status}: ${count}`);
  }

  console.log('\n⭐ By Priority:');
  for (const [priority, count] of Object.entries(byPriority)) {
    console.log(`   ${priority}: ${count}`);
  }

  console.log('\n✨ All leads ready in database!\n');
}

verify();
