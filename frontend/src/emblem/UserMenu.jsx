import React, { useEffect, useRef, useState } from "react";
import Emblem from "./Emblem.jsx";
import EmblemPicker from "./EmblemPicker.jsx";

/*
  <UserMenu
    me={me}                       // { userDetails, ... }
    emblem={emblem}               // current emblem
    onSaveEmblem={async (e) => {}}
    logoutUrl="/.auth/logout"
  />

  Sits in the top-right corner of the header. Clicking the little shark
  opens the menu; "Customize my shark" opens the picker.
*/
export default function UserMenu({ me, emblem, onSaveEmblem, logoutUrl }) {
  const [open, setOpen] = useState(false);
  const [picking, setPicking] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const wrap = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e) {
      if (wrap.current && !wrap.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const name = me?.userDetails || "you";

  return (
    <div className="spw-usermenu" ref={wrap}>
      <button
        className="spw-usermenu-btn"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${name}`}
        title={name}
      >
        <Emblem emblem={emblem} size={40} title={name} />
      </button>

      {open && (
        <div className="spw-usermenu-panel" role="menu">
          <div className="spw-usermenu-who">
            <Emblem emblem={emblem} size={48} />
            <div>
              <strong>{name}</strong>
              <span>signed in</span>
            </div>
          </div>
          <button role="menuitem" className="spw-usermenu-item" onClick={() => { setOpen(false); setPicking(true); }}>
            Customize my shark
          </button>
          <button role="menuitem" className="spw-usermenu-item" onClick={() => { setOpen(false); setShowProfile(true); }}>
            Profile
          </button>
          <a role="menuitem" className="spw-usermenu-item spw-usermenu-out" href={logoutUrl}>
            Sign out
          </a>
        </div>
      )}

      {picking && (
        <EmblemPicker value={emblem} onSave={onSaveEmblem} onClose={() => setPicking(false)} />
      )}

      {showProfile && (
        <div className="spw-picker-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setShowProfile(false)}>
          <section className="spw-picker spw-profile" role="dialog" aria-modal="true" aria-label="Profile">
            <div className="spw-picker-head">
              <h2>Profile</h2>
              <button className="spw-picker-x" onClick={() => setShowProfile(false)} aria-label="Close">×</button>
            </div>
            <div className="spw-profile-body">
              <Emblem emblem={emblem} size={96} />
              <p className="spw-profile-name">{name}</p>
              <p className="spw-profile-note">
                Your name comes from the account you signed in with. Stats and history land here next.
              </p>
              <button className="spw-btn spw-btn-small" onClick={() => { setShowProfile(false); setPicking(true); }}>
                Customize my shark
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
