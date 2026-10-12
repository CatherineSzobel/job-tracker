// "Test User" → "TU"; one word gives one letter
const initialsOf = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");

// Full class strings (not built at runtime) so Tailwind can find them
const SIZE_CLASSES = {
  md: "size-10 text-sm",
  lg: "size-24 text-3xl",
};
const TONE_CLASSES = {
  // The signed-in user
  accent: "bg-accent text-white",
  // Other people (interview prep)
  soft: "bg-accent-soft text-accent-text",
};

// Round initials badge. Decorative: put the name in text or an aria-label nearby.
export default function Avatar({ name, size = "md", tone = "accent" }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold ${SIZE_CLASSES[size]} ${TONE_CLASSES[tone]}`}
    >
      {initialsOf(name)}
    </span>
  );
}
