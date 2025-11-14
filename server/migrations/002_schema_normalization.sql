-- Migration 002: Schema Normalization to snake_case and Lookup Tables
-- This migration updates the database schema from camelCase to snake_case
-- and adds all required lookup tables for dropdowns

-- ============================================================
-- PART 1: CREATE LOOKUP TABLES
-- ============================================================

-- Genders lookup table
CREATE TABLE IF NOT EXISTS public.genders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Marital statuses lookup table
CREATE TABLE IF NOT EXISTS public.marital_statuses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Service types lookup table
CREATE TABLE IF NOT EXISTS public.service_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Insurance companies lookup table
CREATE TABLE IF NOT EXISTS public.insurance_companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Payment methods lookup table
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Wage units lookup table
CREATE TABLE IF NOT EXISTS public.wage_units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Language levels lookup table
CREATE TABLE IF NOT EXISTS public.language_levels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Residence types lookup table
CREATE TABLE IF NOT EXISTS public.residence_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Worker info options lookup table
CREATE TABLE IF NOT EXISTS public.worker_info_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Criminal record options lookup table
CREATE TABLE IF NOT EXISTS public.criminal_record_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Smoking/drinking restrictions lookup table
CREATE TABLE IF NOT EXISTS public.smoking_drinking_restrictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Report issue types lookup table
CREATE TABLE IF NOT EXISTS public.report_issue_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Training categories lookup table
CREATE TABLE IF NOT EXISTS public.training_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ============================================================
-- PART 2: POPULATE LOOKUP TABLES
-- ============================================================

-- Genders
INSERT INTO public.genders (name) VALUES 
  ('Male'), ('Female'), ('Other')
ON CONFLICT (name) DO NOTHING;

-- Marital Statuses
INSERT INTO public.marital_statuses (name) VALUES 
  ('Single'), ('Married'), ('Divorced'), ('Widowed')
ON CONFLICT (name) DO NOTHING;

-- Service Types
INSERT INTO public.service_types (name, description) VALUES 
  ('House Cleaning', 'General house cleaning services'),
  ('Cooking', 'Meal preparation and cooking'),
  ('Laundry', 'Washing and ironing clothes'),
  ('Childcare', 'Taking care of children'),
  ('Elderly Care', 'Assistance for elderly family members'),
  ('Garden Maintenance', 'Gardening and lawn care'),
  ('Pet Care', 'Looking after pets'),
  ('General Household Help', 'Various household tasks')
ON CONFLICT (name) DO NOTHING;

-- Insurance Companies
INSERT INTO public.insurance_companies (name) VALUES 
  ('RSSB'), ('MMI'), ('SANLAM'), ('MITUELLE'), ('Other')
ON CONFLICT (name) DO NOTHING;

-- Payment Methods
INSERT INTO public.payment_methods (name) VALUES 
  ('PayPack'), ('Stripe')
ON CONFLICT (name) DO NOTHING;

-- Wage Units
INSERT INTO public.wage_units (name) VALUES 
  ('Per Hour'), ('Per Day'), ('Per Month')
ON CONFLICT (name) DO NOTHING;

-- Language Levels
INSERT INTO public.language_levels (name) VALUES 
  ('Beginner'), ('Intermediate'), ('Fluent'), ('Native')
ON CONFLICT (name) DO NOTHING;

-- Residence Types
INSERT INTO public.residence_types (name) VALUES 
  ('Studio'), ('Apartment'), ('Villa'), ('Mansion')
ON CONFLICT (name) DO NOTHING;

-- Worker Info Options
INSERT INTO public.worker_info_options (name) VALUES 
  ('Full-time'), ('Part-time'), ('Live-in')
ON CONFLICT (name) DO NOTHING;

-- Criminal Record Options
INSERT INTO public.criminal_record_options (name) VALUES 
  ('Yes'), ('No')
ON CONFLICT (name) DO NOTHING;

-- Smoking/Drinking Restrictions
INSERT INTO public.smoking_drinking_restrictions (name) VALUES 
  ('No smoking/No drinking'),
  ('Smoking allowed'),
  ('Drinking allowed'),
  ('Both allowed')
ON CONFLICT (name) DO NOTHING;

-- Report Issue Types
INSERT INTO public.report_issue_types (name) VALUES 
  ('System Issue'),
  ('Worker Behavior'),
  ('Review'),
  ('Rating'),
  ('Payment Issue'),
  ('Service Quality'),
  ('Safety Concern'),
  ('Contract Dispute'),
  ('Other')
ON CONFLICT (name) DO NOTHING;

-- Training Categories
INSERT INTO public.training_categories (name) VALUES 
  ('Beginner'),
  ('Intermediate'),
  ('Expert')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- PART 3: DROP OLD CAMELCASE TABLES IF THEY EXIST
-- ============================================================

