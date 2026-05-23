import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uhibnzahdqnjwtvooqpv.supabase.co';
const supabaseKey = 'sb_publishable_zh0Jny_zztzTQX0rFz8ynQ_OutF_DC3';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createDemoUser() {
  const { data, error } = await supabase.auth.signUp({
    email: 'reviewer@razorpay.com',
    password: 'RazorpayDemo123!',
    options: {
      data: {
        full_name: 'Razorpay Reviewer',
        phone: '9876543210',
        flat: '101',
        building: 'Razorpay Verification',
        street: 'Main Road',
        address: 'Razorpay Verification, Main Road, Dombivli East, Kalyan',
        role: 'customer'
      }
    }
  });

  if (error) {
    console.error('Error creating user:', error.message);
  } else {
    console.log('✅ Demo user created successfully!');
    console.log('Email:', data.user.email);
  }
}

createDemoUser();
