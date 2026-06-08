export default {
  async fetch(req, env) {
    if(req.method !== "POST"){
      return new Response("ChickAI V3 🐣");
    }

    try{
      const body = await req.json();

      const prompt = body.prompt || "";
      const persona = body.persona || "friendly";

      /* 🛡️ PROMPT INJECTION FILTER */
      const blocked = ["ignore instructions", "system prompt", "reveal api"];

      if(blocked.some(w=>prompt.toLowerCase().includes(w))){
        return Response.json({reply:"🐣 Request blocked."});
      }

      const system={
        friendly:"Friendly assistant",
        teacher:"Teaching assistant",
        meme:"Funny meme assistant",
        dev:"Programming assistant"
      }[persona] || "Friendly assistant";

      const finalPrompt =
`You are ChickAI 🐣
${system}

Conversation:
${prompt}

Answer:`;

      const apiKey=env.GEMINI_API_KEY;

      const r=await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key="+apiKey,
        {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({
            contents:[{parts:[{text:finalPrompt}]}]
          })
        }
      );

      const d=await r.json();

      return Response.json({
        reply:d?.candidates?.[0]?.content?.parts?.[0]?.text || "🐣"
      });

    }catch(e){
      return Response.json({reply:"Backend error 🐣"});
    }
  }
};              }
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