-- Only drop if new snake_case tables don't exist yet
DO $$ 
BEGIN
    -- Check if we need to migrate from camelCase to snake_case
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workers' AND column_name = 'dateOfBirth') THEN
        -- Old camelCase schema exists, need to migrate
        RAISE NOTICE 'Migrating from camelCase to snake_case schema...';
        
        -- We'll keep the existing tables and just rename columns in PART 4
    END IF;
END $$;

-- ============================================================
-- PART 4: ALTER WORKERS TABLE (camelCase → snake_case)
-- ============================================================

DO $$ 
BEGIN
    -- Only rename if old camelCase columns exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workers' AND column_name = 'dateOfBirth') THEN
        -- Rename camelCase columns to snake_case
        ALTER TABLE public.workers RENAME COLUMN "dateOfBirth" TO date_of_birth;
        ALTER TABLE public.workers RENAME COLUMN "maritalStatus" TO marital_status;
        ALTER TABLE public.workers RENAME COLUMN "phoneNumber" TO phone_number;
        ALTER TABLE public.workers RENAME COLUMN "nationalId" TO national_id;
        ALTER TABLE public.workers RENAME COLUMN "typeOfWork" TO type_of_work;
        ALTER TABLE public.workers RENAME COLUMN "workExperience" TO work_experience;
        ALTER TABLE public.workers RENAME COLUMN "expectedWages" TO expected_wages;
        ALTER TABLE public.workers RENAME COLUMN "workingHoursAndDays" TO working_hours_and_days;
        ALTER TABLE public.workers RENAME COLUMN "educationQualification" TO education_qualification;
        ALTER TABLE public.workers RENAME COLUMN "trainingCertificate" TO training_certificate_url;
        ALTER TABLE public.workers RENAME COLUMN "languageProficiency" TO language_proficiency;
        ALTER TABLE public.workers RENAME COLUMN "healthCondition" TO health_condition;
        ALTER TABLE public.workers RENAME COLUMN "emergencyName" TO emergency_contact_name;
        ALTER TABLE public.workers RENAME COLUMN "emergencyContact" TO emergency_contact_phone;
        ALTER TABLE public.workers RENAME COLUMN "bankAccountNumber" TO bank_account_number;
        ALTER TABLE public.workers RENAME COLUMN "accountHolder" TO account_holder_name;
        ALTER TABLE public.workers RENAME COLUMN "insuranceCompany" TO insurance_company;
        ALTER TABLE public.workers RENAME COLUMN "profileComplete" TO terms_accepted;
        
        -- Add missing columns
        ALTER TABLE public.workers ADD COLUMN IF NOT EXISTS education_certificate_url TEXT;
        ALTER TABLE public.workers ADD COLUMN IF NOT EXISTS criminal_record_url TEXT;
        ALTER TABLE public.workers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
        ALTER TABLE public.workers ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2);
        ALTER TABLE public.workers ADD COLUMN IF NOT EXISTS total_bookings INTEGER DEFAULT 0;
        
        -- Update constraints
        ALTER TABLE public.workers DROP CONSTRAINT IF EXISTS workers_gender_check;
        ALTER TABLE public.workers ADD CONSTRAINT workers_gender_check 
          CHECK (gender IN ('male', 'female', 'other'));
        
        ALTER TABLE public.workers DROP CONSTRAINT IF EXISTS workers_status_check;
        ALTER TABLE public.workers ADD CONSTRAINT workers_status_check 
          CHECK (status IN ('active', 'inactive', 'suspended'));
    END IF;
END $$;

