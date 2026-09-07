import React, { useEffect, useMemo, useState } from "react";
import { api } from "./api.js";
import { SaltShaker, WaterDrop } from "./VoteIcons.jsx";
import Sidebar from "./Sidebar.jsx";
import Emblem from "./emblem/Emblem.jsx";
import UserMenu from "./emblem/UserMenu.jsx";
import { emblemFromName } from "./emblem/emblemParts.jsx";
import {
  VIEWS, applyView, formatScore, netScore, statusFor, tiersFor, msUntilMidnight,
} from "./scoring.js";

const MAX_SETUP = 200;
const MAX_PUNCHLINE = 140;

const loginGitHub = "/.auth/login/github?post_login_redirect_uri=/";
const loginMicrosoft = "/.auth/login/aad?post_login_redirect_uri=/";
const logoutUrl = "/.auth/logout";

function useCountdown() {
  const [ms, setMs] = useState(msUntilMidnight());
  useEffect(() => {
    const t = setInterval(() => setMs(msUntilMidnight()), 1000);
    return () => clearInterval(t);
  }, []);
  const h = Math.floor(ms / 3.6e6);
  const m = Math.floor((ms % 3.6e6) / 6e4);
  const s = Math.floor((ms % 6e4) / 1000);
  return `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}

function slug(label) {
  return label.toLowerCase().replace(/\s+/g, "");
}

export default function App() {
  const [me, setMe] = useState(null);
  const [emblem, setEmblem] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [view, setView] = useState("today");
  const [setup, setSetup] = useState("");
  const [punchline, setPunchline] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  // Which way you voted on each complaint this session (the API doesn't return this yet).
  const [myVotes, setMyVotes] = useState({});
  const countdown = useCountdown();
  const [copied, setCopied] = useState(null);

  // /p/<id> shows one post; anything else shows the feed.
  const singleId = (window.location.pathname.match(/^\/p\/([^/]+)/) || [])[1] || null;

  async function share(c) {
    const url = `${window.location.origin}/api/share/${c.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: c.setup, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(c.id);
        setTimeout(() => setCopied(null), 1800);
      }
    } catch {
      /* user cancelled the share sheet */
    }
  }

  async function refresh() {
    try {
      const [meRes, feed] = await Promise.all([api.me(), api.listComplaints()]);
      setMe(meRes);
      setComplaints(feed.complaints);
      setMyVotes(feed.myVotes || {});
      if (meRes?.signedIn) {
        const saved = await api.getEmblem();
        setEmblem(saved || emblemFromName(meRes.userDetails));
      }
    } catch (e) {
      setError("Couldn't reach the pool. Refresh to try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const shown = useMemo(() => {
    if (singleId) return complaints.filter((c) => c.id === singleId);
    return applyView(complaints, view);
  }, [complaints, view, singleId]);

  useEffect(() => {
    const one = singleId && complaints.find((c) => c.id === singleId);
    document.title = one ? `${one.setup} — saltypoolwater` : "saltypoolwater — the shallow end of the internet";
  }, [singleId, complaints]);

  async function saveEmblem(next) {
    const saved = await api.saveEmblem(next);
    setEmblem(saved);
  }

  // The emblem to show next to an author: what the API stored on the post,
  // your own current one if it's you, otherwise a stable one from the name.
  function emblemFor(author, stored) {
    if (stored) return stored;
    if (signedIn && author === me.userDetails && emblem) return emblem;
    return emblemFromName(author);
  }

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
      // Same direction twice = vote removed (matches the API's toggle behaviour).
      setMyVotes((v) => ({ ...v, [c.id]: v[c.id] === direction ? 0 : direction }));
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

  const emptyText = singleId
    ? "That one drifted off. It may have been removed."
    : view === "today"
      ? "Nobody's complained yet today. The pool is suspiciously calm. Be the first."
      : "The pool is empty. Someone go complain.";

  return (
    <div className="spw-shell">
      {signedIn && (
        <UserMenu me={me} emblem={emblem} onSaveEmblem={saveEmblem} logoutUrl={logoutUrl} />
      )}

      <div className="spw-layout">
      <main className="spw-main">
            <header className="spw-header">
        <div className="spw-header-text">
          <h1 className="spw-wordmark">
            <span className="spw-salty">salty</span>poolwater
          </h1>
          <p className="spw-tag">The shallow end of the internet.</p>

          <div className="spw-authrow">
            {signedIn ? (
              <span className="spw-who"><SaltShaker filled size={16} /> {me.userDetails}</span>
            ) : (
              <>
                <a className="spw-btn spw-btn-small" href={loginGitHub}>Sign in with GitHub</a>
                <a className="spw-btn spw-btn-small" href={loginMicrosoft}>Sign in with Microsoft</a>
              </>
            )}
          </div>

          {signedIn && (
            <div className="spw-ration" role="status">
              <span className={`dot ${posted ? "dot-used" : "dot-ok"}`} aria-hidden="true"></span>
              {posted
                ? `Set performed · next mic at midnight (${countdown})`
                : "1 complaint left today"}
            </div>
          )}
        </div>
        <img className="spw-logo" src="/logo-icon.svg" alt="" />
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

      {singleId ? (
        <p className="spw-back"><a href="/">← Back to the pool</a></p>
      ) : (
      <div className="spw-tabs" role="tablist" aria-label="Sort complaints">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            className="spw-tab"
            role="tab"
            aria-selected={view === v.id}
            onClick={() => setView(v.id)}
          >
            {v.label}
          </button>
        ))}
      </div>
      )}

      {loading && <p className="spw-empty">Checking the water…</p>}
      {!loading && shown.length === 0 && <p className="spw-empty">{emptyText}</p>}

      {shown.map((c) => {
        const mine = myVotes[c.id] || 0;
        const status = statusFor(c);
        const tiers = tiersFor(c);
        return (
          <article className="spw-card" key={c.id}>
            <div className="spw-item">
              <div className="spw-votecol">
                <button
                  className={`spw-arrow up ${mine === 1 ? "is-on" : ""}`}
                  onClick={() => vote(c, 1)}
                  aria-pressed={mine === 1}
                  aria-label="Salt it"
                  title="Salt it"
                >
                  <SaltShaker filled={mine === 1} />
                </button>
                <div className="spw-score">
                  <span className={`n ${netScore(c) < 0 ? "neg" : ""}`}>{formatScore(c)}</span>
                </div>
                <button
                  className={`spw-arrow down ${mine === -1 ? "is-on" : ""}`}
                  onClick={() => vote(c, -1)}
                  aria-pressed={mine === -1}
                  aria-label="Water it down"
                  title="Water it down"
                >
                  <WaterDrop filled={mine === -1} />
                </button>
              </div>
              <div className="spw-body">
                <p className="spw-setup">{c.setup}</p>
                {revealed[c.id] || c.id === singleId ? (
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
                  <span className={`spw-status ${slug(status.label)}`}>{status.label}</span>
                  {tiers.map((t) => (
                    <span key={t.key} className={`spw-tier ${t.key}`}>{t.label}</span>
                  ))}
                </p>
                <p className="spw-meta">
                  <span className="spw-author">
                    <Emblem emblem={emblemFor(c.author, c.authorEmblem)} size={18} title={c.author} />
                    {c.author}
                  </span>
                  {" · "}
                  {new Date(c.ts).toLocaleDateString([], { month: "short", day: "numeric" })}
                  {" · "}
                  <span className="counts" title={`${c.landed} salted, ${c.womp} watered down`}>
                    {c.landed} salted · {c.womp} watered down
                  </span>
                  {" · "}
                  <button className="spw-linkbtn spw-share" onClick={() => share(c)}>
                    {copied === c.id ? "Link copied" : "Share"}
                  </button>
                </p>

                <div className="spw-comments">
                  {c.comments.map((m) => (
                    <p className="spw-comment" key={m.id}>
                      <span className="who spw-author">
                        <Emblem emblem={emblemFor(m.author, m.authorEmblem)} size={16} title={m.author} />
                        {m.author}
                      </span>
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
        );
      })}

      </main>
      <Sidebar />
      </div>

      <footer className="spw-foot">
        saltypoolwater.com — keep it petty, keep it anonymous. No naming real people.
      </footer>
    </div>
  );
}
