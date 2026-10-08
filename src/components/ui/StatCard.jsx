// Soft tint for the round icon. Everything else is identical on every card.
const TONES = {
  primary: "bg-primary-50 text-primary-700",
  info: "bg-info-50 text-info-600",
  success: "bg-success-50 text-success-600",
  accent: "bg-orange-50 text-accent-600",
  warning: "bg-warning-50 text-warning-600",
  danger: "bg-danger-50 text-danger-600",
  purple: "bg-[#F1EAFE] text-[#7C3AED]",
  neutral: "bg-background text-text-secondary",
};

/**
 * StatCard — the ONE summary card for every module.
 *
 *   ( icon )   10          <- value
 *              Total       <- label
 *              hint        <- optional small line
 *
 * <StatCard icon={Users} label="Total Users" value={41} hint="All registered users" tone="primary" />
 *
 * Clickable filter card (WFH etc.): pass onClick and active.
 * <StatCard icon={Clock} label="Pending" value={3} tone="warning" active={status === "Pending"} onClick={...} />
 *
 * `value` and `hint` can be text, numbers or small elements (e.g. a loading skeleton).
 * tone="neutral" gives the plain grey icon.
 */
export default function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "primary",
  onClick,
  active = false,
  title,
}) {
  const content = (
    <>
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
          TONES[tone] || TONES.primary
        }`}
      >
        {Icon && <Icon size={22} strokeWidth={1.8} aria-hidden="true" />}
      </span>

      <span className="min-w-0">
        <span className="block text-2xl font-bold leading-8 tabular-nums text-text-primary">{value}</span>
        <span className="block truncate text-sm text-text-secondary">{label}</span>
        {hint && <span className="mt-0.5 block truncate text-xs text-text-disabled">{hint}</span>}
      </span>
    </>
  );

  const base = "flex items-center gap-3.5 rounded-xl border bg-surface px-4 py-4 text-left";

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        title={title}
        className={`${base} w-full transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-600 ${
          active ? "border-accent-500 ring-1 ring-accent-500/30" : "border-border-subtle"
        }`}
      >
        {content}
      </button>
    );
  }

  return <div className={`${base} border-border-subtle`}>{content}</div>;
}