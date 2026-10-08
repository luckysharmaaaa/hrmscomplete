import { useMemo } from "react";
import { BadgeCheck, UserCheck, UserX, Users } from "lucide-react";

import StatCard from "../ui/StatCard";

/**
 * Four summary cards above the users table.
 * `users` is null until the table has loaded, so we show "—" instead of a wrong 0.
 */
export default function UserStatCards({ users }) {
  const counts = useMemo(() => {
    if (!users) return null;

    return {
      total: users.length,
      active: users.filter((u) => u.statusValue === 1).length,
      inactive: users.filter((u) => u.statusValue === 0).length,
      withRole: users.filter((u) => (u.roles || []).length > 0).length,
    };
  }, [users]);

  const show = (value) => (counts ? value : "—");

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={Users}
        tone="primary"
        label="Total Users"
        value={show(counts?.total)}
        hint="All registered users"
      />
      <StatCard
        icon={UserCheck}
        tone="success"
        label="Active Users"
        value={show(counts?.active)}
        hint="Currently active"
      />
      <StatCard
        icon={UserX}
        tone="danger"
        label="Inactive Users"
        value={show(counts?.inactive)}
        hint="Currently inactive"
      />
      <StatCard
        icon={BadgeCheck}
        tone="accent"
        label="Roles Assigned"
        value={show(counts?.withRole)}
        hint="With role mapping"
      />
    </div>
  );
}