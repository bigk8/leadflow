const { createClient } = require('@supabase/supabase-js');

async function check() {
  const supabase = createClient(
    'https://hodknhnqgaypyaflxcef.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvZGtuaG5xZ2F5cHlhZmx4Y2VmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTcwODI2NywiZXhwIjoyMDk1Mjg0MjY3fQ.31Kqz5IMMOKYq1EJxDJyiSqg0xHH2E5bJ0cD8xodPO0'
  );

  console.log('\n📊 בדיקת סטטוס Irrelevant:\n');

  // Count irrelevant
  const { data: irrelevant } = await supabase
    .from('leads')
    .select('id', { count: 'exact' })
    .eq('is_irrelevant', true);

  console.log(`✓ ליידים עם is_irrelevant = true: ${irrelevant?.length || 0}`);

  // Count all
  const { data: all } = await supabase
    .from('leads')
    .select('id', { count: 'exact' });

  console.log(`✓ סה"כ ליידים: ${all?.length || 0}`);

  // Check first few irrelevant if they exist
  if (irrelevant && irrelevant.length > 0) {
    console.log(`\n✓ דוגמה של ליידים לא רלוונטיים:`);
    console.log(irrelevant.slice(0, 5).map(l => l.id));
  }
}

check();
