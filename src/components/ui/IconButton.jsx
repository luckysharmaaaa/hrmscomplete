import { Loader2 } from "lucide-react";

const TONE_CLASS = {
  default: "",
  success: "text-success-600",
  danger: "danger",
};

/**
 * IconButton — one icon-only action button for the whole app
 * (table row actions, toolbars, pagination ...).
 *
 * <IconButton icon={Pencil} label="Edit John" onClick={...} />
 * <IconButton icon={Trash2} label="Delete John" tone="danger" onClick={...} />
 * <IconButton icon={CheckCircle2} label="Approve John" tone="success" loading />
 *
 * `label` is used for both the tooltip (title) and aria-label.
 */
export default function IconButton({
  icon: Icon,
  label,
  tone = "default",
  loading = false,
  disabled = false,
  size = 16,
  onClick,
  className = "",
  type = "button",
}) {
  const handleClick = (e) => {
    // Row-level click handlers must never fire from an action button
    e.preventDefault();
    e.stopPropagation();
    onClick?.(e);
  };

  return (
    <button
      type={type}
      title={label}
      aria-label={label}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      onClick={handleClick}
      className={`hr-icon-btn ${TONE_CLASS[tone] || ""} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {loading ? (
        <Loader2 size={size} className="animate-spin" />
      ) : (
        Icon && <Icon size={size} />
      )}
    </button>
  );
}