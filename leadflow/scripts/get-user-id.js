#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

async function getUserId() {
  console.log('🔐 LeadFlow User ID Lookup\n');

  try {
    // Read .env.local
    const envPath = path.join(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) {
      console.error('❌ .env.local not found');
      process.exit(1);
    }

    const envContent = fs.readFileSync(envPath, 'utf-8');
    const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=([^\n]+)/);

    if (!urlMatch) {
      console.error('❌ SUPABASE_URL not found in .env.local');
      process.exit(1);
    }

    const supabaseUrl = urlMatch[1];
    console.log(`📍 Supabase Project: ${supabaseUrl}`);
    console.log('\n🔍 To get your user ID, you have 3 options:\n');

    console.log('Option 1️⃣  - Browser Console (EASIEST - 30 seconds)');
    console.log('─'.repeat(60));
    console.log('1. Open your LeadFlow app in browser');
    console.log('2. Press F12 to open Developer Tools');
    console.log('3. Go to "Console" tab');
    console.log('4. Paste this and press Enter:');
    console.log('   JSON.parse(localStorage.getItem("sb-leadflow-auth-token")).user.id');
    console.log('5. Copy the UUID shown\n');

    console.log('Option 2️⃣  - Supabase Dashboard');
    console.log('─'.repeat(60));
    console.log('1. Go to: ' + supabaseUrl);
    console.log('2. Click "Authentication" in sidebar');
    console.log('3. Click "Users" tab');
    console.log('4. Find your email address');
    console.log('5. Copy the "ID" column\n');

    console.log('Option 3️⃣  - Database Query');
    console.log('─'.repeat(60));
    console.log('1. Go to Supabase Dashboard → SQL Editor');
    console.log('2. Create new query and run:');
    console.log('   SELECT id, email FROM auth.users LIMIT 5;');
    console.log('3. Find your email and copy the ID\n');

    console.log('─'.repeat(60));
    console.log('Once you have your ID:\n');

    console.log('📝 Edit the SQL file:');
    console.log('   1. Open: scripts/import-leads.sql');
    console.log('   2. Find & Replace: YOUR_USER_ID → your-actual-id-here');
    console.log('   3. Paste into Supabase SQL Editor');
    console.log('   4. Click Run\n');

    console.log('💡 Or use sed to auto-replace (Mac/Linux):');
    console.log('   sed -i "" "s/YOUR_USER_ID/your-id-here/g" scripts/import-leads.sql\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

getUserId();
