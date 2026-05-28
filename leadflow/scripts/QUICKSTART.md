# 🚀 Quick Start: Import 98 Leads

## ⏱️ TL;DR - 5 Minutes

### Step 1: Get Your User ID (1 min)

Open your LeadFlow app and run this in browser console:
```javascript
// Copy this to browser DevTools Console (F12)
console.log(JSON.parse(localStorage.getItem('sb-leadflow-auth-token')).user.id)
```

Copy the UUID that appears (looks like: `a1b2c3d4-...`)

### Step 2: Import the Leads (2 min)

Go to **Supabase Dashboard → SQL Editor**

1. Click "New Query"
2. Copy this SQL (it's already generated):
   ```bash
   cat scripts/import-leads.sql
   ```
3. Paste into the editor
4. Find & Replace: `YOUR_USER_ID` → paste your actual ID (keep quotes!)
5. Click "Run"
6. Wait for "98 rows affected" ✅

### Step 3: Verify (1 min)

Go to LeadFlow → Leads page

You should see 98 new leads from "leadhunter" source!

---

## 📁 Files Generated

| File | Size | Purpose |
|------|------|---------|
| `extracted-leads.json` | 45 KB | Raw data (for reference) |
| `import-leads.sql` | 49 KB | Ready-to-run SQL |
| `import-leads-INSTRUCTIONS.sql` | 49 KB | SQL with instructions |
| `transformed-leads.json` | 50 KB | Transformed/processed data |
| `IMPORT_LEADS_README.md` | - | Full guide |

---

## 📊 What You're Getting

**48 Accountants (רו"ח)**
- 42 unique cities across Israel
- Average score: 8.4/10
- All with phone & website

**50 HVAC Technicians (טכנאי מזגנים)**
- 42 unique cities across Israel  
- Average score: 8.9/10
- All with phone & website

---

## ⚠️ Important: Replace the User ID!

The SQL file contains `'YOUR_USER_ID'` as a placeholder.

**You MUST replace it with your actual ID** before running.

### Finding Your User ID:

**Option 1: Browser Console** (quickest)
```javascript
JSON.parse(localStorage.getItem('sb-leadflow-auth-token')).user.id
```

**Option 2: Supabase Dashboard**
- Go to Supabase → Authentication → Users
- Copy the ID from your user row

**Option 3: Check the database**
```sql
SELECT id, email FROM auth.users LIMIT 1;
```

---

## 🐛 Troubleshooting

**"syntax error"**
- Make sure you replaced `YOUR_USER_ID` correctly
- Check that quotes are present: `'your-id-here'`

**"permission denied"**
- Verify your user ID is correct
- Check RLS policies allow inserts

**Importing but no leads show in app**
- Refresh the page
- Check "Leads" → "All" filter (not filtered by status)
- Verify source is "leadhunter"

---

## 📝 Manual Verification SQL

After import, run this to verify:

```sql
-- Check import succeeded
SELECT COUNT(*) as total_leads FROM leads WHERE source = 'leadhunter';

-- See them by type
SELECT position, COUNT(*) FROM leads 
WHERE source = 'leadhunter' 
GROUP BY position;

-- See distribution by priority
SELECT priority, COUNT(*) FROM leads 
WHERE source = 'leadhunter' 
GROUP BY priority 
ORDER BY priority;
```

---

## ✨ Next: What to do with the leads?

1. **⭐ Mark Favorites** - Click the star icon
2. **🏷️ Update Status** - Change from "new" to "qualified", "contacted", etc.
3. **💬 Add Notes** - Keep track of conversations
4. **📞 Reach Out** - Use the phone number to call
5. **🚀 Track Progress** - Monitor your pipeline

---

**Need help?** Check `IMPORT_LEADS_README.md` for the full guide.
