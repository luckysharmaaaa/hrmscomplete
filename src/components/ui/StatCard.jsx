import React from "react";

const TONES = {
  primary: "bg-primary-50 text-primary-700",
  success: "bg-success-50 text-success-600",
  danger: "bg-danger-50 text-danger-600",
  warning: "bg-warning-50 text-warning-600",
  info: "bg-info-50 text-info-600",
  accent: "bg-orange-50 text-accent-600",
};

/**
 * StatCard — summary box (Total / Active / Inactive ...).
 * <StatCard icon={Layers} label="Total Modules" value={19} tone="primary" />
 */
export default function StatCard({ icon: Icon, label, value, tone = "primary" }) {
  return (
    <div className="hr-card flex items-center gap-4 px-5 py-4">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${
          TONES[tone] || TONES.primary
        }`}
      >
        {Icon && <Icon size={20} />}
      </div>

      <div className="min-w-0">
        <p className="text-2xl font-bold leading-tight tabular-nums text-text-primary">{value}</p>
        <p className="mt-0.5 truncate text-xs text-text-secondary">{label}</p>
      </div>
    </div>
  );
}