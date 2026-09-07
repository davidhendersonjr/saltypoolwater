import React, { useEffect, useState } from "react";
import Emblem from "./Emblem.jsx";
import { CATEGORIES, normalizeEmblem, randomEmblem } from "./emblemParts.jsx";

/*
  <EmblemPicker
    value={emblem}                 // current saved emblem
    onSave={async (emblem) => {}}  // called with the new emblem
    onClose={() => {}}
  />
*/
export default function EmblemPicker({ value, onSave, onClose }) {
  const [draft, setDraft] = useState(() => normalizeEmblem(value));
  const [tab, setTab] = useState(CATEGORIES[0].key);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const cat = CATEGORIES.find((c) => c.key === tab);
  const dirty = JSON.stringify(draft) !== JSON.stringify(normalizeEmblem(value));

  async function save() {
    setError("");
    setSaving(true);
    try {
      await onSave?.(draft);
      onClose?.();
    } catch (e) {
      setError(e?.message || "Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="spw-picker-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <section className="spw-picker" role="dialog" aria-modal="true" aria-label="Customize your shark">
        <div className="spw-picker-head">
          <h2>Your shark</h2>
          <button className="spw-picker-x" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="spw-picker-stage">
          <Emblem emblem={draft} size={160} title="Preview" />
          <div className="spw-picker-stage-btns">
            <button className="spw-linkbtn" onClick={() => setDraft(randomEmblem())}>Shuffle</button>
            <button className="spw-linkbtn" onClick={() => setDraft(normalizeEmblem(value))} disabled={!dirty}>
              Undo changes
            </button>
          </div>
        </div>

        <div className="spw-picker-tabs" role="tablist" aria-label="Part type">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              role="tab"
              className="spw-picker-tab"
              aria-selected={tab === c.key}
              onClick={() => setTab(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="spw-picker-grid" role="listbox" aria-label={cat.label}>
          {cat.parts.map((p) => {
            const selected = draft[cat.key] === p.id;
            return (
              <button
                key={p.id}
                role="option"
                aria-selected={selected}
                className={`spw-picker-swatch ${selected ? "is-on" : ""}`}
                onClick={() => setDraft((d) => ({ ...d, [cat.key]: p.id }))}
                title={p.label}
              >
                <Emblem emblem={{ ...draft, [cat.key]: p.id }} size={56} title={p.label} />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        {error && <div className="spw-error" role="alert">{error}</div>}

        <div className="spw-picker-foot">
          <button className="spw-linkbtn" onClick={onClose}>Cancel</button>
          <button className="spw-btn" onClick={save} disabled={!dirty || saving}>
            {saving ? "Saving…" : "Save my shark"}
          </button>
        </div>
      </section>
    </div>
  );
}
