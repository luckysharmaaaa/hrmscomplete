
/**
 * RowsPerPage — "Rows per page [10]" selector, identical on every table.
 * onChange receives a Number.
 */
export default function RowsPerPage({ value, onChange, options = [10, 25, 50] }) {
  return (
    <div className="flex items-center gap-2 text-sm text-text-secondary">
      <span className="whitespace-nowrap">Rows per page</span>

      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Rows per page"
        className="hr-select !h-9 !w-20"
      >
        {options.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </div>
  );
}
