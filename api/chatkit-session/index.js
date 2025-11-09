// api/chatkit-session/index.js
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

    const payload = {
      workflow_id: WORKFLOW_ID,
      workflow: WORKFLOW_ID
    };

    const resp = await fetch(OPENAI_API, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
        // REQUIRED for ChatKit per the API error you've seen
        "OpenAI-Beta": "chatkit_beta=v1"
      },
      body: JSON.stringify(payload),
    });

    const txt = await resp.text();

    let data;
    try {
      data = txt ? JSON.parse(txt) : null;
    } catch (parseErr) {
      context.log.error("Non-JSON response from OpenAI:", txt);
      context.res = { status: 502, body: { error: "OpenAI returned non-JSON response", raw: txt } };
      return;
    }

    if (!resp.ok) {
      const serverMsg = data?.error?.message || data || `status ${resp.status}`;
      context.log.error("OpenAI API returned error:", serverMsg);
      context.res = { status: resp.status || 500, body: { error: "OpenAI error", detail: serverMsg } };
      return;
    }

    // tolerate several shapes
    const clientSecret =
      data?.client_secret ||
      data?.session?.client_secret ||
      data?.session?.clientSecret ||
      data?.clientSecret;

    if (!clientSecret) {
      context.log("Unexpected OpenAI response (no client_secret):", JSON.stringify(data));
      context.res = { status: 502, body: { error: "No client_secret in OpenAI response", response: data } };
      return;
    }

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: { client_secret: clientSecret }
    };
  } catch (err) {
    context.log.error("chatkit-session exception:", err?.message || err);
    context.res = { status: 500, body: { error: String(err?.message || err) } };
  }
};
