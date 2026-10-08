import { Fingerprint, Laptop, ShieldAlert, UserCog } from "lucide-react";

export const sourceInfo = (row) => {
  const src = row?.checkInSource || row?.checkOutSource;
  const location = String(row?.workLocation || "").toUpperCase();

  if (src === "biometric") return { label: "Biometric", cls: "bg-blue-50 text-blue-700 border-blue-100", Icon: Fingerprint };
  if (src === "manual") return { label: "Manual", cls: "bg-purple-50 text-purple-700 border-purple-100", Icon: UserCog };
  if (src === "web" && location === "OFFICE") return { label: "Manual fallback", cls: "bg-amber-50 text-amber-700 border-amber-100", Icon: ShieldAlert };
  if (src === "web") return { label: "HRMS", cls: "bg-emerald-50 text-emerald-700 border-emerald-100", Icon: Laptop };
  return null;
};
