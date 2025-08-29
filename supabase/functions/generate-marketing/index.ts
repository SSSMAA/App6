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
    const { campaignType, targetAudience, additionalContext } = await req.json();

    if (!campaignType || !targetAudience) {
      return new Response(
        JSON.stringify({ error: 'Campaign type and target audience are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
      Generate compelling marketing content for ISCHOOLGO educational institution:
      
      Campaign Type: ${campaignType}
      Target Audience: ${targetAudience}
      Additional Context: ${additionalContext || 'None'}
      
      Create content that includes:
      1. Attention-grabbing headline
      2. Compelling main message (2-3 sentences)
      3. Key benefits (3-4 bullet points)
      4. Strong call-to-action
      5. Contact information placeholder
      
      Make it professional, persuasive, and tailored to the target audience.
      Focus on educational excellence, personalized learning, and proven results.
      
      Format the response as structured marketing copy ready for use.
    `;

    const result = await model.generateContent(prompt);
    const content = result.response.text();

    return new Response(
      JSON.stringify({
        content,
        campaign_type: campaignType,
        target_audience: targetAudience,
        generated_at: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating marketing content:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate marketing content' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});