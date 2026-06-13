import { createClient } from '@supabase/supabase-js';

const url = 'https://urybvljsmrwxmlfjcgdt.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyeWJ2bGpzbXJ3eG1mamNnZHZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyMjE2NDQsImV4cCI6MjA5Njc5NzY0NH0.BKWi57iNQiE9CBFsBMyWYmElYxA_JN0Z1tKl3HQNTYc';

const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'albertassi.pixel@gmail.com',
    password: 'password123'
  });
  console.log("Response:", data, error);
}
test();
