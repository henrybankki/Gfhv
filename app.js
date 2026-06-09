export default {
  async fetch(req, env) {

    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders()
      });
    }

    if (req.method === "GET") {
      return new Response(
        "🐣 ChickAI Backend Online",
        {
          headers: corsHeaders()
        }
      );
    }

    try {

      const body = await req.json().catch(() => ({}));

      const persona =
        body.persona || "friendly";

      const messages =
        body.messages || [];

      const personas = {
        friendly:
          "You are ChickAI 🐣. Be friendly, helpful and clear.",

        teacher:
          "You are ChickAI 📚. Explain step by step and teach clearly.",

        dev:
          "You are ChickAI 💻. You are an experienced software engineer.",

        strict:
          "You are ChickAI 🧠. Be concise and logical.",

        meme:
          "You are ChickAI 😂. Be funny and playful."
      };

      const systemPrompt =
        personas[persona] ||
        personas.friendly;

      const contents = [];

      contents.push({
        role: "user",
        parts: [
          {
            text:
              "SYSTEM INSTRUCTIONS:\n" +
              systemPrompt
          }
        ]
      });

      for (const msg of messages) {

        contents.push({

          role:
            msg.role === "assistant"
              ? "model"
              : "user",

          parts: [
            {
              text:
                msg.content || ""
            }
          ]

        });

      }

      const response =
        await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key=" +
          env.GEMINI_API_KEY,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body: JSON.stringify({
              contents
            })
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        return new Response(
          JSON.stringify({
            reply:
              "🐣 Gemini API Error",
            status:
              response.status,
            details:
              data
          }),
          {
            headers:
              corsHeaders()
          }
        );

      }

      let reply =
        data?.candidates?.[0]
        ?.content?.parts?.[0]
        ?.text;

      if (!reply) {

        reply =
          "🐣 Gemini returned no text.\n\n" +
          JSON.stringify(data);

      }

      return new Response(
        JSON.stringify({
          reply
        }),
        {
          headers:
            corsHeaders()
        }
      );

    }
    catch (err) {

      return new Response(
        JSON.stringify({

          reply:
            "🐣 Backend error",

          error:
            String(err)

        }),
        {
          headers:
            corsHeaders()
        }
      );

    }
  }
};

function corsHeaders() {

  return {

    "Access-Control-Allow-Origin":
      "*",

    "Access-Control-Allow-Methods":
      "GET, POST, OPTIONS",

    "Access-Control-Allow-Headers":
      "Content-Type",

    "Content-Type":
      "application/json"

  };

}
