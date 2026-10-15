import { useId } from "react";
import { Link } from "react-router-dom";

// A content card (DESIGN_E.md §5): surface, border, radius 16. The heading row holds the title, with an
// optional accent icon, and an optional right-hand action (a CardLink or a small button). Without a title it's
// a plain card. className adds to the card's own classes (e.g. a red border for a danger area).
export default function Card({ title, icon, action, className = "", children }) {
  const headingId = useId();
  const Icon = icon;

  return (
    <section aria-labelledby={title ? headingId : undefined} className={`card flex min-w-0 flex-col gap-4 ${className}`}>
      {title && (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <h2 id={headingId} className="card-title">
            {Icon && <Icon size={20} aria-hidden="true" className="shrink-0 text-accent-text" />}
            {title}
          </h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

// The link in a card's heading row ("Calendar →", "View all", "Edit goals")
export function CardLink({ to, children }) {
  return (
    <Link to={to} className="inline-flex min-h-12 items-center gap-1 font-semibold text-accent-text underline-offset-4 hover:underline">
      {children}
    </Link>
  );
}
