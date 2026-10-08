import { Building2, Home } from "lucide-react";

import { sourceInfo } from "./sourceInfo";

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
