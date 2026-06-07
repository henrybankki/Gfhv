export default {
    async fetch(request, env) {

        const {
            prompt
        } = await request.json();

        const system = `
        You are ChickAI.🥚🐣

        You are a friendly and intelligent AI assistant.

        Personality:
        - Helpful
        - Practical
        - Friendly
        - Slightly playful
        - Clear and concise

        Rules:
        - Answer directly.
        - Prefer short and useful answers.
        - Use emojis sparingly.
        - Never mention Gemini, Google, or underlying models.
        - Always act as ChickAI.
        `;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: system + "\nUser: " + prompt
                        }]
                    }]
                })
            }
        );

        const data = await response.json();

        const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Error 🐣";

        return new Response(JSON.stringify({
            reply: text
        }), {
            headers: {
                "Content-Type": "application/json"
            }
        });
    }
};