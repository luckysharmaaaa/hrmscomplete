import { useEffect, useState } from 'react';import { CalendarOff, CheckCircle2, Clock } from "lucide-react";

import StatCard from "../ui/StatCard";
import { getAdminSummary } from "../../services/leaveService";

/**
 * Summary cards above the admin leave table.
 * Same StatCard look as the Users page. Loads its own data, so it takes no props.
 */
export default function LeaveStatCards() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;

    getAdminSummary()
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <StatCard
        icon={Clock}
        tone="warning"
        label="Pending Requests"
        value={show(summary?.pending)}
        hint="Waiting for approval"
      />
      <StatCard
        icon={CheckCircle2}
        tone="success"
        label="Approved"
        value={show(summary?.approved)}
        hint="Approved requests"
      />
      <StatCard
        icon={CalendarOff}
        tone="info"
        label="On Leave Today"
        value={show(summary?.onLeaveToday)}
        hint="Currently away"
      />
    </div>
  );
}