-- ============================================================
-- PART 5: ALTER HOMEOWNERS TABLE (camelCase → snake_case)
-- ============================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homeowners' AND column_name = 'homeAddress') THEN
        -- Rename camelCase columns to snake_case
        ALTER TABLE public.homeowners RENAME COLUMN "homeAddress" TO home_address;
        ALTER TABLE public.homeowners RENAME COLUMN "typeOfResidence" TO type_of_residence;
        ALTER TABLE public.homeowners RENAME COLUMN "numberOfFamilyMembers" TO number_of_family_members;
        ALTER TABLE public.homeowners RENAME COLUMN "homeComposition" TO home_composition;
        ALTER TABLE public.homeowners RENAME COLUMN "nationalId" TO national_id;
        ALTER TABLE public.homeowners RENAME COLUMN "workerInfo" TO worker_info;
        ALTER TABLE public.homeowners RENAME COLUMN "specificDuties" TO specific_duties;
        ALTER TABLE public.homeowners RENAME COLUMN "workingHoursAndSchedule" TO working_hours_and_schedule;
        ALTER TABLE public.homeowners RENAME COLUMN "numberOfWorkersNeeded" TO number_of_workers_needed;
        ALTER TABLE public.homeowners RENAME COLUMN "preferredGender" TO preferred_gender;
        ALTER TABLE public.homeowners RENAME COLUMN "languagePreference" TO language_preference;
        ALTER TABLE public.homeowners RENAME COLUMN "wagesOffered" TO wages_offered;
        ALTER TABLE public.homeowners RENAME COLUMN "reasonForHiring" TO reason_for_hiring;
        ALTER TABLE public.homeowners RENAME COLUMN "specialRequirements" TO special_requirements;
        ALTER TABLE public.homeowners RENAME COLUMN "startDateRequired" TO start_date_required;
        ALTER TABLE public.homeowners RENAME COLUMN "criminalRecord" TO criminal_record_required;
        ALTER TABLE public.homeowners RENAME COLUMN "paymentMode" TO payment_mode;
        ALTER TABLE public.homeowners RENAME COLUMN "bankDetails" TO bank_details;
        ALTER TABLE public.homeowners RENAME COLUMN "religious" TO religious_preferences;
        ALTER TABLE public.homeowners RENAME COLUMN "smokingDrinkingRestrictions" TO smoking_drinking_restrictions;
        ALTER TABLE public.homeowners RENAME COLUMN "specificSkillsNeeded" TO specific_skills_needed;
        ALTER TABLE public.homeowners RENAME COLUMN "profileComplete" TO terms_accepted;
        
        -- Add missing columns
        ALTER TABLE public.homeowners ADD COLUMN IF NOT EXISTS contact_number TEXT;
        ALTER TABLE public.homeowners ADD COLUMN IF NOT EXISTS home_composition_details TEXT;
        ALTER TABLE public.homeowners ADD COLUMN IF NOT EXISTS selected_days TEXT;
        ALTER TABLE public.homeowners ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
        
        -- Change data types where needed
        ALTER TABLE public.homeowners ALTER COLUMN criminal_record_required TYPE BOOLEAN 
          USING CASE WHEN criminal_record_required = 'yes' THEN TRUE ELSE FALSE END;
        
        ALTER TABLE public.homeowners ALTER COLUMN start_date_required TYPE DATE 
          USING CASE WHEN start_date_required ~ '^\d{4}-\d{2}-\d{2}$' THEN start_date_required::DATE ELSE NULL END;
        
        -- Update constraints
        ALTER TABLE public.homeowners DROP CONSTRAINT IF EXISTS homeowners_type_of_residence_check;
        ALTER TABLE public.homeowners ADD CONSTRAINT homeowners_type_of_residence_check 
          CHECK (type_of_residence IN ('studio', 'apartment', 'villa', 'mansion'));
        
        ALTER TABLE public.homeowners DROP CONSTRAINT IF EXISTS homeowners_worker_info_check;
        ALTER TABLE public.homeowners ADD CONSTRAINT homeowners_worker_info_check 
          CHECK (worker_info IN ('full-time', 'part-time', 'live-in'));
        
        ALTER TABLE public.homeowners DROP CONSTRAINT IF EXISTS homeowners_preferred_gender_check;
        ALTER TABLE public.homeowners ADD CONSTRAINT homeowners_preferred_gender_check 
          CHECK (preferred_gender IN ('male', 'female', 'any'));
        
        ALTER TABLE public.homeowners DROP CONSTRAINT IF EXISTS homeowners_payment_mode_check;
        ALTER TABLE public.homeowners ADD CONSTRAINT homeowners_payment_mode_check 
          CHECK (payment_mode IN ('bank', 'cash', 'mobile'));
        
        ALTER TABLE public.homeowners DROP CONSTRAINT IF EXISTS homeowners_status_check;
        ALTER TABLE public.homeowners ADD CONSTRAINT homeowners_status_check 
          CHECK (status IN ('active', 'inactive', 'suspended'));
    END IF;
END $$;

-- ============================================================
-- PART 6: CREATE ADMINS TABLE IF NOT EXISTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  contact_number TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  role TEXT DEFAULT 'admin',
  permissions JSONB,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ============================================================
-- PART 7: UPDATE WORKERS TABLE STRUCTURE
-- ============================================================

-- Ensure workers table uses auth.users(id) as primary key, not user_id reference
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workers' AND column_name = 'user_id') THEN
        -- Migration from old schema with user_id to new schema with id as FK
        -- This is complex and may require manual data migration
        RAISE NOTICE 'Warning: workers table has user_id column. Manual migration may be required.';
    END IF;
END $$;

-- Add missing columns to workers if they don't exist
ALTER TABLE public.workers ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.workers ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Make sure foreign key constraint exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'workers_id_fkey') THEN
        -- If using old user_id schema, this will fail and need manual migration
        ALTER TABLE public.workers ADD CONSTRAINT workers_id_fkey 
          FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not add foreign key constraint. Manual migration may be required.';
END $$;

-- ============================================================
-- PART 8: UPDATE HOMEOWNERS TABLE STRUCTURE
-- ============================================================

-- Add missing columns to homeowners if they don't exist
ALTER TABLE public.homeowners ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.homeowners ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Make sure foreign key constraint exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'homeowners_id_fkey') THEN
        ALTER TABLE public.homeowners ADD CONSTRAINT homeowners_id_fkey 
          FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not add foreign key constraint. Manual migration may be required.';
END $$;

-- ============================================================
-- END OF MIGRATION
-- ============================================================
