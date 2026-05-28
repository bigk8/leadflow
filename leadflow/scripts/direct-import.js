#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function directImport() {
  try {
    console.log('🚀 Direct Lead Import\n');

    // Initialize Supabase client with service role
    const supabaseUrl = 'https://hodknhnqgaypyaflxcef.supabase.co';
    const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvZGtuaG5xZ2F5cHlhZmx4Y2VmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTcwODI2NywiZXhwIjoyMDk1Mjg0MjY3fQ.31Kqz5IMMOKYq1EJxDJyiSqg0xHH2E5bJ0cD8xodPO0';

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    console.log('📍 Connected to Supabase');

    // Get the first user (assuming you're the user)
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      throw new Error(`Failed to get users: ${usersError.message}`);
    }

    if (!users || users.users.length === 0) {
      throw new Error('No users found in database');
    }

    const userId = users.users[0].id;
    const userEmail = users.users[0].email;

    console.log(`👤 Found user: ${userEmail}`);
    console.log(`   ID: ${userId}\n`);

    // Read extracted leads
    const extractedPath = path.join(process.cwd(), 'scripts/extracted-leads.json');
    const extractedLeads = JSON.parse(fs.readFileSync(extractedPath, 'utf-8'));

    console.log(`📊 Loading ${extractedLeads.length} leads...\n`);

    // Transform leads
    function transformLead(lead) {
      const nameParts = lead.name.trim().split(/\s+/);
      let firstName, lastName;

      if (nameParts.length === 1) {
        firstName = nameParts[0];
        lastName = '';
      } else {
        lastName = nameParts[nameParts.length - 1];
        firstName = nameParts.slice(0, -1).join(' ');
      }

      let priority = 'medium';
      if (lead.score >= 9) {
        priority = 'high';
      } else if (lead.score >= 8) {
        priority = 'medium';
      } else {
        priority = 'low';
      }

      const combinedNotes = [
        lead.notes,
        lead.spec && `תחום: ${lead.spec}`,
        lead.reviews && `ביקורות: ${lead.reviews}`,
        lead.address && `כתובת: ${lead.address}`
      ].filter(Boolean).join('\n');

      return {
        user_id: userId,
        first_name: firstName,
        last_name: lastName,
        email: null,
        phone: lead.phone,
        company: null,
        position: lead.type === 'accountant' ? 'רו"ח' : 'טכנאי מזגנים',
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

    const leadsToInsert = extractedLeads.map(transformLead);

    // Import in batches
    console.log('⏳ Importing leads...\n');

    let totalInserted = 0;
    const batchSize = 100;

    for (let i = 0; i < leadsToInsert.length; i += batchSize) {
      const batch = leadsToInsert.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;

      const { data, error } = await supabase
        .from('leads')
        .insert(batch)
        .select();

      if (error) {
        console.error(`❌ Batch ${batchNum} failed:`, error.message);
        throw error;
      }

      totalInserted += data?.length || 0;
      const percent = Math.round((totalInserted / leadsToInsert.length) * 100);
      console.log(`   [${percent}%] Batch ${batchNum}: ${data?.length || 0} leads inserted`);
    }

    console.log(`\n✅ Import Complete!`);
    console.log(`   Total inserted: ${totalInserted}/${leadsToInsert.length}`);

    // Verify the import
    console.log('\n🔍 Verifying import...\n');

    const { data: countData, error: countError } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('source', 'leadhunter');

    if (!countError && countData) {
      console.log(`✅ Verified: ${countData.length} leads in database with source='leadhunter'`);
    }

    // Show summary by type
    const { data: byType } = await supabase
      .from('leads')
      .select('position')
      .eq('source', 'leadhunter');

    if (byType) {
      const accountants = byType.filter(l => l.position === 'רו"ח').length;
      const hvac = byType.filter(l => l.position === 'טכנאי מזגנים').length;

      console.log(`\n📊 Breakdown:`);
      console.log(`   Accountants (רו"ח): ${accountants}`);
      console.log(`   HVAC Technicians: ${hvac}`);
    }

    console.log('\n✨ Ready! Refresh LeadFlow to see the new leads.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Check if supabase package is installed
try {
  require.resolve('@supabase/supabase-js');
} catch (e) {
  console.log('📦 Installing @supabase/supabase-js...');
  require('child_process').execSync('npm install @supabase/supabase-js', { stdio: 'inherit' });
}

directImport();
