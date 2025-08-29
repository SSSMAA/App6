import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'director' | 'head_trainer' | 'teacher' | 'agent' | 'marketer';
  avatar?: string;
  phone?: string;
  address?: string;
  hire_date?: string;
  salary?: number;
  status: 'active' | 'inactive' | 'suspended';
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  emergency_contact?: any;
  group_id?: string;
  enrollment_date: string;
  status: 'active' | 'inactive' | 'graduated' | 'dropped';
  notes?: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
  group_name?: string;
  group_level?: string;
  total_sessions?: number;
  attended_sessions?: number;
  missed_sessions?: number;
  total_payments?: number;
}

export interface Group {
  id: string;
  name: string;
  level: string;
  subject: string;
  teacher_id?: string;
  schedule?: any;
  max_students: number;
  fee_amount: number;
  description?: string;
  status: 'active' | 'inactive' | 'completed';
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  teacher_name?: string;
  student_count?: number;
  attendance_rate?: number;
}

export interface Payment {
  id: string;
  student_id: string;
  amount: number;
  payment_method: 'cash' | 'card' | 'bank_transfer' | 'check';
  payment_date: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  receipt_number?: string;
  notes?: string;
  processed_by?: string;
  created_at: string;
  updated_at: string;
  student_name?: string;
  group_name?: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  group_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  recorded_by?: string;
  created_at: string;
  updated_at: string;
  student_name?: string;
  student_email?: string;
}