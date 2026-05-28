#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

// Transform lead data to database schema
function transformLead(lead, userId, type) {
  // Split name into first and last name
  const nameParts = lead.name.trim().split(/\s+/);
  let firstName, lastName;

  if (nameParts.length === 1) {
    firstName = nameParts[0];
    lastName = '';
  } else {
    // Last part is the last name, everything else is first name
    lastName = nameParts[nameParts.length - 1];
    firstName = nameParts.slice(0, -1).join(' ');
  }

  // Map score to priority
  let priority = 'medium';
  if (lead.score >= 10) {
    priority = 'critical';
  } else if (lead.score >= 9) {
    priority = 'high';
  } else if (lead.score >= 8) {
    priority = 'medium';
  } else {
    priority = 'low';
  }

  // Combine notes with spec and reviews
  const combinedNotes = [
    lead.notes,
    lead.spec && `תחום: ${lead.spec}`,
    lead.reviews && `ביקורות: ${lead.reviews}`,
    lead.address && `כתובת: ${lead.address}`
  ].filter(Boolean).join('\n');

  return {
    first_name: firstName,
    last_name: lastName,
    email: null,
    phone: lead.phone,
    company: null,
    position: type === 'accountant' ? 'רו"ח' : 'טכנאי מזגנים',
    website: lead.sourceUrl || null,
    status: 'new',
    priority: priority,
    source: 'leadhunter',
    deal_value: null,
    notes: combinedNotes,
    is_favorite: false,
    is_irrelevant: false
  };
}

async function uploadLeads() {
  try {
    console.log('🚀 Lead Upload Tool\n');

    // Read extracted leads
    const extractedPath = path.join(process.cwd(), 'scripts/extracted-leads.json');
    if (!fs.existsSync(extractedPath)) {
      console.error('❌ Error: extracted-leads.json not found. Run: node scripts/import-leads.js');
      process.exit(1);
    }

    const extractedLeads = JSON.parse(fs.readFileSync(extractedPath, 'utf-8'));
    console.log(`📊 Loaded ${extractedLeads.length} leads from extracted file\n`);

    // Get Supabase configuration
    const envPath = path.join(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) {
      console.error('❌ Error: .env.local not found');
      process.exit(1);
    }

    const envContent = fs.readFileSync(envPath, 'utf-8');
    const supabaseUrlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=([^\n]+)/);
    const anonKeyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=([^\n]+)/);

    if (!supabaseUrlMatch || !anonKeyMatch) {
      console.error('❌ Error: Missing Supabase configuration in .env.local');
      process.exit(1);
    }

    const supabaseUrl = supabaseUrlMatch[1];
    const anonKey = anonKeyMatch[1];

    console.log(`📝 Configuration loaded`);
    console.log(`  - Supabase URL: ${supabaseUrl.substring(0, 20)}...`);
    console.log(`  - Leads to upload: ${extractedLeads.length}`);
    console.log(`    - Accountants: ${extractedLeads.filter(l => l.type === 'accountant').length}`);
    console.log(`    - HVAC Technicians: ${extractedLeads.filter(l => l.type === 'hvac').length}\n`);

    // Prompt for authentication
    console.log('📌 You need to provide an authentication token to upload leads.');
    console.log('   Go to: ', supabaseUrl + '/auth/v1/verify');
    console.log('   Or use your existing Supabase session token\n');

    const token = await ask('🔑 Enter your Supabase/LeadFlow authentication token (or press Enter to use browser session): ');

    if (!token) {
      console.log('\n💡 Since no token provided, you will need to upload via the web interface.');
      console.log('   Transformed leads have been saved to scripts/extracted-leads.json\n');

      // Save transformed data
      const transformed = extractedLeads.map(lead =>
        transformLead(lead, 'USER_ID', lead.type)
      );

      fs.writeFileSync(
        path.join(process.cwd(), 'scripts/transformed-leads.json'),
        JSON.stringify(transformed, null, 2)
      );

      console.log('✅ Transformed leads saved to scripts/transformed-leads.json');
      console.log('   You can now copy this data to import via the LeadFlow dashboard.');
      rl.close();
      return;
    }

    console.log('\n⏳ Uploading leads...');

    // Transform leads
    const transformed = extractedLeads.map(lead =>
      transformLead(lead, 'USER_ID', lead.type)
    );

    // Call import function
    const importResponse = await fetch(`${supabaseUrl}/functions/v1/import-leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ leads: transformed })
    });

    if (!importResponse.ok) {
      const errorData = await importResponse.text();
      throw new Error(`Import failed: ${importResponse.status} - ${errorData}`);
    }

    const result = await importResponse.json();

    console.log('\n✅ Upload completed!');
    console.log(`   - Total leads sent: ${result.total}`);
    console.log(`   - Successfully imported: ${result.inserted}`);

    if (result.errors && result.errors.length > 0) {
      console.log('\n⚠️  Some errors occurred:');
      result.errors.forEach(err => console.log(`   - ${err}`));
    }

    // Save transformed data for reference
    fs.writeFileSync(
      path.join(process.cwd(), 'scripts/transformed-leads.json'),
      JSON.stringify(transformed, null, 2)
    );

    console.log('\n📝 Transformed leads also saved to scripts/transformed-leads.json');

    rl.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
}

uploadLeads();
