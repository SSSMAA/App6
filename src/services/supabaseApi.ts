import { supabase } from '../lib/supabase';
import type { User, Student, Group, Payment, AttendanceRecord } from '../lib/supabase';

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) throw profileError;

    return {
      token: data.session.access_token,
      user: profile,
    };
  },

  register: async (userData: Partial<User> & { password: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email!,
      password: userData.password,
    });

    if (error) throw error;

    // Create user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert([{
        id: data.user!.id,
        email: userData.email!,
        name: userData.name!,
        role: userData.role!,
        phone: userData.phone,
        address: userData.address,
        salary: userData.salary,
      }])
      .select()
      .single();

    if (profileError) throw profileError;

    return { user: profile };
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return profile;
  },
};

// Students API
export const studentsAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    group_id?: string;
    status?: string;
  }) => {
    let query = supabase
      .from('students')
      .select(`
        *,
        groups:group_id (
          name,
          level
        )
      `)
      .order('created_at', { ascending: false });

    if (params?.search) {
      query = query.or(`name.ilike.%${params.search}%,email.ilike.%${params.search}%`);
    }

    if (params?.group_id) {
      query = query.eq('group_id', params.group_id);
    }

    if (params?.status) {
      query = query.eq('status', params.status);
    }

    const { data, error, count } = await query
      .range(
        ((params?.page || 1) - 1) * (params?.limit || 10),
        (params?.page || 1) * (params?.limit || 10) - 1
      );

    if (error) throw error;

    return {
      students: data?.map(student => ({
        ...student,
        group_name: student.groups?.name,
        group_level: student.groups?.level,
      })) || [],
      pagination: {
        page: params?.page || 1,
        limit: params?.limit || 10,
        total: count || 0,
        pages: Math.ceil((count || 0) / (params?.limit || 10)),
      },
    };
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        groups:group_id (
          name,
          level,
          fee_amount
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    // Get attendance stats
    const { data: attendanceStats } = await supabase
      .from('attendance')
      .select('status')
      .eq('student_id', id);

    // Get payment stats
    const { data: paymentStats } = await supabase
      .from('payments')
      .select('amount')
      .eq('student_id', id)
      .eq('status', 'completed');

    const totalSessions = attendanceStats?.length || 0;
    const attendedSessions = attendanceStats?.filter(a => a.status === 'present').length || 0;
    const totalPayments = paymentStats?.reduce((sum, p) => sum + p.amount, 0) || 0;

    return {
      student: {
        ...data,
        group_name: data.groups?.name,
        group_level: data.groups?.level,
        total_sessions: totalSessions,
        attended_sessions: attendedSessions,
        missed_sessions: totalSessions - attendedSessions,
        total_payments: totalPayments,
      },
    };
  },

  create: async (studentData: Partial<Student>) => {
    const { data, error } = await supabase
      .from('students')
      .insert([studentData])
      .select()
      .single();

    if (error) throw error;
    return { student: data };
  },

  update: async (id: string, studentData: Partial<Student>) => {
    const { data, error } = await supabase
      .from('students')
      .update({ ...studentData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { student: data };
  },

  delete: async (id: string) => {
    // Check for existing records
    const { data: attendanceRecords } = await supabase
      .from('attendance')
      .select('id')
      .eq('student_id', id)
      .limit(1);

    const { data: paymentRecords } = await supabase
      .from('payments')
      .select('id')
      .eq('student_id', id)
      .limit(1);

    if (attendanceRecords?.length || paymentRecords?.length) {
      // Soft delete - change status to inactive
      const { error } = await supabase
        .from('students')
        .update({ status: 'inactive', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      return { message: 'Student deactivated (has existing records)' };
    } else {
      // Hard delete
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { message: 'Student deleted successfully' };
    }
  },
};

// Groups API
export const groupsAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('groups')
      .select(`
        *,
        teacher:teacher_id (
          name,
          email
        ),
        students (
          id,
          status
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      groups: data?.map(group => ({
        ...group,
        teacher_name: group.teacher?.name,
        student_count: group.students?.filter(s => s.status === 'active').length || 0,
      })) || [],
    };
  },

  create: async (groupData: Partial<Group>) => {
    const { data, error } = await supabase
      .from('groups')
      .insert([groupData])
      .select()
      .single();

    if (error) throw error;
    return { group: data };
  },

  update: async (id: string, groupData: Partial<Group>) => {
    const { data, error } = await supabase
      .from('groups')
      .update({ ...groupData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { group: data };
  },

  getStudents: async (id: string) => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('group_id', id)
      .eq('status', 'active')
      .order('name');

    if (error) throw error;
    return { students: data || [] };
  },
};

// Attendance API
export const attendanceAPI = {
  record: async (attendanceData: {
    student_id: string;
    group_id: string;
    date: string;
    status: string;
    notes?: string;
  }) => {
    // Check if record exists
    const { data: existing } = await supabase
      .from('attendance')
      .select('id')
      .eq('student_id', attendanceData.student_id)
      .eq('group_id', attendanceData.group_id)
      .eq('date', attendanceData.date)
      .single();

    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from('attendance')
        .update({
          status: attendanceData.status,
          notes: attendanceData.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return { attendance: data };
    } else {
      // Create new record
      const { data, error } = await supabase
        .from('attendance')
        .insert([attendanceData])
        .select()
        .single();

      if (error) throw error;
      return { attendance: data };
    }
  },

  getByGroupAndDate: async (groupId: string, date: string) => {
    // Get all students in the group
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, name, email')
      .eq('group_id', groupId)
      .eq('status', 'active')
      .order('name');

    if (studentsError) throw studentsError;

    // Get attendance records for the date
    const { data: attendanceRecords, error: attendanceError } = await supabase
      .from('attendance')
      .select('*')
      .eq('group_id', groupId)
      .eq('date', date);

    if (attendanceError) throw attendanceError;

    // Create attendance map
    const attendanceMap = new Map();
    attendanceRecords?.forEach(record => {
      attendanceMap.set(record.student_id, record);
    });

    // Combine student data with attendance status
    const attendance = students?.map(student => {
      const record = attendanceMap.get(student.id);
      return {
        id: student.id,
        student_name: student.name,
        student_email: student.email,
        status: record?.status || 'not_recorded',
        notes: record?.notes || '',
        recorded_by: record?.recorded_by,
        created_at: record?.created_at,
      };
    }) || [];

    return { attendance };
  },

  getStudentHistory: async (studentId: string, params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) => {
    let query = supabase
      .from('attendance')
      .select(`
        *,
        groups:group_id (
          name,
          level
        )
      `)
      .eq('student_id', studentId)
      .order('date', { ascending: false });

    if (params?.startDate) {
      query = query.gte('date', params.startDate);
    }

    if (params?.endDate) {
      query = query.lte('date', params.endDate);
    }

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      attendance: data?.map(record => ({
        ...record,
        group_name: record.groups?.name,
        group_level: record.groups?.level,
      })) || [],
    };
  },

  getStats: async (params?: {
    startDate?: string;
    endDate?: string;
    group_id?: string;
  }) => {
    let query = supabase
      .from('attendance')
      .select('status');

    if (params?.startDate) {
      query = query.gte('date', params.startDate);
    }

    if (params?.endDate) {
      query = query.lte('date', params.endDate);
    }

    if (params?.group_id) {
      query = query.eq('group_id', params.group_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    const totalRecords = data?.length || 0;
    const presentCount = data?.filter(r => r.status === 'present').length || 0;
    const absentCount = data?.filter(r => r.status === 'absent').length || 0;
    const lateCount = data?.filter(r => r.status === 'late').length || 0;
    const excusedCount = data?.filter(r => r.status === 'excused').length || 0;

    return {
      stats: {
        total_records: totalRecords,
        present_count: presentCount,
        absent_count: absentCount,
        late_count: lateCount,
        excused_count: excusedCount,
        attendance_rate: totalRecords > 0 ? (presentCount / totalRecords * 100).toFixed(2) : 0,
      },
    };
  },
};

// Payments API
export const paymentsAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    payment_method?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    let query = supabase
      .from('payments')
      .select(`
        *,
        students:student_id (
          name,
          groups:group_id (
            name
          )
        )
      `)
      .order('payment_date', { ascending: false });

    if (params?.search) {
      query = query.or(`receipt_number.ilike.%${params.search}%`);
    }

    if (params?.status) {
      query = query.eq('status', params.status);
    }

    if (params?.payment_method) {
      query = query.eq('payment_method', params.payment_method);
    }

    if (params?.start_date) {
      query = query.gte('payment_date', params.start_date);
    }

    if (params?.end_date) {
      query = query.lte('payment_date', params.end_date);
    }

    const { data, error, count } = await query
      .range(
        ((params?.page || 1) - 1) * (params?.limit || 10),
        (params?.page || 1) * (params?.limit || 10) - 1
      );

    if (error) throw error;

    return {
      payments: data?.map(payment => ({
        ...payment,
        student_name: payment.students?.name,
        group_name: payment.students?.groups?.name,
      })) || [],
      pagination: {
        page: params?.page || 1,
        limit: params?.limit || 10,
        total: count || 0,
        pages: Math.ceil((count || 0) / (params?.limit || 10)),
      },
    };
  },

  create: async (paymentData: Partial<Payment>) => {
    // Generate receipt number if not provided
    const receiptNumber = paymentData.receipt_number || 
      `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const { data, error } = await supabase
      .from('payments')
      .insert([{
        ...paymentData,
        receipt_number: receiptNumber,
        status: 'completed',
      }])
      .select()
      .single();

    if (error) throw error;
    return { payment: data };
  },

  updateStatus: async (id: string, status: string, notes?: string) => {
    const { data, error } = await supabase
      .from('payments')
      .update({
        status,
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { payment: data };
  },

  getStats: async (params?: {
    start_date?: string;
    end_date?: string;
    group_id?: string;
  }) => {
    let query = supabase
      .from('payments')
      .select('amount, status');

    if (params?.start_date) {
      query = query.gte('payment_date', params.start_date);
    }

    if (params?.end_date) {
      query = query.lte('payment_date', params.end_date);
    }

    const { data, error } = await query;

    if (error) throw error;

    const totalPayments = data?.length || 0;
    const completedPayments = data?.filter(p => p.status === 'completed').length || 0;
    const pendingPayments = data?.filter(p => p.status === 'pending').length || 0;
    const totalRevenue = data?.filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0) || 0;

    return {
      stats: {
        total_payments: totalPayments,
        completed_payments: completedPayments,
        pending_payments: pendingPayments,
        failed_payments: data?.filter(p => p.status === 'failed').length || 0,
        total_revenue: totalRevenue,
        average_payment: completedPayments > 0 ? totalRevenue / completedPayments : 0,
      },
    };
  },
};

// Dashboard API
export const dashboardAPI = {
  getOverview: async (timeframe?: string) => {
    const dateCondition = timeframe === 'week' ? 7 : timeframe === 'year' ? 365 : 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - dateCondition);

    // Get basic stats
    const [
      { count: activeStudents },
      { count: newStudents },
      { count: activeGroups },
      { count: totalTeachers },
    ] = await Promise.all([
      supabase.from('students').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('students').select('*', { count: 'exact', head: true })
        .eq('status', 'active').gte('created_at', cutoffDate.toISOString()),
      supabase.from('groups').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('users').select('*', { count: 'exact', head: true })
        .in('role', ['teacher', 'head_trainer']).eq('status', 'active'),
    ]);

    // Get revenue
    const { data: payments } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'completed')
      .gte('payment_date', cutoffDate.toISOString().split('T')[0]);

    const revenue = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;

    // Get attendance rate
    const { data: attendanceData } = await supabase
      .from('attendance')
      .select('status')
      .gte('date', cutoffDate.toISOString().split('T')[0]);

    const totalSessions = attendanceData?.length || 0;
    const presentSessions = attendanceData?.filter(a => a.status === 'present').length || 0;
    const attendanceRate = totalSessions > 0 ? (presentSessions / totalSessions * 100) : 0;

    // Get recent activities
    const { data: recentStudents } = await supabase
      .from('students')
      .select('name, created_at')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(5);

    const recentActivities = recentStudents?.map(student => ({
      type: 'student_enrolled',
      description: `New student ${student.name} enrolled`,
      timestamp: student.created_at,
    })) || [];

    return {
      stats: {
        active_students: activeStudents || 0,
        new_students: newStudents || 0,
        active_groups: activeGroups || 0,
        total_teachers: totalTeachers || 0,
        revenue,
        total_payments: payments?.length || 0,
        attendance_rate: Math.round(attendanceRate),
      },
      recent_activities: recentActivities,
    };
  },

  getRevenue: async (period?: string) => {
    const { data, error } = await supabase
      .from('payments')
      .select('amount, payment_date, status')
      .eq('status', 'completed')
      .gte('payment_date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('payment_date');

    if (error) throw error;

    // Group by month
    const revenueByMonth = new Map();
    data?.forEach(payment => {
      const month = payment.payment_date.substring(0, 7); // YYYY-MM
      const current = revenueByMonth.get(month) || { revenue: 0, count: 0 };
      revenueByMonth.set(month, {
        revenue: current.revenue + payment.amount,
        count: current.count + 1,
      });
    });

    const revenueData = Array.from(revenueByMonth.entries()).map(([month, data]) => ({
      period: month,
      revenue: data.revenue,
      payment_count: data.count,
    }));

    return { revenue_data: revenueData };
  },

  getEnrollmentTrends: async () => {
    const { data, error } = await supabase
      .from('students')
      .select('enrollment_date, status')
      .gte('enrollment_date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('enrollment_date');

    if (error) throw error;

    // Group by month
    const enrollmentByMonth = new Map();
    data?.forEach(student => {
      const month = student.enrollment_date.substring(0, 7); // YYYY-MM
      const current = enrollmentByMonth.get(month) || { new_enrollments: 0, active_enrollments: 0 };
      enrollmentByMonth.set(month, {
        new_enrollments: current.new_enrollments + 1,
        active_enrollments: current.active_enrollments + (student.status === 'active' ? 1 : 0),
      });
    });

    const enrollmentTrends = Array.from(enrollmentByMonth.entries()).map(([month, data]) => ({
      month,
      new_enrollments: data.new_enrollments,
      active_enrollments: data.active_enrollments,
    }));

    return { enrollment_trends: enrollmentTrends };
  },

  getTopGroups: async () => {
    const { data, error } = await supabase
      .from('groups')
      .select(`
        *,
        teacher:teacher_id (
          name
        ),
        students (
          id,
          status
        )
      `)
      .eq('status', 'active');

    if (error) throw error;

    // Calculate metrics for each group
    const groupsWithMetrics = await Promise.all(
      (data || []).map(async (group) => {
        const studentCount = group.students?.filter(s => s.status === 'active').length || 0;

        // Get attendance rate for last 30 days
        const { data: attendanceData } = await supabase
          .from('attendance')
          .select('status')
          .eq('group_id', group.id)
          .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

        const totalSessions = attendanceData?.length || 0;
        const presentSessions = attendanceData?.filter(a => a.status === 'present').length || 0;
        const attendanceRate = totalSessions > 0 ? (presentSessions / totalSessions * 100) : 0;

        return {
          id: group.id,
          name: group.name,
          level: group.level,
          teacher_name: group.teacher?.name,
          student_count: studentCount,
          attendance_rate: Math.round(attendanceRate),
        };
      })
    );

    // Sort by attendance rate and student count
    const topGroups = groupsWithMetrics
      .filter(g => g.student_count > 0)
      .sort((a, b) => b.attendance_rate - a.attendance_rate || b.student_count - a.student_count)
      .slice(0, 10);

    return { top_groups: topGroups };
  },
};

// AI API
export const aiAPI = {
  analyzeStudent: async (studentId: string) => {
    // This would be implemented as an edge function
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-student`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ studentId }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze student');
    }

    return response.json();
  },

  generateMarketing: async (campaignType: string, targetAudience: string, additionalContext?: string) => {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-marketing`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ campaignType, targetAudience, additionalContext }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate marketing content');
    }

    return response.json();
  },

  chat: async (message: string, context?: string) => {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, context }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }

    return response.json();
  },

  predictAtRiskStudents: async () => {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/predict-at-risk`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to predict at-risk students');
    }

    return response.json();
  },
};