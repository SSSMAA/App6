import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.24.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const systemPrompt = `
      You are an AI assistant for ISCHOOLGO, an educational management system.
      You help administrators, teachers, and staff with:
      
      - Student management and analytics
      - Educational insights and recommendations
      - Administrative tasks and workflows
      - Performance analysis and reporting
      - Marketing and enrollment strategies
      
      Always provide helpful, professional, and educational-focused responses.
      Keep responses concise and actionable.
      
      Context: ${context || 'General assistance'}
    `;

    const fullPrompt = `${systemPrompt}\n\nUser Question: ${message}`;

    const result = await model.generateContent(fullPrompt);
    const response = result.response.text();

    return new Response(
      JSON.stringify({
        response,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in AI chat:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get AI response' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});