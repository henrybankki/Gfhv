export default {
  async fetch(req, env) {

    /* =========================
       CORS PRE-FLIGHT
    ========================= */

    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    /* =========================
       HEALTH CHECK
    ========================= */

    if (req.method === "GET") {
      return new Response("🐣 ChickAI Backend Online", {
        headers: corsHeaders()
      });
    }

    try {

      /* =========================
         REQUEST BODY
      ========================= */

      const body = await req.json().catch(() => ({}));

      const persona = body.persona || "friendly";
      const messages = body.messages || [];

      /* =========================
         PERSONAS
      ========================= */

      const personas = {
        friendly: `You are ChickAI 🐣\nBe friendly and clear.`,
        teacher: `You are ChickAI 📚\nExplain step by step.`,
        dev: `You are ChickAI 💻\nYou are a senior developer.`,
        strict: `You are ChickAI 🧠\nBe concise.`,
        meme: `You are ChickAI 😂\nBe funny and playful.`
      };

      const systemPrompt = personas[persona] || personas.friendly;

      /* =========================
         BUILD CONVERSATION
      ========================= */

      let prompt = systemPrompt + "\n\nConversation:\n";

      for (const msg of messages) {
        if (msg.role === "user") {
          prompt += "User: " + msg.content + "\n";
        } else if (msg.role === "assistant") {
          prompt += "Assistant: " + msg.content + "\n";
        }
      }

      prompt += "\nAssistant:";

      /* =========================
         GEMINI CALL
      ========================= */

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
        env.GEMINI_API_KEY,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt }
                ]
              }
            ]
          })
        }
      );

      const data = await response.json();

      const reply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text
        || "🐣 No response";

      return new Response(
        JSON.stringify({ reply }),
        {
          headers: corsHeaders()
        }
      );

    } catch (err) {

      return new Response(
        JSON.stringify({
          reply: "🐣 Backend error",
          error: String(err)
        }),
        {
          headers: corsHeaders()
        }
      );

    }
  }
};

/* =========================
   CORS
========================= */

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };
}
