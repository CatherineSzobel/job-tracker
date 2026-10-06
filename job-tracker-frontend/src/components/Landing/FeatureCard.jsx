// One feature on the landing page: an icon, a title and a line or two
export default function FeatureCard({ icon, title, text }) {
  const FeatureIcon = icon;

  return (
    <div className="card flex flex-col gap-2">
      <FeatureIcon size={24} aria-hidden="true" className="text-accent dark:text-accent-muted" />
      <h3 className="text-lg font-semibold text-light-text dark:text-dark-text">{title}</h3>
      <p className="text-sm text-light-muted dark:text-dark-muted">{text}</p>
    </div>
  );
}
