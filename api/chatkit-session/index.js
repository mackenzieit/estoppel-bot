module.exports = async function (context, req) {
  context.log("chatkit-session debug invoked");

  // DON'T include secrets in the response — just boolean presence
  const openaiKeyPresent = !!process.env.OPENAI_API_KEY;

  context.res = {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: {
      ok: true,
      message: "debug endpoint alive",
      time: new Date().toISOString(),
      openai_key_present: openaiKeyPresent
    }
  };
};
