#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Transform lead data to database schema
function transformLead(lead, userId) {
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

  // Combine notes
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
    position: lead.type === 'accountant' ? 'רו"ח' : 'טכנאי מזגנים',
    website: lead.sourceUrl || null,
    status: 'new',
    priority: priority,
    source: 'leadhunter',
    deal_value: null,
    notes: combinedNotes
  };
}

// Escape SQL string
function escapeSql(str) {
  if (!str) return 'NULL';
  return "'" + str.replace(/'/g, "''") + "'";
}

function generateImportSql() {
  try {
    console.log('🚀 Generating SQL import script...\n');

    // Read extracted leads
    const extractedPath = path.join(process.cwd(), 'scripts/extracted-leads.json');
    if (!fs.existsSync(extractedPath)) {
      console.error('❌ Error: extracted-leads.json not found. Run: node scripts/import-leads.js');
      process.exit(1);
    }

    const extractedLeads = JSON.parse(fs.readFileSync(extractedPath, 'utf-8'));
    console.log(`📊 Loaded ${extractedLeads.length} leads\n`);

    // Generate SQL statements
    const sqlStatements = [];

    // NOTE: This SQL assumes you'll replace 'YOUR_USER_ID' with your actual user ID
    const userId = 'YOUR_USER_ID';

    sqlStatements.push('-- Import ' + extractedLeads.length + ' leads from LeadHunter');
    sqlStatements.push('-- Run this in Supabase SQL Editor after replacing YOUR_USER_ID with your actual user ID\n');

    sqlStatements.push('BEGIN;');
    sqlStatements.push('');

    // Insert each lead
    for (const lead of extractedLeads) {
      const transformed = transformLead(lead, userId);

      const sql = `INSERT INTO public.leads (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  company,
  position,
  website,
  status,
  priority,
  source,
  deal_value,
  notes,
  is_favorite,
  is_irrelevant
) VALUES (
  '${userId}',
  ${escapeSql(transformed.first_name)},
  ${escapeSql(transformed.last_name)},
  ${escapeSql(transformed.email)},
  ${escapeSql(transformed.phone)},
  ${escapeSql(transformed.company)},
  ${escapeSql(transformed.position)},
  ${escapeSql(transformed.website)},
  ${escapeSql(transformed.status)},
  ${escapeSql(transformed.priority)},
  ${escapeSql(transformed.source)},
  ${transformed.deal_value},
  ${escapeSql(transformed.notes)},
  false,
  false
);`;

      sqlStatements.push(sql);
    }

    sqlStatements.push('');
    sqlStatements.push('COMMIT;');
    sqlStatements.push('');
    sqlStatements.push(`-- Total leads imported: ${extractedLeads.length}`);

    const sqlContent = sqlStatements.join('\n');

    // Save SQL file
    const sqlPath = path.join(process.cwd(), 'scripts/import-leads.sql');
    fs.writeFileSync(sqlPath, sqlContent);

    console.log(`✅ Generated SQL import script`);
    console.log(`   File: ${sqlPath}`);
    console.log(`   Size: ${(sqlContent.length / 1024).toFixed(2)} KB`);
    console.log(`\n📋 Instructions:`);
    console.log('   1. Open Supabase Dashboard → SQL Editor');
    console.log('   2. Read the generated SQL file');
    console.log('   3. Replace "YOUR_USER_ID" with your actual user ID (from auth.users table)');
    console.log('   4. Paste and run the SQL');
    console.log('   5. Verify the leads were imported by checking the leads table\n');

    // Also save a version with placeholder instructions
    const sqlWithInstructions = `
-- ============================================
-- LeadFlow: Bulk Lead Import
-- ============================================
-- IMPORTANT: Replace 'YOUR_USER_ID' below with your actual user ID
-- You can find your user ID in:
-- - Supabase Dashboard → Authentication → Users
-- - Or from the logged-in session
--
-- Step 1: Update the user ID in the SQL statements below
-- Step 2: Paste all SQL into Supabase SQL Editor
-- Step 3: Run the script
-- ============================================

${sqlContent}
`;

    const instructedPath = path.join(process.cwd(), 'scripts/import-leads-INSTRUCTIONS.sql');
    fs.writeFileSync(instructedPath, sqlWithInstructions);

    console.log(`✅ Also saved with instructions to:`);
    console.log(`   ${instructedPath}`);

    // Show first few inserts as preview
    console.log('\n📝 Preview of SQL (first 3 leads):');
    console.log('---');
    const preview = sqlStatements.slice(4, 7).join('\n\n');
    console.log(preview);
    console.log('---\n');

    console.log(`💾 Summary:`);
    console.log(`   - Total leads: ${extractedLeads.length}`);
    console.log(`   - Accountants: ${extractedLeads.filter(l => l.type === 'accountant').length}`);
    console.log(`   - HVAC Technicians: ${extractedLeads.filter(l => l.type === 'hvac').length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

generateImportSql();
