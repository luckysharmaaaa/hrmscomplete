import { Home, CheckCircle2, Clock, XCircle } from "lucide-react";

import StatCard from "../ui/StatCard";

const cards = [
  { label: "All WFH Requests", key: "all", filter: "All Status", icon: Home, tone: "primary" },
  { label: "Approved", key: "Approved", filter: "Approved", icon: CheckCircle2, tone: "success" },
  { label: "Pending", key: "Pending", filter: "Pending", icon: Clock, tone: "warning" },
  { label: "Rejected", key: "Rejected", filter: "Rejected", icon: XCircle, tone: "danger" },
];

export default function WfhStatCards({ summary, loading, activeStatus, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {cards.map(({ label, key, filter, icon, tone }) => (
        <StatCard
          key={key}
          icon={icon}
          tone={tone}
          label={label}
          value={
            loading && !summary ? (
              <span className="block h-7 w-10 animate-pulse rounded bg-border-subtle" />
            ) : (
              summary?.[key] ?? 0
            )
          }
          active={activeStatus === filter}
          onClick={() => onSelect(filter)}
          title={`Show ${label.toLowerCase()}`}
        />
      ))}
    </div>
  );
}