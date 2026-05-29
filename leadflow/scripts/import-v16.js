#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function importV16() {
  try {
    console.log('🚀 Importing LeadHunter v16 (Financial Advisors/CFO)\n');

    // Read v16 file
    const filePath = path.join(process.env.HOME, 'Downloads/leadhunter-il-v16.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Extract LEADS array
    const leadsMatch = content.match(/const LEADS = \[([\s\S]*?)\];/);
    if (!leadsMatch) {
      throw new Error('Could not find LEADS array');
    }

    // Parse using new Function (safe eval)
    const fn = new Function('return [' + leadsMatch[1].trim() + ']');
    const extractedLeads = fn();

    console.log(`📊 Extracted ${extractedLeads.length} leads\n`);

    // Initialize Supabase
    const supabase = createClient(
      'https://hodknhnqgaypyaflxcef.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvZGtuaG5xZ2F5cHlhZmx4Y2VmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTcwODI2NywiZXhwIjoyMDk1Mjg0MjY3fQ.31Kqz5IMMOKYq1EJxDJyiSqg0xHH2E5bJ0cD8xodPO0'
    );

    // Get correct user ID
    const { data: users } = await supabase.auth.admin.listUsers();
    const correctUser = users.users.find(u => u.email === 'avi.katz6@gmail.com');
    if (!correctUser) throw new Error('User not found');

    console.log(`👤 User: ${correctUser.email}\n`);

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
        user_id: correctUser.id,
        first_name: firstName,
        last_name: lastName,
        email: null,
        phone: lead.phone,
        company: null,
        position: 'יועץ פיננסי / CFO',
        website: lead.sourceUrl || null,
        status: 'new',
        priority: priority,
        source: 'leadhunter-v16',
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

    // Verify
    const { count: v16Count } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('source', 'leadhunter-v16');

    console.log(`\n✨ V16 leads in database: ${v16Count}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

importV16();
