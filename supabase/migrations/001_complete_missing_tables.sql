-- Complete Missing Tables Migration for HouseHelp Platform
-- This migration adds all critical missing tables to make the platform production-ready

-- ============================================================================
-- 1. BOOKINGS TABLE - Core booking system
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    homeowner_id UUID NOT NULL REFERENCES public.homeowners(id) ON DELETE CASCADE,
    worker_id UUID REFERENCES public.workers(id) ON DELETE SET NULL,
    service_id INTEGER NOT NULL REFERENCES public.services(id),

    -- Booking details
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_hours DECIMAL(4,2),
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern TEXT, -- 'daily', 'weekly', 'monthly'
    recurrence_end_date DATE,

    -- Location
    service_address TEXT NOT NULL,
    service_city TEXT NOT NULL,
    service_state TEXT,
    service_postal_code TEXT,
    location_notes TEXT,

    -- Status workflow
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'assigned', 'in_progress', 'completed', 'cancelled', 'disputed')),
    cancellation_reason TEXT,
    cancelled_by UUID REFERENCES public.user_profiles(id),
    cancelled_at TIMESTAMP WITH TIME ZONE,

    -- Payment
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
    payment_method TEXT,

    -- Special requirements
    special_instructions TEXT,
    required_skills TEXT[],
    preferred_worker_id UUID REFERENCES public.workers(id),

    -- Timestamps
    confirmed_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. PAYMENTS TABLE - Complete payment tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    payer_id UUID NOT NULL REFERENCES public.homeowners(id),
    payee_id UUID REFERENCES public.workers(id),

    -- Payment details
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'RWF',
    payment_method TEXT NOT NULL, -- 'flutterwave', 'paypack', 'bank_transfer', 'cash'
    payment_gateway TEXT, -- 'flutterwave', 'paypack'

    -- Transaction tracking
    transaction_id TEXT UNIQUE,
    transaction_reference TEXT,
    gateway_transaction_id TEXT,
    gateway_response JSONB,

    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'disputed')),
    failure_reason TEXT,

    -- Platform fee
    platform_fee DECIMAL(10,2) DEFAULT 0.00,
    worker_payout_amount DECIMAL(10,2),
    payout_status TEXT DEFAULT 'pending' CHECK (payout_status IN ('pending', 'processing', 'completed', 'failed')),
    payout_date TIMESTAMP WITH TIME ZONE,

    -- Invoice
    invoice_number TEXT UNIQUE,
    invoice_url TEXT,

    -- Timestamps
    paid_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. REVIEWS TABLE - Reviews and ratings system
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.user_profiles(id),
    reviewee_id UUID NOT NULL REFERENCES public.user_profiles(id),
    reviewer_role TEXT NOT NULL CHECK (reviewer_role IN ('worker', 'homeowner')),
    reviewee_role TEXT NOT NULL CHECK (reviewee_role IN ('worker', 'homeowner')),

    -- Rating (1-5 stars)
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),

    -- Detailed ratings (optional)
    punctuality_rating INTEGER CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),

    -- Review content
    title TEXT,
    comment TEXT,

    -- Moderation
    is_verified BOOLEAN DEFAULT FALSE,
    is_flagged BOOLEAN DEFAULT FALSE,
    moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'flagged')),
    moderated_by UUID REFERENCES public.admins(id),
    moderated_at TIMESTAMP WITH TIME ZONE,
    moderation_notes TEXT,

    -- Response
    response_text TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure only one review per booking per reviewer
    UNIQUE(booking_id, reviewer_id)
);

-- ============================================================================
-- 4. MESSAGES TABLE - Chat/messaging system
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL,
    sender_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,

    -- Message content
    message_text TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    attachment_url TEXT,
    attachment_type TEXT,
    attachment_size INTEGER,

    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    is_deleted_by_sender BOOLEAN DEFAULT FALSE,
    is_deleted_by_recipient BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 5. CONVERSATIONS TABLE - Chat conversations
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_1_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    participant_2_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,

    -- Last message tracking
    last_message_id UUID REFERENCES public.messages(id),
    last_message_at TIMESTAMP WITH TIME ZONE,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_archived_by_p1 BOOLEAN DEFAULT FALSE,
    is_archived_by_p2 BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure unique conversations (order-independent)
    UNIQUE(participant_1_id, participant_2_id)
);

