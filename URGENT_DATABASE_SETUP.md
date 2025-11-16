# 🚨 URGENT: Database Setup Required

## Your App Status

✅ **Code**: All fixed and running  
✅ **Replit Dev**: Running on port 5000  
✅ **Netlify Deploy**: Configured at https://househelprw.netlify.app/  
⚠️ **Database**: **NEEDS MIGRATIONS** (Nothing will work without this!)

---

## Why Your App Won't Work Yet

Your Supabase database has **camelCase** columns but the code expects **snake_case**.

**Example of the problem:**
```
Database has:    fullName, dateOfBirth, phoneNumber
Code expects:    full_name, date_of_birth, phone_number
Result:          ❌ ERROR: column "full_name" does not exist
```

---

## 🚀 Quick Fix (5 Minutes)

### Step 1: Open Supabase
1. Go to https://supabase.com/dashboard
2. Click on your HouseHelp project
3. Click **"SQL Editor"** in the left sidebar

### Step 2: Run These Migrations (In Order)

**Copy and paste each file, click "Run"**

#### Migration 1: Initial Schema
```
📁 server/migrations/001_init_schema.sql
```
Click "Run" → Wait for "Success"

#### Migration 2: Snake Case Conversion  
```
📁 server/migrations/002_schema_normalization.sql
```
Click "Run" → Wait for "Success"

#### Migration 3: Fix RLS Policies
```
📁 server/migrations/003_fix_rls_policies.sql
```
Click "Run" → Wait for "Success"

#### Migration 4: Final Fixes ⭐ (MOST IMPORTANT)
```
📁 server/migrations/004_complete_schema_fixes.sql
```
Click "Run" → Wait for "Success"

**Check the output** - You should see messages like:
```
✓ Migrating user_profiles from camelCase to snake_case...
✓ user_profiles migration completed
✓ Adding booking_id to payments table...
✓ booking_id added to payments table
```

---

## Step 3: Verify It Worked

Run this query in Supabase SQL Editor:

```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;
```

**You should see:**
- ✅ `full_name` (snake_case) ← Correct!
- ❌ NOT `fullName` (camelCase)

---

## Step 4: Test Your App

### Option A: Test in Replit Dev Server

Open your Replit webview and try:
1. Click "Admin" → "Register"
2. Fill in the form
3. Submit

**Expected**: Success! User created.

### Option B: Test via Curl

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "fullName": "Test User",
    "role": "admin",
    "contactNumber": "+250788123456",
    "gender": "male"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "email": "test@example.com",
    "full_name": "Test User",
    "role": "admin"
  },
  "token": "..."
}
```

### Option C: Test on Netlify

Once migrations are done, your Netlify site will also work:
```
https://househelprw.netlify.app/admin/register
```

---

## ⚠️ Important Notes

### For Netlify Deployment

Your Netlify site uses the **same Supabase database** as your Replit dev environment. Once you run the migrations:

✅ **Both will work** (Replit dev + Netlify production)

The migrations are **one-time only**. After running them, both deployments will work perfectly.

### Migration Safety

The migration scripts are **safe** because:
- ✅ They check if columns exist before renaming
- ✅ They won't run twice (idempotent)
- ✅ They don't delete data
- ✅ They only rename columns and add missing ones

---

## 🆘 Troubleshooting

### "Migration already ran" messages
✅ **This is fine!** It means some migrations already ran. Just continue with the next one.

### "Column already exists" error
✅ **This is fine!** The migration detected the column exists and skipped it.

### "Permission denied" error
❌ **Check your Supabase user permissions**. You need admin access to run migrations.

### Still getting errors after migrations?
1. Check Supabase logs: **Dashboard → Logs → Postgres Logs**
2. Verify columns were renamed: Run the verification query above
3. Check the detailed error message in the API response

---

## 📊 What Gets Fixed

| Table | Before (Broken) | After (Fixed) |
|-------|----------------|---------------|
| user_profiles | fullName | full_name ✅ |
| workers | phoneNumber, nationalId, ... | phone_number, national_id, ... ✅ |
| homeowners | homeAddress, contactNumber, ... | home_address, contact_number, ... ✅ |
| payments | (missing booking_id) | booking_id ✅ |
| services | baseRate | base_rate ✅ |

---

## ✨ After Migrations Complete

### Your App Will Support:

✅ Admin registration & login  
✅ Worker registration & login  
✅ Homeowner registration & login  
✅ Profile updates  
✅ Booking creation  
✅ Payment processing  
✅ All CRUD operations  

### Both Deployments Will Work:

✅ **Replit Dev**: http://localhost:5000  
✅ **Netlify Production**: https://househelprw.netlify.app/  

---

## 🎯 Summary

**Time needed**: 5 minutes  
**Difficulty**: Easy (copy & paste SQL)  
**Risk**: None (migrations are safe)  
**Benefit**: App fully functional!

**Next Step**: Go to Supabase Dashboard → SQL Editor → Run migrations 001→004

---

Need help? Check these files:
- `DATABASE_MIGRATION_GUIDE.md` - Detailed migration guide
- `DEEP_SCAN_REPORT_2024-11-16.md` - Full technical analysis
