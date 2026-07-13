import React, { useEffect, useMemo, useState } from "react";
import { api, loginUrl, logoutUrl } from "./api.js";

const MAX_SETUP = 200;
const MAX_PUNCHLINE = 140;

function msToMidnightUTC() {
  const now = new Date();
  const midnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return midnight - now;
}

function useCountdown() {
  const [ms, setMs] = useState(msToMidnightUTC());
  useEffect(() => {
    const t = setInterval(() => setMs(msToMidnightUTC()), 1000);
    return () => clearInterval(t);
  }, []);
  const h = Math.floor(ms / 3.6e6);
  const m = Math.floor((ms % 3.6e6) / 6e4);
  const s = Math.floor((ms % 6e4) / 1000);
  return `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}

function ppm(c) {
  return c.landed * 100 - c.womp * 25;
}

export default function App() {
  const [me, setMe] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [day, setDay] = useState("");
  const [tab, setTab] = useState("salty");
  const [setup, setSetup] = useState("");
  const [punchline, setPunchline] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const countdown = useCountdown();

  async function refresh() {
    try {
      const [meRes, feed] = await Promise.all([api.me(), api.listComplaints()]);
      setMe(meRes);
      setComplaints(feed.complaints);
      setDay(feed.day);
    } catch (e) {
      setError("Couldn't reach the pool. Refresh to try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const sorted = useMemo(() => {
    const list = [...complaints];
    if (tab === "salty") list.sort((a, b) => ppm(b) - ppm(a));
    else list.sort((a, b) => b.ts - a.ts);
    return list;
  }, [complaints, tab]);

  async function submit() {
    setError("");
    try {
      const doc = await api.post({ setup, punchline });
      setComplaints((c) => [doc, ...c]);
      setSetup("");
      setPunchline("");
      setMe((m) => ({ ...m, postedToday: true }));
    } catch (e) {
      setError(e.message);
    }
  }

  async function vote(c, direction) {
    setError("");
    try {
      const updated = await api.vote(c.id, c.day, direction);
      setComplaints((list) => list.map((x) => (x.id === updated.id ? updated : x)));
    } catch (e) {
      setError(e.status === 401 ? "Sign in to vote." : e.message);
    }
  }

  async function comment(c) {
    const text = (commentDrafts[c.id] || "").trim();
    if (!text) return;
    setError("");
    try {
      const updated = await api.comment(c.id, c.day, text);
      setComplaints((list) => list.map((x) => (x.id === updated.id ? updated : x)));
      setCommentDrafts((d) => ({ ...d, [c.id]: "" }));
    } catch (e) {
      setError(e.status === 401 ? "Sign in to comment." : e.message);
    }
  }

  const signedIn = me?.signedIn;
  const posted = me?.postedToday;

  return (
    <div className="spw-shell">
      <header className="spw-header">
        <img className="spw-logo" src="/logo-icon.svg" alt="" width="72" height="72" />
        <h1 className="spw-wordmark">
          <span className="spw-salty">salty</span>poolwater
        </h1>
        <p className="spw-tag">One complaint a day. Make it funny.</p>

        <div className="spw-authrow">
          {signedIn ? (
            <>
              <span className="spw-who">🧂 {me.userDetails}</span>
              <a className="spw-linkbtn" href={logoutUrl}>Sign out</a>
            </>
          ) : (
            <a className="spw-btn spw-btn-small" href={loginUrl}>Sign in with GitHub</a>
          )}
        </div>

        {signedIn && (
          <div className="spw-ration" role="status">
            <span className={`dot ${posted ? "dot-used" : "dot-ok"}`} aria-hidden="true"></span>
            {posted
              ? `Set performed · next mic at midnight UTC (${countdown})`
              : "1 complaint left today"}
          </div>
        )}
      </header>

      {error && <div className="spw-error" role="alert">{error}</div>}

      {signedIn && !posted && (
        <section className="spw-card" aria-label="Post your daily complaint">
          <p className="spw-label">
            Today's complaint <span className="hint">— petty grievance, funny landing</span>
          </p>
          <textarea
            className="spw-textarea"
            value={setup}
            maxLength={MAX_SETUP + 40}
            placeholder="The setup. What's bothering you? Keep it petty. No naming real people."
            onChange={(e) => setSetup(e.target.value)}
            aria-label="Setup"
          />
          <span className={`spw-count ${setup.length > MAX_SETUP ? "over" : ""}`}>
            {setup.length}/{MAX_SETUP}
          </span>
          <textarea
            className="spw-textarea spw-textarea-punch"
            value={punchline}
            maxLength={MAX_PUNCHLINE + 40}
            placeholder="The punchline. Stick the landing."
            onChange={(e) => setPunchline(e.target.value)}
            aria-label="Punchline"
          />
          <div className="spw-compose-row">
            <span className={`spw-count ${punchline.length > MAX_PUNCHLINE ? "over" : ""}`}>
              {punchline.length}/{MAX_PUNCHLINE}
            </span>
            <button
              className="spw-btn"
              onClick={submit}
              disabled={
                !setup.trim() ||
                !punchline.trim() ||
                setup.length > MAX_SETUP ||
                punchline.length > MAX_PUNCHLINE
              }
            >
              Take the mic 🧂
            </button>
          </div>
        </section>
      )}

      {!signedIn && !loading && (
        <section className="spw-card spw-card-invite">
          <p>Anyone can read. Sign in to grab the mic — one complaint a day, setup and punchline.</p>
        </section>
      )}

      <div className="spw-tabs" role="tablist" aria-label="Sort complaints">
        <button className="spw-tab" role="tab" aria-selected={tab === "salty"} onClick={() => setTab("salty")}>
          Saltiest today
        </button>
        <button className="spw-tab" role="tab" aria-selected={tab === "fresh"} onClick={() => setTab("fresh")}>
          Fresh
        </button>
      </div>

      {loading && <p className="spw-empty">Checking the water…</p>}
      {!loading && sorted.length === 0 && (
        <p className="spw-empty">
          Nobody's complained yet today. The pool is suspiciously calm. Be the first.
        </p>
      )}

      {sorted.map((c) => (
        <article className="spw-card" key={c.id}>
          <div className="spw-item">
            <div className="spw-votecol">
              <button className="spw-arrow" onClick={() => vote(c, 1)} aria-label="Landed">▲</button>
              <div className="spw-ppm">
                <span className="n">{ppm(c)}</span>
                <span className="u">PPM</span>
              </div>
              <button className="spw-arrow" onClick={() => vote(c, -1)} aria-label="Womp womp">▼</button>
            </div>
            <div className="spw-body">
              <p className="spw-setup">{c.setup}</p>
              {revealed[c.id] ? (
                <p className="spw-punchline">{c.punchline}</p>
              ) : (
                <button
                  className="spw-reveal"
                  onClick={() => setRevealed((r) => ({ ...r, [c.id]: true }))}
                >
                  …tap for the punchline
                </button>
              )}
              <p className="spw-meta">
                {c.author} · {new Date(c.ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                {" · "}{c.landed} landed · {c.womp} womp
              </p>

              <div className="spw-comments">
                {c.comments.map((m) => (
                  <p className="spw-comment" key={m.id}>
                    <span className="who">{m.author}</span>
                    {m.text}
                  </p>
                ))}
                {signedIn && (
                  <div className="spw-crow">
                    <input
                      className="spw-cinput"
                      value={commentDrafts[c.id] || ""}
                      placeholder="Heckle (supportively)"
                      maxLength={300}
                      onChange={(e) =>
                        setCommentDrafts((d) => ({ ...d, [c.id]: e.target.value }))
                      }
                      onKeyDown={(e) => e.key === "Enter" && comment(c)}
                    />
                    <button className="spw-cbtn" onClick={() => comment(c)}>Reply</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </article>
      ))}

      <footer className="spw-foot">
        saltypoolwater.com — keep it petty, keep it anonymous. No naming real people.
      </footer>
    </div>
  );
}
