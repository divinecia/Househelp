-- HouseHelp Database Schema for Supabase
-- Copy and execute these SQL queries in Supabase SQL Editor

-- ============================================================
-- 1. USER PROFILES TABLE (Main user table)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  role TEXT NOT NULL CHECK (role IN ('worker', 'homeowner', 'admin')),
  national_id TEXT UNIQUE,
  profile_image_url TEXT,
  bio TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. WORKERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS workers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  marital_status TEXT,
  phone_number TEXT NOT NULL,
  national_id TEXT UNIQUE NOT NULL,
  type_of_work TEXT,
  work_experience INTEGER,
  expected_wages TEXT,
  working_hours_and_days TEXT,
  education_qualification TEXT,
  education_certificate_url TEXT,
  training_certificate_url TEXT,
  criminal_record_url TEXT,
  language_proficiency TEXT,
  insurance_company TEXT,
  health_condition TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  bank_account_number TEXT,
  account_holder_name TEXT,
  terms_accepted BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  rating DECIMAL(3,2),
  total_bookings INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. HOMEOWNERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS homeowners (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  age INTEGER,
  contact_number TEXT NOT NULL,
  home_address TEXT NOT NULL,
  type_of_residence TEXT CHECK (type_of_residence IN ('studio', 'apartment', 'villa', 'mansion')),
  number_of_family_members INTEGER,
  home_composition JSONB,
  home_composition_details TEXT,
  national_id TEXT,
  worker_info TEXT CHECK (worker_info IN ('full-time', 'part-time', 'live-in')),
  specific_duties TEXT,
  working_hours_and_schedule TEXT,
  number_of_workers_needed INTEGER,
  preferred_gender TEXT CHECK (preferred_gender IN ('male', 'female', 'any')),
  language_preference TEXT,
  wages_offered TEXT,
  reason_for_hiring TEXT,
  special_requirements TEXT,
  start_date_required DATE,
  criminal_record_required BOOLEAN,
  payment_mode TEXT CHECK (payment_mode IN ('bank', 'cash', 'mobile')),
  bank_details TEXT,
  religious_preferences TEXT,
  smoking_drinking_restrictions TEXT,
  specific_skills_needed TEXT,
  selected_days TEXT,
  terms_accepted BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 4. ADMINS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  contact_number TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  role TEXT DEFAULT 'admin',
  permissions JSONB,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 5. BOOKINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  homeowner_id UUID NOT NULL REFERENCES homeowners(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES workers(id) ON DELETE SET NULL,
  booking_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  service_type TEXT,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  amount DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 6. PAYMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  homeowner_id UUID NOT NULL REFERENCES homeowners(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES workers(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT DEFAULT 'flutterwave' CHECK (payment_method IN ('flutterwave', 'bank_transfer', 'cash')),
  transaction_ref TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 7. SERVICES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 8. TRAININGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS trainings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  instructor TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 9. WORKER TRAININGS (Many-to-Many)
-- ============================================================
CREATE TABLE IF NOT EXISTS worker_trainings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  training_id UUID NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  completion_status TEXT CHECK (completion_status IN ('pending', 'in_progress', 'completed')),
  completed_date DATE,
  certificate_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(worker_id, training_id)
);

-- ============================================================
-- 10. NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('booking', 'payment', 'rating', 'message', 'system')),
  title TEXT NOT NULL,
  body TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  related_id UUID,
  related_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 11. REPORTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 12. RATINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  reviewed_user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INDEXES for Performance
-- ============================================================
CREATE INDEX idx_workers_status ON workers(status);
CREATE INDEX idx_workers_type_of_work ON workers(type_of_work);
CREATE INDEX idx_homeowners_status ON homeowners(status);
CREATE INDEX idx_bookings_homeowner_id ON bookings(homeowner_id);
CREATE INDEX idx_bookings_worker_id ON bookings(worker_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_ratings_reviewed_user_id ON ratings(reviewed_user_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE homeowners ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- User profiles: Users can view their own profile
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Workers: Users can view their own profile, public can view active workers
CREATE POLICY "Users can view own worker profile" ON workers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Anyone can view active workers" ON workers
  FOR SELECT USING (status = 'active');

-- Homeowners: Users can view their own profile
CREATE POLICY "Users can view own homeowner profile" ON homeowners
  FOR SELECT USING (auth.uid() = id);

-- Bookings: Users can view their own bookings
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (
    auth.uid() = homeowner_id OR auth.uid() = worker_id
  );

-- Notifications: Users can only view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);
