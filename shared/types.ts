// ============================================================
// SHARED TYPE DEFINITIONS FOR HOUSEHELP APPLICATION
// ============================================================

export type UserRole = 'worker' | 'homeowner' | 'admin';
export type Gender = 'male' | 'female' | 'other';
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';
export type ResidenceType = 'studio' | 'apartment' | 'villa' | 'mansion';
export type WorkerInfoType = 'full-time' | 'part-time' | 'live-in';
export type PreferredGender = 'male' | 'female' | 'any';
export type PaymentMode = 'bank' | 'mobile';
export type BookingStatus = 'pending' | 'accepted' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'cancelled';
export type TrainingStatus = 'active' | 'inactive' | 'completed' | 'cancelled';
export type EnrollmentStatus = 'enrolled' | 'in_progress' | 'completed' | 'dropped';
export type ReportType = 'bug' | 'complaint' | 'suggestion' | 'other';
export type ReportStatus = 'pending' | 'in_review' | 'resolved' | 'closed';
export type ReportPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

// ============================================================
// USER PROFILE TYPES
// ============================================================

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Worker {
  id: string;
  email: string;
  full_name: string;
  date_of_birth?: string;
  gender?: Gender;
  marital_status?: string;
  phone_number?: string;
  national_id?: string;
  type_of_work?: string;
  work_experience?: string;
  expected_wages?: string;
  working_hours_and_days?: string;
  education_qualification?: string;
  education_certificate_url?: string;
  training_certificate_url?: string;
  criminal_record_url?: string;
  status?: string;
  language_proficiency?: string;
  insurance_company?: string;
  health_condition?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  bank_account_number?: string;
  account_holder_name?: string;
  terms_accepted?: boolean;
  hourly_rate?: number;
  experience_years?: number;
  created_at: string;
  updated_at: string;
}

export interface Homeowner {
  id: string;
  email: string;
  full_name: string;
  contact_number?: string;
  home_address?: string;
  type_of_residence?: ResidenceType;
  number_of_family_members?: string;
  home_composition?: Record<string, any>;
  home_composition_details?: string;
  national_id?: string;
  worker_info?: WorkerInfoType;
  specific_duties?: string;
  working_hours_and_schedule?: string;
  number_of_workers_needed?: string;
  preferred_gender?: PreferredGender;
  language_preference?: string;
  wages_offered?: string;
  reason_for_hiring?: string;
  special_requirements?: string;
  start_date_required?: string;
  criminal_record_required?: boolean;
  payment_mode?: PaymentMode;
  bank_details?: string;
  religious_preferences?: string;
  smoking_drinking_restrictions?: string;
  specific_skills_needed?: string;
  selected_days?: string;
  terms_accepted?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Admin {
  id: string;
  email: string;
  full_name: string;
  role: string;
  contact_number?: string;
  gender?: string;
  terms_accepted?: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================
// BOOKING AND PAYMENT TYPES
// ============================================================

export interface Booking {
  id: string;
  homeowner_id: string;
  worker_id?: string;
  job_title: string;
  description?: string;
  scheduled_date: string;
  duration_hours?: number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  rating?: number;
  review?: string;
  created_at: string;
  updated_at: string;
  completed_date?: string;
}

export interface Payment {
  id: string;
  booking_id?: string;
  amount: number;
  payment_method: string;
  transaction_ref?: string;
  status: PaymentStatus;
  description?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// TRAINING TYPES
// ============================================================

export interface Training {
  id: string;
  title: string;
  description?: string;
  category?: string;
  duration_hours?: number;
  instructor_name?: string;
  max_participants?: number;
  status: TrainingStatus;
  start_date?: string;
  end_date?: string;
  location?: string;
  cost?: number;
  created_at: string;
  updated_at: string;
}

export interface WorkerTraining {
  id: string;
  training_id: string;
  worker_id: string;
  status: EnrollmentStatus;
  progress_percentage: number;
  enrollment_date: string;
  completion_date?: string;
  certificate_url?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// REPORT TYPES
// ============================================================

export interface Report {
  id: string;
  user_id?: string;
  report_type: ReportType;
  issue_type?: string;
  title: string;
  description: string;
  reporter_email?: string;
  reporter_name?: string;
  status: ReportStatus;
  priority: ReportPriority;
  assigned_to?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

// ============================================================
// NOTIFICATION TYPES
// ============================================================

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  action_url?: string;
  data?: Record<string, any>;        // Add this line
  metadata?: Record<string, any>;
  created_at: string;
  read_at?: string;
}

// ============================================================
// OPTIONS/LOOKUP TYPES
// ============================================================

export interface OptionItem {
  id: string;
  name: string;
}

export interface Service extends OptionItem {
  active: boolean;
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  total?: number;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  total: number;
  limit: number;
  offset: number;
}

// ============================================================
// DATABASE TYPE DEFINITION (for Supabase)
// ============================================================

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<UserProfile, 'id'>>;
      };
      workers: {
        Row: Worker;
        Insert: Omit<Worker, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Worker, 'id'>>;
      };
      homeowners: {
        Row: Homeowner;
        Insert: Omit<Homeowner, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Homeowner, 'id'>>;
      };
      admins: {
        Row: Admin;
        Insert: Omit<Admin, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Admin, 'id'>>;
      };
      bookings: {
        Row: Booking;
        Insert: Omit<Booking, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Booking, 'id'>>;
      };
      payments: {
        Row: Payment;
        Insert: Omit<Payment, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Payment, 'id'>>;
      };
      trainings: {
        Row: Training;
        Insert: Omit<Training, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Training, 'id'>>;
      };
      worker_trainings: {
        Row: WorkerTraining;
        Insert: Omit<WorkerTraining, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<WorkerTraining, 'id'>>;
      };
      reports: {
        Row: Report;
        Insert: Omit<Report, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Report, 'id'>>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Notification, 'id'>>;
      };
      genders: {
        Row: OptionItem;
        Insert: OptionItem;
        Update: Partial<OptionItem>;
      };
      marital_statuses: {
        Row: OptionItem;
        Insert: OptionItem;
        Update: Partial<OptionItem>;
      };
      service_types: {
        Row: OptionItem;
        Insert: OptionItem;
        Update: Partial<OptionItem>;
      };
      insurance_companies: {
        Row: OptionItem;
        Insert: OptionItem;
        Update: Partial<OptionItem>;
      };
      payment_methods: {
        Row: OptionItem;
        Insert: OptionItem;
        Update: Partial<OptionItem>;
      };
      report_issue_types: {
        Row: OptionItem;
        Insert: OptionItem;
        Update: Partial<OptionItem>;
      };
      training_categories: {
        Row: OptionItem;
        Insert: OptionItem;
        Update: Partial<OptionItem>;
      };
      wage_units: {
        Row: OptionItem;
        Insert: OptionItem;
        Update: Partial<OptionItem>;
      };
      language_levels: {
        Row: OptionItem;
        Insert: OptionItem;
        Update: Partial<OptionItem>;
      };
      residence_types: {
        Row: OptionItem;
        Insert: OptionItem;
        Update: Partial<OptionItem>;
      };
      worker_info_options: {
        Row: OptionItem;
        Insert: OptionItem;
        Update: Partial<OptionItem>;
      };
      criminal_record_options: {
        Row: OptionItem;
        Insert: OptionItem;
        Update: Partial<OptionItem>;
      };
      smoking_drinking_restrictions: {
        Row: OptionItem;
        Insert: OptionItem;
        Update: Partial<OptionItem>;
      };
      services: {
        Row: Service;
        Insert: Service;
        Update: Partial<Service>;
      };
    };
  };
}