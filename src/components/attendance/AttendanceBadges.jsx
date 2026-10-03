import React from "react";
import { Building2, Home, Fingerprint, Laptop, ShieldAlert, UserCog } from "lucide-react";

/**
 * Reusable chips for work location and attendance source.
 * Source is derived from data already stored on the row:
 *   checkInSource = biometric                      -> Biometric
 *   checkInSource = web  + workLocation = WFH      -> HRMS
 *   checkInSource = web  + workLocation = OFFICE   -> Manual fallback (HRMS punch at the office)
 *   checkInSource = manual                         -> Manual (admin edit / regularization)
 */

const base = "inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold whitespace-nowrap";

export const WorkLocationBadge = ({ value }) => {
  if (!value) return <span className="text-gray-300">-</span>;
  const wfh = String(value).toUpperCase() === "WFH";
  return (
    <span className={`${base} ${wfh ? "bg-cyan-50 text-cyan-700 border-cyan-100" : "bg-slate-50 text-slate-700 border-slate-200"}`}>
      {wfh ? <Home size={11} /> : <Building2 size={11} />}
      {wfh ? "WFH" : "OFFICE"}
    </span>
  );
};

export const sourceInfo = (row) => {
  const src = row?.checkInSource || row?.checkOutSource;
  const location = String(row?.workLocation || "").toUpperCase();

  if (src === "biometric") return { label: "Biometric", cls: "bg-blue-50 text-blue-700 border-blue-100", Icon: Fingerprint };
  if (src === "manual") return { label: "Manual", cls: "bg-purple-50 text-purple-700 border-purple-100", Icon: UserCog };
  if (src === "web" && location === "OFFICE") return { label: "Manual fallback", cls: "bg-amber-50 text-amber-700 border-amber-100", Icon: ShieldAlert };
  if (src === "web") return { label: "HRMS", cls: "bg-emerald-50 text-emerald-700 border-emerald-100", Icon: Laptop };
  return null;
};

export const AttendanceSourceBadge = ({ row }) => {
  const info = sourceInfo(row);
  if (!info) return <span className="text-gray-300">-</span>;
  const { label, cls, Icon } = info;
  return (
    <span
      title={`Check in: ${row?.checkInSource || "-"} / Check out: ${row?.checkOutSource || "-"}`}
      className={`${base} ${cls}`}
    >
      <Icon size={11} />
      {label}
    </span>
  );
};
