import React from "react";
import { Link } from "react-router-dom";
import { Home, ChevronRight } from "lucide-react";

/**
 * PageHeader — the navy banner at the top of EVERY page.
 *
 * Shows: orange icon tile, title, and ONE line under it:
 *   - `subtitle` when given, otherwise the breadcrumb trail.
 *
 * <PageHeader
 *   icon={Users}
 *   title="Users"
 *   subtitle="Manage user profiles, roles and access permissions across the system."
 *   breadcrumbs={[{ label: "User Management" }, { label: "Users" }]}
 *   actions={<>
 *     <button className="hr-btn hr-btn-glass">Export</button>   // solid white button
 *     <button className="hr-btn hr-btn-primary">Add User</button>
 *   </>}
 * />
 */
export default function PageHeader({
  icon: Icon,
  title,
  subtitle,
  breadcrumbs = [],
  actions,
}) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface px-5 py-5 shadow-sm sm:px-6 sm:py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* LEFT */}
        <div className="flex min-w-0 items-center gap-4">
          {Icon && (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-accent-500 text-white shadow-[0_8px_18px_-8px_rgba(249,115,22,0.9)]">
              <Icon size={28} strokeWidth={1.8} aria-hidden="true" />
            </div>
          )}

          <div className="min-w-0">
            <h1 className="truncate text-[28px] font-bold leading-9 tracking-tight text-text-primary">
              {title}
            </h1>

            {subtitle ? (
              <p className="mt-0.5 text-sm text-text-secondary">{subtitle}</p>
            ) : (
              breadcrumbs.length > 0 && (
                <nav
                  aria-label="Breadcrumb"
                  className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-text-secondary"
                >
                  <Link
                    to="/dashboard"
                    aria-label="Dashboard"
                    className="flex items-center text-text-disabled transition-colors hover:text-primary-700"
                  >
                    <Home size={14} />
                  </Link>

                  {breadcrumbs.map((crumb, index) => {
                    const isLast = index === breadcrumbs.length - 1;

                    return (
                      <React.Fragment key={`${crumb.label}-${index}`}>
                        <ChevronRight size={13} className="shrink-0 text-text-disabled" />

                        {crumb.to && !isLast ? (
                          <Link to={crumb.to} className="transition-colors hover:text-primary-700">
                            {crumb.label}
                          </Link>
                        ) : (
                          <span className={isLast ? "font-medium text-accent-600" : ""}>
                            {crumb.label}
                          </span>
                        )}
                      </React.Fragment>
                    );
                  })}
                </nav>
              )
            )}
          </div>
        </div>

        {/* RIGHT — actions */}
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>
        )}
      </div>
    </div>
  );
}
