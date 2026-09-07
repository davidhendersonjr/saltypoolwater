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

// Emblems save to the API when the endpoint exists and fall back to this
// browser's storage until then, so the picker works before the backend does.
const EMBLEM_KEY = "spw-emblem";

function localEmblem() {
  try {
    return JSON.parse(localStorage.getItem(EMBLEM_KEY));
  } catch {
    return null;
  }
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

  getEmblem: async () => {
    try {
      const body = await request("/api/me/emblem");
      if (body.emblem) return body.emblem;
    } catch {
      /* endpoint not there yet, or nothing saved */
    }
    return localEmblem();
  },
  saveEmblem: async (emblem) => {
    try {
      const body = await request("/api/me/emblem", {
        method: "PUT",
        body: JSON.stringify({ emblem }),
      });
      return body.emblem || emblem;
    } catch (e) {
      if (e.status === 401) throw new Error("Sign in to save your shark.");
      localStorage.setItem(EMBLEM_KEY, JSON.stringify(emblem));
      return emblem;
    }
  },
};

export const loginUrl = "/.auth/login/github?post_login_redirect_uri=/";
export const logoutUrl = "/.auth/logout";
