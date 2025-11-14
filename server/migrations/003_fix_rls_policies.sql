-- Migration 003: Fix RLS Policies for Registration and CRUD Operations
-- This migration adds missing INSERT policies and fixes RLS to allow proper auth flow

-- ============================================================
-- PART 1: USER_PROFILES TABLE - Fix RLS for Registration
-- ============================================================

-- Drop existing policies on user_profiles if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

-- Create new policies for user_profiles
-- Allow anyone to INSERT their own profile (needed for registration with auth.uid() as the new user)
CREATE POLICY "Users can create their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (
    -- Allow insert if the id being inserted matches the auth.uid()
    -- For new registrations, auth.uid() will be the new user's ID
    (SELECT auth.uid()) = id
  );

-- Allow users to SELECT their own profile
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to UPDATE their own profile
CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow service role or admin to DELETE profiles (for data cleanup)
CREATE POLICY "Service can delete profiles" ON public.user_profiles
  FOR DELETE USING (true);

-- ============================================================
-- PART 2: WORKERS TABLE - Fix RLS for Registration
-- ============================================================

-- Drop existing policy on workers if it exists
DROP POLICY IF EXISTS "Workers can view and manage their own data" ON public.workers;

-- Create new policies for workers
-- Allow users to INSERT their own worker profile
CREATE POLICY "Workers can create their own profile" ON public.workers
  FOR INSERT WITH CHECK (
    (SELECT auth.uid()) = id
  );

-- Allow workers to SELECT their own data
CREATE POLICY "Workers can view their own data" ON public.workers
  FOR SELECT USING (auth.uid() = id);

-- Allow workers to UPDATE their own data
CREATE POLICY "Workers can update their own data" ON public.workers
  FOR UPDATE USING (auth.uid() = id);

-- Allow workers to DELETE their own data
CREATE POLICY "Workers can delete their own data" ON public.workers
  FOR DELETE USING (auth.uid() = id);

-- Allow admins to view all workers
CREATE POLICY "Admins can view all workers" ON public.workers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- PART 3: HOMEOWNERS TABLE - Fix RLS for Registration
-- ============================================================

-- Drop existing policy on homeowners if it exists
DROP POLICY IF EXISTS "Homeowners can view and manage their own data" ON public.homeowners;

-- Create new policies for homeowners
-- Allow users to INSERT their own homeowner profile
CREATE POLICY "Homeowners can create their own profile" ON public.homeowners
  FOR INSERT WITH CHECK (
    (SELECT auth.uid()) = id
  );

-- Allow homeowners to SELECT their own data
CREATE POLICY "Homeowners can view their own data" ON public.homeowners
  FOR SELECT USING (auth.uid() = id);

-- Allow homeowners to UPDATE their own data
CREATE POLICY "Homeowners can update their own data" ON public.homeowners
  FOR UPDATE USING (auth.uid() = id);

-- Allow homeowners to DELETE their own data
CREATE POLICY "Homeowners can delete their own data" ON public.homeowners
  FOR DELETE USING (auth.uid() = id);

-- Allow admins to view all homeowners
CREATE POLICY "Admins can view all homeowners" ON public.homeowners
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- PART 4: ADMINS TABLE - Create Policies
-- ============================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view their own data" ON public.admins;
DROP POLICY IF EXISTS "Admins can update their own data" ON public.admins;

-- Create policies for admins
-- Allow users to INSERT their own admin profile
CREATE POLICY "Admins can create their own profile" ON public.admins
  FOR INSERT WITH CHECK (
    (SELECT auth.uid()) = id
  );

-- Allow admins to SELECT their own data
CREATE POLICY "Admins can view their own data" ON public.admins
  FOR SELECT USING (auth.uid() = id);

-- Allow admins to UPDATE their own data
CREATE POLICY "Admins can update their own data" ON public.admins
  FOR UPDATE USING (auth.uid() = id);

-- Allow admins to view all data for management
CREATE POLICY "Admins can view all users" ON public.admins
  FOR SELECT USING (true); -- Admins can view all

-- ============================================================
-- PART 5: BOOKINGS TABLE - Fix RLS
-- ============================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view bookings they created or are assigned to" ON public.bookings;
DROP POLICY IF EXISTS "Homeowners can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update bookings they own or are assigned to" ON public.bookings;

