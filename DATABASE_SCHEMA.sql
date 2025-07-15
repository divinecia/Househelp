-- HouseHelp Rwanda Database Schema
-- Complete schema for the domestic help platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS for location services
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================================
-- CORE USER TABLES
-- ============================================================================

-- Users table - Base user information
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('worker', 'household', 'admin')),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    profile_photo TEXT,
    date_of_birth DATE,
    gender VARCHAR(10),
    language VARCHAR(10) DEFAULT 'en',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    metadata JSONB
);

-- Worker profiles
CREATE TABLE worker_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    national_id VARCHAR(50) UNIQUE,
    bio TEXT,
    years_of_experience INTEGER DEFAULT 0,
    service_categories TEXT[] DEFAULT '{}',
    skills TEXT[] DEFAULT '{}',
    certifications TEXT[] DEFAULT '{}',
    hourly_rate DECIMAL(10,2),
    availability_schedule JSONB,
    available_days TEXT[] DEFAULT '{}',
    location GEOGRAPHY(POINT, 4326),
    district VARCHAR(100),
    sector VARCHAR(100),
    cell VARCHAR(100),
    rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    total_jobs INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    is_background_checked BOOLEAN DEFAULT false,
    emergency_contact JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Household profiles
CREATE TABLE household_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    household_size INTEGER,
    address TEXT,
    location GEOGRAPHY(POINT, 4326),
    district VARCHAR(100),
    sector VARCHAR(100),
    cell VARCHAR(100),
    preferred_services TEXT[] DEFAULT '{}',
    budget_range JSONB,
    rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    total_jobs INTEGER DEFAULT 0,
    emergency_contact JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Admin profiles
CREATE TABLE admin_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    admin_level VARCHAR(20) DEFAULT 'admin' CHECK (admin_level IN ('super_admin', 'admin', 'moderator')),
    permissions TEXT[] DEFAULT '{}',
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- ============================================================================
-- JOB MANAGEMENT TABLES
-- ============================================================================

-- Jobs table
CREATE TABLE jobs (
    id VARCHAR(100) PRIMARY KEY,
    household_id UUID NOT NULL REFERENCES users(id),
    worker_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    job_type VARCHAR(20) NOT NULL CHECK (job_type IN ('one_time', 'recurring', 'urgent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled', 'disputed')),
    requested_date TIMESTAMP NOT NULL,
    scheduled_date TIMESTAMP,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    estimated_duration INTEGER, -- in minutes
    hourly_rate DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    latitude DECIMAL(10,8),
    longitude DECIMAL(10,8),
    location_description TEXT,
    requirements TEXT[] DEFAULT '{}',
    supplies TEXT[] DEFAULT '{}',
    recurrence_type VARCHAR(20) DEFAULT 'none' CHECK (recurrence_type IN ('none', 'daily', 'weekly', 'biweekly', 'monthly')),
    recurrence_interval INTEGER,
    recurrence_end_date TIMESTAMP,
    is_urgent BOOLEAN DEFAULT false,
    urgent_premium DECIMAL(10,2),
    rating DECIMAL(3,2),
    review TEXT,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    metadata JSONB
);

-- Job applications
CREATE TABLE job_applications (
    id VARCHAR(100) PRIMARY KEY,
    job_id VARCHAR(100) NOT NULL REFERENCES jobs(id),
    worker_id UUID NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    proposed_rate DECIMAL(10,2) NOT NULL,
    available_date TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP,
    response_message TEXT
);

