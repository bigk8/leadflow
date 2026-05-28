const fs = require('fs');
const path = require('path');

const extractedPath = path.join(process.cwd(), 'scripts/extracted-leads.json');
const leads = JSON.parse(fs.readFileSync(extractedPath, 'utf-8'));

console.log('🔍 Lead Data Validation\n');

const stats = {
  total: leads.length,
  byType: {},
  byScore: {},
  byCity: {},
  withPhone: 0,
  withSourceUrl: 0,
  withAddress: 0
};

const cities = new Set();

for (const lead of leads) {
  stats.byType[lead.type] = (stats.byType[lead.type] || 0) + 1;
  stats.byScore[lead.score] = (stats.byScore[lead.score] || 0) + 1;
  
  if (lead.phone) stats.withPhone++;
  if (lead.sourceUrl) stats.withSourceUrl++;
  if (lead.address) stats.withAddress++;
  if (lead.city) cities.add(lead.city);
}

console.log('📊 Summary:');
console.log(`   Total Leads: ${stats.total}`);
console.log(`   - Accountants: ${stats.byType.accountant || 0}`);
console.log(`   - HVAC: ${stats.byType.hvac || 0}`);

console.log('\n📞 Contact Info:');
console.log(`   Phone provided: ${stats.withPhone}/${stats.total}`);
console.log(`   Website/Source URL: ${stats.withSourceUrl}/${stats.total}`);
console.log(`   Address provided: ${stats.withAddress}/${stats.total}`);

console.log('\n⭐ Score Distribution:');
Object.keys(stats.byScore).sort((a,b) => b-a).forEach(score => {
  const count = stats.byScore[score];
  const bar = '█'.repeat(count);
  console.log(`   Score ${score}: ${bar} (${count})`);
});

console.log('\n🏙️  Cities Coverage:');
console.log(`   Unique cities: ${cities.size}`);
Array.from(cities).sort().slice(0, 10).forEach(city => {
  console.log(`   - ${city}`);
});
if (cities.size > 10) {
  console.log(`   ... and ${cities.size - 10} more cities`);
}

console.log('\n✅ Data validation complete');
