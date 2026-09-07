const { app } = require("@azure/functions");
const db = require("../shared/db");

// In local dev there's no SWA auth header, so stand in a fixed user.
function principalOf(request) {
  const p = db.getPrincipal(request);
  if (p) return p;
  if (!db.useCosmos) return { userId: "local-dev-user", userDetails: "local-dev-user" };
  return null;
}

/** What anyone is allowed to see about another user. */
function publicProfile(profile, author) {
  return {
    author,
    emblem: profile?.emblem || null,
    headline: profile?.headline || "",
    bio: profile?.bio || "",
    joined: profile?.joined || null,
  };
}

// GET /api/profiles — { author: { emblem, headline } } for the whole site.
app.http("profiles", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "profiles",
  handler: async () => ({ jsonBody: { profiles: await db.listProfiles() } }),
});

// GET /api/users/{name}            → that person's public profile
// GET /api/users/{name}/activity   → their posts and comments
app.http("userProfile", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "users/{name}/{section?}",
  handler: async (request) => {
    const name = decodeURIComponent(request.params.name || "");
    if (!name) return { status: 400, jsonBody: { error: "No user given." } };

    if (request.params.section === "activity") {
      return { jsonBody: await db.listUserActivity(name) };
    }
    if (request.params.section) {
      return { status: 404, jsonBody: { error: "Not found." } };
    }

    const profile = await db.getProfileByAuthor(name);
    return { jsonBody: { profile: publicProfile(profile, name) } };
  },
});

// GET  /api/me/profile  → your own profile (including anything not shown publicly)
// PUT  /api/me/profile  → save headline, bio, and/or emblem
app.http("myProfile", {
  methods: ["GET", "PUT"],
  authLevel: "anonymous",
  route: "me/profile",
  handler: async (request) => {
    const principal = principalOf(request);
    if (!principal) return { status: 401, jsonBody: { error: "Sign in first." } };

    if (request.method === "GET") {
      const profile = await db.getProfile(principal.userId);
      return { jsonBody: { profile: publicProfile(profile, principal.userDetails) } };
    }

    let body = {};
    try {
      body = await request.json();
    } catch {
      return { status: 400, jsonBody: { error: "Couldn't read that." } };
    }

    const saved = await db.saveProfile({
      userId: principal.userId,
      author: principal.userDetails,
      headline: body.headline,
      bio: body.bio,
      emblem: body.emblem,
    });
    return { jsonBody: { profile: publicProfile(saved, principal.userDetails) } };
  },
});

// The frontend's older emblem calls still work, so nothing breaks mid-deploy.
app.http("myEmblem", {
  methods: ["GET", "PUT"],
  authLevel: "anonymous",
  route: "me/emblem",
  handler: async (request) => {
    const principal = principalOf(request);
    if (!principal) return { status: 401, jsonBody: { error: "Sign in first." } };

    if (request.method === "GET") {
      const profile = await db.getProfile(principal.userId);
      return { jsonBody: { emblem: profile?.emblem || null } };
    }

    let body = {};
    try {
      body = await request.json();
    } catch {
      return { status: 400, jsonBody: { error: "Couldn't read that." } };
    }
    const saved = await db.saveProfile({
      userId: principal.userId,
      author: principal.userDetails,
      emblem: body.emblem,
    });
    return { jsonBody: { emblem: saved.emblem } };
  },
});
