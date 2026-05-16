require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function getAllTables() {
  const { data, error } = await supabase.rpc('get_tables'); // Or query information_schema if possible
  // Using direct query to fetch tables in public schema
  const { data: tableData, error: tableError } = await supabase
    .from('ngetem_history')
    .select('*')
    .limit(1);
    
  if (tableError) {
    console.log("Table 'ngetem_history' does not exist or error:", tableError);
  } else {
    console.log("Table 'ngetem_history' exists:", tableData);
  }
}
getAllTables();
