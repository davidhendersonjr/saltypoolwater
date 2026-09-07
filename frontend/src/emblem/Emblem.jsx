import React, { useId } from "react";
import {
  FINS, FIN_COLORS, FLOATIES, WATERS, EXTRAS, WATERLINE,
  findPart, normalizeEmblem,
} from "./emblemParts.jsx";

/*
  <Emblem emblem={{fin, color, floatie, water, extra}} size={40} />

  Renders one user emblem. `emblem` can be partial or missing; anything
  unknown falls back to the default part.
*/
export default function Emblem({ emblem, size = 40, title, className = "" }) {
  const e = normalizeEmblem(emblem);
  const uid = useId().replace(/:/g, "");

  const fin = findPart(FINS, e.fin);
  const color = findPart(FIN_COLORS, e.color);
  const floatie = findPart(FLOATIES, e.floatie);
  const water = findPart(WATERS, e.water);
  const extra = findPart(EXTRAS, e.extra);

  const finClip = `fin-${uid}`;
  const backClip = `back-${uid}`;
  const frontClip = `front-${uid}`;
  const roundClip = `round-${uid}`;

  return (
    <svg
      className={`spw-emblem ${className}`}
      viewBox="0 0 128 128"
      width={size}
      height={size}
      role="img"
      aria-label={title || "user emblem"}
    >
      {title && <title>{title}</title>}
      <defs>
        <clipPath id={roundClip}><circle cx="64" cy="64" r="64" /></clipPath>
        <clipPath id={finClip}><path d={fin.d} /></clipPath>
        {/* Floatie back half sits above the waterline, front half below. */}
        <clipPath id={backClip}><rect x="-20" y="-20" width="168" height={WATERLINE + 20} /></clipPath>
        <clipPath id={frontClip}><rect x="-20" y={WATERLINE} width="168" height="60" /></clipPath>
      </defs>

      <g clipPath={`url(#${roundClip})`}>
        {water.draw()}

        <g clipPath={`url(#${backClip})`}>{floatie.back()}</g>

        {/* fin body: a slightly darker underside line so it reads as solid */}
        {/* pale outline so a dark fin still reads against night water */}
        <path d={fin.d} fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="4" strokeLinejoin="round" />
        <path d={fin.d} fill={color.base} />
        {color.overlay && <g clipPath={`url(#${finClip})`}>{color.overlay()}</g>}
        {fin.detail && fin.detail()}
        <path d={fin.d} fill="none" stroke="#000" strokeOpacity="0.12" strokeWidth="1.5" />

        <g clipPath={`url(#${frontClip})`}>{floatie.front()}</g>

        {extra.draw(fin.tip)}
      </g>
    </svg>
  );
}
