import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.24.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface AtRiskStudent {
  id: string;
  name: string;
  group_name: string;
  attended_sessions: number;
  total_sessions: number;
  ai_analysis: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Mock data for demonstration (in real implementation, fetch from Supabase)
    const studentsData = [
      {
        id: '1',
        name: 'Sara Mohamed',
        group_name: 'Beginner English',
        total_sessions: 20,
        attended_sessions: 12,
        missed_sessions: 8,
        enrollment_date: '2024-01-15',
        last_payment_date: '2024-01-01',
        payment_status: 'behind'
      },
      {
        id: '2',
        name: 'Omar Ali',
        group_name: 'Intermediate Math',
        total_sessions: 18,
        attended_sessions: 10,
        missed_sessions: 8,
        enrollment_date: '2024-02-01',
        last_payment_date: '2024-02-15',
        payment_status: 'up_to_date'
      }
    ];

    const atRiskStudents: AtRiskStudent[] = [];

    for (const student of studentsData) {
      const attendanceRate = student.total_sessions > 0 
        ? (student.attended_sessions / student.total_sessions * 100)
        : 0;

      // Consider at-risk if attendance < 70% or payment issues
      if (attendanceRate < 70 || student.payment_status === 'behind') {
        const prompt = `
          Analyze this student's risk factors and provide intervention recommendations:
          
          Student: ${student.name}
          Group: ${student.group_name}
          Attendance Rate: ${attendanceRate.toFixed(1)}%
          Sessions: ${student.attended_sessions}/${student.total_sessions}
          Payment Status: ${student.payment_status}
          Enrollment Date: ${student.enrollment_date}
          
          Provide a brief analysis (max 100 words) with:
          1. Primary risk factors
          2. Recommended interventions
          3. Urgency level
        `;

        const result = await model.generateContent(prompt);
        const analysis = result.response.text();

        atRiskStudents.push({
          id: student.id,
          name: student.name,
          group_name: student.group_name,
          attended_sessions: student.attended_sessions,
          total_sessions: student.total_sessions,
          ai_analysis: analysis
        });
      }
    }

    return new Response(
      JSON.stringify({
        atRiskStudents,
        total_analyzed: studentsData.length,
        risk_count: atRiskStudents.length,
        analysis_date: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error predicting at-risk students:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to analyze at-risk students' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});