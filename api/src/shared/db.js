// Data layer for saltypoolwater.
// Uses Cosmos DB when COSMOS_ENDPOINT/COSMOS_KEY are set (production),
// otherwise falls back to an in-memory store so local dev needs zero Azure setup.

const DB_ID = "saltypoolwater";
const useCosmos = !!(process.env.COSMOS_ENDPOINT && process.env.COSMOS_KEY);

// ---------- helpers ----------

const SITE_TZ = process.env.SITE_TZ || "America/Chicago";

/** Day bucket in the site's timezone, e.g. "2026-09-05". Partition key + daily ration. */
function today(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SITE_TZ, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(date);
}

/** Read the user identity SWA injects. Returns { userId, userDetails } or null. */
function getPrincipal(request) {
  const header = request.headers.get("x-ms-client-principal");
  if (!header) return null;
  try {
    const decoded = JSON.parse(Buffer.from(header, "base64").toString("utf8"));
    return { userId: decoded.userId, userDetails: decoded.userDetails };
  } catch {
    return null;
  }
}

function newId() {
  return `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ---------- Cosmos implementation ----------

let containers = null;
async function getContainers() {
  if (containers) return containers;
  const { CosmosClient } = require("@azure/cosmos"); // lazy: only needed in production
  const client = new CosmosClient({
    endpoint: process.env.COSMOS_ENDPOINT,
    key: process.env.COSMOS_KEY,
  });
  const db = client.database(DB_ID);
  containers = {
    complaints: db.container("complaints"),
    votes: db.container("votes"),
    profiles: db.container("profiles"),
  };
  return containers;
}

// ---------- in-memory fallback (local dev) ----------

const mem = { complaints: [], votes: [], profiles: [] };

// ---------- public API ----------

async function listComplaints({ limit = 100 } = {}) {
  if (useCosmos) {
    const { complaints } = await getContainers();
    const { resources } = await complaints.items
      .query({
        query: "SELECT TOP @limit * FROM c ORDER BY c.ts DESC",
        parameters: [{ name: "@limit", value: limit }],
      })
      .fetchAll();
    return resources;
  }
  return [...mem.complaints].sort((a, b) => b.ts - a.ts).slice(0, limit);
}

async function userPostedToday(userId) {
  const d = today();
  if (useCosmos) {
    const { complaints } = await getContainers();
    const { resources } = await complaints.items
      .query({
        query:
          "SELECT VALUE COUNT(1) FROM c WHERE c.day = @day AND c.userId = @uid",
        parameters: [
          { name: "@day", value: d },
          { name: "@uid", value: userId },
        ],
      })
      .fetchAll();
    return (resources[0] || 0) > 0;
  }
  return mem.complaints.some((c) => c.day === d && c.userId === userId);
}

async function createComplaint({ userId, author, setup, punchline }) {
  const doc = {
    id: newId(),
    day: today(),
    userId,
    author,
    setup,
    punchline,
    ts: Date.now(),
    landed: 0,
    womp: 0,
    comments: [],
  };
  if (useCosmos) {
    const { complaints } = await getContainers();
    await complaints.items.create(doc);
  } else {
    mem.complaints.push(doc);
  }
  return doc;
}

async function getComplaint(id, day) {
  if (useCosmos) {
    const { complaints } = await getContainers();
    try {
      const { resource } = await complaints.item(id, day).read();
      return resource || null;
    } catch {
      return null;
    }
  }
  return mem.complaints.find((c) => c.id === id) || null;
}

async function saveComplaint(doc) {
  if (useCosmos) {
    const { complaints } = await getContainers();
    await complaints.item(doc.id, doc.day).replace(doc);
  }
  // in-memory objects are mutated in place; nothing to do
  return doc;
}

/**
 * Record a vote: direction is 1 (landed) or -1 (womp womp).
 * One vote per user per complaint; re-voting the same way removes it,
 * voting the other way flips it. Returns the updated complaint.
 */
async function vote({ complaintId, day, userId, direction }) {
  const complaint = await getComplaint(complaintId, day);
  if (!complaint) return null;

  const voteId = `${complaintId}|${userId}`;
  let existing = null;

  if (useCosmos) {
    const { votes } = await getContainers();
    try {
      const { resource } = await votes.item(voteId, complaintId).read();
      existing = resource || null;
    } catch {
      existing = null;
    }
    if (existing && existing.direction === direction) {
      await votes.item(voteId, complaintId).delete();
      direction === 1 ? complaint.landed-- : complaint.womp--;
    } else if (existing) {
      existing.direction = direction;
      await votes.item(voteId, complaintId).replace(existing);
      if (direction === 1) { complaint.landed++; complaint.womp--; }
      else { complaint.womp++; complaint.landed--; }
    } else {
      await votes.items.create({ id: voteId, complaintId, userId, direction });
      direction === 1 ? complaint.landed++ : complaint.womp++;
    }
  } else {
    existing = mem.votes.find((v) => v.id === voteId) || null;
    if (existing && existing.direction === direction) {
      mem.votes = mem.votes.filter((v) => v.id !== voteId);
      direction === 1 ? complaint.landed-- : complaint.womp--;
    } else if (existing) {
      existing.direction = direction;
      if (direction === 1) { complaint.landed++; complaint.womp--; }
      else { complaint.womp++; complaint.landed--; }
    } else {
      mem.votes.push({ id: voteId, complaintId, userId, direction });
      direction === 1 ? complaint.landed++ : complaint.womp++;
    }
  }

  return saveComplaint(complaint);
}

async function addComment({ complaintId, day, author, text }) {
  const complaint = await getComplaint(complaintId, day);
  if (!complaint) return null;
  complaint.comments.push({
    id: newId(),
    author,
    text,
    ts: Date.now(),
  });
  return saveComplaint(complaint);
}

/** Look up a complaint by id alone (cross-partition, used by share links). */
async function findComplaint(id) {
  if (useCosmos) {
    const { complaints } = await getContainers();
    const { resources } = await complaints.items
      .query({ query: "SELECT * FROM c WHERE c.id = @id", parameters: [{ name: "@id", value: id }] })
      .fetchAll();
    return resources[0] || null;
  }
  return mem.complaints.find((c) => c.id === id) || null;
}

/** All of one user's votes as { complaintId: 1 | -1 }. Powers the filled-in icons on load. */
async function listUserVotes(userId) {
  const out = {};
  if (useCosmos) {
    const { votes } = await getContainers();
    const { resources } = await votes.items
      .query({
        query: "SELECT c.complaintId, c.direction FROM c WHERE c.userId = @uid",
        parameters: [{ name: "@uid", value: userId }],
      })
      .fetchAll();
    for (const v of resources) out[v.complaintId] = v.direction;
  } else {
    for (const v of mem.votes) if (v.userId === userId) out[v.complaintId] = v.direction;
  }
  return out;
}
// ============================================================
// PROFILES — paste this block into api/src/shared/db.js,
// just above the final `module.exports = {` line.
// ============================================================

const MAX_HEADLINE = 80;
const MAX_BIO = 280;

/** Trim and cap a free-text field. */
function clean(value, max) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

/** Only keep the five emblem slots, each a short id. Anything else is dropped. */
function cleanEmblem(e) {
  if (!e || typeof e !== "object") return null;
  const out = {};
  for (const key of ["fin", "color", "floatie", "water", "extra"]) {
    const v = e[key];
    if (typeof v === "string" && v.length <= 32) out[key] = v;
  }
  return Object.keys(out).length ? out : null;
}

/** One user's profile by their auth id. */
async function getProfile(userId) {
  if (useCosmos) {
    const { profiles } = await getContainers();
    try {
      const { resource } = await profiles.item(userId, userId).read();
      return resource || null;
    } catch {
      return null;
    }
  }
  return mem.profiles.find((p) => p.id === userId) || null;
}

/** One user's profile by their display name (what the feed shows). */
async function getProfileByAuthor(author) {
  if (useCosmos) {
    const { profiles } = await getContainers();
    const { resources } = await profiles.items
      .query({
        query: "SELECT * FROM c WHERE c.author = @a",
        parameters: [{ name: "@a", value: author }],
      })
      .fetchAll();
    return resources[0] || null;
  }
  return mem.profiles.find((p) => p.author === author) || null;
}

/** Create or update the signed-in user's own profile. Only the given fields change. */
async function saveProfile({ userId, author, headline, bio, emblem }) {
  const existing = (await getProfile(userId)) || {
    id: userId,
    author,
    headline: "",
    bio: "",
    emblem: null,
    joined: Date.now(),
  };

  const doc = {
    ...existing,
    author, // keep in step with the auth provider
    ...(headline !== undefined ? { headline: clean(headline, MAX_HEADLINE) } : {}),
    ...(bio !== undefined ? { bio: clean(bio, MAX_BIO) } : {}),
    ...(emblem !== undefined ? { emblem: cleanEmblem(emblem) } : {}),
    updated: Date.now(),
  };

  if (useCosmos) {
    const { profiles } = await getContainers();
    await profiles.items.upsert(doc);
  } else {
    mem.profiles = mem.profiles.filter((p) => p.id !== userId);
    mem.profiles.push(doc);
  }
  return doc;
}

/**
 * Every profile as { author: { emblem, headline } }.
 * The feed loads this once so each post can show its author's current shark —
 * change your shark and every post you've made updates with it.
 */
async function listProfiles() {
  const out = {};
  let rows;
  if (useCosmos) {
    const { profiles } = await getContainers();
    const { resources } = await profiles.items
      .query("SELECT c.author, c.emblem, c.headline FROM c")
      .fetchAll();
    rows = resources;
  } else {
    rows = mem.profiles;
  }
  for (const p of rows) {
    if (p.author) out[p.author] = { emblem: p.emblem || null, headline: p.headline || "" };
  }
  return out;
}

/** One user's complaints and comments, newest first. */
async function listUserActivity(author, { limit = 50 } = {}) {
  let posts = [];
  let comments = [];

  if (useCosmos) {
    const { complaints } = await getContainers();
    const postRes = await complaints.items
      .query({
        query: "SELECT TOP @limit * FROM c WHERE c.author = @a ORDER BY c.ts DESC",
        parameters: [
          { name: "@limit", value: limit },
          { name: "@a", value: author },
        ],
      })
      .fetchAll();
    posts = postRes.resources;

    const commentRes = await complaints.items
      .query({
        query:
          "SELECT c.id AS complaintId, c.day, c.setup, m.text, m.ts " +
          "FROM c JOIN m IN c.comments WHERE m.author = @a ORDER BY m.ts DESC",
        parameters: [{ name: "@a", value: author }],
      })
      .fetchAll();
    comments = commentRes.resources.slice(0, limit);
  } else {
    posts = mem.complaints
      .filter((c) => c.author === author)
      .sort((a, b) => b.ts - a.ts)
      .slice(0, limit);
    for (const c of mem.complaints) {
      for (const m of c.comments || []) {
        if (m.author === author) {
          comments.push({ complaintId: c.id, day: c.day, setup: c.setup, text: m.text, ts: m.ts });
        }
      }
    }
    comments.sort((a, b) => b.ts - a.ts);
    comments = comments.slice(0, limit);
  }

  // Strip the internal id before this leaves the server.
  posts = posts.map(({ userId, ...rest }) => rest);

  const salted = posts.reduce((n, p) => n + (p.landed || 0), 0);
  const watered = posts.reduce((n, p) => n + (p.womp || 0), 0);

  return { posts, comments, stats: { posts: posts.length, comments: comments.length, salted, watered } };
}

module.exports = {
  today,
  getPrincipal,
  listComplaints,
  userPostedToday,
  createComplaint,
  vote,
  addComment,
  useCosmos,
  findComplaint,
  listUserVotes,
  getProfile,
  getProfileByAuthor,
  saveProfile,
  listProfiles,
  listUserActivity,
};

