const urls = [
  'https://urybvljsmrnwmfjcgdtvt.supabase.co',
  'https://urybvljsmrnwmfjcgdtvt.supabase.co',
  'https://urybvljsmrnwmfjcgdv.supabase.co',
  'https://urybvljsmrnwmfjcgdt.supabase.co',
  'https://urybvljsmrwxmlfjcgdt.supabase.co',
  'https://urybvljsmrnwmfjcgdvt.supabase.co',
  'https://urybvljsmrnwmfjcgdvt.supabase.co'
];

async function check() {
  for (const url of urls) {
    try {
      const res = await fetch(url);
      console.log(url, "=>", res.status);
    } catch (e) {
      console.log(url, "=>", e.message);
    }
  }
}
check();
