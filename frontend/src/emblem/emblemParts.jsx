import React from "react";

/*
  saltypoolwater user emblems
  ---------------------------
  Every part draws into the same 128x128 box. The waterline is y=92.
  The fin's base runs from x=40 to x=92 along the waterline; its tip is
  near (82, 22). Floaties sit on the waterline centred at (64, 90).

  Layer order (bottom to top):
    water -> floatie (back half) -> fin -> fin pattern -> floatie (front half) -> extra

  To add a part: add an entry to the right list below. `draw` gets an
  object with the ids it needs for clipping/gradients (unique per emblem
  instance so several emblems can share a page).
*/

export const WATERLINE = 92;

// ---------- fins (shape) ----------
// Each fin is a closed path. The path is reused as a clip for patterns,
// so keep it a single <path d="...">.

export const FINS = [
  {
    id: "classic",
    label: "Classic",
    d: "M40 92 C44 62 56 42 82 20 C80 44 84 68 93 92 Z",
    tip: [82, 20],
  },
  {
    id: "hammer",
    label: "Hammerhead",
    d: "M40 92 C46 66 56 50 68 40 L58 36 L60 25 L102 27 L100 38 L88 40 C93 56 94 74 95 92 Z",
    tip: [80, 26],
  },
  {
    id: "stubby",
    label: "Stubby",
    d: "M44 92 C48 72 60 58 78 52 C82 66 86 80 90 92 Z",
    tip: [78, 52],
  },
  {
    id: "notched",
    label: "Bite taken",
    d: "M40 92 C44 62 56 42 82 20 C80 34 82 44 84 52 C78 50 74 56 78 62 C82 68 86 64 88 60 C90 72 92 82 93 92 Z",
    tip: [82, 20],
  },
  {
    id: "double",
    label: "Two fins",
    d: "M30 92 C33 74 40 60 54 50 C56 64 60 78 66 92 Z M66 92 C68 66 78 46 98 30 C96 50 98 72 104 92 Z",
    tip: [98, 30],
  },
  {
    id: "wavy",
    label: "Curled",
    d: "M40 92 C42 66 50 46 66 34 C76 26 90 26 96 18 C88 34 92 40 84 50 C82 66 88 80 93 92 Z",
    tip: [96, 18],
  },
];

// ---------- fin colours / patterns ----------
// `base` fills the fin. `overlay` (optional) is drawn clipped to the fin.

export const FIN_COLORS = [
  { id: "navy", label: "Navy", base: "#0E3A5C" },
  { id: "tiger", label: "Tiger", base: "#1E5580",
    overlay: () => (
      <g fill="#082840" opacity="0.85">
        <path d="M50 78 C60 70 66 58 70 44 L76 44 C72 60 66 74 56 84 Z" />
        <path d="M62 92 C70 82 76 70 80 56 L86 58 C82 72 76 84 68 92 Z" />
        <path d="M74 36 C78 30 80 26 82 22 L86 26 C84 30 82 34 78 40 Z" />
      </g>
    ) },
  { id: "sunburn", label: "Sunburned", base: "#F27B6B",
    overlay: () => <path d="M40 92 C46 64 58 44 82 20 C76 44 68 66 60 92 Z" fill="#FF5C4D" opacity="0.55" /> },
  { id: "bleached", label: "Chlorine bleached", base: "#BFD9E6",
    overlay: () => <path d="M40 92 C44 62 56 42 82 20 C72 48 66 70 62 92 Z" fill="#DFF3F7" opacity="0.7" /> },
  { id: "glow", label: "Pool-light glow", base: "#37D6A0",
    overlay: () => <path d="M40 92 C44 62 56 42 82 20 C70 50 64 72 60 92 Z" fill="#9CF7D4" opacity="0.55" /> },
  { id: "brine", label: "Brine gold", base: "#E4B33C",
    overlay: () => <path d="M40 92 C44 62 56 42 82 20 C72 48 66 70 62 92 Z" fill="#FFE08A" opacity="0.6" /> },
  { id: "spotted", label: "Spotted", base: "#4A6E8C",
    overlay: () => (
      <g fill="#0E3A5C">
        <circle cx="58" cy="80" r="4" /><circle cx="70" cy="66" r="3" />
        <circle cx="80" cy="82" r="3.5" /><circle cx="76" cy="48" r="2.5" />
        <circle cx="66" cy="86" r="2" />
      </g>
    ) },
];

// ---------- water (background) ----------

