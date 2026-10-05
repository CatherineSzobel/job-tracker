// The top of a list page (Applications, Interviews, Archive): the title with its count on the left,
// the page's buttons (actions) on the right, and the filters (children) in a row underneath
export default function ListPageHeader({ title, count, actions, children }) {
  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-light-text dark:text-dark-text">
          {title}
          {count !== undefined && ` (${count})`}
        </h1>
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      </div>
      {children && <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">{children}</div>}
    </div>
  );
}
