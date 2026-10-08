import { useEffect, useState } from 'react';import { CalendarCheck, CalendarDays, Clock, Wallet } from "lucide-react";

import StatCard from "../ui/StatCard";
import { getMySummary } from "../../services/leaveService";

/**
 * Summary cards above the employee leave table.
 * Same StatCard look as the Users page. Loads its own data, so it takes no props.
 */
export default function LeaveStatCardsEmployee() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;

    getMySummary()
      .then((data) => live && setSummary(data))
      .catch(() => live && setSummary(null))
      .finally(() => live && setLoading(false));

    return () => {
      live = false;
    };
  }, []);

  // "—" while loading or if the summary could not be loaded, never a wrong 0.
  const show = (value) => (loading || !summary ? "—" : value ?? 0);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={CalendarDays}
        tone="primary"
        label="Total Allocated"
        value={show(summary?.totalAllocated)}
        hint="Days this year"
      />
      <StatCard
        icon={CalendarCheck}
        tone="accent"
        label="Leave Used"
        value={show(summary?.totalUsed)}
        hint="Days taken"
      />
      <StatCard
        icon={Wallet}
        tone="success"
        label="Remaining"
        value={show(summary?.totalRemaining)}
        hint="Days available"
      />
      <StatCard
        icon={Clock}
        tone="warning"
        label="Pending Requests"
        value={show(summary?.pendingRequests)}
        hint="Waiting for approval"
      />
    </div>
  );
}