export default {
  async fetch(req, env) {

    // CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    // test endpoint
    if (req.method === "GET") {
      return new Response("ChickAI V5 🐣 OK", {
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }

    try {

      const body = await req.json().catch(() => ({}));

      const prompt = body.prompt || "";
      const persona = body.persona || "friendly";

      const personas = {

        friendly: `
You are ChickAI 🐣
Be friendly, simple, helpful, and kind.
Avoid long answers.
`,

        teacher: `
You are ChickAI 📚
You explain everything step-by-step like a teacher.
Be clear and structured.
`,

        meme: `
You are ChickAI 😂
You are funny, use humor and memes sometimes.
`,

        dev: `
You are ChickAI 💻
You are a senior software engineer.
Give correct technical answers and examples.
`,

        strict: `
You are ChickAI 🧠
Be logical, precise and minimal.
No unnecessary text.
`
      };

      const system = personas[persona] || personas.friendly;

      const finalPrompt =
`${system}

Conversation:
${prompt}

Answer:`;

      if (!env.GEMINI_API_KEY) {
        return Response.json({
          reply: "🐣 Missing API key"
        }, cors());
      }

      const r = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + env.GEMINI_API_KEY,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              { parts: [{ text: finalPrompt }] }
            ]
          })
        }
      );

      const d = await r.json();

      const reply =
        d?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "🐣 empty response";

      return Response.json({
        reply,
        persona
      }, cors());

    } catch (e) {

      return Response.json({
        reply: "🐣 Backend crash",
        error: String(e)
      }, cors());
    }
  }
};

/* helper */
function cors(){
  return {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json"
    }
  };
}      });
    }
  }
};
