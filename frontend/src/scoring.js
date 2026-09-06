// Scoring, status ladder, and tier badges for saltypoolwater.
// Everything tunable lives in the two tables at the top.

export const STATUS_LADDER = [
  { min: 15,        label: "Brine" },
  { min: 5,         label: "Salty" },
  { min: 1,         label: "Chlorinated" },
  { min: -2,        label: "Lukewarm" },
  { min: -Infinity, label: "Drained" },
];

export const TIERS = [
  { key: "cannonball", field: "landed", min: 10, label: "Cannonball" },
  { key: "bellyflop",  field: "womp",   min: 10, label: "Belly flop" },
];

export const SITE_TZ = "America/Chicago";

export function netScore(c) {
  return (c.landed || 0) - (c.womp || 0);
}

export function formatScore(c) {
  const n = netScore(c);
  return n > 0 ? `+${n}` : String(n);
}

export function statusFor(c) {
  const n = netScore(c);
  return STATUS_LADDER.find((s) => n >= s.min);
}

export function tiersFor(c) {
  return TIERS.filter((t) => (c[t.field] || 0) >= t.min);
}

/** YYYY-MM-DD in the site's timezone. Mirrors today() in the API. */
export function todayKey(date = new Date(), tz = SITE_TZ) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(date);
}

/** Milliseconds until the next midnight in the site's timezone (for the countdown). */
export function msUntilMidnight(tz = SITE_TZ) {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hour: "numeric", minute: "numeric", second: "numeric", hour12: false,
  }).formatToParts(now).reduce((o, p) => ((o[p.type] = Number(p.value)), o), {});
  const secondsIntoDay = (parts.hour % 24) * 3600 + parts.minute * 60 + parts.second;
  return (86400 - secondsIntoDay) * 1000;
}

// ---- feed views ----

const byScoreThenNewest = (a, b) =>
  netScore(b) - netScore(a) || (b.ts || 0) - (a.ts || 0);
const byNewest = (a, b) => (b.ts || 0) - (a.ts || 0);

export const VIEWS = [
  { id: "today",   label: "Saltiest today" },
  { id: "alltime", label: "All time" },
  { id: "fresh",   label: "Fresh" },
];

export function applyView(complaints, viewId) {
  const list = [...complaints];
  switch (viewId) {
    case "today": {
      const key = todayKey();
      return list.filter((c) => c.day === key).sort(byScoreThenNewest);
    }
    case "alltime":
      return list.sort(byScoreThenNewest);
    case "fresh":
    default:
      return list.sort(byNewest);
  }
}