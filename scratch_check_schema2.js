const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('c:\\Users\\diena\\Desktop\\Temu Kopling\\temu-kopling\\.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key) env[key.trim()] = values.join('=').trim().replace(/['"]/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('profiles').select('*').limit(5);
  console.log('Profiles:', data);
  console.log('Error:', error);
}

check();