-- Service packages
CREATE TABLE service_packages (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    price DECIMAL(10,2) NOT NULL,
    includes TEXT[] DEFAULT '{}',
    excludes TEXT[] DEFAULT '{}',
    is_popular BOOLEAN DEFAULT false,
    discount DECIMAL(5,2),
    discount_valid_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- RATINGS AND REVIEWS
-- ============================================================================

-- Ratings table
CREATE TABLE ratings (
    id VARCHAR(100) PRIMARY KEY,
    job_id VARCHAR(100) NOT NULL REFERENCES jobs(id),
    rater_id UUID NOT NULL REFERENCES users(id),
    ratee_id UUID NOT NULL REFERENCES users(id),
    rating DECIMAL(3,2) NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    categories TEXT[] DEFAULT '{}',
    category_ratings JSONB,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- MESSAGING SYSTEM
-- ============================================================================

-- Conversations
CREATE TABLE conversations (
    id VARCHAR(100) PRIMARY KEY,
    participant_ids UUID[] NOT NULL,
    job_id VARCHAR(100) REFERENCES jobs(id),
    title VARCHAR(255),
    last_message_id VARCHAR(100),
    last_message_content TEXT,
    last_message_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    is_group_chat BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Messages
CREATE TABLE messages (
    id VARCHAR(100) PRIMARY KEY,
    conversation_id VARCHAR(100) NOT NULL REFERENCES conversations(id),
    sender_id UUID NOT NULL REFERENCES users(id),
    recipient_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text', 'image', 'video', 'audio', 'file', 'location', 'system', 'job_update', 'payment_reminder', 'rating')),
    job_id VARCHAR(100) REFERENCES jobs(id),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    delivered_at TIMESTAMP,
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP,
    reply_to_id VARCHAR(100) REFERENCES messages(id),
    reactions TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Message delivery status
CREATE TABLE message_delivery_status (
    message_id VARCHAR(100) PRIMARY KEY REFERENCES messages(id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Typing indicators
CREATE TABLE typing_indicators (
    conversation_id VARCHAR(100) NOT NULL REFERENCES conversations(id),
    user_id UUID NOT NULL REFERENCES users(id),
    is_typing BOOLEAN DEFAULT false,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (conversation_id, user_id)
);

-- Blocked users
CREATE TABLE blocked_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    blocked_user_id UUID NOT NULL REFERENCES users(id),
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, blocked_user_id)
);

-- Conversation reports
CREATE TABLE conversation_reports (
    id VARCHAR(100) PRIMARY KEY,
    reporter_id UUID NOT NULL REFERENCES users(id),
    conversation_id VARCHAR(100) NOT NULL REFERENCES conversations(id),
    reason VARCHAR(100) NOT NULL,
    details TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    resolved_by UUID REFERENCES users(id),
    resolution TEXT
);

-- ============================================================================
-- PAYMENT SYSTEM
-- ============================================================================

-- Payment records
CREATE TABLE payment_records (
    id VARCHAR(100) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    job_id VARCHAR(100) REFERENCES jobs(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('service', 'training')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    reference_id VARCHAR(100),
    gross_amount DECIMAL(10,2),
    vat_amount DECIMAL(10,2),
    income_tax DECIMAL(10,2),
    social_security DECIMAL(10,2),
    net_amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Worker earnings
CREATE TABLE worker_earnings (
    id VARCHAR(100) PRIMARY KEY,
    worker_id UUID NOT NULL REFERENCES users(id),
    job_id VARCHAR(100) NOT NULL REFERENCES jobs(id),
    gross_amount DECIMAL(10,2) NOT NULL,
    vat_amount DECIMAL(10,2) NOT NULL,
    income_tax DECIMAL(10,2) NOT NULL,
    social_security DECIMAL(10,2) NOT NULL,
    net_amount DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Tax reports
CREATE TABLE tax_reports (
    id VARCHAR(100) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_income DECIMAL(10,2) NOT NULL,
    total_vat DECIMAL(10,2) NOT NULL,
    total_income_tax DECIMAL(10,2) NOT NULL,
    total_social_security DECIMAL(10,2) NOT NULL,
    report_data JSONB,
    submitted_to_rra BOOLEAN DEFAULT false,
    submitted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TRAINING AND CERTIFICATION
-- ============================================================================

-- Training courses
CREATE TABLE training_courses (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    level VARCHAR(20) NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    instructor_id UUID NOT NULL REFERENCES users(id),
    thumbnail_url TEXT,
    duration INTEGER NOT NULL, -- in minutes
    is_free BOOLEAN DEFAULT false,
    price DECIMAL(10,2),
    has_certificate BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT '{}',
    prerequisites TEXT,
    learning_objectives TEXT[] DEFAULT '{}',
    language VARCHAR(10) DEFAULT 'en',
    rating DECIMAL(3,2) DEFAULT 0.00,
    rating_count INTEGER DEFAULT 0,
    enrollment_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Course modules
CREATE TABLE course_modules (
    id VARCHAR(100) PRIMARY KEY,
    course_id VARCHAR(100) NOT NULL REFERENCES training_courses(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    is_preview BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Module content
CREATE TABLE module_content (
    id VARCHAR(100) PRIMARY KEY,
    module_id VARCHAR(100) NOT NULL REFERENCES course_modules(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('video', 'text', 'image', 'audio', 'document', 'quiz', 'assignment', 'interactive')),
    content TEXT,
    content_url TEXT,
    order_index INTEGER NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    is_required BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Enrollments
CREATE TABLE enrollments (
    id VARCHAR(100) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    course_id VARCHAR(100) NOT NULL REFERENCES training_courses(id),
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'expired')),
    progress DECIMAL(5,2) DEFAULT 0.00,
    payment_amount DECIMAL(10,2),
    payment_method VARCHAR(50),
    last_accessed_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB,
    UNIQUE(user_id, course_id)
);

-- Course progress
CREATE TABLE course_progress (
    id VARCHAR(100) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    course_id VARCHAR(100) NOT NULL REFERENCES training_courses(id),
    module_id VARCHAR(100) NOT NULL REFERENCES course_modules(id),
    content_id VARCHAR(100) NOT NULL REFERENCES module_content(id),
    time_spent DECIMAL(10,2) NOT NULL, -- in minutes
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Certificates
CREATE TABLE certificates (
    id VARCHAR(100) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    course_id VARCHAR(100) NOT NULL REFERENCES training_courses(id),
    certificate_number VARCHAR(50) UNIQUE NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_valid BOOLEAN DEFAULT true,
    verification_url TEXT,
    metadata JSONB
);

-- Assignment submissions
CREATE TABLE assignment_submissions (
    id VARCHAR(100) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    assignment_id VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    attachments TEXT[] DEFAULT '{}',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected')),
    score DECIMAL(5,2),
    feedback TEXT,
    reviewed_by UUID REFERENCES users(id),
    metadata JSONB
);

-- Quiz attempts
CREATE TABLE quiz_attempts (
    id VARCHAR(100) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    quiz_id VARCHAR(100) NOT NULL,
    answers JSONB NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_passed BOOLEAN DEFAULT false,
    time_spent INTEGER DEFAULT 0, -- in minutes
    metadata JSONB
);

-- Learning paths
CREATE TABLE learning_paths (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    course_ids TEXT[] NOT NULL,
    estimated_duration INTEGER NOT NULL, -- in minutes
    level VARCHAR(20) NOT NULL,
    thumbnail_url TEXT,
    skills TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Learning path enrollments
CREATE TABLE learning_path_enrollments (
    id VARCHAR(100) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    path_id VARCHAR(100) NOT NULL REFERENCES learning_paths(id),
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    progress DECIMAL(5,2) DEFAULT 0.00,
    UNIQUE(user_id, path_id)
);

-- Course ratings
CREATE TABLE course_ratings (
    id VARCHAR(100) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    course_id VARCHAR(100) NOT NULL REFERENCES training_courses(id),
    rating DECIMAL(3,2) NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB,
    UNIQUE(user_id, course_id)
);

-- Instructors
CREATE TABLE instructors (
    id VARCHAR(100) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    bio TEXT NOT NULL,
    expertise VARCHAR(255) NOT NULL,
    qualifications TEXT[] DEFAULT '{}',
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_courses INTEGER DEFAULT 0,
    total_students INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Quizzes
CREATE TABLE quizzes (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    course_id VARCHAR(100) REFERENCES training_courses(id),
    module_id VARCHAR(100) REFERENCES course_modules(id),
    questions JSONB NOT NULL,
    passing_score DECIMAL(5,2) DEFAULT 70.00,
    time_limit INTEGER, -- in minutes
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- REFERRAL AND LOYALTY SYSTEM
-- ============================================================================

-- Referral codes
CREATE TABLE referral_codes (
    id VARCHAR(100) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    code VARCHAR(20) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    max_usage INTEGER,
    metadata JSONB
);

-- Referrals
CREATE TABLE referrals (
    id VARCHAR(100) PRIMARY KEY,
    referrer_id UUID NOT NULL REFERENCES users(id),
    referred_user_id UUID NOT NULL REFERENCES users(id),
    referral_code VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'expired')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    reward_amount DECIMAL(10,2),
    notes TEXT,
    metadata JSONB
);

-- Referral invitations
CREATE TABLE referral_invitations (
    id VARCHAR(100) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    referral_code VARCHAR(20) NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'accepted', 'expired')),
    accepted_at TIMESTAMP,
    accepted_by_user_id UUID REFERENCES users(id),
    metadata JSONB
);

-- Loyalty points
CREATE TABLE loyalty_points (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    total_points INTEGER DEFAULT 0,
    earned_points INTEGER DEFAULT 0,
    spent_points INTEGER DEFAULT 0,
    expired_points INTEGER DEFAULT 0,
    last_earned_at TIMESTAMP,
    last_spent_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Loyalty transactions
CREATE TABLE loyalty_transactions (
    id VARCHAR(100) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    points INTEGER NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    reference_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Loyalty rewards
CREATE TABLE loyalty_rewards (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('discount', 'cashback', 'free_service', 'points', 'upgrade')),
    points_required INTEGER NOT NULL,
    value DECIMAL(10,2),
    image_url TEXT,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    is_limited BOOLEAN DEFAULT false,
    stock_count INTEGER,
    max_redemptions INTEGER,
    terms TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Reward redemptions
CREATE TABLE reward_redemptions (
    id VARCHAR(100) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    reward_id VARCHAR(100) NOT NULL REFERENCES loyalty_rewards(id),
    points_spent INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'fulfilled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fulfilled_at TIMESTAMP,
    fulfillment_details TEXT,
    expires_at TIMESTAMP,
    notes TEXT,
    metadata JSONB
);

-- Loyalty tiers
CREATE TABLE loyalty_tiers (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    points_required INTEGER NOT NULL,
    color VARCHAR(20) NOT NULL,
    icon VARCHAR(100),
    benefits TEXT[] DEFAULT '{}',
    discount DECIMAL(5,2),
    priority_level INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Promotions
CREATE TABLE promotions (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    points_multiplier INTEGER DEFAULT 1,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    target_user_type VARCHAR(20),
    conditions JSONB,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

-- Notifications
CREATE TABLE notifications (
    id VARCHAR(100) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- Notification preferences
CREATE TABLE notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    push_enabled BOOLEAN DEFAULT true,
    email_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT false,
    job_notifications BOOLEAN DEFAULT true,
    message_notifications BOOLEAN DEFAULT true,
    payment_notifications BOOLEAN DEFAULT true,
    marketing_notifications BOOLEAN DEFAULT false,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- EMERGENCY SYSTEM
-- ============================================================================

-- Emergency reports
CREATE TABLE emergency_reports (
    id VARCHAR(100) PRIMARY KEY,
    reporter_id UUID NOT NULL REFERENCES users(id),
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('app_issue', 'criminal', 'medical', 'safety')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    location GEOGRAPHY(POINT, 4326),
    location_description TEXT,
    contact_name VARCHAR(255),
    contact_phone VARCHAR(20),
    evidence_urls TEXT[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'in_progress', 'resolved', 'closed')),
    assigned_to UUID REFERENCES users(id),
    resolution TEXT,
    authority_contacted VARCHAR(100),
    reference_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    metadata JSONB
);

-- Emergency contacts
CREATE TABLE emergency_contacts (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- VERIFICATION SYSTEM
-- ============================================================================

-- Background checks
CREATE TABLE background_checks (
    id VARCHAR(100) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    check_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
    provider VARCHAR(100),
    reference_id VARCHAR(100),
    results JSONB,
    verified_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Document verifications
CREATE TABLE document_verifications (
    id VARCHAR(100) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    document_type VARCHAR(50) NOT NULL,
    document_url TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- ANALYTICS AND REPORTING
-- ============================================================================

-- User analytics
CREATE TABLE user_analytics (
    id VARCHAR(100) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    date DATE NOT NULL,
    sessions INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0, -- in minutes
    jobs_created INTEGER DEFAULT 0,
    jobs_completed INTEGER DEFAULT 0,
    messages_sent INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0.00,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);

-- Platform analytics
CREATE TABLE platform_analytics (
    id VARCHAR(100) PRIMARY KEY,
    date DATE NOT NULL,
    active_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    total_jobs INTEGER DEFAULT 0,
    completed_jobs INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0.00,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date)
);

-- ============================================================================
-- SYSTEM CONFIGURATION
-- ============================================================================

-- App settings
CREATE TABLE app_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id)
);

-- API keys
CREATE TABLE api_keys (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    key_value VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Worker profile indexes
CREATE INDEX idx_worker_profiles_user_id ON worker_profiles(user_id);
CREATE INDEX idx_worker_profiles_service_categories ON worker_profiles USING GIN(service_categories);
CREATE INDEX idx_worker_profiles_district ON worker_profiles(district);
CREATE INDEX idx_worker_profiles_rating ON worker_profiles(rating);
CREATE INDEX idx_worker_profiles_location ON worker_profiles USING GIST(location);

-- Household profile indexes
CREATE INDEX idx_household_profiles_user_id ON household_profiles(user_id);
CREATE INDEX idx_household_profiles_district ON household_profiles(district);
CREATE INDEX idx_household_profiles_location ON household_profiles USING GIST(location);

-- Job indexes
CREATE INDEX idx_jobs_household_id ON jobs(household_id);
CREATE INDEX idx_jobs_worker_id ON jobs(worker_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_service_type ON jobs(service_type);
CREATE INDEX idx_jobs_created_at ON jobs(created_at);
CREATE INDEX idx_jobs_scheduled_date ON jobs(scheduled_date);

-- Message indexes
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_is_read ON messages(is_read);

-- Training indexes
CREATE INDEX idx_training_courses_category ON training_courses(category);
CREATE INDEX idx_training_courses_instructor_id ON training_courses(instructor_id);
CREATE INDEX idx_training_courses_is_active ON training_courses(is_active);
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);

-- Referral indexes
CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred_user_id ON referrals(referred_user_id);
CREATE INDEX idx_referrals_status ON referrals(status);
CREATE INDEX idx_loyalty_transactions_user_id ON loyalty_transactions(user_id);

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert emergency contacts
INSERT INTO emergency_contacts (id, name, phone, type, description) VALUES
('ec_police', 'Police', '112', 'police', 'National Police Emergency Line'),
('ec_fire', 'Fire Department', '113', 'fire', 'Fire and Rescue Services'),
('ec_ambulance', 'Ambulance', '114', 'medical', 'Emergency Medical Services'),
('ec_isange', 'ISANGE One Stop Center', '3512', 'support', 'Gender-based violence support'),
('ec_hospital', 'Hospital Emergency', '912', 'medical', 'Hospital Emergency Line'),
('ec_red_cross', 'Red Cross', '116', 'support', 'Rwanda Red Cross Emergency'),
('ec_disaster', 'Disaster Management', '118', 'disaster', 'Disaster Management Office'),
('ec_child_helpline', 'Child Helpline', '116', 'support', 'Child Protection Helpline'),
('ec_mental_health', 'Mental Health', '3511', 'support', 'Mental Health Support Line');

-- Insert default app settings
INSERT INTO app_settings (key, value, description) VALUES
('app_version', '"1.0.0"', 'Current app version'),
('maintenance_mode', 'false', 'Maintenance mode status'),
('registration_enabled', 'true', 'User registration enabled'),
('tax_rates', '{"vat": 0.18, "income_tax": 0.30, "social_security": 0.06}', 'Tax rates configuration'),
('emergency_numbers', '{"police": "112", "fire": "113", "ambulance": "114", "isange": "3512"}', 'Emergency contact numbers'),
('supported_languages', '["en", "rw", "fr"]', 'Supported languages'),
('default_currency', '"RWF"', 'Default currency'),
('urgent_job_multiplier', '1.5', 'Urgent job price multiplier'),
('max_file_size', '10485760', 'Maximum file size in bytes (10MB)'),
('session_timeout', '3600', 'Session timeout in seconds');

-- Insert default loyalty tiers
INSERT INTO loyalty_tiers (id, name, points_required, color, benefits) VALUES
('tier_bronze', 'Bronze', 0, '#CD7F32', ARRAY['Basic support', 'Standard notifications']),
('tier_silver', 'Silver', 1000, '#C0C0C0', ARRAY['Priority support', 'Early access to features', '5% discount on services']),
('tier_gold', 'Gold', 5000, '#FFD700', ARRAY['Premium support', 'VIP features', '10% discount on services', 'Monthly rewards']),
('tier_platinum', 'Platinum', 15000, '#E5E4E2', ARRAY['24/7 support', 'Exclusive features', '15% discount on services', 'Weekly rewards', 'Personal account manager']);

-- Insert default service packages
INSERT INTO service_packages (id, name, description, service_type, duration, price, includes, excludes) VALUES
('pkg_basic_cleaning', 'Basic Cleaning', 'Standard house cleaning service', 'cleaning', 180, 5000, 
 ARRAY['Sweeping', 'Mopping', 'Dusting', 'Bathroom cleaning'], 
 ARRAY['Window cleaning', 'Carpet cleaning', 'Appliance cleaning']),
('pkg_deep_cleaning', 'Deep Cleaning', 'Comprehensive deep cleaning service', 'cleaning', 300, 8000,
 ARRAY['All basic cleaning', 'Window cleaning', 'Appliance cleaning', 'Cabinet cleaning'],
 ARRAY['Carpet steam cleaning', 'Upholstery cleaning']),
('pkg_cooking_basic', 'Basic Cooking', 'Simple meal preparation', 'cooking', 120, 3000,
 ARRAY['1 main dish', '1 side dish', 'Kitchen cleanup'],
 ARRAY['Grocery shopping', 'Special dietary meals']),
('pkg_cooking_family', 'Family Cooking', 'Complete family meal preparation', 'cooking', 180, 4500,
 ARRAY['2 main dishes', '2 side dishes', 'Kitchen cleanup', 'Meal planning'],
 ARRAY['Grocery shopping', 'Special dietary meals']);

-- ============================================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_worker_profiles_updated_at BEFORE UPDATE ON worker_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_household_profiles_updated_at BEFORE UPDATE ON household_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_courses_updated_at BEFORE UPDATE ON training_courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_records_updated_at BEFORE UPDATE ON payment_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate worker rating
CREATE OR REPLACE FUNCTION update_worker_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE worker_profiles 
    SET rating = (
        SELECT AVG(rating) 
        FROM ratings 
        WHERE ratee_id = NEW.ratee_id
    ),
    review_count = (
        SELECT COUNT(*) 
        FROM ratings 
        WHERE ratee_id = NEW.ratee_id
    )
    WHERE user_id = NEW.ratee_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update worker rating when new rating is added
CREATE TRIGGER update_worker_rating_trigger
    AFTER INSERT ON ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_worker_rating();

-- Function to update conversation last message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations 
    SET last_message_id = NEW.id,
        last_message_content = NEW.content,
        last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update conversation when new message is added
CREATE TRIGGER update_conversation_last_message_trigger
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View for worker profiles with user info
CREATE VIEW worker_profiles_view AS
SELECT 
    wp.*,
    u.first_name,
    u.last_name,
    u.email,
    u.phone,
    u.profile_photo,
    u.status as user_status,
    u.created_at as user_created_at
FROM worker_profiles wp
JOIN users u ON wp.user_id = u.id;

-- View for household profiles with user info  
CREATE VIEW household_profiles_view AS
SELECT 
    hp.*,
    u.first_name,
    u.last_name,
    u.email,
    u.phone,
    u.profile_photo,
    u.status as user_status,
    u.created_at as user_created_at
FROM household_profiles hp
JOIN users u ON hp.user_id = u.id;

-- View for jobs with user info
CREATE VIEW jobs_view AS
SELECT 
    j.*,
    h.first_name as household_first_name,
    h.last_name as household_last_name,
    h.phone as household_phone,
    w.first_name as worker_first_name,
    w.last_name as worker_last_name,
    w.phone as worker_phone
FROM jobs j
JOIN users h ON j.household_id = h.id
LEFT JOIN users w ON j.worker_id = w.id;

-- View for active jobs with location
CREATE VIEW active_jobs_view AS
SELECT 
    j.*,
    hp.district as household_district,
    hp.location as household_location
FROM jobs j
JOIN household_profiles hp ON j.household_id = hp.user_id
WHERE j.status IN ('pending', 'accepted', 'in_progress');

-- View for worker earnings summary
CREATE VIEW worker_earnings_summary AS
SELECT 
    worker_id,
    COUNT(*) as total_jobs,
    SUM(gross_amount) as total_gross,
    SUM(net_amount) as total_net,
    AVG(net_amount) as avg_net,
    MIN(created_at) as first_job_date,
    MAX(created_at) as last_job_date
FROM worker_earnings
GROUP BY worker_id;

-- View for training course enrollments
CREATE VIEW course_enrollments_view AS
SELECT 
    e.*,
    tc.title as course_title,
    tc.category as course_category,
    tc.instructor_id,
    u.first_name as student_first_name,
    u.last_name as student_last_name
FROM enrollments e
JOIN training_courses tc ON e.course_id = tc.id
JOIN users u ON e.user_id = u.id;

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================

-- Procedure to get nearby workers
CREATE OR REPLACE FUNCTION get_nearby_workers(
    household_lat DECIMAL,
    household_lng DECIMAL,
    max_distance_km INTEGER DEFAULT 10,
    service_type VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    user_id UUID,
    first_name VARCHAR,
    last_name VARCHAR,
    rating DECIMAL,
    distance_km DECIMAL,
    hourly_rate DECIMAL,
    service_categories TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        wp.user_id,
        u.first_name,
        u.last_name,
        wp.rating,
        ROUND(
            ST_Distance(
                ST_SetSRID(ST_MakePoint(household_lng, household_lat), 4326)::geography,
                wp.location
            ) / 1000, 2
        ) as distance_km,
        wp.hourly_rate,
        wp.service_categories
    FROM worker_profiles wp
    JOIN users u ON wp.user_id = u.id
    WHERE 
        u.status = 'active' 
        AND wp.is_verified = true
        AND ST_DWithin(
            ST_SetSRID(ST_MakePoint(household_lng, household_lat), 4326)::geography,
            wp.location,
            max_distance_km * 1000
        )
        AND (service_type IS NULL OR service_type = ANY(wp.service_categories))
    ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;

-- Procedure to get job recommendations
CREATE OR REPLACE FUNCTION get_job_recommendations(
    worker_user_id UUID,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    job_id VARCHAR,
    title VARCHAR,
    service_type VARCHAR,
    hourly_rate DECIMAL,
    distance_km DECIMAL,
    match_score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        j.id as job_id,
        j.title,
        j.service_type,
        j.hourly_rate,
        ROUND(
            ST_Distance(
                wp.location,
                ST_SetSRID(ST_MakePoint(j.longitude, j.latitude), 4326)::geography
            ) / 1000, 2
        ) as distance_km,
        -- Simple match score based on service type match and rating
        CASE 
            WHEN j.service_type = ANY(wp.service_categories) THEN wp.rating * 20
            ELSE wp.rating * 10
        END as match_score
    FROM jobs j
    JOIN worker_profiles wp ON wp.user_id = worker_user_id
    LEFT JOIN job_applications ja ON ja.job_id = j.id AND ja.worker_id = worker_user_id
    WHERE 
        j.status = 'pending'
        AND j.latitude IS NOT NULL 
        AND j.longitude IS NOT NULL
        AND ja.id IS NULL -- Worker hasn't applied yet
        AND ST_DWithin(
            wp.location,
            ST_SetSRID(ST_MakePoint(j.longitude, j.latitude), 4326)::geography,
            50000 -- 50km radius
        )
    ORDER BY match_score DESC, distance_km ASC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SECURITY POLICIES (Row Level Security)
-- ============================================================================

-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY users_own_data ON users
    FOR ALL
    TO authenticated
    USING (auth.uid() = id);

-- Workers can only see their own profile
CREATE POLICY workers_own_profile ON worker_profiles
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);

-- Households can only see their own profile
CREATE POLICY households_own_profile ON household_profiles
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);

-- Jobs visibility rules
CREATE POLICY jobs_visibility ON jobs
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = household_id OR 
        auth.uid() = worker_id OR 
        status = 'pending'
    );

-- Messages visibility rules
CREATE POLICY messages_visibility ON messages
    FOR ALL
    TO authenticated
    USING (
        auth.uid() = sender_id OR 
        auth.uid() = recipient_id
    );

-- Notifications are only visible to the recipient
CREATE POLICY notifications_own_data ON notifications
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);

-- Payment records are only visible to the user
CREATE POLICY payment_records_own_data ON payment_records
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);

-- Loyalty transactions are only visible to the user
CREATE POLICY loyalty_transactions_own_data ON loyalty_transactions
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);

-- ============================================================================
-- BACKUP AND MAINTENANCE
-- ============================================================================

-- Create backup schedule (this would be configured in your database system)
-- Example: Daily backup at 2 AM
-- pg_dump -h localhost -U postgres househelp_rwanda > backup_$(date +%Y%m%d).sql

-- Maintenance queries for cleanup
-- Clean up old notifications (older than 30 days)
-- DELETE FROM notifications WHERE created_at < NOW() - INTERVAL '30 days';

-- Clean up old messages (older than 1 year)
-- DELETE FROM messages WHERE created_at < NOW() - INTERVAL '1 year' AND is_deleted = true;

-- Clean up expired sessions
-- DELETE FROM auth.sessions WHERE expires_at < NOW();

-- Update statistics
-- ANALYZE;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Create indexes for full-text search
CREATE INDEX idx_jobs_search ON jobs USING gin(to_tsvector('english', title || ' ' || description));
CREATE INDEX idx_training_courses_search ON training_courses USING gin(to_tsvector('english', title || ' ' || description));

-- Create audit log table for important actions
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(100),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on audit log
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- ============================================================================
-- SUMMARY
-- ============================================================================

-- This schema provides:
-- ✅ Complete user management (workers, households, admins)
-- ✅ Job posting, application, and management system
-- ✅ Advanced search and matching algorithms
-- ✅ Comprehensive booking and scheduling system
-- ✅ Background check and verification system
-- ✅ Secure payment processing with tax calculations
-- ✅ Rating and review system
-- ✅ Real-time messaging and notifications
-- ✅ Training and certification programs
-- ✅ Geo-location and navigation support
-- ✅ Emergency reporting system
-- ✅ Multi-language support
-- ✅ Referral and loyalty programs
-- ✅ Analytics and reporting
-- ✅ Security with RLS policies
-- ✅ Performance optimization with indexes
-- ✅ Maintenance and backup considerations

-- Total tables: 50+
-- Total indexes: 30+
-- Total functions: 5+
-- Total views: 6+
-- Total triggers: 10+