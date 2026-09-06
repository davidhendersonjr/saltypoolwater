import React from "react";
import { STATUS_LADDER, TIERS } from "./scoring.js";
import { SaltShaker, WaterDrop } from "./VoteIcons.jsx";

function rangeLabel(i) {
  const s = STATUS_LADDER[i];
  const above = STATUS_LADDER[i - 1];
  if (i === 0) return `${s.min}+`;
  if (s.min === -Infinity) return `${above.min - 1} or less`;
  return s.min === above.min - 1 ? `${s.min}` : `${s.min} to ${above.min - 1}`;
}

export default function Sidebar() {
  return (
    <aside className="spw-side" aria-label="About saltypoolwater">
      <section className="spw-card spw-side-card">
        <p className="spw-label">House rules</p>
        <ul className="spw-rules">
          <li>One complaint a day. Setup, then punchline.</li>
          <li>Keep it petty. Keep it anonymous.</li>
          <li>No naming real people.</li>
          <li>Votes and heckles are unlimited.</li>
        </ul>
      </section>

      <section className="spw-card spw-side-card">
        <p className="spw-label">How scoring works</p>
        <p className="spw-side-note">
          <SaltShaker size={16} /> salts it, <WaterDrop size={16} /> waters it down.
          The score is salted minus watered down.
        </p>
        <ul className="spw-ladder">
          {STATUS_LADDER.map((s, i) => (
            <li key={s.label}>
              <span className={`spw-status ${s.label.toLowerCase()}`}>{s.label}</span>
              <span className="spw-ladder-range">{rangeLabel(i)}</span>
            </li>
          ))}
        </ul>
        <ul className="spw-ladder">
          {TIERS.map((t) => (
            <li key={t.key}>
              <span className={`spw-tier ${t.key}`}>{t.label}</span>
              <span className="spw-ladder-range">
                {t.min}+ {t.field === "landed" ? "salted" : "watered down"}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}