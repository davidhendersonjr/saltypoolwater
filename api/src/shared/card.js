// Renders the share-card PNG for a complaint: setup on a card, punchline hidden, logo.
const path = require("path");
const { Resvg } = require("@resvg/resvg-js");

const FONTS = [
  path.join(__dirname, "../../assets/Poppins-ExtraBold.ttf"),
  path.join(__dirname, "../../assets/Poppins-Regular.ttf"),
];

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Greedy word wrap using an average-width estimate; good enough for a preview card.
function wrap(text, maxChars) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > maxChars) {
      if (line) lines.push(line);
      line = w;
    } else {
      line = (line + " " + w).trim();
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Small lifebuoy + fin, same construction as the site logo, scaled to fit a 150px box.
function logo(x, y, s) {
  return `<g transform="translate(${x},${y}) scale(${s})">
    <ellipse cx="256" cy="332" rx="120" ry="36" fill="#B9E5EF"/>
    <g clip-path="url(#back)">
      <ellipse cx="256" cy="332" rx="156" ry="72" fill="none" stroke="#FF5C4D" stroke-width="84"/>
      <path d="M215.6 262.5 A156 72 0 0 1 296.4 262.5" stroke="#fff" stroke-width="84" fill="none"/>
      <path d="M406.7 313.4 A156 72 0 0 1 406.7 350.6" stroke="#fff" stroke-width="84" fill="none"/>
      <path d="M105.3 350.6 A156 72 0 0 1 105.3 313.4" stroke="#fff" stroke-width="84" fill="none"/>
    </g>
    <path fill="#0E3A5C" d="M236 352 C238 306 246 236 274 166 C288 130 306 100 326 78 C320 126 320 184 330 240 C336 272 342 306 350 352 C332 344 306 340 288 342 C268 344 250 348 236 352 Z"/>
    <g clip-path="url(#front)">
      <ellipse cx="256" cy="332" rx="156" ry="72" fill="none" stroke="#FF5C4D" stroke-width="84"/>
      <path d="M296.4 401.5 A156 72 0 0 1 215.6 401.5" stroke="#fff" stroke-width="84" fill="none"/>
      <path d="M406.7 313.4 A156 72 0 0 1 406.7 350.6" stroke="#fff" stroke-width="84" fill="none"/>
      <path d="M105.3 350.6 A156 72 0 0 1 105.3 313.4" stroke="#fff" stroke-width="84" fill="none"/>
    </g>
  </g>`;
}

function buildSvg(c) {
  const setupLines = wrap(c.setup, 30).slice(0, 4);
  const size = { 1: 56, 2: 56, 3: 50, 4: 42 }[setupLines.length] || 42;
  const lineH = Math.round(size * 1.22);
  const startY = 240;
  const setupText = setupLines
    .map((l, i) => `<text x="80" y="${startY + i * lineH}" font-family="Poppins" font-weight="800" font-size="${size}" fill="#0E3A5C">${esc(l)}</text>`)
    .join("");
  const afterY = 455;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <clipPath id="back"><rect x="0" y="0" width="512" height="332"/></clipPath>
    <clipPath id="front"><rect x="0" y="331" width="512" height="181"/></clipPath>
  </defs>
  <rect width="1200" height="630" fill="#DFF3F7"/>
  <rect x="40" y="40" width="1120" height="550" rx="28" fill="#FFFFFF" stroke="#8FD0DE" stroke-width="6"/>
  <text x="80" y="130" font-family="Poppins" font-weight="800" font-size="46" fill="#FF5C4D">salty<tspan fill="#0E3A5C">poolwater</tspan></text>
  <text x="80" y="170" font-family="Poppins" font-size="24" fill="#4A7186">The shallow end of the internet.</text>
  ${logo(900, 290, 0.5)}
  ${setupText}
  <line x1="80" y1="${afterY}" x2="860" y2="${afterY}" stroke="#8FD0DE" stroke-width="4" stroke-dasharray="14 12"/>
  <text x="80" y="${afterY + 48}" font-family="Poppins" font-size="30" fill="#FF5C4D" font-style="italic">The punchline’s at saltypoolwater.com</text>
  <text x="80" y="548" font-family="Poppins" font-size="22" fill="#4A7186">${esc(c.author || "anonymous")}  ·  ${c.landed || 0} salted  ·  ${c.womp || 0} watered down</text>
</svg>`;
}

function renderPng(complaint) {
  const svg = buildSvg(complaint);
  const r = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
    font: { fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: "Poppins" },
  });
  return r.render().asPng();
}

module.exports = { renderPng, buildSvg };
