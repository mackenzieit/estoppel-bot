// /api/chatkit-session/index.mjs
const OPENAI_API = "https://api.openai.com/v1/chatkit/sessions";
const WORKFLOW_ID = "wf_690bb1d11a1c8190adcb640e789dc71508144f38704a106c";

export default async function (context, req) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY not set in environment");

    const payload = {
      // include both keys in case of slight API naming differences
      workflow: WORKFLOW_ID,
      workflow_id: WORKFLOW_ID,
      // optional: set a model if your workflow needs it
      // model: "gpt-4.1-mini"
    };

    const resp = await fetch(OPENAI_API, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
        // **required** for ChatKit access per the error you saw:
        "OpenAI-Beta": "chatkit_beta=v1"
      },
      body: JSON.stringify(payload),
    });

    const text = await resp.text();
    let data;
    try { data = text ? JSON.parse(text) : null; } catch(e) {
      // if the API returns non-JSON, include it in the error to debug
      throw new Error(`OpenAI returned non-JSON response: ${text}`);
    }

    if (!resp.ok) {
      const serverMsg = data?.error?.message || JSON.stringify(data) || `status ${resp.status}`;
      throw new Error(`OpenAI error: ${serverMsg}`);
    }

    // response shapes vary; try common paths
    const clientSecret =
      data?.client_secret ||
      data?.session?.client_secret ||
      data?.session?.clientSecret ||
      data?.clientSecret;

    if (!clientSecret) {
      // dump full response for debugging in Azure logs
      context.log("Unexpected OpenAI response:", JSON.stringify(data, null, 2));
      throw new Error("No client_secret found in OpenAI response");
    }

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: { client_secret: clientSecret }
    };
  } catch (err) {
    context.log.error("chatkit-session error:", err?.message || err);
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: { error: String(err?.message || err) }
    };
  }
}
