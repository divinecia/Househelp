# Database Schema Migration Instructions

## Problem

There are **two different database schemas** in the codebase:

1. **`server/migrations/001_init_schema.sql`** (Nov 7) - Uses **camelCase** field names
2. **`DATABASE_SCHEMA.sql`** (Nov 14) - Uses **snake_case** field names with proper CHECK constraints

The backend code has been updated to use **snake_case** fields (matching `DATABASE_SCHEMA.sql`), but if the old migration was already applied to Supabase, the database will have **camelCase** columns, causing insertion failures.

## Solution

A new migration file `server/migrations/002_schema_normalization.sql` has been created that will:

1. ✅ Create all lookup tables for dropdowns (genders, marital_statuses, etc.)
2. ✅ Populate lookup tables with initial data
3. ✅ Rename camelCase columns to snake_case (if they exist)
4. ✅ Add missing columns
5. ✅ Add proper CHECK constraints
6. ✅ Update data types where needed
7. ✅ Create admins table

## How to Apply the Migration

### Option 1: Manual Application (Recommended)

**Step 1: Connect to Supabase**

You need to have Supabase environment variables set up. If not, [Connect to Supabase](#open-mcp-popover) first.

**Step 2: Apply the Migration**

Once connected, you have two options:

**A. Via Supabase Dashboard (Easiest):**

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the sidebar
3. Copy the entire contents of `server/migrations/002_schema_normalization.sql`
4. Paste into the SQL Editor
5. Click **Run** to execute the migration
6. Check the output for any errors or warnings

**B. Via Supabase CLI:**

```bash
# If you have supabase CLI installed
supabase db reset --db-url "your-supabase-connection-string"
supabase migration up
```

### Option 2: Fresh Database Setup

If you haven't deployed the database yet or want to start fresh:

**Step 1: Use the Canonical Schema**

1. Copy the contents of `DATABASE_SCHEMA.sql`
2. Go to Supabase Dashboard → SQL Editor
3. Paste and run the entire schema
4. Then run `002_schema_normalization.sql` (Part 1 and 2 only for lookup tables)

## What the Migration Does

### PART 1 & 2: Lookup Tables

Creates and populates these tables:

- `genders` (Male, Female, Other)
- `marital_statuses` (Single, Married, Divorced, Widowed)
- `service_types` (8 service types)
- `insurance_companies` (RSSB, MMI, SANLAM, MITUELLE, Other)
- `payment_methods` (PayPack, Stripe)
- `wage_units` (Per Hour, Per Day, Per Month)
- `language_levels` (Beginner, Intermediate, Fluent, Native)
- `residence_types` (Studio, Apartment, Villa, Mansion)
- `worker_info_options` (Full-time, Part-time, Live-in)
- `criminal_record_options` (Yes, No)
- `smoking_drinking_restrictions` (4 options)
- `report_issue_types` (9 issue types)
- `training_categories` (Beginner, Intermediate, Expert)

### PART 3 & 4: Workers Table Migration

**Renames columns:**

- `dateOfBirth` → `date_of_birth`
- `maritalStatus` → `marital_status`
- `phoneNumber` → `phone_number`
- `nationalId` → `national_id`
- `typeOfWork` → `type_of_work`
- `workExperience` → `work_experience`
- `expectedWages` → `expected_wages`
- `workingHoursAndDays` → `working_hours_and_days`
- `educationQualification` → `education_qualification`
- `trainingCertificate` → `training_certificate_url`
- `languageProficiency` → `language_proficiency`
- `healthCondition` → `health_condition`
- `emergencyName` → `emergency_contact_name`
- `emergencyContact` → `emergency_contact_phone`
- `bankAccountNumber` → `bank_account_number`
- `accountHolder` → `account_holder_name`
- `insuranceCompany` → `insurance_company`
- `profileComplete` → `terms_accepted`

**Adds columns:**

- `education_certificate_url`
- `criminal_record_url`
- `status` (with CHECK constraint)
- `rating`
- `total_bookings`

**Adds constraints:**

- `gender` CHECK (male, female, other)
- `status` CHECK (active, inactive, suspended)

### PART 5: Homeowners Table Migration

**Renames columns:**

- `homeAddress` → `home_address`
- `typeOfResidence` → `type_of_residence`
- `numberOfFamilyMembers` → `number_of_family_members`
- `homeComposition` → `home_composition`
- `nationalId` → `national_id`
- `workerInfo` → `worker_info`
- `specificDuties` → `specific_duties`
- `workingHoursAndSchedule` → `working_hours_and_schedule`
- `numberOfWorkersNeeded` → `number_of_workers_needed`
- `preferredGender` → `preferred_gender`
- `languagePreference` → `language_preference`
- `wagesOffered` → `wages_offered`
- `reasonForHiring` → `reason_for_hiring`
- `specialRequirements` → `special_requirements`
- `startDateRequired` → `start_date_required`
- `criminalRecord` → `criminal_record_required`
- `paymentMode` → `payment_mode`
- `bankDetails` → `bank_details`
- `religious` → `religious_preferences`
- `smokingDrinkingRestrictions` → `smoking_drinking_restrictions`
- `specificSkillsNeeded` → `specific_skills_needed`
- `profileComplete` → `terms_accepted`

**Adds columns:**

- `contact_number`
- `home_composition_details`
- `selected_days`
- `status` (with CHECK constraint)

**Updates data types:**

- `criminal_record_required`: TEXT → BOOLEAN
- `start_date_required`: TEXT → DATE

**Adds constraints:**

- `type_of_residence` CHECK (studio, apartment, villa, mansion)
- `worker_info` CHECK (full-time, part-time, live-in)
- `preferred_gender` CHECK (male, female, any)
- `payment_mode` CHECK (bank, cash, mobile)
- `status` CHECK (active, inactive, suspended)

### PART 6: Admins Table

Creates the `admins` table if it doesn't exist with all proper fields and constraints.

### PART 7 & 8: Table Structure Updates

Ensures both `workers` and `homeowners` tables:

- Have `email` and `full_name` columns
- Use `id` as primary key (foreign key to `auth.users(id)`)
- Have proper foreign key constraints

## Post-Migration Verification

After running the migration, verify:

1. **Check Lookup Tables:**

```sql
SELECT * FROM genders;
SELECT * FROM marital_statuses;
SELECT * FROM service_types;
-- etc.
```

2. **Check Workers Table Structure:**

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'workers'
ORDER BY ordinal_position;
```

3. **Check Homeowners Table Structure:**

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'homeowners'
ORDER BY ordinal_position;
```

4. **Check Constraints:**

```sql
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.workers'::regclass;

SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.homeowners'::regclass;
```

## Testing Registration

After migration, test all three registration flows:

### 1. Worker Registration

- Visit `/worker/register`
- Fill out all fields
- Submit form
- Check database: `SELECT * FROM workers ORDER BY created_at DESC LIMIT 1;`

### 2. Homeowner Registration

- Visit `/homeowner/register`
- Fill out all fields
- Submit form
- Check database: `SELECT * FROM homeowners ORDER BY created_at DESC LIMIT 1;`

### 3. Admin Registration

- Visit `/admin/register`
- Fill out all fields
- Submit form
- Check database: `SELECT * FROM admins ORDER BY created_at DESC LIMIT 1;`

## Rollback (If Needed)

If something goes wrong, you can rollback by:

1. **Via Supabase Dashboard:**
   - Go to Database → Migrations
   - Click on the migration
   - Select "Rollback"

2. **Via SQL:**

```sql
-- Rename columns back to camelCase (if needed)
ALTER TABLE workers RENAME COLUMN date_of_birth TO "dateOfBirth";
-- ... repeat for all columns
```

## Common Issues

### Issue: "column already exists"

**Solution:** The column was already renamed. This is safe to ignore.

### Issue: "constraint already exists"

**Solution:** The constraint was already added. This is safe to ignore.

### Issue: "cannot change data type"

**Solution:** There's existing data that can't be converted. You may need to:

1. Backup the data
2. Drop the column
3. Recreate with correct type
4. Restore the data (with conversion)

### Issue: "foreign key constraint fails"

**Solution:** The table structure differs from expected. Manual migration may be required.

## Support

If you encounter errors during migration:

1. Copy the full error message
2. Check which PART of the migration failed
3. Run that specific part manually with modifications
4. Contact support if needed

## Summary

Once this migration is applied:

- ✅ All lookup tables will be created and populated
- ✅ All columns will use snake_case naming
- ✅ All CHECK constraints will be in place
- ✅ All data types will be correct
- ✅ Worker, Homeowner, and Admin registration will work correctly
- ✅ All dropdowns will load from database
- ✅ All insertions will succeed

**Next Step:** Apply the migration using one of the methods above, then test all registration forms.
