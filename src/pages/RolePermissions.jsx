import React from "react";
import { KeyRound } from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import RolePermissionMatrix from "../components/rbac/RolePermissionMatrix";

export default function RolePermissions() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={KeyRound}
        title="Role Permissions"
        subtitle="Control which actions each role can perform in every module"
        breadcrumbs={[
          { label: "Access Control" },
          { label: "Role Permissions" },
        ]}
      />

      <RolePermissionMatrix />
    </div>
  );
}