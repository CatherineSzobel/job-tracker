// One Settings card: an id the section links jump to, the heading with an optional description under it,
// then the controls. danger: the red-bordered Delete account card.
export default function SettingsSection({ id, title, description, danger = false, children }) {
  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`settings-section flex scroll-mt-24 flex-col gap-6 ${danger ? "border-rejected-line" : ""}`}
    >
      <div className="flex flex-col gap-1">
        <h2 id={headingId} className={`text-xl/8 font-semibold ${danger ? "text-danger" : ""}`}>
          {title}
        </h2>
        {description && <p className="text-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}
