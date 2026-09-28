import React from "react";

const TONES = {
  success: "bg-success-50 text-success-600",
  danger: "bg-danger-50 text-danger-600",
  warning: "bg-warning-50 text-warning-600",
  info: "bg-info-50 text-info-600",
  primary: "bg-primary-50 text-primary-700",
  neutral: "bg-background text-text-secondary border border-border-subtle",
};

/**
 * StatusBadge — every status in every table is rendered with this pill.
 * <StatusBadge tone="success">Active</StatusBadge>
 */
export default function StatusBadge({ tone = "neutral", dot = true, title, children }) {
  return (
    <span
      title={title}
      className={`inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-xs font-semibold ${
        TONES[tone] || TONES.neutral
      }`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}