# Lead Import Guide

✅ **Extraction Complete!** 98 leads have been extracted from your TSX files.

## What Was Extracted

- **Total Leads**: 98
  - **Accountants (רו"ח)**: 48 leads from `leadhunter-il-v14.tsx`
  - **HVAC Technicians (טכנאי מזגנים)**: 50 leads from `leadhunter-il-v15.tsx`

## Files Generated

1. **`extracted-leads.json`** - Raw lead data extracted from TSX files
2. **`import-leads.sql`** - SQL INSERT statements for Supabase
3. **`import-leads-INSTRUCTIONS.sql`** - SQL with setup instructions

## How to Import the Leads

### Option A: Using Supabase SQL Editor (Recommended)

1. **Get your User ID:**
   - Go to your LeadFlow app
   - Open browser DevTools → Application → Storage → Local Storage
   - Find the `auth.session` or check Supabase Dashboard → Authentication → Users

2. **Copy the SQL:**
   ```bash
   # Copy the content of:
   cat scripts/import-leads-INSTRUCTIONS.sql
   ```

3. **Run in Supabase SQL Editor:**
   - Go to Supabase Dashboard → SQL Editor
   - Create New Query
   - Paste the SQL content
   - **Replace `'YOUR_USER_ID'` with your actual user ID** (keeping the quotes)
   - Click "Run"
   - You should see "98 rows affected"

### Option B: Using Node.js Edge Function

If you deployed to Vercel, you can use the Edge Function:

```bash
# Make sure you have an auth token
node scripts/upload-leads.js
```

This will prompt you for:
- Your Supabase/LeadFlow authentication token
- Then upload leads directly to your database

### Option C: Manual Import in LeadFlow UI

If neither of the above options work:

1. Go to LeadFlow Dashboard → Leads
2. Look for "Import" button or menu
3. Copy data from `scripts/extracted-leads.json`
4. Paste into import form

## Data Mapping

Each lead is mapped with:

| Field | Mapping |
|-------|---------|
| `name` | Split into `first_name` and `last_name` |
| `phone` | Direct mapping |
| `city` | Stored in notes |
| `address` | Included in notes |
| `reviews` | Included in notes as "ביקורות: ..." |
| `sourceUrl` | Mapped to `website` |
| `spec` | Included in notes as "תחום: ..." |
| `score` | Mapped to `priority` (10→critical, 9→high, 8→medium, <8→low) |
| `notes` | Enriched with spec, reviews, and address |

## Verification

After importing, verify in LeadFlow:

```sql
-- Check total leads imported
SELECT COUNT(*) as total, status, priority 
FROM leads 
WHERE source = 'leadhunter' 
GROUP BY status, priority;

-- Check by type
SELECT position, COUNT(*) as count 
FROM leads 
WHERE source = 'leadhunter' 
GROUP BY position;
```

## Troubleshooting

**SQL Error: "invalid input value for enum"**
- Verify that `status` values are 'new', 'qualified', 'contacted', 'in_progress', or 'closed'
- Verify that `priority` values are 'low', 'medium', 'high', or 'critical'

**Error: "permission denied"**
- Check that you're using the correct user ID
- Verify RLS policies allow inserts for your user

**Some leads failed to import**
- The SQL runs in a transaction, so if ANY lead fails, NONE are imported
- Check the SQL file for special characters or escaping issues

## Next Steps

1. ✅ Leads are now in your database
2. 🔍 Filter and organize them using the Leads page
3. ⭐ Mark favorites using the star icon
4. 🏷️ Assign status and priority
5. 💼 Add notes and track progress
6. 📞 Start reaching out to prospects!

## Need Help?

- Check `extracted-leads.json` for the raw data structure
- Check `import-leads.sql` for the exact SQL being run
- Review Supabase documentation: https://supabase.com/docs