export const WATERS = [
  { id: "calm", label: "Calm pool", draw: () => (
    <g>
      <rect width="128" height="128" fill="#DFF3F7" />
      <rect y={WATERLINE} width="128" height="36" fill="#A9DEEA" />
    </g>
  ) },
  { id: "wavy", label: "Choppy", draw: () => (
    <g>
      <rect width="128" height="128" fill="#DFF3F7" />
      <path d="M0 92 C12 84 20 100 32 92 C44 84 52 100 64 92 C76 84 84 100 96 92 C108 84 116 100 128 92 L128 128 L0 128 Z" fill="#A9DEEA" />
      <path d="M0 100 C12 92 20 108 32 100 C44 92 52 108 64 100 C76 92 84 108 96 100 C108 92 116 108 128 100" fill="none" stroke="#8FD0DE" strokeWidth="3" />
    </g>
  ) },
  { id: "hottub", label: "Hot tub", draw: () => (
    <g>
      <rect width="128" height="128" fill="#FBE9DD" />
      <rect y={WATERLINE} width="128" height="36" fill="#F5C9B4" />
      <g fill="none" stroke="#fff" strokeWidth="2" opacity="0.8">
        <circle cx="18" cy="104" r="4" /><circle cx="30" cy="114" r="2.5" />
        <circle cx="106" cy="102" r="3" /><circle cx="116" cy="112" r="4.5" />
        <circle cx="24" cy="120" r="2" />
      </g>
      <g fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.6">
        <path d="M22 80 C26 74 18 70 22 64" /><path d="M104 82 C108 76 100 72 104 66" />
      </g>
    </g>
  ) },
  { id: "kiddie", label: "Kiddie pool", draw: () => (
    <g>
      <rect width="128" height="128" fill="#FFF6D6" />
      <rect y={WATERLINE} width="128" height="36" fill="#B9E5EF" />
      <rect y={WATERLINE - 6} width="128" height="8" fill="#FF5C4D" />
      <rect y={WATERLINE - 6} width="128" height="8" fill="#fff" opacity="0.35" clipPath="inset(0 0 50% 0)" />
      <rect y={WATERLINE + 2} width="128" height="6" fill="#FFD0CA" />
    </g>
  ) },
  { id: "night", label: "Night swim", draw: () => (
    <g>
      <rect width="128" height="128" fill="#0E3A5C" />
      <rect y={WATERLINE} width="128" height="36" fill="#1E5580" />
      <g fill="#fff" opacity="0.9">
        <circle cx="20" cy="22" r="1.5" /><circle cx="44" cy="12" r="1" />
        <circle cx="108" cy="18" r="1.5" /><circle cx="118" cy="40" r="1" />
        <circle cx="12" cy="52" r="1" />
      </g>
      <circle cx="100" cy="34" r="9" fill="#FFE08A" />
    </g>
  ) },
  { id: "whirl", label: "Whirlpool", draw: () => (
    <g>
      <rect width="128" height="128" fill="#DFF3F7" />
      <rect y={WATERLINE} width="128" height="36" fill="#A9DEEA" />
      <g fill="none" stroke="#8FD0DE" strokeWidth="3" strokeLinecap="round">
        <ellipse cx="64" cy="110" rx="52" ry="9" />
        <ellipse cx="64" cy="110" rx="34" ry="5.5" />
        <ellipse cx="64" cy="110" rx="16" ry="2.5" />
      </g>
    </g>
  ) },
];

// ---------- floaties ----------
// Split into back (behind fin) and front (in front of fin). The classic
// ring: ellipse centre (64,90), rx 44, ry 14, tube width 16.

const ringBack = (color, stripe) => (
  <g>
    <path d="M20 90 A44 14 0 0 1 108 90" fill="none" stroke={color} strokeWidth="16" />
    {stripe && <path d="M40 78 A44 14 0 0 1 56 76" fill="none" stroke={stripe} strokeWidth="16" />}
    {stripe && <path d="M84 77 A44 14 0 0 1 100 82" fill="none" stroke={stripe} strokeWidth="16" />}
    <path d="M26 86 A44 14 0 0 1 60 78" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
  </g>
);
const ringFront = (color, stripe) => (
  <g>
    <path d="M20 90 A44 14 0 0 0 108 90" fill="none" stroke={color} strokeWidth="16" />
    {stripe && <path d="M30 98 A44 14 0 0 0 48 103" fill="none" stroke={stripe} strokeWidth="16" />}
    {stripe && <path d="M78 104 A44 14 0 0 0 96 100" fill="none" stroke={stripe} strokeWidth="16" />}
  </g>
);

