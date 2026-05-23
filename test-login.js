import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://uhibnzahdqnjwtvooqpv.supabase.co';
const supabaseKey = 'sb_publishable_zh0Jny_zztzTQX0rFz8ynQ_OutF_DC3';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'haste6inertia@gmail.com',
    password: 'Diamond@678',
  });
  console.log("Error:", error?.message);
  console.log("Data:", data.user ? "Success" : "Failed");
}
main();
