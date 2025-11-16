# Database Migration Guide - Critical Schema Fixes

## Overview
This guide explains the critical database schema mismatches found and how to fix them.

## Critical Issues Identified

### 1. **user_profiles Table** (CRITICAL)
- **Problem**: Backend expects `full_name` (snake_case) but schema has `fullName` (camelCase)
- **Impact**: ALL user registrations fail with "column does not exist" error
- **Fixed in**: Migration 004

### 2. **workers Table** (CRITICAL)
- **Problem**: Backend expects snake_case columns but schema has camelCase
- **Impact**: ALL worker registrations and updates fail
- **Fixed in**: Migration 002 + 004

### 3. **homeowners Table** (CRITICAL)
- **Problem**: Backend expects snake_case columns but schema has camelCase
- **Impact**: ALL homeowner registrations and updates fail
- **Fixed in**: Migration 002 + 004

### 4. **payments Table** (HIGH)
- **Problem**: Missing `booking_id` column, constraints too strict
- **Impact**: Payment creation fails when trying to link to bookings
- **Fixed in**: Migration 004

### 5. **services Table** (MEDIUM)
- **Problem**: Backend expects `base_rate` but schema has `baseRate`
- **Impact**: Service creation/updates may fail
- **Fixed in**: Migration 004

## Migration Files

The database requires these migrations to be run **in order**:

1. **001_init_schema.sql** - Creates initial database schema with camelCase
2. **002_schema_normalization.sql** - Converts workers/homeowners to snake_case, creates lookup tables
3. **003_fix_rls_policies.sql** - Fixes Row Level Security policies for auth
4. **004_complete_schema_fixes.sql** - **NEW** Fixes user_profiles, payments, services tables

## How to Run Migrations

### Option 1: Via Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run Each Migration in Order**

   **Step 1: Run Migration 001**
   ```sql
   -- Copy and paste contents of server/migrations/001_init_schema.sql
   -- Click "Run" button
   ```

   **Step 2: Run Migration 002**
   ```sql
   -- Copy and paste contents of server/migrations/002_schema_normalization.sql
   -- Click "Run" button
   ```

   **Step 3: Run Migration 003**
   ```sql
   -- Copy and paste contents of server/migrations/003_fix_rls_policies.sql
   -- Click "Run" button
   ```

   **Step 4: Run Migration 004** (CRITICAL)
   ```sql
   -- Copy and paste contents of server/migrations/004_complete_schema_fixes.sql
   -- Click "Run" button
   ```

4. **Verify Migrations**
   - Check the NOTICE messages in the output
   - Verify that all columns are in snake_case format

### Option 2: Via Supabase CLI

```bash
# Initialize Supabase (if not already done)
npx supabase init

# Link to your project
npx supabase link --project-ref <your-project-ref>

# Run migrations
npx supabase db push

# Or run individual migration files
npx supabase db execute -f server/migrations/001_init_schema.sql
npx supabase db execute -f server/migrations/002_schema_normalization.sql
npx supabase db execute -f server/migrations/003_fix_rls_policies.sql
npx supabase db execute -f server/migrations/004_complete_schema_fixes.sql
```

## Verification

After running all migrations, verify the schema is correct:

### 1. Check user_profiles Table
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;
```

Expected columns:
- `id` (uuid)
- `email` (text)
- `role` (text)
- `full_name` (text) ← **Must be snake_case**
- `profile_data` (jsonb) ← **Must be snake_case**
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 2. Check workers Table
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'workers'
ORDER BY ordinal_position;
```

Expected: All columns in snake_case (e.g., `phone_number`, `national_id`, `type_of_work`)

### 3. Check payments Table
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'payments'
ORDER BY ordinal_position;
```

Expected: Should include `booking_id` column

## Testing After Migration

### Test 1: Admin Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "test123",
    "fullName": "Test Admin",
    "role": "admin",
    "contactNumber": "+250788123456",
    "gender": "male"
  }'
```

**Expected**: Success response with user data

### Test 2: Worker Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "worker@test.com",
    "password": "test123",
    "fullName": "Test Worker",
    "role": "worker",
    "phoneNumber": "+250788123456",
    "nationalId": "1199970012345678"
  }'
```

**Expected**: Success response with user data

### Test 3: Homeowner Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "homeowner@test.com",
    "password": "test123",
    "fullName": "Test Homeowner",
    "role": "homeowner",
    "contactNumber": "+250788123456",
    "homeAddress": "KG 123 St, Kigali"
  }'
```

**Expected**: Success response with user data

## Common Issues

### Issue: "column does not exist" error
**Cause**: Migration 004 hasn't been run yet
**Solution**: Run migration 004 to rename columns to snake_case

### Issue: "violates check constraint" error
**Cause**: Invalid enum values or missing required fields
**Solution**: Check the schema constraints in the migration files

### Issue: RLS policy prevents insert
**Cause**: Migration 003 hasn't been run
**Solution**: Run migration 003 to fix RLS policies

## Schema Alignment Summary

| Table | Status | Migration |
|-------|--------|-----------|
| user_profiles | ✅ Fixed | 004 |
| workers | ✅ Fixed | 002, 004 |
| homeowners | ✅ Fixed | 002, 004 |
| admins | ✅ Fixed | 002 |
| payments | ✅ Fixed | 004 |
| services | ✅ Fixed | 004 |
| bookings | ✅ OK | 001 |
| trainings | ✅ OK | 001 |

## Next Steps

1. ✅ Run all migrations in order (001 → 002 → 003 → 004)
2. ✅ Verify schema using SQL queries above
3. ✅ Test registration endpoints
4. ✅ Test CRUD operations for workers/homeowners
5. ✅ Test booking and payment creation

## Support

If you encounter issues:
1. Check Supabase logs in the Dashboard
2. Verify all migrations ran successfully
3. Check the NOTICE messages in migration output
4. Review the API error messages for specific column names

## Backend Compatibility

The backend code (server/routes/*.ts) expects **snake_case** columns because:
1. The normalize-request middleware converts incoming camelCase to snake_case
2. All database queries use snake_case column names
3. This is the PostgreSQL convention

After running all migrations, the schema will be fully aligned with the backend expectations.
