// Debug script to test Supabase connection
const fs = require('fs');

console.log('🔍 Debugging Supabase Connection\n');

// Check environment file
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  console.log('📁 Environment file content:');
  console.log('---');
  
  // Show env vars but mask sensitive parts
  const lines = envContent.split('\n');
  lines.forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (value) {
        const maskedValue = value.length > 10 ? 
          value.substring(0, 10) + '...' + value.slice(-4) : 
          value;
        console.log(`${key}=${maskedValue}`);
      }
    }
  });
  console.log('---\n');
  
  // Check URL format
  const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
  if (urlMatch) {
    const url = urlMatch[1].trim();
    console.log('🌐 Supabase URL Check:');
    console.log(`URL: ${url}`);
    console.log(`✅ Starts with https: ${url.startsWith('https://')}`);
    console.log(`✅ Contains supabase.co: ${url.includes('supabase.co')}`);
    console.log(`✅ Proper format: ${/^https:\/\/[a-z]+\.supabase\.co$/.test(url)}\n`);
  }
  
  // Check key format
  const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/);
  if (keyMatch) {
    const key = keyMatch[1].trim();
    console.log('🔑 Supabase Key Check:');
    console.log(`Key length: ${key.length} characters`);
    console.log(`✅ Proper length: ${key.length > 100}`);
    console.log(`✅ Starts with 'eyJ': ${key.startsWith('eyJ')}\n`);
  }
  
} else {
  console.log('❌ .env.local file not found!\n');
}

console.log('🔧 Troubleshooting Steps:');
console.log('1. Verify Supabase project is active');
console.log('2. Check API keys are correct');
console.log('3. Ensure database schema is created');
console.log('4. Try restarting the dev server');
console.log('\n💡 Common fixes:');
console.log('- Copy fresh API keys from Supabase dashboard');
console.log('- Ensure no extra spaces in .env.local');
console.log('- Check Supabase project status');
console.log('- Run database-schema.sql again');
