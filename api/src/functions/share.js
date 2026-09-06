const { app } = require("@azure/functions");
const db = require("../shared/db");
const { renderPng } = require("../shared/card");

const SITE_URL = process.env.SITE_URL || "https://saltypoolwater.com";

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Works whether we were called as /api/share/{id} directly, or via the
// /s/{id} rewrite in staticwebapp.config.json (SWA passes the original URL along).
function idFrom(request) {
  if (request.params.id) return request.params.id;
  const q = request.query.get("id");
  if (q) return q;
  const orig = request.headers.get("x-ms-original-url") || "";
  const m = orig.match(/\/s\/([^/?#]+)/);
  return m ? m[1] : null;
}

function sharePage(c) {
  const url = `${SITE_URL}/p/${c.id}`;
  const img = `${SITE_URL}/api/og/${c.id}.png`;
  const title = esc(c.setup);
  const desc = "…tap for the punchline. The shallow end of the internet.";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>${title} — saltypoolwater</title>
<meta name="description" content="${desc}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="saltypoolwater">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${img}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${img}">
<meta http-equiv="refresh" content="0; url=${url}">
</head><body style="font-family:sans-serif;background:#DFF3F7;color:#0E3A5C;padding:40px">
<p>Taking you to the pool… <a href="${url}">${title}</a></p>
<script>location.replace(${JSON.stringify(url)});</script>
</body></html>`;
}

app.http("share", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "share/{id?}",
  handler: async (request) => {
    const id = idFrom(request);
    const c = id ? await db.findComplaint(id) : null;
    if (!c) {
      return { status: 302, headers: { Location: SITE_URL } };
    }
    return {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=300" },
      body: sharePage(c),
    };
  },
});

app.http("og", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "og/{id}",
  handler: async (request) => {
    const id = String(request.params.id || "").replace(/\.png$/i, "");
    const c = await db.findComplaint(id);
    if (!c) return { status: 404, body: "not found" };
    const png = renderPng(c);
    return {
      status: 200,
      headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=3600" },
      body: png,
    };
  },
});
