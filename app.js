export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("ChickAI API 🐣", { status: 200 });
    }

    try {
      const body = await request.json();
      const prompt = body.prompt || "";
      const persona = body.persona || "friendly";
      const language = body.language || "auto";

      // 🛡️ SIMPLE ABUSE FILTER
      const blocked = [
        "hack", "exploit", "illegal", "virus", "kill", "weapon"
      ];

      if (blocked.some(w => prompt.toLowerCase().includes(w))) {
        return Response.json({
          reply: "🐣 Sorry, I can't help with that."
        });
      }

      // 🧠 PERSONAS
      const personas = {
        friendly: "You are ChickAI 🐣. Friendly, helpful, casual.",
        teacher: "You are ChickAI 🧠. Teach step by step clearly.",
        meme: "You are ChickAI 😂. Funny, meme-style answers.",
        dev: "You are ChickAI 💻. Programming expert."
      };

      const system = personas[persona] || personas.friendly;

      // 🌍 LANGUAGE RULE
      let langRule = "";
      if (language === "fi") {
        langRule = "Answer in Finnish.";
      } else if (language === "en") {
        langRule = "Answer in English.";
      } else {
        langRule = "Detect user's language and respond in same language.";
      }

      // 💬 FINAL PROMPT
      const finalPrompt =
`${system}

${langRule}

Chat:
${prompt}

Answer:`;

      // 🔑 GEMINI API (env secret)
      const apiKey = env.GEMINI_API_KEY;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: finalPrompt }]
              }
            ]
          })
        }
      );

      const data = await response.json();

      const reply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "🐣 No response";

      return Response.json({ reply });

    } catch (err) {
      return Response.json({
        reply: "🐣 Backend error"
      });
    }
  }
};
