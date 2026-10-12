// The top of an app page: the title (h1) with a one-line description under it, and the page's actions on the
// right (they wrap below on phones). children: anything under the row, such as a filter panel.
export default function PageHeader({ title, description, actions, children }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="page-title">{title}</h1>
          {description && <p className="text-muted">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}
