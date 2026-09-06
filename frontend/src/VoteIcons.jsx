// Original vote icons for saltypoolwater.
// SaltShaker = upvote ("salt it"), WaterDrop = downvote ("water it down").
// Both take `filled` for the voted state and inherit currentColor.

export function SaltShaker({ filled = false, size = 22 }) {
  const ink = filled ? "currentColor" : "none";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"
         fill={ink} stroke="currentColor"
         strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
      <g transform="rotate(-32 12 12)">
        {/* domed cap */}
        <path d="M7.6 8.2 a4.4 4.4 0 0 1 8.8 0" />
        <path d="M7.2 8.2 h9.6" />
        {/* body: narrow neck flaring to a wide base */}
        <path d="M8.4 8.2 l-1.5 10.3 a1.4 1.4 0 0 0 1.4 1.5 h7.4 a1.4 1.4 0 0 0 1.4 -1.5 L15.6 8.2" />
        {!filled && (
          <>
            <path d="M7.7 14.6 h8.6" />
            <circle cx="10.4" cy="5.6" r="0.55" fill="currentColor" stroke="none" />
            <circle cx="13.6" cy="5.6" r="0.55" fill="currentColor" stroke="none" />
            <circle cx="12" cy="4.4" r="0.55" fill="currentColor" stroke="none" />
          </>
        )}
      </g>
      {/* falling salt */}
      <circle cx="4.4" cy="7.6" r="1" fill="currentColor" stroke="none" />
      <circle cx="6.8" cy="4.4" r="1" fill="currentColor" stroke="none" />
      <circle cx="2.8" cy="4" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function WaterDrop({ filled = false, size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"
         fill={filled ? "currentColor" : "none"} stroke="currentColor"
         strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
      <path d="M12 3 c3.2 4.2 6 7.3 6 11 a6 6 0 0 1 -12 0 c0 -3.7 2.8 -6.8 6 -11 z" />
      {!filled && <path d="M9.2 14.2 a3 3 0 0 0 1.6 2.9" />}
    </svg>
  );
}