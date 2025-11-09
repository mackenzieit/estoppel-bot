const OPENAI_API = "https://api.openai.com/v1/chatkit/sessions";
const WORKFLOW_ID = "wf_690bb1d11a1c8190adcb640e789dc71508144f38704a106c";

export default async function (context, req) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY not set in Azure");

    const resp = await fetch(OPENAI_API, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        // model can be omitted if your workflow specifies it;
        // include it if your workflow expects one:
        model: "gpt-4.1-mini",
        workflow: WORKFLOW_ID
      })
    });

    const data = await resp.json();

    if (!resp.ok) {
      const msg = data?.error?.message || `OpenAI returned ${resp.status}`;
      throw new Error(msg);
    }

    // Expecting a shape that includes client_secret
    const clientSecret = data.client_secret || data?.session?.client_secret;
    if (!clientSecret) throw new Error("No client_secret in OpenAI response");

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: { client_secret: clientSecret }
    };
  } catch (err) {
    context.log("ChatKit session error:", err);
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: { error: String(err?.message || err) }
    };
  }
}
