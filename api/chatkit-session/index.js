// api/chatkit-session/index.js
const fs = require("fs");
const path = require("path");

module.exports = async function (context, req) {
  try {
    const base = __dirname || path.dirname(process.argv[1] || "."); // where the function is running
    const parent = path.resolve(base, "..");
    function safeList(dir) {
      try {
        return fs.readdirSync(dir).map(f => {
          const p = path.join(dir, f);
          const stat = fs.existsSync(p) ? fs.statSync(p) : null;
          return {
            name: f,
            isFile: stat ? stat.isFile() : null,
            isDirectory: stat ? stat.isDirectory() : null
          };
        });
      } catch (e) {
        return { error: String(e) };
      }
    }

    const info = {
      probe_time: new Date().toISOString(),
      __dirname: base,
      __filename: __filename,
      node_version: process.version,
      env_sample: {
        OPENAI_API_KEY_exists: !!process.env.OPENAI_API_KEY,
        CHATKIT_WORKFLOW_ID: process.env.CHATKIT_WORKFLOW_ID || null,
      },
      listing_base: safeList(base),
      listing_parent: safeList(parent),
      file_contents: {}
    };

    // try to read function.json and any index.* files
    const tryRead = (file) => {
      try { return fs.readFileSync(path.join(base, file), "utf8"); }
      catch (e) { return `ERROR: ${String(e)}`; }
    };
    ["function.json", "index.js", "index.mjs", "index.ts", "package.json"].forEach(f => {
      info.file_contents[f] = tryRead(f);
    });

    context.log("DEBUG: chatkit-session probe", JSON.stringify({
      dirname: base,
      files: info.listing_base.map(f=>f.name).slice(0,50)
    }));

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: info
    };
  } catch (err) {
    context.log.error("probe exception:", err);
    context.res = { status: 500, body: { error: String(err) } };
  }
};
