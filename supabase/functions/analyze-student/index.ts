import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.24.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface StudentData {
  id: string;
  name: string;
  enrollment_date: string;
  group_name?: string;
  group_level?: string;
  total_sessions: number;
  attended_sessions: number;
  missed_sessions: number;
  total_payments: number;
  status: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { studentId } = await req.json();

    if (!studentId) {
      return new Response(
        JSON.stringify({ error: 'Student ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Mock student data (in real implementation, fetch from Supabase)
    const studentData: StudentData = {
      id: studentId,
      name: 'Ahmed Hassan',
      enrollment_date: '2024-01-15',
      group_name: 'Beginner English',
      group_level: 'A1',
      total_sessions: 24,
      attended_sessions: 18,
      missed_sessions: 6,
      total_payments: 450,
      status: 'active'
    };

    const attendanceRate = studentData.total_sessions > 0 
      ? (studentData.attended_sessions / studentData.total_sessions * 100).toFixed(1)
      : 0;

    const prompt = `
      Analyze this student's performance data and provide actionable insights:
      
      Student: ${studentData.name}
      Group: ${studentData.group_name} (${studentData.group_level})
      Enrollment Date: ${studentData.enrollment_date}
      Total Sessions: ${studentData.total_sessions}
      Attended Sessions: ${studentData.attended_sessions}
      Missed Sessions: ${studentData.missed_sessions}
      Attendance Rate: ${attendanceRate}%
      Total Payments: $${studentData.total_payments}
      Status: ${studentData.status}
      
      Please provide a concise analysis (max 200 words) covering:
      1. Performance summary
      2. Areas of concern (if any)
      3. Specific recommendations
      4. Risk assessment for dropout
      
      Focus on actionable insights for educators and administrators.
    `;

    const result = await model.generateContent(prompt);
    const analysis = result.response.text();

    return new Response(
      JSON.stringify({
        student: studentData,
        analysis,
        metrics: {
          attendance_rate: parseFloat(attendanceRate),
          payment_status: 'up_to_date',
          risk_level: parseFloat(attendanceRate) < 70 ? 'high' : parseFloat(attendanceRate) < 85 ? 'medium' : 'low'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error analyzing student:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to analyze student performance' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});