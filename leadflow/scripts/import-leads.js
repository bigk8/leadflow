const fs = require('fs');
const path = require('path');

// Parse TSX file to extract LEADS array using property extraction
function extractLeadsFromTsx(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Find the LEADS array
  const leadsMatch = content.match(/const LEADS = \[([\s\S]*?)\];/);
  if (!leadsMatch) {
    throw new Error(`Could not find LEADS array in ${filePath}`);
  }

  const leadsContent = leadsMatch[1];
  const leads = [];

  // Split by } { pattern to find individual objects
  const objectMatches = leadsContent.matchAll(/\{\s*id:(\d+),\s*name:'((?:[^'\\]|\\.)*)',\s*phone:'([^']*)',\s*city:'([^']*)',\s*address:'([^']*)',\s*reviews:'([^']*)',\s*(?:sourceUrl:'([^']*)',\s*)?(?:spec:'([^']*)',\s*)?score:(\d+),\s*(?:sourceUrl:'([^']*)',\s*)?notes:'((?:[^'\\]|\\.)*)'\s*\}/g);

  for (const match of objectMatches) {
    // Handle different orderings of sourceUrl and spec
    let sourceUrl = match[7] || match[10] || '';
    let spec = match[8] || '';

    leads.push({
      id: parseInt(match[1]),
      name: match[2].replace(/\\'/g, "'"),
      phone: match[3],
      city: match[4],
      address: match[5],
      reviews: match[6],
      sourceUrl: sourceUrl,
      spec: spec,
      score: parseInt(match[9]),
      notes: match[11].replace(/\\'/g, "'")
    });
  }

  // If no matches found, try alternative parsing with eval (more flexible)
  if (leads.length === 0) {
    // Safe eval-like approach using new Function
    try {
      // Create a safe context
      const sandbox = {};
      const fn = new Function('return [' + leadsContent.trim() + ']');
      const parsed = fn();
      return parsed;
    } catch (e) {
      throw new Error(`Could not parse leads: ${e.message}`);
    }
  }

  return leads;
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

  // Map score to priority (8-9 = high, 10 = urgent/critical)
  let priority = 'medium';
  if (lead.score >= 10) {
    priority = 'critical';
  } else if (lead.score >= 9) {
    priority = 'high';
  }

  // Combine notes with spec and reviews
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
    position: type === 'accountant' ? 'רו"ח' : 'טכנאי מזגנים',
    website: lead.sourceUrl || null,
    status: 'new',
    priority: priority,
    source: 'leadhunter',
    deal_value: null,
    notes: combinedNotes,
    is_favorite: false,
    is_irrelevant: false,
    city: lead.city,
    score: lead.score
  };
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting lead import...\n');

    const home = process.env.HOME;
    const v14Path = path.join(home, 'Downloads/leadhunter-il-v14.tsx');
    const v15Path = path.join(home, 'Downloads/leadhunter-il-v15.tsx');

    console.log('📖 Extracting leads from v14 (Accountants)...');
    const accountantLeads = extractLeadsFromTsx(v14Path);
    console.log(`✅ Extracted ${accountantLeads.length} accountant leads\n`);

    console.log('📖 Extracting leads from v15 (HVAC Technicians)...');
    const hvacLeads = extractLeadsFromTsx(v15Path);
    console.log(`✅ Extracted ${hvacLeads.length} HVAC technician leads\n`);

    // For now, just show sample data
    console.log('📋 Sample Accountant Lead (v14):');
    console.log(JSON.stringify(accountantLeads[0], null, 2));
    console.log('\n📋 Sample HVAC Lead (v15):');
    console.log(JSON.stringify(hvacLeads[0], null, 2));

    // Show the SQL that would be generated
    console.log('\n\n📝 SQL Import Example:\n');

    // This would need a real user_id from the database
    const sampleUserId = 'YOUR_USER_ID_HERE';

    const transformed14 = transformLead(accountantLeads[0], sampleUserId, 'accountant');
    const transformed15 = transformLead(hvacLeads[0], sampleUserId, 'hvac');

    console.log('First Accountant Lead (transformed):');
    console.log(JSON.stringify(transformed14, null, 2));
    console.log('\nFirst HVAC Lead (transformed):');
    console.log(JSON.stringify(transformed15, null, 2));

    // Save transformed data to JSON file
    const allLeads = [
      ...accountantLeads.map((l, i) => ({ ...l, type: 'accountant', originalId: i + 1 })),
      ...hvacLeads.map((l, i) => ({ ...l, type: 'hvac', originalId: i + 1 }))
    ];

    const outputPath = path.join(process.cwd(), 'scripts/extracted-leads.json');
    fs.writeFileSync(outputPath, JSON.stringify(allLeads, null, 2));
    console.log(`\n✅ Saved extracted leads to ${outputPath}`);

    console.log(`\n📊 Summary:`);
    console.log(`  - Total leads: ${allLeads.length}`);
    console.log(`  - Accountants: ${accountantLeads.length}`);
    console.log(`  - HVAC Technicians: ${hvacLeads.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
