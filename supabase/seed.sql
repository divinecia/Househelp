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
    age INTEGER,
    national_id TEXT,
    home_address TEXT,
    type_of_work TEXT,
    experience_years INTEGER,
    skills TEXT[],
    languages TEXT[],
    availability_status TEXT DEFAULT 'available',
    status TEXT DEFAULT 'pending',
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
    age INTEGER,
    national_id TEXT,
    home_address TEXT,
    type_of_residence TEXT,
    number_of_family_members INTEGER,
    home_composition JSONB,
    home_composition_details TEXT,
    worker_info TEXT,
    specific_duties TEXT,
    working_days TEXT[],
    working_hours_start TIME,
    working_hours_end TIME,
    salary_expectation DECIMAL(10,2),
    payment_mode TEXT,
    criminal_record_check BOOLEAN,
    smoking_drinking_restrictions TEXT,
    special_requirements TEXT,
    specific_skills_needed TEXT,
    religious_preferences TEXT,
    terms_accepted BOOLEAN DEFAULT FALSE,
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_workers_status ON public.workers(status);
CREATE INDEX IF NOT EXISTS idx_workers_availability ON public.workers(availability_status);
CREATE INDEX IF NOT EXISTS idx_homeowners_type_of_residence ON public.homeowners(type_of_residence);