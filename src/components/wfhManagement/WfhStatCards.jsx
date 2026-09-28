import React from "react";
import { Home, CheckCircle2, Clock, XCircle } from "lucide-react";

const cards = [
  { label: "All WFH Requests", key: "all", filter: "All Status", icon: Home, bg: "bg-blue-50", iconColor: "text-blue-500", valueColor: "text-blue-600" },
  { label: "Approved", key: "Approved", filter: "Approved", icon: CheckCircle2, bg: "bg-green-50", iconColor: "text-green-500", valueColor: "text-green-600" },
  { label: "Pending", key: "Pending", filter: "Pending", icon: Clock, bg: "bg-yellow-50", iconColor: "text-yellow-500", valueColor: "text-yellow-600" },
  { label: "Rejected", key: "Rejected", filter: "Rejected", icon: XCircle, bg: "bg-red-50", iconColor: "text-red-500", valueColor: "text-red-600" },
];

export default function WfhStatCards({ summary, loading, activeStatus, onSelect }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map(({ label, key, filter, icon: Icon, bg, iconColor, valueColor }) => {
        const active = activeStatus === filter;
        return (
          <button
            type="button"
            key={key}
            onClick={() => onSelect(filter)}
            aria-pressed={active}
            title={`Show ${label.toLowerCase()}`}
            className={`text-left bg-white border rounded-xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 ${
              active ? "border-orange-300 ring-1 ring-orange-200" : "border-gray-100"
            }`}
          >
            <div className={`${bg} p-3 rounded-xl flex-shrink-0`}>
              <Icon size={20} className={iconColor} />
            </div>
            <div>
              {loading && !summary ? (
                <div className="h-7 w-10 rounded bg-gray-100 animate-pulse" />
              ) : (
                <p className={`text-2xl font-bold ${valueColor}`}>{summary?.[key] ?? 0}</p>
              )}
              <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}