import OpenAI from "openai";

export default async function (context, req) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    // Create a ChatKit session for your workflow
    const session = await client.chatkit.sessions.create({
      model: "gpt-4.1-mini",
      workflow: "wf_690bb1d11a1c8190adcb640e789dc71508144f38704a106c"
    });

    context.res = {
      headers: { "Content-Type": "application/json" },
      body: { client_secret: session.client_secret }
    };
  } catch (err) {
    context.log("ChatKit session error:", err);
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: { error: err.message ?? String(err) }
    };
  }
}
