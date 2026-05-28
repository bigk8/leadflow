const { createClient } = require('@supabase/supabase-js');

async function check() {
  const supabase = createClient(
    'https://hodknhnqgaypyaflxcef.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvZGtuaG5xZ2F5cHlhZmx4Y2VmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTcwODI2NywiZXhwIjoyMDk1Mjg0MjY3fQ.31Kqz5IMMOKYq1EJxDJyiSqg0xHH2E5bJ0cD8xodPO0'
  );

  console.log('🔍 Checking user and RLS...\n');

  // Get all users
  const { data: users } = await supabase.auth.admin.listUsers();
  console.log('📋 Users in database:');
  for (const user of users.users) {
    console.log(`   ${user.email}: ${user.id}`);
  }

  // Check leads by user_id
  console.log('\n📊 Leads by user_id:');
  const { data: leadsByUser } = await supabase
    .from('leads')
    .select('user_id')
    .select();

  const userLeads = {};
  for (const lead of leadsByUser || []) {
    userLeads[lead.user_id] = (userLeads[lead.user_id] || 0) + 1;
  }

  for (const [userId, count] of Object.entries(userLeads)) {
    const user = users.users.find(u => u.id === userId);
    console.log(`   ${user?.email || userId}: ${count} leads`);
  }

  // Check imported leads user_id
  console.log('\n✅ LeadHunter imported leads:');
  const { data: imported } = await supabase
    .from('leads')
    .select('user_id, first_name')
    .eq('source', 'leadhunter')
    .limit(1);

  if (imported && imported.length > 0) {
    console.log(`   First imported lead user_id: ${imported[0].user_id}`);
    const importedUser = users.users.find(u => u.id === imported[0].user_id);
    console.log(`   User: ${importedUser?.email}`);
  }
}

check();
