// Simple test script to verify setup
const fs = require('fs');
const path = require('path');

console.log('🔍 CryptoEarn Pro - Setup Verification\n');

// Check if required files exist
const requiredFiles = [
  '.env.local',
  'src/app/layout.tsx',
  'src/contexts/AuthContext.tsx',
  'src/lib/supabase.ts',
  'database-schema.sql'
];

console.log('📁 Checking required files...');
requiredFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
  }
});

// Check package.json dependencies
console.log('\n📦 Checking dependencies...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = [
  '@supabase/supabase-js',
  '@supabase/auth-helpers-nextjs',
  'lucide-react',
  'recharts',
  'class-variance-authority'
];

requiredDeps.forEach(dep => {
  if (packageJson.dependencies[dep]) {
    console.log(`✅ ${dep} - ${packageJson.dependencies[dep]}`);
  } else {
    console.log(`❌ ${dep} - MISSING`);
  }
});

// Check environment variables
console.log('\n🔐 Checking environment setup...');
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL');
  const hasSupabaseKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  
  console.log(`✅ .env.local exists`);
  console.log(`${hasSupabaseUrl ? '✅' : '❌'} NEXT_PUBLIC_SUPABASE_URL`);
  console.log(`${hasSupabaseKey ? '✅' : '❌'} NEXT_PUBLIC_SUPABASE_ANON_KEY`);
} else {
  console.log('❌ .env.local file missing');
  console.log('   Create it from env-template.txt');
}

console.log('\n🚀 Ready to start?');
console.log('If all items above are ✅, run: npm run dev');
console.log('Then open: http://localhost:3000\n');
