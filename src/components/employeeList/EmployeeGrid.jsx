import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { DESIGNATIONS, SORT_OPTIONS, getProductivityStyle } from "./employeeData";

const DEPT_TONES = [
  "bg-pink-50 text-pink-600",
  "bg-primary-50 text-primary-700",
  "bg-info-50 text-info-600",
  "bg-success-50 text-success-600",
  "bg-warning-50 text-warning-600",
  "bg-orange-50 text-accent-600",
];

export default function EmployeeGrid({
  filtered,
  designation,
  setDesignation,
  sortBy,
  setSortBy,
  onEdit,
  onDelete,
}) {
  return (
    <div className="hr-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-5 py-4">
        <h2 className="text-base font-semibold text-primary-700">Employees Grid</h2>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            className="hr-select !h-9 !w-44"
          >
            {DESIGNATIONS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="hr-select !h-9 !w-48"
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s} value={s}>
                Sort By : {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="p-5">
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-text-secondary">No employees found.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((emp, idx) => {
              const style = getProductivityStyle(emp.productivity);
              const deptTone = DEPT_TONES[idx % DEPT_TONES.length];
              return (
                <div
                  key={emp.id}
                  className="hr-card relative flex flex-col items-center gap-3 p-5 transition-shadow hover:shadow-md"
                >
                  {/* 3-dot menu */}
                  <div className="dropdown dropdown-end absolute right-3 top-3">
                    <label tabIndex={0} className="hr-icon-btn !h-7 !w-7 cursor-pointer">
                      <MoreVertical size={16} />
                    </label>
                    <ul
                      tabIndex={0}
                      className="dropdown-content z-50 mt-1 w-32 rounded-lg border border-border-subtle bg-surface p-1 shadow-lg"
                    >
                      <li>
                        <button
                          type="button"
                          onClick={() => onEdit(emp)}
                          className="flex h-9 w-full items-center gap-2 rounded-md px-2.5 text-sm text-text-primary hover:bg-primary-50 hover:text-primary-700"
                        >
                          <Pencil size={14} /> Edit
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => onDelete(emp)}
                          className="flex h-9 w-full items-center gap-2 rounded-md px-2.5 text-sm text-text-primary hover:bg-danger-50 hover:text-danger-600"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* Avatar */}
                  <div className="relative mt-2">
                    <div
                      className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-full ${emp.color} text-xl font-bold text-white shadow-sm ring-4 ring-white`}
                    >
                      {emp.avatarUrl ? (
                        <img
                          src={emp.avatarUrl}
                          alt={emp.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        emp.avatar
                      )}
                    </div>
                    <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-success-500" />
                  </div>

                  {/* Name + department pill */}
                  <div className="text-center">
                    <p className="text-[15px] font-semibold text-text-primary">{emp.name}</p>
                    <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${deptTone}`}>
                      {emp.department}
                    </span>
                  </div>

                  {/* Stats row */}
                  <div className="grid w-full grid-cols-3 gap-2 border-t border-border-subtle pt-3 text-center">
                    {[["Projects", emp.projects], ["Done", emp.done], ["Progress", emp.progress]].map(([label, val]) => (
                      <div key={label}>
                        <p className="text-[10px] font-medium text-text-disabled">{label}</p>
                        <p className="text-sm font-bold text-text-primary">{val}</p>
                      </div>
                    ))}
                  </div>

                  {/* Productivity bar */}
                  <div className="w-full">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[11px] text-text-disabled">Productivity</span>
                      <span className={`text-[12px] font-bold ${style.text}`}>{emp.productivity}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-background">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${emp.productivity}%`, backgroundColor: style.bar }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}