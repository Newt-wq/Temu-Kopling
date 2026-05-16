require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkSchema() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Profiles columns:");
    if (data.length > 0) {
      console.log(Object.keys(data[0]));
    } else {
      console.log("Table is empty, trying to insert dummy and fail to see error schema");
      const { error: insertError } = await supabase.from('profiles').insert([{ id: 'dummy' }]);
      console.log("Insert error details:", insertError);
    }
  }
}

checkSchema();