export const FLOATIES = [
  { id: "none", label: "No floatie", back: () => null, front: () => null },
  { id: "ring", label: "Inner tube",
    back: () => ringBack("#FF5C4D"), front: () => ringFront("#FF5C4D") },
  { id: "lifebuoy", label: "Lifebuoy",
    back: () => ringBack("#fff", "#FF5C4D"), front: () => ringFront("#fff", "#FF5C4D") },
  { id: "duck", label: "Duck",
    back: () => (
      <g>
        {ringBack("#FFD23F")}
        <ellipse cx="22" cy="66" rx="13" ry="12" fill="#FFD23F" />
        <path d="M9 68 L-2 72 L9 76 Z" fill="#FF8C42" />
        <circle cx="18" cy="63" r="2" fill="#0E3A5C" />
        <path d="M100 76 C112 66 114 70 110 82" fill="#FFD23F" />
      </g>
    ),
    front: () => ringFront("#FFD23F") },
  { id: "flamingo", label: "Flamingo",
    back: () => (
      <g>
        {ringBack("#FF7BAC")}
        <path d="M22 78 C10 72 8 54 18 44 C26 36 34 42 30 50" fill="none" stroke="#FF7BAC" strokeWidth="8" strokeLinecap="round" />
        <circle cx="31" cy="50" r="8" fill="#FF7BAC" />
        <path d="M37 52 L48 58 L36 58 Z" fill="#0E3A5C" />
        <circle cx="30" cy="48" r="1.6" fill="#0E3A5C" />
      </g>
    ),
    front: () => ringFront("#FF7BAC") },
  { id: "pizza", label: "Pizza slice",
    back: () => (
      <g>
        <path d="M16 90 L112 76 L112 100 Z" fill="#F4C46A" />
        <path d="M24 90 L104 79 L104 98 Z" fill="#E8553F" />
        <path d="M30 90 L100 81 L100 96 Z" fill="#FFE8A8" />
        <circle cx="60" cy="88" r="4" fill="#B5301F" /><circle cx="84" cy="86" r="4" fill="#B5301F" />
        <circle cx="72" cy="92" r="3.5" fill="#B5301F" />
      </g>
    ),
    front: () => <path d="M16 90 L112 100 L112 104 L16 94 Z" fill="#D9A24E" /> },
  { id: "noodle", label: "Pool noodle",
    back: () => (
      <g>
        <path d="M10 96 C30 70 50 70 64 84 C78 98 98 98 118 74" fill="none" stroke="#2BB673" strokeWidth="11" strokeLinecap="round" />
        <path d="M10 96 C30 70 50 70 64 84 C78 98 98 98 118 74" fill="none" stroke="#7CE3A9" strokeWidth="3" strokeLinecap="round" opacity="0.7" transform="translate(0,-3)" />
      </g>
    ),
    front: () => null },
  { id: "unicorn", label: "Unicorn",
    back: () => (
      <g>
        {ringBack("#F6F0FF", "#C9B3FF")}
        <ellipse cx="22" cy="62" rx="13" ry="11" fill="#F6F0FF" />
        <path d="M20 52 L24 36 L28 52 Z" fill="#FFD23F" />
        <path d="M32 58 C38 54 40 60 36 64" fill="#C9B3FF" />
        <circle cx="18" cy="60" r="2" fill="#0E3A5C" />
      </g>
    ),
    front: () => ringFront("#F6F0FF", "#C9B3FF") },
];

// ---------- extras (drawn on top, positioned from the fin tip) ----------