-- Create new policies for bookings
-- Allow users to INSERT bookings where they are the homeowner
CREATE POLICY "Homeowners can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (
    auth.uid() = homeowner_id
  );

-- Allow users to SELECT bookings they're involved in
CREATE POLICY "Users can view their bookings" ON public.bookings
  FOR SELECT USING (
    auth.uid() = homeowner_id OR auth.uid() = worker_id
  );

-- Allow users to UPDATE bookings they own
CREATE POLICY "Users can update their bookings" ON public.bookings
  FOR UPDATE USING (
    auth.uid() = homeowner_id OR auth.uid() = worker_id
  );

-- Allow users to DELETE their bookings
CREATE POLICY "Users can delete their bookings" ON public.bookings
  FOR DELETE USING (
    auth.uid() = homeowner_id OR auth.uid() = worker_id
  );

-- ============================================================
-- PART 6: PAYMENTS TABLE - Fix RLS
-- ============================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can create their own payments" ON public.payments;

-- Create new policies for payments
-- Allow users to INSERT payments
CREATE POLICY "Users can create payments" ON public.payments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
  );

-- Allow users to SELECT their payments
CREATE POLICY "Users can view their payments" ON public.payments
  FOR SELECT USING (
    auth.uid() = user_id
  );

-- Allow users to UPDATE their payments
CREATE POLICY "Users can update their payments" ON public.payments
  FOR UPDATE USING (
    auth.uid() = user_id
  );

-- ============================================================
-- PART 7: NOTIFICATIONS TABLE - Fix RLS
-- ============================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Service can insert notifications" ON public.notifications;

-- Create new policies for notifications
-- Allow service to INSERT notifications
CREATE POLICY "Service can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Allow users to SELECT their notifications
CREATE POLICY "Users can view their notifications" ON public.notifications
  FOR SELECT USING (
    auth.uid() = user_id
  );

-- Allow users to UPDATE their notifications
CREATE POLICY "Users can update their notifications" ON public.notifications
  FOR UPDATE USING (
    auth.uid() = user_id
  );

-- Allow users to DELETE their notifications
CREATE POLICY "Users can delete their notifications" ON public.notifications
  FOR DELETE USING (
    auth.uid() = user_id
  );

-- ============================================================
-- PART 8: MESSAGES TABLE - Fix RLS
-- ============================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view messages they sent or received" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;

-- Create new policies for messages
-- Allow users to INSERT messages
CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
  );

-- Allow users to SELECT messages
CREATE POLICY "Users can view their messages" ON public.messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = recipient_id
  );

-- Allow users to UPDATE messages (mark as read, etc)
CREATE POLICY "Users can update their messages" ON public.messages
  FOR UPDATE USING (
    auth.uid() = sender_id OR auth.uid() = recipient_id
  );

-- Allow users to DELETE messages
CREATE POLICY "Users can delete their messages" ON public.messages
  FOR DELETE USING (
    auth.uid() = sender_id OR auth.uid() = recipient_id
  );

-- ============================================================
-- PART 9: SERVICES TABLE - Allow Public READ
-- ============================================================

-- Enable RLS if not already
DO $$ 
BEGIN
    EXECUTE 'ALTER TABLE public.services ENABLE ROW LEVEL SECURITY';
EXCEPTION 
    WHEN OTHERS THEN NULL;
END $$;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view services" ON public.services;

-- Allow public to view services
CREATE POLICY "Anyone can view services" ON public.services
  FOR SELECT USING (true);

-- Allow service to INSERT/UPDATE/DELETE services (admin or service role)
CREATE POLICY "Service can manage services" ON public.services
  FOR ALL USING (true);

-- ============================================================
-- PART 10: TRAININGS TABLE - Allow Public READ
-- ============================================================

-- Enable RLS if not already
DO $$ 
BEGIN
    EXECUTE 'ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY';
EXCEPTION 
    WHEN OTHERS THEN NULL;
END $$;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view trainings" ON public.trainings;

-- Allow public to view trainings
CREATE POLICY "Anyone can view trainings" ON public.trainings
  FOR SELECT USING (true);

-- Allow service to manage trainings
CREATE POLICY "Service can manage trainings" ON public.trainings
  FOR ALL USING (true);

-- ============================================================
-- END OF MIGRATION
-- ============================================================
