import React from "react";
import { Link } from "react-router-dom";
import { Home, ChevronRight } from "lucide-react";

/**
 * PageHeader — the gradient banner at the top of EVERY page.
 *
 * <PageHeader
 *   icon={Users}
 *   title="Users"
 *   subtitle="Manage user profiles, roles and access"
 *   breadcrumbs={[{ label: "User Management" }, { label: "Users" }]}
 *   actions={<>
 *     <button className="hr-btn hr-btn-glass">Export</button>      // secondary action on gradient
 *     <button className="hr-btn hr-btn-primary">Add User</button>  // main CTA (orange)
 *   </>}
 * />
 */
export default function PageHeader({ icon: Icon, title, subtitle, breadcrumbs = [], actions }) {
  return (
    <div className="relative rounded-xl bg-gradient-banner px-5 py-5 shadow-md sm:px-6 sm:py-6">
      {/* Decorative shapes — clipped in their own layer so dropdowns are never cut off */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
        <div className="absolute -right-10 -top-16 h-52 w-52 rounded-full bg-white/5" />
        <div className="absolute right-40 top-10 h-24 w-24 rounded-full bg-white/[0.04]" />
        <div className="absolute -bottom-12 left-16 h-32 w-32 rounded-full bg-accent-500/15" />
      </div>

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          {Icon && (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-accent-400 backdrop-blur-sm">
              <Icon size={24} />
            </div>
          )}

          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold tracking-tight text-white">{title}</h1>

            {breadcrumbs.length > 0 && (
              <nav
                aria-label="Breadcrumb"
                className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-white/60"
              >
                <Link
                  to="/dashboard"
                  className="flex items-center text-white/60 transition-colors hover:text-white"
                  aria-label="Dashboard"
                >
                  <Home size={13} />
                </Link>

                {breadcrumbs.map((crumb, index) => {
                  const isLast = index === breadcrumbs.length - 1;
                  return (
                    <React.Fragment key={`${crumb.label}-${index}`}>
                      <ChevronRight size={12} className="shrink-0 text-white/40" />
                      {crumb.to && !isLast ? (
                        <Link to={crumb.to} className="transition-colors hover:text-white">
                          {crumb.label}
                        </Link>
                      ) : (
                        <span className={isLast ? "font-medium text-accent-400" : ""}>
                          {crumb.label}
                        </span>
                      )}
                    </React.Fragment>
                  );
                })}
              </nav>
            )}

            {subtitle && <p className="mt-1 text-sm text-white/70">{subtitle}</p>}
          </div>
        </div>

        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>
        )}
      </div>
    </div>
  );
}