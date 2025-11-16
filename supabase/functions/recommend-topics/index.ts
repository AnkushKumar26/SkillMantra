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
    const { difficulty, context } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const difficultyPrompts = {
      beginner: "simple, everyday topics that are easy to understand",
      intermediate: "moderately complex topics that require some thought",
      advanced: "complex, nuanced topics that require deep analysis"
    };

    const prompt = `Generate 5 interesting debate topics suitable for ${difficultyPrompts[difficulty as keyof typeof difficultyPrompts] || "beginner"} level. ${context ? `Context: ${context}. ` : ''}Return ONLY a JSON array of topic strings, nothing else. Example: ["Topic 1", "Topic 2", "Topic 3", "Topic 4", "Topic 5"]`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 512,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to generate topics" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const topicsText = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    
    // Parse JSON from response
    let topics;
    try {
      // Try to extract JSON array from the response
      const jsonMatch = topicsText.match(/\[[\s\S]*\]/);
      topics = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch (e) {
      console.error("Failed to parse topics:", e);
      topics = [];
    }

    return new Response(
      JSON.stringify({ topics }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("recommend-topics error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
