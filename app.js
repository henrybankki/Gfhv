export default {
  async fetch(request, env) {

    // CORS + preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    let prompt;

    try {
      const body = await request.json();
      prompt = body.prompt;
    } catch (e) {
      return new Response("Bad Request", { status: 400 });
    }

    try {
      const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + env.GEMINI_KEY,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: "You are ChickAI. Reply in friendly tone.\nUser: " + prompt }]
            }]
          })
        }
      );

      const data = await res.json();

      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response 🐣";

      return new Response(JSON.stringify({ reply: text }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });

    } catch (err) {
      return new Response("Worker error: " + err.message, {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
};
