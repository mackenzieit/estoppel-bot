// api/chatkit-session/index.js  (CommonJS)
module.exports = async function (context, req) {
  try {
    const OPENAI_API = "https://api.openai.com/v1/chatkit/sessions";
    const WORKFLOW_ID = "wf_690bb1d11a1c8190adcb640e789dc71508144f38704a106c";

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      context.log.error("OPENAI_API_KEY missing");
      context.res = { status: 500, body: { error: "OPENAI_API_KEY not set in app settings" } };
      return;
    }

    const payload = { workflow_id: WORKFLOW_ID };

    // Do the POST
    const resp = await fetch(OPENAI_API, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
        "OpenAI-Beta": "chatkit_beta=v1" // REQUIRED
      },
      body: JSON.stringify(payload),
    });

    const txt = await resp.text();

    // Log everything for debugging
    context.log("OpenAI status:", resp.status);
    context.log("OpenAI raw text response:", txt);

    // Return raw response to caller (debug)
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: {
        debug: {
          status: resp.status,
          body_text: txt
        }
      }
    };
  } catch (err) {
    context.log.error("chatkit-session exception:", err);
    context.res = { status: 500, body: { error: String(err?.message || err) } };
  }
};
