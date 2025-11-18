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
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    // Set system prompt based on difficulty
    const systemPrompts = {
      beginner: `You are a friendly debate opponent. Keep arguments simple and easy to understand. Use basic vocabulary and structure. Be supportive while presenting counterarguments. Debate topic: ${topic}`,
      intermediate: `You are a skilled debate opponent. Present well-structured arguments with supporting evidence. Challenge points logically and use persuasive language. Debate topic: ${topic}`,
      advanced: `You are an expert debate opponent. Present sophisticated arguments with complex reasoning, rhetorical devices, and deep analysis. Challenge assumptions and use advanced debate techniques. Debate topic: ${topic}`
    };

    const systemPrompt = systemPrompts[difficulty as keyof typeof systemPrompts] || systemPrompts.beginner;

    // Convert messages to Gemini format
    const geminiContents = messages.map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));

    // Add system instruction as first user message
    geminiContents.unshift({
      role: "user",
      parts: [{ text: systemPrompt }]
    });

    console.log("Calling Gemini API with messages:", geminiContents.length);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: geminiContents,
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
    });

    console.log("Gemini API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: `Gemini API error: ${errorText}` }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    console.log("Gemini response data:", JSON.stringify(data).substring(0, 200));
    
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, I couldn't generate a response.";
    console.log("AI response length:", aiResponse.length);

    // Analyze the user's argument for feedback
    const analysisResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{
              text: `Analyze this debate argument and provide scores (0-100) for: clarity, argument_strength, confidence. Also count filler words and assess speaking pace. Return ONLY valid JSON: {"clarity": number, "argument_strength": number, "confidence": number, "filler_words": number, "pace": "slow/moderate/fast"}\n\nArgument: ${messages[messages.length - 1].content}`
            }]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 256,
        }
      }),
    });

    let analysis = { clarity: 75, argument_strength: 75, confidence: 75, filler_words: 0, pace: "moderate" };
    if (analysisResponse.ok) {
      const analysisData = await analysisResponse.json();
      try {
        const analysisText = analysisData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        analysis = JSON.parse(analysisText);
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
