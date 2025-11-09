// DO NOT call OpenAI here yet. Just prove the route is alive.
module.exports = async function (context, req) {
  context.log("chatkit-session ping");
  const openaiKeyPresent = !!process.env.OPENAI_API_KEY;

  context.res = {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: {
      ok: true,
      message: "debug endpoint alive",
      openai_key_present: openaiKeyPresent,
      time: new Date().toISOString()
    }
  };
};
