import React from "react";
import { Layers, Plus } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Can from "../components/rbac/Can";
import usePermission from "../hooks/usePermission";

// Shown for a module that exists in the DB (and is permitted) but has no page file yet.
export default function ModulePlaceholder({ name, slug }) {
  const p = usePermission(slug);
  const granted = [["View", p.canView], ["Add", p.canAdd], ["Edit", p.canEdit], ["Approved", p.canApprove], ["Delete", p.canDelete]]
    .filter(([, on]) => on).map(([l]) => l);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Layers}
        title={name}
        subtitle="This module is enabled for your account"
        breadcrumbs={[{ label: name }]}
        actions={
          <Can module={slug} action="add">
            <button type="button" className="hr-btn hr-btn-primary"><Plus size={16} /> Add {name}</button>
          </Can>
        }
      />
      <div className="hr-card px-6 py-12 text-center">
        <p className="text-sm font-semibold text-primary-700">The page for “{name}” hasn't been built yet.</p>
        <p className="mx-auto mt-1 max-w-lg text-sm text-text-secondary">
          Create <code className="rounded border border-border-subtle bg-background px-1.5 py-0.5 font-mono text-xs">src/pages/modules/{slug}.jsx</code> and it
          will appear here automatically — no sidebar or route changes needed.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {granted.map((l) => (
            <span key={l} className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
