// "Test User" → "TU"; one word gives one letter
const initialsOf = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");

const SIZE_CLASSES = {
  md: "size-10 text-sm",
  lg: "size-24 text-3xl",
};

// Round initials badge for the signed-in user. Decorative: put the name in text or an aria-label nearby.
export default function Avatar({ name, size = "md" }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-accent font-bold text-white ${SIZE_CLASSES[size]}`}
    >
      {initialsOf(name)}
    </span>
  );
}
