export default {
  async fetch(req, env) {

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    // Preflight
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Health check
    if (req.method === "GET") {
      return new Response("ChickAI V6 🐣 Gemini 2.5 Flash OK", {
        headers: corsHeaders
      });
    }

    try {

      const body = await req.json().catch(() => ({}));

      const prompt = body.prompt || "";
      const persona = body.persona || "friendly";

      // 🧠 Personas (backend controlled)
      const personas = {
        friendly: "You are ChickAI 🐣. Be friendly, simple and helpful.",
        teacher: "You are ChickAI 📚. Explain things step-by-step like a teacher.",
        meme: "You are ChickAI 😂. Be funny, use memes and humor.",
        dev: "You are ChickAI 💻. You are a senior software engineer.",
        strict: "You are ChickAI 🧠. Be precise, logical and minimal."
      };

      const system = personas[persona] || personas.friendly;

      const finalPrompt =
`${system}

User message:
${prompt}

Answer clearly and in the same language as the user (Finnish or English).`;

      // 🔥 GEMINI 2.5 FLASH
      const r = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + env.GEMINI_API_KEY,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: finalPrompt
                  }
                ]
              }
            ]
          })
        }
      );

      const data = await r.json();

      console.log("GEMINI RESPONSE:", JSON.stringify(data));

      // 🧠 Safe parsing (IMPORTANT)
      const reply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        data?.error?.message ||
        "🐣 No response from Gemini";

      return new Response(JSON.stringify({
        reply,
        persona
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });

    } catch (err) {

      console.error("Backend error:", err);

      return new Response(JSON.stringify({
        reply: "🐣 Backend crash",
        error: String(err)
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
  }
};
