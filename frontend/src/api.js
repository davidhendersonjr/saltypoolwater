// Thin client for the saltypoolwater API.

async function request(path, options = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return body;
}

// Until the profile API is deployed, your own emblem and text live in this
// browser so the picker still works. Other people's still come from the API.
const LOCAL_KEY = "spw-profile";

function localProfile() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY)) || {};
  } catch {
    return {};
  }
}

function saveLocalProfile(patch) {
  const next = { ...localProfile(), ...patch };
  localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
  return next;
}

export const api = {
  me: () => request("/api/me"),
  listComplaints: () => request("/api/complaints"),
  post: ({ author, setup, punchline }) =>
    request("/api/complaints", {
      method: "POST",
      body: JSON.stringify({ author, setup, punchline }),
    }),
  vote: (id, day, direction) =>
    request(`/api/complaints/${id}/vote`, {
      method: "POST",
      body: JSON.stringify({ day, direction }),
    }),
  comment: (id, day, text) =>
    request(`/api/complaints/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({ day, text }),
    }),

  // --- profiles ---

  /** Everyone's emblem and headline, keyed by author name. Loaded once with the feed. */
  listProfiles: async () => {
    try {
      const body = await request("/api/profiles");
      return body.profiles || {};
    } catch {
      return {};
    }
  },

  /** One person's public profile. Falls back to local storage for your own. */
  getProfile: async (name) => {
    try {
      const body = await request(`/api/users/${encodeURIComponent(name)}`);
      if (body.profile) return body.profile;
    } catch {
      /* API not deployed yet */
    }
    return { author: name, ...localProfile() };
  },

  getActivity: (name) => request(`/api/users/${encodeURIComponent(name)}/activity`),

  /** Save any of headline, bio, emblem. Omitted fields are left alone. */
  saveProfile: async (patch) => {
    try {
      const body = await request("/api/me/profile", {
        method: "PUT",
        body: JSON.stringify(patch),
      });
      return body.profile;
    } catch (e) {
      if (e.status === 401) throw new Error("Sign in to save your profile.");
      return saveLocalProfile(patch);
    }
  },

  getEmblem: async () => {
    try {
      const body = await request("/api/me/emblem");
      if (body.emblem) return body.emblem;
    } catch {
      /* fall through */
    }
    return localProfile().emblem || null;
  },

  saveEmblem: async (emblem) => {
    const saved = await api.saveProfile({ emblem });
    return saved?.emblem || emblem;
  },
};

export const loginUrl = "/.auth/login/github?post_login_redirect_uri=/";
export const logoutUrl = "/.auth/logout";
