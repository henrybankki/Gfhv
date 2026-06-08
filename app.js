export default {

  async fetch(req, env) {

    /* =========================
       CORS
    ========================= */

    if (req.method === "OPTIONS") {

      return new Response(null, {
        headers: corsHeaders()
      });

    }

    /* =========================
       TEST ENDPOINT
    ========================= */

    if (req.method === "GET") {

      return new Response(
        "🐣 ChickAI Backend Online",
        {
          headers: corsHeaders()
        }
      );

    }

    try {

      /* =========================
         REQUEST
      ========================= */

      const body =
      await req.json();

      const persona =
      body.persona ||
      "friendly";

      const messages =
      body.messages ||
      [];

      /* =========================
         PERSONAS
      ========================= */

      const personas = {

        friendly: `
You are ChickAI 🐣

You are friendly, helpful and positive.

Keep answers clear.
`,

        teacher: `
You are ChickAI 📚

Explain things step-by-step.

Teach clearly.
`,

        dev: `
You are ChickAI 💻

You are an experienced software engineer.

Provide technical answers.
`,

        strict: `
You are ChickAI 🧠

Be concise and logical.

Avoid unnecessary words.
`,

        meme: `
You are ChickAI 😂

Be funny and playful.

Use light humor.
`

      };

      const systemPrompt =
      personas[persona]
      ||
      personas.friendly;

      /* =========================
         CONVERSATION
      ========================= */

      let prompt =
      systemPrompt +
      "\n\nConversation:\n";

      for (const msg of messages) {

        if (
          msg.role === "user"
        ) {

          prompt +=
          "User: " +
          msg.content +
          "\n";

        }

        if (
          msg.role ===
          "assistant"
        ) {

          prompt +=
          "Assistant: " +
          msg.content +
          "\n";

        }

      }

      prompt +=
      "\nAssistant:";

      /* =========================
         GEMINI
      ========================= */

      const response =
      await fetch(

        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key="
        +
        env.GEMINI_API_KEY,

        {

          method:"POST",

          headers:{
            "Content-Type":
            "application/json"
          },

          body:
          JSON.stringify({

            contents:[

              {
                parts:[
                  {
                    text:prompt
                  }
                ]
              }

            ]

          })

        }

      );

      const data =
      await response.json();

      const reply =

      data?.candidates?.[0]
      ?.content?.parts?.[0]
      ?.text

      ||

      "🐣 No response";

      return Response.json(

        {
          reply
        },

        {
          headers:
          corsHeaders()
        }

      );

    }

    catch(err){

      return Response.json(

        {

          reply:
          "🐣 Backend error",

          error:
          String(err)

        },

        {

          headers:
          corsHeaders()

        }

      );

    }

  }

};

/* =========================
   CORS HEADERS
========================= */

function corsHeaders(){

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
