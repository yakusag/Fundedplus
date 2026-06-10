import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Groq from 'npm:groq-sdk@0.5.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY') || '';

interface AIRequest {
  type: 'campaign' | 'suggestion';
  title?: string;
  category?: string;
  description?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const groq = new Groq({ apiKey: GROQ_API_KEY });

    const body: AIRequest = await req.json();
    const { type, title, category } = body;

    let systemPrompt: string;
    let prompt: string;

    if (type === 'campaign') {
      systemPrompt = `You are a crowdfunding campaign expert. Help users create compelling campaign descriptions.
Your response must be valid JSON with these fields:
- "description": A detailed, persuasive campaign description (2-3 paragraphs)
- "short_description": A brief tagline (max 150 characters)
Write in an inspiring, professional tone. Be specific about impact and goals.`;

      prompt = `Create a compelling crowdfunding campaign description for:
Title: ${title || 'Untitled Campaign'}
Category: ${category || 'General'}

Make it inspiring and persuasive. Explain the project clearly, its impact, and why people should support it.
Return ONLY valid JSON, no markdown, no explanation.`;
    } else {
      systemPrompt = `You are a helpful assistant for a crowdfunding platform. Provide concise, helpful suggestions.`;
      prompt = `Suggest improvements for this campaign.`;
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: type === 'campaign' ? 800 : 200,
    });

    const content = completion.choices[0]?.message?.content || '';

    if (type === 'campaign') {
      try {
        const parsed = JSON.parse(content);
        return new Response(
          JSON.stringify(parsed),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch {
        return new Response(
          JSON.stringify({
            description: content,
            short_description: content.substring(0, 150),
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ suggestion: content }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error('AI assistant error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate content', message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
