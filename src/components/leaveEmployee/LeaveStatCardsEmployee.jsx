import React from "react";
import { STAT_CARDS_EMPLOYEE } from "./leaveEmployeeData";

// ── Stat Cards Row ────────────────────────────────────────────
export default function LeaveStatCardsEmployee() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {STAT_CARDS_EMPLOYEE.map(
        ({ label, value, icon: Icon, gradient, iconBg }) => (
          <div
            key={label}
            className={`relative bg-gradient-to-r ${gradient} rounded-xl p-5 text-white shadow-sm overflow-hidden`}
          >
            {/* Background icon decoration */}
            <div
              className={`absolute -right-3 -top-3 p-5 ${iconBg} rounded-full`}
            >
              <Icon size={32} className="opacity-60" />
            </div>
            <p className="text-sm font-medium opacity-90 mb-1">{label}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
          </div>
        ),
      )}
    </div>
  );
}
