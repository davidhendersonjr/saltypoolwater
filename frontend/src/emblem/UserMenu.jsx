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
export default function UserMenu({ me, emblem, onSaveEmblem, onOpenProfile, logoutUrl }) {
  const [open, setOpen] = useState(false);
  const [picking, setPicking] = useState(false);
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
          <button role="menuitem" className="spw-usermenu-item" onClick={() => { setOpen(false); onOpenProfile?.(); }}>
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

    </div>
  );
}
