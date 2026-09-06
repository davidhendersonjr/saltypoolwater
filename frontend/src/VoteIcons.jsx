// Original vote icons for saltypoolwater.
// SaltShaker = upvote ("salt it"), WaterDrop = downvote ("water it down").
// Both take `filled` for the voted state and inherit currentColor.

export function SaltShaker({ filled = false, size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"
         fill={filled ? "currentColor" : "none"} stroke="currentColor"
         strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
      <path d="M8.5 7.5 V5.5 a3.5 3.5 0 0 1 7 0 V7.5" />
      <circle cx="10" cy="3.2" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="2.6" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="14" cy="3.2" r="0.5" fill="currentColor" stroke="none" />
      <path d="M8.5 7.5 h7 l1 12 a1.5 1.5 0 0 1 -1.5 1.5 h-6 a1.5 1.5 0 0 1 -1.5 -1.5 z" />
      {!filled && <path d="M8.9 13.5 h6.2" />}
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