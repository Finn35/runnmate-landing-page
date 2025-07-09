#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 RUNNMATE Analytics Environment Setup');
console.log('=====================================\n');

const envPath = path.join(__dirname, '.env.local');

// Check if .env.local already exists
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists. Backing it up...');
  fs.copyFileSync(envPath, `${envPath}.backup`);
  console.log('✅ Backup created as .env.local.backup\n');
}

const envTemplate = `# Supabase Configuration
# 🔗 Get these from: https://supabase.com/dashboard/project/[your-project]/settings/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Analytics PIN (change this for security!)
ANALYTICS_PIN=1234

# Email Configuration (optional)
RESEND_API_KEY=your_resend_api_key_here

# Strava API Configuration (optional)
STRAVA_CLIENT_ID=your_strava_client_id_here
STRAVA_CLIENT_SECRET=your_strava_client_secret_here
`;

// Write the template
fs.writeFileSync(envPath, envTemplate);

console.log('✅ Created .env.local template file\n');

console.log('📋 NEXT STEPS:');
console.log('==============');
console.log('1. Open your Supabase dashboard: https://supabase.com/dashboard');
console.log('2. Select your project');
console.log('3. Go to Settings → API');
console.log('4. Copy the following values:\n');

console.log('   📄 Project URL → NEXT_PUBLIC_SUPABASE_URL');
console.log('   🔑 anon public key → NEXT_PUBLIC_SUPABASE_ANON_KEY');
console.log('   🔐 service_role secret key → SUPABASE_SERVICE_ROLE_KEY\n');

console.log('5. Edit .env.local and replace the placeholder values');
console.log('6. Change ANALYTICS_PIN from 1234 to something secure');
console.log('7. Restart your dev server: npm run dev\n');

console.log('🎯 Then visit: http://localhost:3000/analytics');
console.log('🔐 Enter your PIN to access the analytics dashboard\n');

console.log('Need help? The template file is ready at: .env.local'); 