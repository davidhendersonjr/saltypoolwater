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
    id: "seahorse",
    label: "Seahorse",
    // head + snout top right, belly curve, tail curling in at the waterline
    d: "M72 14 C83 14 91 22 90 31 L108 33 L106 42 L89 45 C88 56 93 64 92 75 C90 89 79 97 66 96 C56 95 50 88 52 81 C54 74 63 73 66 79 C68 84 74 83 74 76 C74 65 70 56 70 46 C61 43 56 35 58 26 C60 18 65 14 72 14 Z M60 48 L48 54 L62 63 Z M62 68 L52 74 L64 80 Z",
    detail: () => (
      <g>
        <circle cx="79" cy="26" r="3" fill="#fff" />
        <circle cx="79.5" cy="26" r="1.6" fill="#111" />
        <g stroke="#111" strokeWidth="1.4" fill="none" opacity="0.3">
          <path d="M74 44 L84 46 M73 56 L86 58 M74 68 L88 68" />
        </g>
      </g>
    ),
    tip: [74, 14],
  },
  {
    id: "shrimp",
    label: "Shrimp",
    // curled body, head to the right, tail fan at the lower left
    d: "M100 26 C66 22 42 46 42 72 C42 88 54 100 70 102 L82 88 C66 86 58 80 58 70 C58 50 76 38 100 44 Z M100 20 C113 20 121 28 121 37 C121 46 113 53 100 53 C90 53 84 46 84 37 C84 28 90 20 100 20 Z M112 22 L127 12 L117 32 Z M78 90 L56 94 L74 102 L60 112 L88 100 Z",
    detail: () => (
      <g>
        <circle cx="106" cy="32" r="3.2" fill="#fff" />
        <circle cx="106.5" cy="32" r="1.7" fill="#111" />
        <g stroke="#111" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.4">
          <path d="M60 58 L50 60 M58 70 L47 72 M62 82 L52 87 M70 92 L62 99" />
        </g>
        <g stroke="#111" strokeWidth="1.4" fill="none" opacity="0.25">
          <path d="M70 40 L76 50 M58 52 L68 60 M52 66 L64 70 M52 80 L64 78" />
        </g>
      </g>
    ),
    tip: [98, 20],
  },
  {
    id: "skull",
    label: "Skeleton",
    d: "M64 24 C84 24 96 38 96 54 C96 64 92 72 86 76 L86 84 C86 88 82 90 78 90 L50 90 C46 90 42 88 42 84 L42 76 C36 72 32 64 32 54 C32 38 44 24 64 24 Z",
    detail: () => (
      <g>
        <ellipse cx="52" cy="52" rx="8" ry="9" fill="#231A12" />
        <ellipse cx="76" cy="52" rx="8" ry="9" fill="#231A12" />
        <path d="M64 60 L69 70 L59 70 Z" fill="#231A12" />
        <g stroke="#231A12" strokeWidth="2" strokeLinecap="round">
          <path d="M42 78 L86 78" />
          <path d="M54 78 L54 90 M64 78 L64 90 M74 78 L74 90" />
        </g>
      </g>
    ),
    tip: [64, 24],
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
        <path d="M-10 20 L14 4 L26 4 L2 20 Z" /><path d="M-10 48 L18 30 L30 30 L2 48 Z" />
        <path d="M-10 76 L22 56 L34 56 L2 76 Z" /><path d="M10 100 L42 80 L54 80 L22 100 Z" />
        <path d="M40 100 L72 80 L84 80 L52 100 Z" /><path d="M34 60 L62 42 L74 42 L46 60 Z" />
        <path d="M50 30 L74 14 L86 14 L62 30 Z" /><path d="M70 100 L102 80 L114 80 L82 100 Z" />
      </g>
    ) },
  { id: "sunburn", label: "Sunburned", base: "#F27B6B",
    overlay: () => <rect x="-10" y="44" width="148" height="60" fill="#FF5C4D" opacity="0.5" /> },
  { id: "bleached", label: "Chlorine bleached", base: "#BFD9E6",
    overlay: () => <rect x="-10" y="-10" width="148" height="70" fill="#F4FBFD" opacity="0.75" /> },
  { id: "glow", label: "Pool-light glow", base: "#37D6A0",
    overlay: () => <rect x="-10" y="-10" width="148" height="66" fill="#B4FBE0" opacity="0.6" /> },
  { id: "brine", label: "Brine gold", base: "#E4B33C",
    overlay: () => <rect x="-10" y="-10" width="148" height="60" fill="#FFE08A" opacity="0.6" /> },
  { id: "spotted", label: "Spotted", base: "#4A6E8C",
    overlay: () => (
      <g fill="#0E3A5C">
        <circle cx="58" cy="80" r="4" /><circle cx="70" cy="64" r="3" />
        <circle cx="80" cy="82" r="3.5" /><circle cx="74" cy="46" r="2.5" />
        <circle cx="64" cy="88" r="2" /><circle cx="86" cy="60" r="3" />
        <circle cx="50" cy="66" r="2.5" /><circle cx="90" cy="34" r="2" />
        <circle cx="60" cy="34" r="2.5" /><circle cx="44" cy="86" r="3" />
      </g>
    ) },
  { id: "coral", label: "Coral", base: "#FF7A66" },
  { id: "seafoam", label: "Seafoam", base: "#6FD5C4" },
  { id: "bubblegum", label: "Bubblegum", base: "#FF8FC4" },
  { id: "midnight", label: "Midnight purple", base: "#4B3A8C",
    overlay: () => <rect x="-10" y="-10" width="148" height="54" fill="#7A66C9" opacity="0.5" /> },
  { id: "ember", label: "Ember", base: "#E2571F",
    overlay: () => (
      <g>
        <rect x="-10" y="-10" width="148" height="42" fill="#FFC24A" opacity="0.75" />
        <rect x="-10" y="70" width="148" height="40" fill="#9E2B20" opacity="0.55" />
      </g>
    ) },
  { id: "ghostly", label: "Ghost white", base: "#F2F7FA",
    overlay: () => <rect x="-10" y="56" width="148" height="50" fill="#C9DDE8" opacity="0.7" /> },
  { id: "candycorn", label: "Candy corn", base: "#FFD23F",
    overlay: () => (
      <g>
        <rect x="-10" y="-10" width="148" height="44" fill="#fff" />
        <rect x="-10" y="66" width="148" height="44" fill="#FF8C1A" />
      </g>
    ) },
  { id: "zombie", label: "Zombie green", base: "#7FA85C",
    overlay: () => (
      <g fill="#5A7F3C" opacity="0.8">
        <circle cx="56" cy="72" r="6" /><circle cx="78" cy="52" r="4.5" />
        <circle cx="68" cy="88" r="5" /><circle cx="86" cy="78" r="4" />
        <circle cx="48" cy="50" r="3.5" />
      </g>
    ) },
  { id: "bone", label: "Bone", base: "#EDE3CE",
    overlay: () => (
      <g stroke="#C9B896" strokeWidth="2.5" fill="none" strokeLinecap="round">
        <path d="M-10 40 L138 40" /><path d="M-10 58 L138 58" /><path d="M-10 76 L138 76" />
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
  { id: "swamp", label: "Murky swamp", draw: () => (
    <g>
      <rect width="128" height="128" fill="#C7CFA8" />
      <rect y={WATERLINE} width="128" height="36" fill="#7F8F5A" />
      <g fill="#5E6E3C" opacity="0.7">
        <ellipse cx="24" cy="104" rx="14" ry="5" /><ellipse cx="98" cy="114" rx="16" ry="5" />
        <ellipse cx="62" cy="120" rx="12" ry="4" />
      </g>
      <g stroke="#5E6E3C" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6">
        <path d="M10 92 L10 62" /><path d="M18 92 L20 70" /><path d="M118 92 L118 66" />
      </g>
    </g>
  ) },
  { id: "bloodmoon", label: "Blood moon", draw: () => (
    <g>
      <rect width="128" height="128" fill="#2B1520" />
      <rect y={WATERLINE} width="128" height="36" fill="#4A2030" />
      <circle cx="96" cy="32" r="16" fill="#E2571F" />
      <circle cx="90" cy="28" r="4" fill="#C2461A" opacity="0.7" />
      <g fill="#1A0C13" opacity="0.9">
        <path d="M0 44 L14 30 L22 40 L34 26 L46 44 Z" />
      </g>
    </g>
  ) },
  { id: "fog", label: "Foggy", draw: () => (
    <g>
      <rect width="128" height="128" fill="#CBD8DE" />
      <rect y={WATERLINE} width="128" height="36" fill="#A7B9C2" />
      <g fill="#fff" opacity="0.55">
        <ellipse cx="30" cy="66" rx="34" ry="7" /><ellipse cx="96" cy="80" rx="38" ry="8" />
        <ellipse cx="66" cy="48" rx="30" ry="6" />
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

const surfboard = () => (
  <g>
    <path d="M6 90 C34 68 94 68 122 90 C94 104 34 104 6 90 Z" fill="#FFF3D6" stroke="#0E3A5C" strokeWidth="2.5" />
    <path d="M14 87 C40 72 88 72 114 87" fill="none" stroke="#FF5C4D" strokeWidth="4" />
    <path d="M20 94 C46 84 82 84 108 94" fill="none" stroke="#37D6A0" strokeWidth="3" />
  </g>
);
const door = () => (
  <g>
    <path d="M10 84 L118 84 L110 102 L18 102 Z" fill="#8A5A34" stroke="#4A2E1E" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M22 88 L58 88 L54 98 L26 98 Z M70 88 L106 88 L102 98 L74 98 Z" fill="none" stroke="#4A2E1E" strokeWidth="2" />
  </g>
);
const coffin = () => (
  <g>
    <path d="M14 88 L32 74 L96 74 L114 88 L96 104 L32 104 Z" fill="#4A2E1E" stroke="#241109" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M22 88 L36 79 L92 79 L106 88 L92 99 L36 99 Z" fill="none" stroke="#7A5537" strokeWidth="1.5" />
    <path d="M26 82 L20 88 L26 94" fill="none" stroke="#EDE3CE" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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
  { id: "surfboard", label: "Surfboard", back: () => surfboard(), front: () => surfboard() },
  { id: "door", label: "The door", back: () => door(), front: () => door() },
  { id: "pumpkin", label: "Jack-o'-lantern",
    back: () => (
      <g>
        {ringBack("#FF8C1A")}
        <ellipse cx="24" cy="66" rx="15" ry="13" fill="#FF8C1A" />
        <path d="M24 53 L24 46 C24 44 28 44 28 47" fill="none" stroke="#2BB673" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M17 62 L22 62 L19.5 67 Z" fill="#3A1B00" />
        <path d="M27 62 L32 62 L29.5 67 Z" fill="#3A1B00" />
        <path d="M16 71 L20 74 L24 71 L28 74 L32 71 L30 75 L18 75 Z" fill="#3A1B00" />
      </g>
    ),
    front: () => ringFront("#FF8C1A") },
  { id: "coffin", label: "Coffin", back: () => coffin(), front: () => coffin() },
  { id: "ghostring", label: "Ghost ring",
    back: () => (
      <g>
        {ringBack("#F2F7FA", "#DCE9F0")}
        <path d="M10 74 C10 58 36 58 36 74 L36 86 L30 80 L23 86 L16 80 L10 86 Z" fill="#F7FBFD" stroke="#0E3A5C" strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="18" cy="70" r="2.2" fill="#0E3A5C" /><circle cx="29" cy="70" r="2.2" fill="#0E3A5C" />
        <path d="M20 77 C22 79 25 79 27 77" fill="none" stroke="#0E3A5C" strokeWidth="2" strokeLinecap="round" />
      </g>
    ),
    front: () => ringFront("#F2F7FA", "#DCE9F0") },
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
  { id: "witchhat", label: "Witch hat", draw: (tip) => {
    const [x, y] = tip;
    return (
      <g transform={`translate(${x} ${y}) rotate(8)`}>
        <path d="M2 -26 C6 -14 8 -4 10 4 L-12 4 C-8 -6 -2 -18 2 -26 Z" fill="#3A2A5C" />
        <path d="M-16 4 C-6 10 8 10 16 4 C8 0 -8 0 -16 4 Z" fill="#3A2A5C" />
        <path d="M-9 1 L7 1" stroke="#37D6A0" strokeWidth="3" strokeLinecap="round" />
      </g>
    );
  } },
  { id: "bat", label: "Bat", draw: () => (
    <g transform="translate(36 42)">
      <path d="M0 0 C-6 -6 -14 -6 -18 -2 C-14 -2 -12 2 -8 4 L0 6 L8 4 C12 2 14 -2 18 -2 C14 -6 6 -6 0 0 Z" fill="#2B1A3A" />
      <circle cx="0" cy="2" r="4" fill="#2B1A3A" />
      <path d="M-3 -1 L-4 -5 L-1 -3 Z M3 -1 L4 -5 L1 -3 Z" fill="#2B1A3A" />
      <circle cx="-1.5" cy="2" r="0.9" fill="#FFD23F" /><circle cx="1.5" cy="2" r="0.9" fill="#FFD23F" />
    </g>
  ) },
  { id: "spider", label: "Dangling spider", draw: () => (
    <g transform="translate(100 0)">
      <path d="M0 0 L0 44" stroke="#0E3A5C" strokeWidth="1.5" />
      <g stroke="#1A1020" strokeWidth="2" strokeLinecap="round" fill="none">
        <path d="M-4 46 L-11 42 M-4 50 L-12 50 M-4 54 L-11 58" />
        <path d="M4 46 L11 42 M4 50 L12 50 M4 54 L11 58" />
      </g>
      <circle cx="0" cy="50" r="6" fill="#1A1020" />
      <circle cx="-2" cy="48" r="1.2" fill="#FF5C4D" /><circle cx="2" cy="48" r="1.2" fill="#FF5C4D" />
    </g>
  ) },
  { id: "candycorn", label: "Candy corn", draw: (tip) => {
    const [x, y] = tip;
    return (
      <g transform={`translate(${x + 16} ${y + 30}) rotate(20)`}>
        <path d="M0 -12 L5 2 L-5 2 Z" fill="#FFD23F" />
        <path d="M-3.2 -4 L3.2 -4 L5 2 L-5 2 Z" fill="#FF8C1A" />
        <path d="M0 -12 L1.6 -8 L-1.6 -8 Z" fill="#fff" />
      </g>
    );
  } },
  { id: "eyepatch", label: "Eyepatch", draw: (tip) => {
    const [x, y] = tip;
    return (
      <g transform={`translate(${x - 4} ${y + 24}) rotate(-12)`}>
        <path d="M-14 -6 L12 -2" stroke="#1A1020" strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="0" cy="0" rx="7" ry="6" fill="#1A1020" />
      </g>
    );
  } },
  { id: "snorkelmask", label: "Dive mask", draw: (tip) => {
    const [x, y] = tip;
    return (
      <g transform={`translate(${x - 4} ${y + 26}) rotate(-10)`}>
        <rect x="-14" y="-7" width="28" height="14" rx="6" fill="#8FD0DE" stroke="#0E3A5C" strokeWidth="2.5" />
        <path d="M0 -7 L0 7" stroke="#0E3A5C" strokeWidth="2" />
        <path d="M-14 -2 L-20 -4" stroke="#0E3A5C" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    );
  } },
  { id: "duckling", label: "Tiny duck", draw: () => (
    <g transform="translate(104 82)">
      <ellipse cx="0" cy="2" rx="9" ry="6" fill="#FFD23F" />
      <circle cx="5" cy="-4" r="5" fill="#FFD23F" />
      <path d="M10 -4 L16 -3 L10 -1 Z" fill="#FF8C1A" />
      <circle cx="6" cy="-5" r="1.2" fill="#0E3A5C" />
    </g>
  ) },
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
