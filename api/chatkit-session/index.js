// /api/chatkit-session/index.js
module.exports = async function (context, req) {
  try {
    context.log('chatkit-session invoked', { method: req_method: req?.method, query: req?.query });

    // show whether Azure made the env var available
    const hasKey = !!process.env.OPENAI_API_KEY;
    context.log('OPENAI_API_KEY present?', hasKey);

    const OPENAI_API = "https://api.openai.com/v1/chatkit/sessions";
    const WORKFLOW_ID = "wf_690bb1d11a1c8190adcb640e789dc71508144f38704a106c";

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      context.log.error("OPENAI_API_KEY missing - returning 500");
      context.res = {
        status: 500,
        headers: { "Content-Type": "application/json" },
        body: { error: "OPENAI_API_KEY not set in app settings (process.env.OPENAI_API_KEY is falsy)" }
      };
      return;
    }

    // Build payload
    const payload = { workflow_id: WORKFLOW_ID };

    // POST to OpenAI ChatKit
    context.log('Calling OpenAI ChatKit endpoint', OPENAI_API);
    const resp = await fetch(OPENAI_API, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
        "OpenAI-Beta": "chatkit_beta=v1" // REQUIRED
      },
      body: JSON.stringify(payload),
      // timeout may be whatever; let node default
    });

    const text = await resp.text().catch(e => {
      context.log.error('Error reading resp.text()', e);
      return null;
    });

    context.log('OpenAI status', resp.status, 'body (first 1000 chars):', (text || '').slice(0, 1000));

    // If response is JSON, try to parse; otherwise return raw text
    let parsed = null;
    try { parsed = JSON.parse(text); } catch (e) { /* not JSON */ }

    context.res = {
      status: resp.status,
      headers: { "Content-Type": "application/json" },
      body: {
        debug: {
          openai_status: resp.status,
          openai_body_text: text,
          openai_body_json: parsed
        }
      }
    };
  } catch (err) {
    context.log.error('Unhandled exception in function:', err && err.stack || String(err));
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: { error: String(err && err.message || err), stack: err && err.stack }
    };
  }
};
