// Shared types for Supabase database
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          role: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      workers: {
        Row: {
          id: string
          user_id: string
          full_name: string
          phone_number: string
          date_of_birth: string
          gender: string
          marital_status: string
          national_id: string
          type_of_work: string
          work_experience: string
          expected_wages: string
          working_hours_and_days: string
          education_qualification: string
          language_proficiency: string
          health_condition: string
          emergency_name: string
          emergency_contact: string
          bank_account_number: string
          account_holder: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          phone_number: string
          date_of_birth: string
          gender: string
          marital_status: string
          national_id: string
          type_of_work: string
          work_experience: string
          expected_wages: string
          working_hours_and_days: string
          education_qualification: string
          language_proficiency: string
          health_condition: string
          emergency_name: string
          emergency_contact: string
          bank_account_number: string
          account_holder: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          phone_number?: string
          date_of_birth?: string
          gender?: string
          marital_status?: string
          national_id?: string
          type_of_work?: string
          work_experience?: string
          expected_wages?: string
          working_hours_and_days?: string
          education_qualification?: string
          language_proficiency?: string
          health_condition?: string
          emergency_name?: string
          emergency_contact?: string
          bank_account_number?: string
          account_holder?: string
          created_at?: string
          updated_at?: string
        }
      }
      homeowners: {
        Row: {
          id: string
          user_id: string
          full_name: string
          contact_number: string
          home_address: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          contact_number: string
          home_address: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          contact_number?: string
          home_address?: string
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          homeowner_id: string
          worker_id: string
          service_type: string
          booking_date: string
          status: string
          amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          homeowner_id: string
          worker_id: string
          service_type: string
          booking_date: string
          status: string
          amount: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          homeowner_id?: string
          worker_id?: string
          service_type?: string
          booking_date?: string
          status?: string
          amount?: number
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          amount: number
          currency: string
          status: string
          transaction_ref: string
          payment_method: string
          description: string
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          currency: string
          status: string
          transaction_ref: string
          payment_method: string
          description: string
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          currency?: string
          status?: string
          transaction_ref?: string
          payment_method?: string
          description?: string
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          read: boolean
          data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          read?: boolean
          data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          read?: boolean
          data?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      admins: {
        Row: {
          id: string
          user_id: string
          full_name: string
          contact_number: string
          gender: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          contact_number: string
          gender: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          contact_number?: string
          gender?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          role: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      trainings: {
        Row: {
          id: string
          title: string
          description: string
          category: string
          duration: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: string
          duration: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: string
          duration?: string
          created_at?: string
          updated_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          title: string
          description: string
          type: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          type: string
          status: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          type?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
