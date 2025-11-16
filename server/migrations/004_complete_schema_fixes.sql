-- Migration 004: Complete Schema Fixes
-- This migration addresses all missing schema fixes identified in deep scan
-- Fixes: user_profiles snake_case, payments.booking_id, and other mismatches

-- ============================================================
-- PART 1: FIX USER_PROFILES TABLE (camelCase → snake_case)
-- ============================================================

DO $$ 
BEGIN
    -- Only rename if old camelCase columns exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'fullName') THEN
        RAISE NOTICE 'Migrating user_profiles from camelCase to snake_case...';
        
        -- Rename camelCase columns to snake_case
        ALTER TABLE public.user_profiles RENAME COLUMN "fullName" TO full_name;
        ALTER TABLE public.user_profiles RENAME COLUMN "profileData" TO profile_data;
        
        RAISE NOTICE 'user_profiles migration completed';
    ELSE
        RAISE NOTICE 'user_profiles already in snake_case format';
    END IF;
END $$;

-- ============================================================
-- PART 2: FIX PAYMENTS TABLE - Add booking_id and fix constraints
-- ============================================================

DO $$
BEGIN
    -- Add booking_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'booking_id') THEN
        RAISE NOTICE 'Adding booking_id to payments table...';
        
        -- Add booking_id column with foreign key to bookings
        ALTER TABLE public.payments 
        ADD COLUMN booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL;
        
        -- Add index for performance
        CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);
        
        RAISE NOTICE 'booking_id added to payments table';
    ELSE
        RAISE NOTICE 'booking_id already exists in payments table';
    END IF;
    
    -- Make user_id and currency nullable since booking_id can be used instead
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'payments' AND column_name = 'user_id' AND is_nullable = 'NO') THEN
        RAISE NOTICE 'Making payments.user_id nullable...';
        ALTER TABLE public.payments ALTER COLUMN user_id DROP NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'payments' AND column_name = 'currency' AND is_nullable = 'NO') THEN
        RAISE NOTICE 'Making payments.currency nullable (has default)...';
        ALTER TABLE public.payments ALTER COLUMN currency DROP NOT NULL;
    END IF;
END $$;

-- ============================================================
-- PART 3: FIX SERVICES TABLE (camelCase → snake_case)
-- ============================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'baseRate') THEN
        RAISE NOTICE 'Migrating services from camelCase to snake_case...';
        
        ALTER TABLE public.services RENAME COLUMN "baseRate" TO base_rate;
        
        RAISE NOTICE 'services migration completed';
    ELSE
        RAISE NOTICE 'services already in snake_case format';
    END IF;
END $$;

-- ============================================================
-- PART 4: ADD MISSING CONTACT_NUMBER TO HOMEOWNERS (if missing)
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homeowners' AND column_name = 'contact_number') THEN
        RAISE NOTICE 'Adding contact_number to homeowners table...';
        ALTER TABLE public.homeowners ADD COLUMN contact_number TEXT;
    END IF;
END $$;

-- ============================================================
-- PART 5: ENSURE ADMINS TABLE HAS CORRECT STRUCTURE
-- ============================================================

-- This is already handled in migration 002, but we verify here
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admins') THEN
        RAISE NOTICE 'Creating admins table...';
        
        CREATE TABLE public.admins (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          email TEXT UNIQUE NOT NULL,
          full_name TEXT NOT NULL,
          contact_number TEXT,
          gender TEXT CHECK (gender IN ('male', 'female', 'other')),
          role TEXT DEFAULT 'admin',
          permissions JSONB DEFAULT '{}',
          status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
        );
        
        -- Add index
        CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins(email);
        CREATE INDEX IF NOT EXISTS idx_admins_status ON public.admins(status);
    END IF;
END $$;

-- ============================================================
-- PART 6: ADD MISSING COLUMNS TO WORKERS/HOMEOWNERS FOR FULL_NAME AND EMAIL
-- ============================================================

-- These columns are needed for direct queries without joining user_profiles
DO $$
BEGIN
    -- Workers table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workers' AND column_name = 'full_name') THEN
        ALTER TABLE public.workers ADD COLUMN full_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workers' AND column_name = 'email') THEN
        ALTER TABLE public.workers ADD COLUMN email TEXT;
    END IF;
    
    -- Homeowners table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homeowners' AND column_name = 'full_name') THEN
        ALTER TABLE public.homeowners ADD COLUMN full_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homeowners' AND column_name = 'email') THEN
        ALTER TABLE public.homeowners ADD COLUMN email TEXT;
    END IF;
END $$;

-- ============================================================
-- PART 7: FIX WORKERS/HOMEOWNERS TABLE STRUCTURE (user_id vs id)
-- ============================================================

-- The 001 schema uses user_id as FK, but 002 wants to use id as FK
-- We need to handle this carefully to avoid breaking existing data

DO $$
BEGIN
    -- Check if workers table uses user_id (old schema) or id (new schema)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workers' AND column_name = 'user_id') THEN
        RAISE NOTICE 'Workers table uses user_id schema - this is the current correct schema';
        -- Keep it as is - the 001 schema is correct for now
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'homeowners' AND column_name = 'user_id') THEN
        RAISE NOTICE 'Homeowners table uses user_id schema - this is the current correct schema';
        -- Keep it as is - the 001 schema is correct for now
    END IF;
END $$;

-- ============================================================
-- VERIFICATION AND SUMMARY
-- ============================================================

DO $$
DECLARE
    user_profiles_fixed BOOLEAN;
    payments_fixed BOOLEAN;
    services_fixed BOOLEAN;
BEGIN
    -- Check if fixes were applied
    user_profiles_fixed := EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'full_name'
    );
    
    payments_fixed := EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'booking_id'
    );
    
    services_fixed := EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'services' AND column_name = 'base_rate'
    );
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Migration 004 Summary:';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'user_profiles.full_name exists: %', user_profiles_fixed;
    RAISE NOTICE 'payments.booking_id exists: %', payments_fixed;
    RAISE NOTICE 'services.base_rate exists: %', services_fixed;
    RAISE NOTICE '========================================';
END $$;
