import OpenAI from "openai";

export default async function (context, req) {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const session = await client.chatkit.sessions.create({
      model: "gpt-4.1-mini",
      workflow: "wf_690bb1d11a1c8190adcb640e789dc71508144f38704a106c",
    });

    return {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: { client_secret: session.client_secret },
    };
  } catch (err) {
    context.log("ChatKit session error:", err);
    return {
      status: 500,
      body: { error: err.message },
    };
  }
}
