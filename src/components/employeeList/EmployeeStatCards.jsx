import React from "react";
import { Users, UserCheck, UserX, UserPlus } from "lucide-react";

const cards = [
  {
    label: "Total Employees",
    key: "total",
    icon: Users,
    gradient: "from-primary-800 to-primary-600",
  },
  {
    label: "Active",
    key: "active",
    icon: UserCheck,
    gradient: "from-success-600 to-success-500",
  },
  {
    label: "Inactive",
    key: "inactive",
    icon: UserX,
    gradient: "from-danger-600 to-danger-500",
  },
  {
    label: "New Joiners",
    key: "new",
    icon: UserPlus,
    gradient: "from-accent-600 to-accent-400",
  },
];

function getJoiningYear(joiningDate) {
  if (!joiningDate) return null;
  const parsed = new Date(joiningDate);
  return isNaN(parsed.getTime()) ? null : parsed.getFullYear();
}

export default function EmployeeStatCards({ data }) {
  const currentYear = new Date().getFullYear();

  const counts = {
    total: data.length,
    active: data.filter((e) => e.status === "Active").length,
    inactive: data.filter((e) => e.status === "Inactive").length,
    new: data.filter((e) => {
      const year = getJoiningYear(e.joiningDate);
      return year !== null && year >= currentYear - 1;
    }).length,
  };

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {cards.map(({ label, key, icon: Icon, gradient }) => (
        <div
          key={key}
          className={`relative flex items-center gap-4 overflow-hidden rounded-xl bg-gradient-to-br ${gradient} p-5 text-white shadow-md`}
        >
          <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-6 -right-2 h-28 w-28 rounded-full bg-white/5" />

          <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
            <Icon size={22} />
          </div>

          <div className="relative z-10">
            <p className="text-xs font-medium uppercase tracking-wide text-white/70">{label}</p>
            <p className="mt-0.5 text-3xl font-extrabold leading-none">{counts[key]}</p>
          </div>
        </div>
      ))}
    </div>
  );
}