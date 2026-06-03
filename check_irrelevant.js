const { createClient } = require('@supabase/supabase-js');

async function check() {
  const supabase = createClient(
    'https://hodknhnqgaypyaflxcef.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvZGtuaG5xZ2F5cHlhZmx4Y2VmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTcwODI2NywiZXhwIjoyMDk1Mjg0MjY3fQ.31Kqz5IMMOKYq1EJxDJyiSqg0xHH2E5bJ0cD8xodPO0'
  );

  const { data, error } = await supabase
    .from('leads')
    .select('id, is_irrelevant')
    .eq('is_irrelevant', true);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log(`Total irrelevant leads in DB: ${data?.length || 0}`);
    if (data && data.length > 0) {
      console.log(`Sample IDs:`, data.slice(0, 5).map(l => l.id));
    }
  }
}

check();
