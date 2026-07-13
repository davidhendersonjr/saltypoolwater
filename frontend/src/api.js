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
};

export const loginUrl = "/.auth/login/github?post_login_redirect_uri=/";
export const logoutUrl = "/.auth/logout";