-- ============================================================================
-- 6. NOTIFICATIONS TABLE - System notifications
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

    -- Notification details
    type TEXT NOT NULL, -- 'booking', 'payment', 'review', 'message', 'system', 'verification'
    title TEXT NOT NULL,
    message TEXT NOT NULL,

    -- Related entities
    related_id UUID, -- ID of related booking/payment/review/etc
    related_type TEXT, -- 'booking', 'payment', 'review', 'message'

    -- Actions
    action_url TEXT,
    action_text TEXT,

    -- Priority
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT FALSE,

    -- Delivery
    sent_via_email BOOLEAN DEFAULT FALSE,
    sent_via_sms BOOLEAN DEFAULT FALSE,
    sent_via_push BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- 7. APPLICATIONS TABLE - Worker job applications
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,

    -- Application details
    cover_letter TEXT,
    proposed_rate DECIMAL(10,2),
    availability_notes TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    rejection_reason TEXT,

    -- Timestamps
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure one application per worker per booking
    UNIQUE(booking_id, worker_id)
);

-- ============================================================================
-- 8. DISPUTES TABLE - Dispute resolution system
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,

    -- Dispute parties
    raised_by UUID NOT NULL REFERENCES public.user_profiles(id),
    against_user_id UUID NOT NULL REFERENCES public.user_profiles(id),

    -- Dispute details
    category TEXT NOT NULL, -- 'payment', 'service_quality', 'no_show', 'cancellation', 'safety', 'other'
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    evidence_urls TEXT[],

    -- Status
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed', 'escalated')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),

    -- Resolution
    assigned_to UUID REFERENCES public.admins(id),
    resolution_notes TEXT,
    resolution_action TEXT, -- 'refund_full', 'refund_partial', 'no_action', 'warning', 'suspension'
    refund_amount DECIMAL(10,2),

    -- Timestamps
    assigned_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 9. WORKER_TRAININGS TABLE - Training enrollments
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.trainings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT, -- 'safety', 'skills', 'customer_service', 'compliance'
    duration_hours INTEGER,
    instructor_name TEXT,

    -- Content
    content_url TEXT,
    video_url TEXT,
    document_urls TEXT[],

    -- Requirements
    is_mandatory BOOLEAN DEFAULT FALSE,
    prerequisites TEXT[],

    -- Availability
    is_active BOOLEAN DEFAULT TRUE,
    start_date DATE,
    end_date DATE,

    -- Capacity
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,

    -- Certification
    provides_certificate BOOLEAN DEFAULT FALSE,
    certificate_template_url TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.worker_trainings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
    training_id UUID NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,

    -- Enrollment
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    enrollment_status TEXT DEFAULT 'enrolled' CHECK (enrollment_status IN ('enrolled', 'in_progress', 'completed', 'dropped', 'failed')),

    -- Progress
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    last_accessed_at TIMESTAMP WITH TIME ZONE,

    -- Completion
    completed_at TIMESTAMP WITH TIME ZONE,
    completion_score DECIMAL(5,2),
    certificate_url TEXT,
    certificate_issued_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure one enrollment per worker per training
    UNIQUE(worker_id, training_id)
);

-- ============================================================================
-- 10. ACTIVITY_LOGS TABLE - Audit trail
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,

    -- Activity details
    action TEXT NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout', 'view'
    entity_type TEXT NOT NULL, -- 'booking', 'payment', 'worker', 'homeowner', 'review'
    entity_id UUID,

    -- Context
    description TEXT,
    changes JSONB, -- Store before/after values

    -- Request metadata
    ip_address INET,
    user_agent TEXT,
    request_method TEXT,
    request_path TEXT,

    -- Status
    status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failure', 'error')),
    error_message TEXT,

    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 11. FAVORITES TABLE - Saved workers for homeowners
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    homeowner_id UUID NOT NULL REFERENCES public.homeowners(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,

    -- Notes
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure unique favorites
    UNIQUE(homeowner_id, worker_id)
);

