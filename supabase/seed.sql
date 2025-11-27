-- Basic database schema for HouseHelp application
-- This creates the essential tables needed for registration and login

-- Create user_profiles table (central user management)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('worker', 'homeowner', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workers table
CREATE TABLE IF NOT EXISTS public.workers (
    id UUID PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    contact_number TEXT,
    gender TEXT,
    date_of_birth DATE,
    marital_status TEXT,
    nationality TEXT,
    languages TEXT[],
    religion TEXT,
    education_level TEXT,
    experience_years INTEGER,
    skills TEXT[],
    hourly_rate DECIMAL(10,2),
    availability_status TEXT DEFAULT 'available',
    profile_image_url TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    emergency_contact_name TEXT,
    emergency_contact_number TEXT,
    emergency_contact_relationship TEXT,
    background_check_completed BOOLEAN DEFAULT FALSE,
    background_check_status TEXT DEFAULT 'pending',
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    verification_status TEXT DEFAULT 'pending',
    verified_at TIMESTAMP WITH TIME ZONE,
    password_hash TEXT NOT NULL,
    reset_token TEXT,
    reset_token_expiry TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create homeowners table
CREATE TABLE IF NOT EXISTS public.homeowners (
    id UUID PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    contact_number TEXT,
    gender TEXT,
    date_of_birth DATE,
    marital_status TEXT,
    nationality TEXT,
    languages TEXT[],
    religion TEXT,
    occupation TEXT,
    employer TEXT,
    employer_address TEXT,
    monthly_income DECIMAL(12,2),
    household_size INTEGER,
    residence_type TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    home_ownership_status TEXT,
    years_at_residence INTEGER,
    emergency_contact_name TEXT,
    emergency_contact_number TEXT,
    emergency_contact_relationship TEXT,
    profile_image_url TEXT,
    preferred_payment_method TEXT,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    verification_status TEXT DEFAULT 'pending',
    verified_at TIMESTAMP WITH TIME ZONE,
    password_hash TEXT NOT NULL,
    reset_token TEXT,
    reset_token_expiry TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admins table
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    contact_number TEXT,
    gender TEXT,
    role TEXT NOT NULL DEFAULT 'admin',
    permissions TEXT[],
    password_hash TEXT NOT NULL,
    reset_token TEXT,
    reset_token_expiry TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dropdown option tables
CREATE TABLE IF NOT EXISTS public.genders (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS public.marital_statuses (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS public.payment_methods (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS public.residence_types (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS public.worker_info_options (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS public.criminal_record_options (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS public.smoking_drinking_restrictions (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

-- Insert default dropdown data
INSERT INTO public.genders (name) VALUES 
    ('Male'), ('Female'), ('Other')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.marital_statuses (name) VALUES 
    ('Single'), ('Married'), ('Divorced'), ('Widowed')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.payment_methods (name) VALUES 
    ('Bank Transfer'), ('Mobile Money')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.residence_types (name) VALUES 
    ('Studio'), ('Apartment'), ('Villa'), ('Mansion'), ('House')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.worker_info_options (name) VALUES 
    ('Full-time'), ('Part-time'), ('Live-in'), ('Live-out')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.criminal_record_options (name) VALUES 
    ('Yes'), ('No')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.smoking_drinking_restrictions (name) VALUES 
    ('No smoking/drinking allowed'),
    ('Smoking allowed outside only'),
    ('Drinking allowed in moderation'),
    ('No restrictions')
ON CONFLICT (name) DO NOTHING;

-- Create services table
CREATE TABLE IF NOT EXISTS public.services (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default services
INSERT INTO public.services (name, description) VALUES 
    ('Cooking', 'Professional cooking and meal preparation'),
    ('Washing', 'Clothing and fabric washing services'),
    ('Cleaning', 'General house cleaning and maintenance'),
    ('Gardening', 'Garden and outdoor area maintenance'),
    ('Elderly Care', 'Specialized care for elderly family members'),
    ('Pet Care', 'Pet feeding, walking, and basic care'),
    ('Child Care', 'Child supervision and basic care'),
    ('Laundry & Ironing', 'Complete laundry and ironing services')
;

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homeowners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for registration (allow unauthenticated inserts)
CREATE POLICY "Allow registration for user_profiles" ON public.user_profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow registration for workers" ON public.workers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow registration for homeowners" ON public.homeowners
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow registration for admins" ON public.admins
    FOR INSERT WITH CHECK (true);

-- Create RLS policies for reading (allow users to read their own data)
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view own worker profile" ON public.workers
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view own homeowner profile" ON public.homeowners
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view own admin profile" ON public.admins
    FOR SELECT USING (auth.uid() = id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON public.user_profiles(created_at);

CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_reset_token ON public.admins(reset_token);
CREATE INDEX IF NOT EXISTS idx_admins_reset_token_expiry ON public.admins(reset_token_expiry);

CREATE INDEX IF NOT EXISTS idx_workers_email ON public.workers(email);
CREATE INDEX IF NOT EXISTS idx_workers_reset_token ON public.workers(reset_token);
CREATE INDEX IF NOT EXISTS idx_workers_reset_token_expiry ON public.workers(reset_token_expiry);
CREATE INDEX IF NOT EXISTS idx_workers_skills ON public.workers USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_workers_availability ON public.workers(availability_status);
CREATE INDEX IF NOT EXISTS idx_workers_rating ON public.workers(rating);
CREATE INDEX IF NOT EXISTS idx_workers_verification ON public.workers(verification_status);

CREATE INDEX IF NOT EXISTS idx_homeowners_email ON public.homeowners(email);
CREATE INDEX IF NOT EXISTS idx_homeowners_reset_token ON public.homeowners(reset_token);
CREATE INDEX IF NOT EXISTS idx_homeowners_reset_token_expiry ON public.homeowners(reset_token_expiry);
CREATE INDEX IF NOT EXISTS idx_homeowners_residence_type ON public.homeowners(residence_type);
CREATE INDEX IF NOT EXISTS idx_homeowners_verification ON public.homeowners(verification_status);