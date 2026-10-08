
/**
 * Small layout pieces so every table card has the same skeleton:
 *
 *  <div className="hr-card overflow-hidden">
 *    <TableHeader title="Users List" count={12} description="...">   // filters go in children
 *    <TableToolbar left={<RowsPerPage/>} right={<SearchInput/>} />
 *    <div className="overflow-x-auto"><table className="hr-table min-w-[900px]">…</table></div>
 *    <Pagination … />
 *  </div>
 */

export function TableHeader({ title, count, description, badge, children }) {
  return (
    <div className="bg-surface px-5 py-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight text-primary-700">{title}</h2>

            {count !== undefined && (
              <span className="inline-flex min-w-7 items-center justify-center rounded-full bg-primary-50 px-2 py-0.5 text-xs font-semibold tabular-nums text-primary-700">
                {count}
              </span>
            )}

            {badge}
          </div>

          {description && (
            <p className="mt-1 text-xs leading-5 text-text-secondary">{description}</p>
          )}
        </div>

        {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
      </div>
    </div>
  );
}

export function TableToolbar({ left, right }) {
  return (
    <div className="flex flex-col gap-3 bg-surface px-5 pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">{left}</div>
      {right}
    </div>
  );
}

// Loading rows. `avatar` adds a round placeholder in the first column.
export function TableSkeletonRows({ rows = 5, columns = 5, avatar = false }) {
  return Array.from({ length: rows }).map((_, r) => (
    <tr key={`skeleton-${r}`} aria-hidden="true">
      {Array.from({ length: columns }).map((__, c) => (
        <td key={c} className="hr-td">
          <div className="flex animate-pulse items-center gap-3">
            {avatar && c === 0 && <div className="h-10 w-10 shrink-0 rounded-full bg-primary-50" />}
            <div className={`h-3 rounded bg-primary-50 ${c === 0 ? "w-36" : "w-24"}`} />
          </div>
        </td>
      ))}
    </tr>
  ));
}
