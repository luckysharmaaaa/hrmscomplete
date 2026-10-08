import { Search, X } from "lucide-react";

/**
 * SearchInput — the one search box for every table / page.
 * onChange receives the plain string value (not the event).
 *
 * <SearchInput value={search} onChange={(v) => { setSearch(v); setCurrentPage(1); }}
 *              placeholder="Search name, email or phone..." label="Search users" />
 */
export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  label = "Search",
  className = "w-full sm:w-72",
}) {
  return (
    <div className={`relative ${className}`}>
      <Search
        size={16}
        strokeWidth={1.8}
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled"
      />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="hr-input pl-9 pr-9"
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-primary-50 hover:text-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-600"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