export const EXTRAS = [
  { id: "none", label: "Nothing", draw: () => null },
  { id: "shades", label: "Sunglasses", draw: (tip) => {
    const [x, y] = tip;
    return (
      <g transform={`translate(${x - 6} ${y + 24}) rotate(-14)`}>
        <rect x="-13" y="-5" width="12" height="10" rx="4" fill="#111" stroke="#fff" strokeWidth="2" />
        <rect x="1" y="-5" width="12" height="10" rx="4" fill="#111" stroke="#fff" strokeWidth="2" />
        <path d="M-1 -1 L1 -1" stroke="#fff" strokeWidth="2" />
        <path d="M-10 -2 L-6 -2 M4 -2 L8 -2" stroke="#fff" strokeWidth="1.5" opacity="0.7" />
      </g>
    );
  } },
  { id: "party", label: "Party hat", draw: (tip) => {
    const [x, y] = tip;
    return (
      <g transform={`translate(${x} ${y})`}>
        <path d="M0 -20 L-9 4 L9 4 Z" fill="#FF5C4D" />
        <path d="M-3 -12 L4 -6 M-6 -4 L6 -1" stroke="#FFE08A" strokeWidth="2" strokeLinecap="round" />
        <circle cx="0" cy="-20" r="3" fill="#FFE08A" />
      </g>
    );
  } },
  { id: "snorkel", label: "Snorkel", draw: (tip) => {
    const [x, y] = tip;
    return (
      <g transform={`translate(${x + 14} ${y + 26})`}>
        <path d="M0 22 L0 -6 C0 -12 8 -12 8 -6 L8 -2" fill="none" stroke="#FF5C4D" strokeWidth="4" strokeLinecap="round" />
        <rect x="-4" y="20" width="8" height="8" rx="2" fill="#0E3A5C" />
      </g>
    );
  } },
  { id: "cap", label: "Swim cap", draw: (tip) => {
    const [x, y] = tip;
    return (
      <g transform={`translate(${x} ${y})`}>
        <path d="M-10 12 C-8 -6 14 -6 12 12 Z" fill="#fff" />
        <path d="M-10 12 L12 12" stroke="#8FD0DE" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M-2 -3 C2 -3 4 0 4 4" fill="none" stroke="#8FD0DE" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      </g>
    );
  } },
  { id: "bandage", label: "Bandage", draw: (tip) => {
    const [x, y] = tip;
    return (
      <g transform={`translate(${x - 6} ${y + 30}) rotate(-35)`}>
        <rect x="-9" y="-4" width="18" height="8" rx="3" fill="#F3D9B1" />
        <rect x="-3" y="-4" width="6" height="8" fill="#E8C596" />
      </g>
    );
  } },
  { id: "goggle", label: "Lost goggle", draw: () => (
    <g transform="translate(108 84)">
      <ellipse cx="0" cy="0" rx="7" ry="5" fill="#8FD0DE" stroke="#0E3A5C" strokeWidth="2" />
      <path d="M-7 0 C-14 -4 -14 6 -7 2" fill="none" stroke="#0E3A5C" strokeWidth="2" />
    </g>
  ) },
  { id: "crown", label: "Brine crown", draw: (tip) => {
    const [x, y] = tip;
    return (
      <g transform={`translate(${x} ${y - 2})`}>
        <path d="M-10 4 L-10 -8 L-4 -2 L0 -12 L4 -2 L10 -8 L10 4 Z" fill="#E4B33C" />
        <circle cx="0" cy="-12" r="2" fill="#FF5C4D" />
      </g>
    );
  } },
];

export const CATEGORIES = [
  { key: "fin", label: "Fin", parts: FINS },
  { key: "color", label: "Color", parts: FIN_COLORS },
  { key: "floatie", label: "Floatie", parts: FLOATIES },
  { key: "water", label: "Water", parts: WATERS },
  { key: "extra", label: "Extra", parts: EXTRAS },
];

export const DEFAULT_EMBLEM = {
  fin: "classic",
  color: "navy",
  floatie: "ring",
  water: "calm",
  extra: "none",
};

export function findPart(list, id, fallbackId) {
  return list.find((p) => p.id === id) || list.find((p) => p.id === fallbackId) || list[0];
}

// Fill in anything missing or unknown so old/partial saves still render.
export function normalizeEmblem(e) {
  const src = e && typeof e === "object" ? e : {};
  return {
    fin: findPart(FINS, src.fin, DEFAULT_EMBLEM.fin).id,
    color: findPart(FIN_COLORS, src.color, DEFAULT_EMBLEM.color).id,
    floatie: findPart(FLOATIES, src.floatie, DEFAULT_EMBLEM.floatie).id,
    water: findPart(WATERS, src.water, DEFAULT_EMBLEM.water).id,
    extra: findPart(EXTRAS, src.extra, DEFAULT_EMBLEM.extra).id,
  };
}

// A stable emblem for people who haven't customised yet, seeded from
// their username so every author gets their own shark from day one.
export function emblemFromName(name) {
  let h = 2166136261;
  for (const ch of String(name || "")) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619) >>> 0;
  }
  const pick = (list, salt) => list[(h >>> salt) % list.length].id;
  return {
    fin: pick(FINS, 0),
    color: pick(FIN_COLORS, 5),
    floatie: pick(FLOATIES, 10),
    water: pick(WATERS, 15),
    extra: "none",
  };
}

export function randomEmblem() {
  const r = (list) => list[Math.floor(Math.random() * list.length)].id;
  return { fin: r(FINS), color: r(FIN_COLORS), floatie: r(FLOATIES), water: r(WATERS), extra: r(EXTRAS) };
}
