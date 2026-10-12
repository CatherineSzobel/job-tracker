// The top of a list page (Applications, Interviews, Archive): the title with its count on the left,
// the page's buttons (actions) on the right, and the filters (children) in a row underneath
export default function ListPageHeader({ title, count, actions, children }) {
  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="page-title">
          {title}
          {count !== undefined && ` (${count})`}
        </h1>
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      </div>
      {children && <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">{children}</div>}
    </div>
  );
}
