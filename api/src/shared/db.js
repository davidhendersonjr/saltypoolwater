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
  };
  return containers;
}

// ---------- in-memory fallback (local dev) ----------

const mem = { complaints: [], votes: [] };

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

module.exports = {
  today,
  getPrincipal,
  listComplaints,
  userPostedToday,
  createComplaint,
  vote,
  addComment,
  useCosmos,
};
