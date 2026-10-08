import { Users, UserCheck, UserX, UserPlus } from "lucide-react";

import StatCard from "../ui/StatCard";

function getJoiningYear(joiningDate) {
  if (!joiningDate) return null;
  const parsed = new Date(joiningDate);
  return Number.isNaN(parsed.getTime()) ? null : parsed.getFullYear();
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
      <StatCard icon={Users} tone="primary" label="Total Employees" value={counts.total} />
      <StatCard icon={UserCheck} tone="success" label="Active" value={counts.active} />
      <StatCard icon={UserX} tone="danger" label="Inactive" value={counts.inactive} />
      <StatCard icon={UserPlus} tone="accent" label="New Joiners" value={counts.new} />
    </div>
  );
}