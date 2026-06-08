export default {
  async fetch(req, env) {

    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (req.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    if (req.method === "GET") {
      return new Response("ChickAI V6 🐣 OK", { headers: cors });
    }

    try {

      const { prompt, persona } = await req.json().catch(() => ({}));

      const personas = {
        friendly: "You are a friendly helpful assistant.",
        teacher: "Explain everything step by step clearly.",
        meme: "Be funny, use memes and humor.",
        dev: "You are a senior software engineer.",
        strict: "Be short, precise and logical."
      };

      const system = personas[persona] || personas.friendly;

      const finalPrompt =
`${system}

User:
${prompt}

Answer:`;

      const r = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + env.GEMINI_API_KEY,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: finalPrompt }] }]
          })
        }
      );

      const d = await r.json();

      const reply =
        d?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "🐣 No response";

      return Response.json({
        reply,
        persona
      }, { headers: cors });

    } catch (e) {

      return Response.json({
        reply: "🐣 Backend crash",
        error: String(e)
      }, { headers: cors });
    }
  }
};