-- ============================================================================
-- 12. WORKER_AVAILABILITY TABLE - Availability calendar
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.worker_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,

    -- Date and time
    available_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    -- Type
    availability_type TEXT DEFAULT 'available' CHECK (availability_type IN ('available', 'unavailable', 'booked')),

    -- Recurring
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern TEXT, -- 'weekly', 'monthly'
    recurrence_end_date DATE,

    -- Notes
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 13. DOCUMENTS TABLE - Document management
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

    -- Document details
    document_type TEXT NOT NULL, -- 'national_id', 'background_check', 'certificate', 'proof_of_address', 'photo'
    document_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    file_type TEXT,

    -- Verification
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'expired')),
    verified_by UUID REFERENCES public.admins(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,

    -- Expiry
    expiry_date DATE,

    -- Timestamps
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 14. NOTIFICATION_PREFERENCES TABLE - User notification settings
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.user_profiles(id) ON DELETE CASCADE,

    -- Channel preferences
    email_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,

    -- Notification type preferences
    booking_notifications BOOLEAN DEFAULT TRUE,
    payment_notifications BOOLEAN DEFAULT TRUE,
    message_notifications BOOLEAN DEFAULT TRUE,
    review_notifications BOOLEAN DEFAULT TRUE,
    marketing_notifications BOOLEAN DEFAULT FALSE,

    -- Frequency
    digest_frequency TEXT DEFAULT 'realtime' CHECK (digest_frequency IN ('realtime', 'hourly', 'daily', 'weekly', 'off')),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 15. WITHDRAWAL_REQUESTS TABLE - Worker payout requests
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,

    -- Amount
    requested_amount DECIMAL(10,2) NOT NULL,
    available_balance DECIMAL(10,2) NOT NULL,
    withdrawal_fee DECIMAL(10,2) DEFAULT 0.00,
    net_amount DECIMAL(10,2) NOT NULL,

    -- Destination
    withdrawal_method TEXT NOT NULL, -- 'bank_transfer', 'mobile_money'
    account_number TEXT NOT NULL,
    account_name TEXT,
    bank_name TEXT,
    bank_branch TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'rejected', 'failed')),
    rejection_reason TEXT,
    failure_reason TEXT,

    -- Processing
    processed_by UUID REFERENCES public.admins(id),
    transaction_reference TEXT,

    -- Timestamps
    processed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Bookings indexes
