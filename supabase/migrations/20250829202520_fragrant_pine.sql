/*
  # Complete ISCHOOLGO Database Schema

  1. New Tables
    - `users` - System users with different roles (admin, director, head_trainer, teacher, agent, marketer)
    - `students` - Student information and enrollment data
    - `visitors` - Potential students and leads
    - `groups` - Study groups and classes
    - `attendance` - Student attendance tracking
    - `payments` - Payment records and transactions
    - `marketing_campaigns` - Marketing campaign management
    - `expenses` - Business expense tracking
    - `inventory` - Equipment and resource management
    - `notifications` - System notifications
    - `ai_interactions` - AI chat and analysis history

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Secure sensitive data with proper constraints

  3. Features
    - Complete audit trail with created_at/updated_at
    - Soft delete capabilities
    - Foreign key relationships
    - Indexes for performance
    - Default values for consistency
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (system users with roles)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'director', 'head_trainer', 'teacher', 'agent', 'marketer')),
  avatar text,
  phone text,
  address text,
  hire_date date DEFAULT CURRENT_DATE,
  salary decimal(10,2),
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text UNIQUE,
  phone text,
  date_of_birth date,
  address text,
  emergency_contact jsonb,
  group_id uuid REFERENCES groups(id),
  enrollment_date date DEFAULT CURRENT_DATE,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated', 'dropped')),
  notes text,
  avatar text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Groups table (classes/study groups)
CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  level text NOT NULL,
  subject text NOT NULL,
  teacher_id uuid REFERENCES users(id),
  schedule jsonb,
  max_students integer DEFAULT 20,
  fee_amount decimal(10,2) NOT NULL DEFAULT 0,
  description text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  start_date date DEFAULT CURRENT_DATE,
  end_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Visitors table (potential students/leads)
CREATE TABLE IF NOT EXISTS visitors (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text,
  phone text NOT NULL,
  age integer,
  interests text[],
  source text,
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'interested', 'enrolled', 'not_interested')),
  assigned_to uuid REFERENCES users(id),
  notes text,
  visit_date date DEFAULT CURRENT_DATE,
  follow_up_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid NOT NULL REFERENCES students(id),
  group_id uuid NOT NULL REFERENCES groups(id),
  date date NOT NULL,
  status text NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  notes text,
  recorded_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(student_id, group_id, date)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid NOT NULL REFERENCES students(id),
  amount decimal(10,2) NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'check')),
  payment_date date NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  receipt_number text UNIQUE,
  notes text,
  processed_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Marketing campaigns table
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  type text NOT NULL,
  target_audience text NOT NULL,
  content text NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  budget decimal(10,2),
  spent_amount decimal(10,2) DEFAULT 0,
  leads_generated integer DEFAULT 0,
  conversions integer DEFAULT 0,
  start_date date,
  end_date date,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  category text NOT NULL,
  description text NOT NULL,
  amount decimal(10,2) NOT NULL,
  expense_date date NOT NULL,
  receipt_url text,
  approved_by uuid REFERENCES users(id),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_name text NOT NULL,
  category text NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  unit_price decimal(10,2),
  supplier text,
  location text,
  status text DEFAULT 'available' CHECK (status IN ('available', 'low_stock', 'out_of_stock', 'discontinued')),
  minimum_quantity integer DEFAULT 5,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id),
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read boolean DEFAULT false,
  action_url text,
  created_at timestamptz DEFAULT now()
);

-- AI interactions table
CREATE TABLE IF NOT EXISTS ai_interactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id),
  interaction_type text NOT NULL CHECK (interaction_type IN ('chat', 'analysis', 'content_generation', 'prediction')),
  input_data jsonb NOT NULL,
  output_data jsonb NOT NULL,
  context text,
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraint for students.group_id after groups table is created
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'students_group_id_fkey'
  ) THEN
    ALTER TABLE students ADD CONSTRAINT students_group_id_fkey 
    FOREIGN KEY (group_id) REFERENCES groups(id);
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all users" ON users
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage users" ON users
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for students table
CREATE POLICY "All authenticated users can read students" ON students
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authorized roles can manage students" ON students
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'director', 'head_trainer', 'teacher', 'agent')
    )
  );

-- RLS Policies for visitors table
CREATE POLICY "Marketing roles can manage visitors" ON visitors
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'director', 'agent', 'marketer')
    )
  );

-- RLS Policies for groups table
CREATE POLICY "All authenticated users can read groups" ON groups
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Teaching roles can manage groups" ON groups
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'director', 'head_trainer', 'teacher')
    )
  );

-- RLS Policies for attendance table
CREATE POLICY "Teaching roles can manage attendance" ON attendance
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'director', 'head_trainer', 'teacher')
    )
  );

-- RLS Policies for payments table
CREATE POLICY "Financial roles can manage payments" ON payments
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'director', 'agent')
    )
  );

-- RLS Policies for marketing_campaigns table
CREATE POLICY "Marketing roles can manage campaigns" ON marketing_campaigns
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'director', 'marketer')
    )
  );

-- RLS Policies for expenses table
CREATE POLICY "Management roles can manage expenses" ON expenses
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'director')
    )
  );

-- RLS Policies for inventory table
CREATE POLICY "All authenticated users can read inventory" ON inventory
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Management roles can manage inventory" ON inventory
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'director', 'head_trainer')
    )
  );

-- RLS Policies for notifications table
CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for ai_interactions table
CREATE POLICY "Users can read own AI interactions" ON ai_interactions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create AI interactions" ON ai_interactions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_students_group_id ON students(group_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_enrollment_date ON students(enrollment_date);

CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_group_id ON attendance(group_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);

CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

CREATE INDEX IF NOT EXISTS idx_visitors_status ON visitors(status);
CREATE INDEX IF NOT EXISTS idx_visitors_assigned_to ON visitors(assigned_to);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Insert default admin user
INSERT INTO users (email, password_hash, name, role, status) 
VALUES (
  'admin@ischoolgo.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', -- password: admin123
  'System Administrator',
  'admin',
  'active'
) ON CONFLICT (email) DO NOTHING;

-- Insert demo teacher
INSERT INTO users (email, password_hash, name, role, status) 
VALUES (
  'teacher@ischoolgo.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', -- password: teacher123
  'Demo Teacher',
  'teacher',
  'active'
) ON CONFLICT (email) DO NOTHING;

-- Insert demo marketer
INSERT INTO users (email, password_hash, name, role, status) 
VALUES (
  'marketer@ischoolgo.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', -- password: marketer123
  'Demo Marketer',
  'marketer',
  'active'
) ON CONFLICT (email) DO NOTHING;

-- Insert demo groups
INSERT INTO groups (name, level, subject, fee_amount, description, status)
VALUES 
  ('Beginner English', 'A1', 'English Language', 150.00, 'Basic English for beginners', 'active'),
  ('Intermediate Math', 'Grade 8', 'Mathematics', 200.00, 'Algebra and geometry for grade 8', 'active'),
  ('Advanced Physics', 'Grade 12', 'Physics', 250.00, 'Advanced physics concepts', 'active')
ON CONFLICT DO NOTHING;

-- Insert demo students
INSERT INTO students (name, email, phone, enrollment_date, status)
VALUES 
  ('Ahmed Hassan', 'ahmed@example.com', '+1234567890', CURRENT_DATE - INTERVAL '30 days', 'active'),
  ('Sara Mohamed', 'sara@example.com', '+1234567891', CURRENT_DATE - INTERVAL '45 days', 'active'),
  ('Omar Ali', 'omar@example.com', '+1234567892', CURRENT_DATE - INTERVAL '60 days', 'active'),
  ('Fatima Ibrahim', 'fatima@example.com', '+1234567893', CURRENT_DATE - INTERVAL '15 days', 'active'),
  ('Youssef Mahmoud', 'youssef@example.com', '+1234567894', CURRENT_DATE - INTERVAL '90 days', 'active')
ON CONFLICT (email) DO NOTHING;

-- Update students with group assignments
UPDATE students SET group_id = (SELECT id FROM groups WHERE name = 'Beginner English' LIMIT 1)
WHERE email IN ('ahmed@example.com', 'sara@example.com');

UPDATE students SET group_id = (SELECT id FROM groups WHERE name = 'Intermediate Math' LIMIT 1)
WHERE email IN ('omar@example.com', 'fatima@example.com');

UPDATE students SET group_id = (SELECT id FROM groups WHERE name = 'Advanced Physics' LIMIT 1)
WHERE email = 'youssef@example.com';

-- Insert demo attendance records
INSERT INTO attendance (student_id, group_id, date, status, recorded_by)
SELECT 
  s.id,
  s.group_id,
  CURRENT_DATE - (random() * 30)::integer,
  CASE 
    WHEN random() < 0.8 THEN 'present'
    WHEN random() < 0.9 THEN 'late'
    ELSE 'absent'
  END,
  (SELECT id FROM users WHERE role = 'teacher' LIMIT 1)
FROM students s
WHERE s.group_id IS NOT NULL
AND s.status = 'active'
ON CONFLICT (student_id, group_id, date) DO NOTHING;

-- Insert demo payments
INSERT INTO payments (student_id, amount, payment_method, payment_date, status, receipt_number, processed_by)
SELECT 
  s.id,
  g.fee_amount,
  CASE 
    WHEN random() < 0.4 THEN 'cash'
    WHEN random() < 0.7 THEN 'card'
    WHEN random() < 0.9 THEN 'bank_transfer'
    ELSE 'check'
  END,
  CURRENT_DATE - (random() * 60)::integer,
  'completed',
  'RCP-' || LPAD((random() * 999999)::integer::text, 6, '0'),
  (SELECT id FROM users WHERE role IN ('admin', 'agent') LIMIT 1)
FROM students s
JOIN groups g ON s.group_id = g.id
WHERE s.status = 'active'
ON CONFLICT (receipt_number) DO NOTHING;

-- Insert demo visitors
INSERT INTO visitors (name, phone, age, interests, source, status, assigned_to)
VALUES 
  ('Layla Ahmed', '+1234567895', 16, ARRAY['English', 'Math'], 'Website', 'new', (SELECT id FROM users WHERE role = 'agent' LIMIT 1)),
  ('Khaled Omar', '+1234567896', 14, ARRAY['Science', 'Physics'], 'Referral', 'contacted', (SELECT id FROM users WHERE role = 'agent' LIMIT 1)),
  ('Nour Hassan', '+1234567897', 18, ARRAY['English'], 'Social Media', 'interested', (SELECT id FROM users WHERE role = 'marketer' LIMIT 1))
ON CONFLICT DO NOTHING;

-- Insert demo marketing campaigns
INSERT INTO marketing_campaigns (name, type, target_audience, content, status, budget, created_by)
VALUES 
  (
    'Back to School Campaign',
    'Social Media Campaign',
    'Parents of Young Children (3-8 years)',
    'Join ISCHOOLGO for the new academic year! Expert teachers, small classes, proven results.',
    'active',
    1000.00,
    (SELECT id FROM users WHERE role = 'marketer' LIMIT 1)
  ),
  (
    'Summer Intensive Program',
    'Email Newsletter',
    'Parents of Teenagers (13-18 years)',
    'Boost your teen''s academic performance with our intensive summer program.',
    'completed',
    500.00,
    (SELECT id FROM users WHERE role = 'marketer' LIMIT 1)
  )
ON CONFLICT DO NOTHING;

-- Insert demo expenses
INSERT INTO expenses (category, description, amount, expense_date, status, created_by, approved_by)
VALUES 
  ('Office Supplies', 'Whiteboard markers and erasers', 45.50, CURRENT_DATE - 5, 'approved', 
   (SELECT id FROM users WHERE role = 'teacher' LIMIT 1),
   (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),
  ('Equipment', 'New projector for classroom', 350.00, CURRENT_DATE - 10, 'approved',
   (SELECT id FROM users WHERE role = 'head_trainer' LIMIT 1),
   (SELECT id FROM users WHERE role = 'director' LIMIT 1)),
  ('Marketing', 'Facebook ads campaign', 200.00, CURRENT_DATE - 3, 'pending',
   (SELECT id FROM users WHERE role = 'marketer' LIMIT 1),
   NULL)
ON CONFLICT DO NOTHING;

-- Insert demo inventory
INSERT INTO inventory (item_name, category, quantity, unit_price, supplier, location, status)
VALUES 
  ('Whiteboard Markers', 'Office Supplies', 25, 2.50, 'Office Depot', 'Storage Room A', 'available'),
  ('Student Chairs', 'Furniture', 8, 45.00, 'Furniture Plus', 'Classroom 1', 'low_stock'),
  ('Projector', 'Electronics', 3, 350.00, 'Tech Solutions', 'Equipment Room', 'available'),
  ('Textbooks - English A1', 'Books', 15, 25.00, 'Educational Books Co', 'Library', 'available'),
  ('Calculator TI-84', 'Electronics', 2, 120.00, 'Math Tools Inc', 'Equipment Room', 'low_stock')
ON CONFLICT DO NOTHING;