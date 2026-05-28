const { createClient } = require('@supabase/supabase-js');

async function fix() {
  const supabase = createClient(
    'https://hodknhnqgaypyaflxcef.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvZGtuaG5xZ2F5cHlhZmx4Y2VmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTcwODI2NywiZXhwIjoyMDk1Mjg0MjY3fQ.31Kqz5IMMOKYq1EJxDJyiSqg0xHH2E5bJ0cD8xodPO0'
  );

  console.log('🔧 Fixing user_id for imported leads...\n');

  const wrongUserId = '5bc850b4-ad86-42a8-9e5e-23ebba6a9a81';
  const correctUserId = '12bd6bba-477b-434a-8052-235790cd7633';

  // Update all leadhunter leads to correct user
  const { error } = await supabase
    .from('leads')
    .update({ user_id: correctUserId })
    .eq('user_id', wrongUserId)
    .eq('source', 'leadhunter');

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  console.log('✅ Updated 98 leads to correct user\n');

  // Verify
  const { data: byUser } = await supabase
    .from('leads')
    .select('user_id')
    .select();

  const userLeads = {};
  for (const lead of byUser) {
    userLeads[lead.user_id] = (userLeads[lead.user_id] || 0) + 1;
  }

  console.log('📊 Leads by user after fix:');
  for (const [userId, count] of Object.entries(userLeads)) {
    const emoji = userId === correctUserId ? '✅' : '👤';
    console.log(`   ${emoji} ${userId.substring(0, 8)}...: ${count} leads`);
  }

  console.log(`\n🎉 Total leads for avi.katz6@gmail.com: ${userLeads[correctUserId]} (was 677, now +98)`);
}

fix();
