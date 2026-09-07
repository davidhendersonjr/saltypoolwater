import React, { useEffect, useState } from "react";
import Emblem from "./Emblem.jsx";
import { api } from "../api.js";
import { emblemFromName } from "./emblemParts.jsx";

const MAX_HEADLINE = 80;
const MAX_BIO = 280;

/*
  <ProfilePanel
    name="someone@example.com"   // whose profile to show
    isMe={true}                  // show edit controls
    myEmblem={emblem}            // your current shark, so edits show live
    onSaved={(profile) => {}}    // after a successful save
    onClose={() => {}}
  />
*/
export default function ProfilePanel({ name, isMe, myEmblem, onSaved, onClose }) {
  const [tab, setTab] = useState("about");
  const [profile, setProfile] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    api
      .getProfile(name)
      .then((p) => {
        if (!alive) return;
        setProfile(p);
        setHeadline(p?.headline || "");
        setBio(p?.bio || "");
      })
      .catch(() => alive && setProfile(null))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [name]);

  useEffect(() => {
    if (tab !== "activity" || activity) return;
    let alive = true;
    api
      .getActivity(name)
      .then((a) => alive && setActivity(a))
      .catch(() => alive && setActivity({ posts: [], comments: [], stats: null }));
    return () => {
      alive = false;
    };
  }, [tab, name, activity]);

  async function save() {
    setError("");
    setSaving(true);
    try {
      const saved = await api.saveProfile({ headline, bio });
      setProfile(saved);
      setEditing(false);
      onSaved?.(saved);
    } catch (e) {
      setError(e?.message || "Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  const shark = (isMe && myEmblem) || profile?.emblem || emblemFromName(name);
  const stats = activity?.stats;

  return (
    <div className="spw-picker-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <section className="spw-picker spw-profile" role="dialog" aria-modal="true" aria-label={`Profile for ${name}`}>
        <div className="spw-picker-head">
          <h2>Profile</h2>
          <button className="spw-picker-x" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="spw-profile-top">
          <Emblem emblem={shark} size={128} title={name} />
          <p className="spw-profile-name">{name}</p>
          {!editing && profile?.headline && <p className="spw-profile-headline">{profile.headline}</p>}
          {!editing && !profile?.headline && isMe && (
            <p className="spw-profile-note">No headline yet. Add one so people know who they're heckling.</p>
          )}
        </div>

        <div className="spw-picker-tabs" role="tablist" aria-label="Profile section">
          <button role="tab" className="spw-picker-tab" aria-selected={tab === "about"} onClick={() => setTab("about")}>
            About
          </button>
          <button role="tab" className="spw-picker-tab" aria-selected={tab === "activity"} onClick={() => setTab("activity")}>
            Activity
          </button>
        </div>

        {tab === "about" && (
          <div className="spw-profile-about">
            {loading && <p className="spw-empty">Checking the water…</p>}

            {!loading && editing && (
              <>
                <label className="spw-label" htmlFor="spw-headline">Headline</label>
                <input
                  id="spw-headline"
                  className="spw-cinput"
                  value={headline}
                  maxLength={MAX_HEADLINE}
                  placeholder="One line about you"
                  onChange={(e) => setHeadline(e.target.value)}
                />
                <span className="spw-count">{headline.length}/{MAX_HEADLINE}</span>

                <label className="spw-label" htmlFor="spw-bio">About</label>
                <textarea
                  id="spw-bio"
                  className="spw-textarea"
                  value={bio}
                  maxLength={MAX_BIO}
                  placeholder="What are you salty about?"
                  onChange={(e) => setBio(e.target.value)}
                />
                <span className="spw-count">{bio.length}/{MAX_BIO}</span>

                {error && <div className="spw-error" role="alert">{error}</div>}

                <div className="spw-picker-foot">
                  <button className="spw-linkbtn" onClick={() => setEditing(false)}>Cancel</button>
                  <button className="spw-btn" onClick={save} disabled={saving}>
                    {saving ? "Saving…" : "Save profile"}
                  </button>
                </div>
              </>
            )}

            {!loading && !editing && (
              <>
                {profile?.bio ? (
                  <p className="spw-profile-bio">{profile.bio}</p>
                ) : (
                  <p className="spw-profile-note">
                    {isMe ? "Nothing here yet." : "This one keeps to the shallow end."}
                  </p>
                )}
                {profile?.joined && (
                  <p className="spw-profile-joined">
                    In the pool since {new Date(profile.joined).toLocaleDateString([], { month: "long", year: "numeric" })}
                  </p>
                )}
                {isMe && (
                  <div className="spw-picker-foot">
                    <button className="spw-btn spw-btn-small" onClick={() => setEditing(true)}>Edit profile</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {tab === "activity" && (
          <div className="spw-profile-activity">
            {!activity && <p className="spw-empty">Checking the water…</p>}

            {activity && stats && (
              <p className="spw-profile-stats">
                {stats.posts} {stats.posts === 1 ? "complaint" : "complaints"} · {stats.comments}{" "}
                {stats.comments === 1 ? "heckle" : "heckles"} · {stats.salted} salted
              </p>
            )}

            {activity && activity.posts.length === 0 && activity.comments.length === 0 && (
              <p className="spw-empty">Hasn't made a splash yet.</p>
            )}

            {activity?.posts.map((p) => (
              <a className="spw-activity-row" key={p.id} href={`/p/${p.id}`}>
                <span className="spw-activity-score">{(p.landed || 0) - (p.womp || 0)}</span>
                <span className="spw-activity-text">
                  {p.setup}
                  <span className="spw-activity-when">
                    {new Date(p.ts).toLocaleDateString([], { month: "short", day: "numeric" })}
                  </span>
                </span>
              </a>
            ))}

            {activity?.comments.length > 0 && (
              <>
                <p className="spw-label">Heckles</p>
                {activity.comments.map((m, i) => (
                  <a className="spw-activity-row" key={`${m.complaintId}-${i}`} href={`/p/${m.complaintId}`}>
                    <span className="spw-activity-text">
                      {m.text}
                      <span className="spw-activity-when">on “{m.setup}”</span>
                    </span>
                  </a>
                ))}
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
