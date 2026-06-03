const { createClient } = require('@supabase/supabase-js');

async function find() {
  const supabase = createClient(
    'https://hodknhnqgaypyaflxcef.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvZGtuaG5xZ2F5cHlhZmx4Y2VmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTcwODI2NywiZXhwIjoyMDk1Mjg0MjY3fQ.31Kqz5IMMOKYq1EJxDJyiSqg0xHH2E5bJ0cD8xodPO0'
  );

  console.log('\n🔍 חיפוש אחרי ליידים שסומנו:\n');

  // Look for leads that might have been marked
  const { data, count } = await supabase
    .from('leads')
    .select('id, first_name, last_name, is_irrelevant', { count: 'exact' })
    .limit(10);

  console.log(`סה"כ ליידים: ${count}`);
  console.log(`דוגמה של 10 ליידים ראשונים:`);
  
  if (data) {
    data.forEach(lead => {
      console.log(`  - ${lead.first_name} ${lead.last_name} | is_irrelevant: ${lead.is_irrelevant}`);
    });
  }
}

find();
