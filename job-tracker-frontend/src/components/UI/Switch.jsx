// On/off toggle (DESIGN_E.md §5 "Switch"): a 48×28 track, input-coloured when off and accent when on.
// label is its accessible name; pass the visible text next to it the same words.
export default function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`inline-flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors ${checked ? "bg-accent" : "bg-input"}`}
    >
      <span className={`size-6 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : ""}`} />
    </button>
  );
}
