const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96bWV6bmFweXl3eXJ3c293ZnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyMjEwNTEsImV4cCI6MjA5Njc5NzA1MX0.5iaieyY0qOuPhtEdbw_HWisChjXkX4jMMdueFb4BZDc';
const payloadBase64 = jwt.split('.')[1];
const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8'));
console.log("URL:", `https://${payload.ref}.supabase.co`);
