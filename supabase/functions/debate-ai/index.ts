import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, difficulty, topic } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Set system prompt based on difficulty
    const systemPrompts = {
      beginner: `You are a friendly debate opponent. Keep arguments simple and easy to understand. Use basic vocabulary and structure. Be supportive while presenting counterarguments. Debate topic: ${topic}`,
      intermediate: `You are a skilled debate opponent. Present well-structured arguments with supporting evidence. Challenge points logically and use persuasive language. Debate topic: ${topic}`,
      advanced: `You are an expert debate opponent. Present sophisticated arguments with complex reasoning, rhetorical devices, and deep analysis. Challenge assumptions and use advanced debate techniques. Debate topic: ${topic}`
    };

    const systemPrompt = systemPrompts[difficulty as keyof typeof systemPrompts] || systemPrompts.beginner;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Analyze the user's argument for feedback
    const analysisResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Analyze this debate argument and provide scores (0-100) for: clarity, argument_strength, confidence. Also count filler words and assess speaking pace. Return ONLY valid JSON: {"clarity": number, "argument_strength": number, "confidence": number, "filler_words": number, "pace": "slow/moderate/fast"}`
          },
          { role: "user", content: messages[messages.length - 1].content }
        ],
      }),
    });

    let analysis = { clarity: 75, argument_strength: 75, confidence: 75, filler_words: 0, pace: "moderate" };
    if (analysisResponse.ok) {
      const analysisData = await analysisResponse.json();
      try {
        analysis = JSON.parse(analysisData.choices[0].message.content);
      } catch (e) {
        console.error("Failed to parse analysis:", e);
      }
    }

    return new Response(
      JSON.stringify({ response: aiResponse, analysis }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("debate-ai error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
