export default {
  async fetch(req, env) {

    /* =========================
       CORS
    ========================= */

    if (req.method === "OPTIONS") {
      return new Response(null, { headers: cors() });
    }

    /* =========================
       HEALTH CHECK
    ========================= */

    if (req.method === "GET") {
      return new Response("🐣 ChickAI Groq Online", {
        headers: cors()
      });
    }

    try {

      const body = await req.json().catch(() => ({}));

      const messages = body.messages || [];
      const persona = body.persona || "friendly";

      /* =========================
         PERSONAS
      ========================= */

      const personas = {
        friendly: "You are ChickAI 🐣 Be friendly, simple and helpful.",
        teacher: "You are ChickAI 📚 Explain clearly step-by-step.",
        dev: "You are ChickAI 💻 You are a senior software engineer.",
        strict: "You are ChickAI 🧠 Be concise and logical.",
        meme: "You are ChickAI 😂 Be funny and playful."
      };

      const system = personas[persona] || personas.friendly;

      /* =========================
         BUILD MESSAGES
      ========================= */

      const groqMessages = [
        {
          role: "system",
          content: system
        },
        ...messages
      ];

      /* =========================
         GROQ REQUEST
      ========================= */

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + env.GROQ_API_KEY
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: groqMessages,
            temperature: 0.7,
            max_tokens: 1024
          })
        }
      );

      const data = await response.json();

      const reply =
        data?.choices?.[0]?.message?.content
        || "🐣 No response from Groq";

      return new Response(
        JSON.stringify({ reply }),
        { headers: cors() }
      );

    } catch (err) {

      return new Response(
        JSON.stringify({
          reply: "🐣 Groq backend error",
          error: String(err)
        }),
        { headers: cors() }
      );
    }
  }
};

/* ========================= */

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };
}