CREATE INDEX IF NOT EXISTS idx_bookings_homeowner ON public.bookings(homeowner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_worker ON public.bookings(worker_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service ON public.bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON public.bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_booking ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_payer ON public.payments(payer_id);
CREATE INDEX IF NOT EXISTS idx_payments_payee ON public.payments(payee_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON public.payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_booking ON public.reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON public.reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON public.reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_moderation_status ON public.reviews(moderation_status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_booking ON public.messages(booking_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON public.messages(is_read);

-- Conversations indexes
CREATE INDEX IF NOT EXISTS idx_conversations_p1 ON public.conversations(participant_1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_p2 ON public.conversations(participant_2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_booking ON public.conversations(booking_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON public.notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- Applications indexes
CREATE INDEX IF NOT EXISTS idx_applications_booking ON public.applications(booking_id);
CREATE INDEX IF NOT EXISTS idx_applications_worker ON public.applications(worker_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON public.applications(created_at);

-- Disputes indexes
CREATE INDEX IF NOT EXISTS idx_disputes_booking ON public.disputes(booking_id);
CREATE INDEX IF NOT EXISTS idx_disputes_payment ON public.disputes(payment_id);
CREATE INDEX IF NOT EXISTS idx_disputes_raised_by ON public.disputes(raised_by);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON public.disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_assigned_to ON public.disputes(assigned_to);
CREATE INDEX IF NOT EXISTS idx_disputes_created_at ON public.disputes(created_at);

-- Worker trainings indexes
CREATE INDEX IF NOT EXISTS idx_worker_trainings_worker ON public.worker_trainings(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_trainings_training ON public.worker_trainings(training_id);
CREATE INDEX IF NOT EXISTS idx_worker_trainings_status ON public.worker_trainings(enrollment_status);
CREATE INDEX IF NOT EXISTS idx_worker_trainings_created_at ON public.worker_trainings(created_at);

-- Trainings indexes
CREATE INDEX IF NOT EXISTS idx_trainings_category ON public.trainings(category);
CREATE INDEX IF NOT EXISTS idx_trainings_is_active ON public.trainings(is_active);
CREATE INDEX IF NOT EXISTS idx_trainings_created_at ON public.trainings(created_at);

-- Activity logs indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON public.activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_id ON public.activity_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at);

-- Favorites indexes
CREATE INDEX IF NOT EXISTS idx_favorites_homeowner ON public.favorites(homeowner_id);
CREATE INDEX IF NOT EXISTS idx_favorites_worker ON public.favorites(worker_id);

-- Worker availability indexes
CREATE INDEX IF NOT EXISTS idx_worker_availability_worker ON public.worker_availability(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_availability_date ON public.worker_availability(available_date);
CREATE INDEX IF NOT EXISTS idx_worker_availability_type ON public.worker_availability(availability_type);

-- Documents indexes
CREATE INDEX IF NOT EXISTS idx_documents_user ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON public.documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_verification_status ON public.documents(verification_status);
CREATE INDEX IF NOT EXISTS idx_documents_expiry_date ON public.documents(expiry_date);

-- Withdrawal requests indexes
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_worker ON public.withdrawal_requests(worker_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON public.withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_created_at ON public.withdrawal_requests(created_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Bookings policies
CREATE POLICY "Homeowners can view their bookings" ON public.bookings
    FOR SELECT USING (homeowner_id = auth.uid());

CREATE POLICY "Workers can view their bookings" ON public.bookings
    FOR SELECT USING (worker_id = auth.uid());

CREATE POLICY "Homeowners can create bookings" ON public.bookings
    FOR INSERT WITH CHECK (homeowner_id = auth.uid());

CREATE POLICY "Homeowners can update their bookings" ON public.bookings
    FOR UPDATE USING (homeowner_id = auth.uid());

-- Payments policies
CREATE POLICY "Users can view their payments" ON public.payments
    FOR SELECT USING (payer_id = auth.uid() OR payee_id = auth.uid());

-- Reviews policies
CREATE POLICY "Users can view reviews about themselves" ON public.reviews
    FOR SELECT USING (reviewee_id = auth.uid());

CREATE POLICY "Users can view reviews they wrote" ON public.reviews
    FOR SELECT USING (reviewer_id = auth.uid());

CREATE POLICY "Users can create reviews" ON public.reviews
    FOR INSERT WITH CHECK (reviewer_id = auth.uid());

-- Messages policies
CREATE POLICY "Users can view their messages" ON public.messages
    FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Conversations policies
CREATE POLICY "Users can view their conversations" ON public.conversations
    FOR SELECT USING (participant_1_id = auth.uid() OR participant_2_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view their notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Applications policies
CREATE POLICY "Workers can create applications" ON public.applications
    FOR INSERT WITH CHECK (worker_id = auth.uid());

CREATE POLICY "Workers can view their applications" ON public.applications
    FOR SELECT USING (worker_id = auth.uid());

-- Disputes policies
CREATE POLICY "Users can create disputes" ON public.disputes
    FOR INSERT WITH CHECK (raised_by = auth.uid());

CREATE POLICY "Users can view disputes they're involved in" ON public.disputes
    FOR SELECT USING (raised_by = auth.uid() OR against_user_id = auth.uid());

-- Favorites policies
CREATE POLICY "Homeowners can manage their favorites" ON public.favorites
    FOR ALL USING (homeowner_id = auth.uid());

-- Worker availability policies
CREATE POLICY "Workers can manage their availability" ON public.worker_availability
    FOR ALL USING (worker_id = auth.uid());

-- Documents policies
CREATE POLICY "Users can view their documents" ON public.documents
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can upload documents" ON public.documents
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Notification preferences policies
CREATE POLICY "Users can manage their notification preferences" ON public.notification_preferences
    FOR ALL USING (user_id = auth.uid());

-- Withdrawal requests policies
CREATE POLICY "Workers can view their withdrawal requests" ON public.withdrawal_requests
    FOR SELECT USING (worker_id = auth.uid());

CREATE POLICY "Workers can create withdrawal requests" ON public.withdrawal_requests
    FOR INSERT WITH CHECK (worker_id = auth.uid());

-- Trainings policies (public read)
CREATE POLICY "Anyone can view active trainings" ON public.trainings
    FOR SELECT USING (is_active = TRUE);

-- Worker trainings policies
CREATE POLICY "Workers can view their trainings" ON public.worker_trainings
    FOR SELECT USING (worker_id = auth.uid());

CREATE POLICY "Workers can enroll in trainings" ON public.worker_trainings
    FOR INSERT WITH CHECK (worker_id = auth.uid());

CREATE POLICY "Workers can update their training progress" ON public.worker_trainings
    FOR UPDATE USING (worker_id = auth.uid());

-- ============================================================================
-- TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
-- ============================================================================

-- Create update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers to all tables with updated_at column
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON public.disputes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trainings_updated_at BEFORE UPDATE ON public.trainings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_worker_trainings_updated_at BEFORE UPDATE ON public.worker_trainings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_worker_availability_updated_at BEFORE UPDATE ON public.worker_availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_withdrawal_requests_updated_at BEFORE UPDATE ON public.withdrawal_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTIONS FOR RATING CALCULATIONS
-- ============================================================================

-- Function to update worker rating after review
CREATE OR REPLACE FUNCTION update_worker_rating()
RETURNS TRIGGER AS $$
DECLARE
    avg_rating DECIMAL(3,2);
    review_count INTEGER;
BEGIN
    -- Calculate average rating for the worker
    SELECT
        COALESCE(AVG(rating), 0.00)::DECIMAL(3,2),
        COUNT(*)
    INTO avg_rating, review_count
    FROM public.reviews
    WHERE reviewee_id = NEW.reviewee_id
      AND reviewee_role = 'worker'
      AND moderation_status = 'approved';

    -- Update worker table
    UPDATE public.workers
    SET
        rating = avg_rating,
        total_reviews = review_count,
        updated_at = NOW()
    WHERE id = NEW.reviewee_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update homeowner rating after review
CREATE OR REPLACE FUNCTION update_homeowner_rating()
RETURNS TRIGGER AS $$
DECLARE
    avg_rating DECIMAL(3,2);
    review_count INTEGER;
BEGIN
    -- Calculate average rating for the homeowner
    SELECT
        COALESCE(AVG(rating), 0.00)::DECIMAL(3,2),
        COUNT(*)
    INTO avg_rating, review_count
    FROM public.reviews
    WHERE reviewee_id = NEW.reviewee_id
      AND reviewee_role = 'homeowner'
      AND moderation_status = 'approved';

    -- Update homeowner table
    UPDATE public.homeowners
    SET
        rating = avg_rating,
        total_reviews = review_count,
        updated_at = NOW()
    WHERE id = NEW.reviewee_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for rating updates
CREATE TRIGGER update_worker_rating_trigger
AFTER INSERT OR UPDATE ON public.reviews
FOR EACH ROW
WHEN (NEW.reviewee_role = 'worker' AND NEW.moderation_status = 'approved')
EXECUTE FUNCTION update_worker_rating();

CREATE TRIGGER update_homeowner_rating_trigger
AFTER INSERT OR UPDATE ON public.reviews
FOR EACH ROW
WHEN (NEW.reviewee_role = 'homeowner' AND NEW.moderation_status = 'approved')
EXECUTE FUNCTION update_homeowner_rating();

-- ============================================================================
-- FUNCTION TO CREATE ACTIVITY LOGS
-- ============================================================================

CREATE OR REPLACE FUNCTION log_activity(
    p_user_id UUID,
    p_action TEXT,
    p_entity_type TEXT,
    p_entity_id UUID,
    p_description TEXT,
    p_changes JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.activity_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        description,
        changes,
        ip_address,
        user_agent
    ) VALUES (
        p_user_id,
        p_action,
        p_entity_type,
        p_entity_id,
        p_description,
        p_changes,
        p_ip_address,
        p_user_agent
    )
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Add comment to track migration
COMMENT ON SCHEMA public IS 'HouseHelp Platform - Complete Schema v1.0 - All tables migrated';
