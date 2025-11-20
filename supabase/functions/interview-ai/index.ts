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
    const { messages, industry, role, questionNumber } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const totalQuestions = 5;
    const isComplete = questionNumber >= totalQuestions;

    // System prompt for interview
    const systemPrompt = `You are a professional AI interviewer conducting a mock interview for a ${role} position in the ${industry} industry. 
    
Your responsibilities:
- Ask relevant, thoughtful questions appropriate for the role and industry
- Keep questions concise and clear
- Progress naturally through different aspects: background, technical skills, behavioral situations, career goals
- After the candidate answers, acknowledge their response briefly before asking the next question
- This is question ${questionNumber + 1} of ${totalQuestions}
${isComplete ? '- This is the final question. After their answer, thank them for the interview.' : ''}

Guidelines:
- Be professional but friendly
- Ask one question at a time
- Questions should be realistic for a real interview
- Cover: introduction, strengths, challenges, technical skills, and career goals`;

    console.log("Calling Lovable AI Gateway for interview question");
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content
          }))
        ],
        temperature: 0.8,
        max_tokens: 512,
      }),
    });

    console.log("Lovable AI Gateway response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to your Lovable workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: `AI Gateway error: ${errorText}` }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const question = data.choices?.[0]?.message?.content || "Could you tell me more about your experience?";

    // Evaluate the user's last answer if there is one
    let evaluation = null;
    if (messages.length > 0 && messages[messages.length - 1].role === "user") {
      const userAnswer = messages[messages.length - 1].content;
      
      const evaluationResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: "You are an expert interview evaluator. Analyze answers and return ONLY valid JSON with scores."
            },
            {
              role: "user",
              content: `Analyze this interview answer and provide scores (0-100) for: clarity, confidence, overall. Also count filler words and assess speaking pace. Return ONLY valid JSON: {"clarity": number, "confidence": number, "overall": number, "filler_words": number, "pace": "slow/moderate/fast", "eye_contact": number, "posture": number}\n\nAnswer: ${userAnswer}`
            }
          ],
          temperature: 0.3,
          max_tokens: 256,
        }),
      });

      if (evaluationResponse.ok) {
        const evaluationData = await evaluationResponse.json();
        try {
          let evaluationText = evaluationData.choices?.[0]?.message?.content || "{}";
          
          // Strip markdown code blocks if present
          evaluationText = evaluationText.trim();
          if (evaluationText.startsWith("```")) {
            evaluationText = evaluationText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
          }
          
          console.log("Parsing evaluation:", evaluationText);
          evaluation = JSON.parse(evaluationText);
        } catch (e) {
          console.error("Failed to parse evaluation:", e);
          evaluation = { 
            clarity: 75, 
            confidence: 75, 
            overall: 75, 
            filler_words: 0, 
            pace: "moderate",
            eye_contact: 75,
            posture: 75
          };
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        question, 
        evaluation,
        isComplete,
        questionNumber 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("interview-ai error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
