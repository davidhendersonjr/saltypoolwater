const { app } = require("@azure/functions");
const db = require("../shared/db");

const MAX_SETUP = 200;
const MAX_PUNCHLINE = 140;

// Very light content gate for MVP: block posts that name-and-shame with
// contact info or slurs. Real moderation comes later; this catches the
// laziest bad actors on day one.
const BLOCK_PATTERNS = [
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/, // phone numbers
  /\b[\w.+-]+@[\w-]+\.[\w.]+\b/,       // email addresses
];

function reject(status, message) {
  return { status, jsonBody: { error: message } };
}

app.http("complaints", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  route: "complaints",
  handler: async (request, context) => {
    if (request.method === "GET") {
      const day = request.query.get("day") || undefined;
      const items = await db.listComplaints(day);
      // Never leak userIds to the feed
      const publicItems = items.map(({ userId, ...rest }) => rest);
      return { jsonBody: { day: day || db.today(), complaints: publicItems } };
    }

    // POST — requires login so the daily ration is enforceable
    const principal = db.getPrincipal(request);
    const isLocalDev = !db.useCosmos;
    const userId = principal?.userId || (isLocalDev ? "local-dev-user" : null);
    if (!userId) {
      return reject(401, "Sign in to post. Voting and reading are open to all.");
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return reject(400, "Invalid JSON body.");
    }

    const setup = (body.setup || "").trim();
    const punchline = (body.punchline || "").trim();
    const author = (body.author || principal?.userDetails || "anonymous").trim().slice(0, 40);

    if (!setup) return reject(400, "The complaint needs a setup.");
    if (!punchline) return reject(400, "No punchline, no post. Stick the landing.");
    if (setup.length > MAX_SETUP) return reject(400, `Setup is over ${MAX_SETUP} characters.`);
    if (punchline.length > MAX_PUNCHLINE) return reject(400, `Punchline is over ${MAX_PUNCHLINE} characters.`);
    for (const pattern of BLOCK_PATTERNS) {
      if (pattern.test(setup) || pattern.test(punchline)) {
        return reject(400, "No contact info or naming real people. Keep it petty, keep it anonymous.");
      }
    }

    if (await db.userPostedToday(userId)) {
      return reject(429, "That's your salt for today. Fresh shaker at midnight UTC.");
    }

    const doc = await db.createComplaint({ userId, author, setup, punchline });
    const { userId: _omit, ...publicDoc } = doc;
    return { status: 201, jsonBody: publicDoc };
  },
});

app.http("votes", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "complaints/{id}/vote",
  handler: async (request, context) => {
    const principal = db.getPrincipal(request);
    const userId = principal?.userId || (!db.useCosmos ? "local-dev-user" : null);
    if (!userId) return reject(401, "Sign in to vote.");

    let body;
    try {
      body = await request.json();
    } catch {
      return reject(400, "Invalid JSON body.");
    }

    const direction = body.direction === -1 ? -1 : body.direction === 1 ? 1 : null;
    if (!direction) return reject(400, "direction must be 1 (landed) or -1 (womp womp).");
    if (!body.day) return reject(400, "day is required.");

    const updated = await db.vote({
      complaintId: request.params.id,
      day: body.day,
      userId,
      direction,
    });
    if (!updated) return reject(404, "Complaint not found.");
    const { userId: _omit, ...publicDoc } = updated;
    return { jsonBody: publicDoc };
  },
});

app.http("comments", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "complaints/{id}/comments",
  handler: async (request, context) => {
    const principal = db.getPrincipal(request);
    const isLocalDev = !db.useCosmos;
    if (!principal && !isLocalDev) return reject(401, "Sign in to comment.");

    let body;
    try {
      body = await request.json();
    } catch {
      return reject(400, "Invalid JSON body.");
    }

    const text = (body.text || "").trim();
    if (!text) return reject(400, "Empty comment.");
    if (text.length > 300) return reject(400, "Comments max out at 300 characters.");
    if (!body.day) return reject(400, "day is required.");

    const author = (principal?.userDetails || "local-dev-user").slice(0, 40);
    const updated = await db.addComment({
      complaintId: request.params.id,
      day: body.day,
      author,
      text,
    });
    if (!updated) return reject(404, "Complaint not found.");
    const { userId: _omit, ...publicDoc } = updated;
    return { jsonBody: publicDoc };
  },
});

// Who am I? Frontend uses this to show login state and the daily ration.
app.http("me", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "me",
  handler: async (request) => {
    const principal = db.getPrincipal(request);
    const isLocalDev = !db.useCosmos;
    const userId = principal?.userId || (isLocalDev ? "local-dev-user" : null);
    if (!userId) return { jsonBody: { signedIn: false } };
    return {
      jsonBody: {
        signedIn: true,
        userDetails: principal?.userDetails || "local-dev-user",
        postedToday: await db.userPostedToday(userId),
      },
    };
  },
});
