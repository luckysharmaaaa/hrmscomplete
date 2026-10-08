import { User } from "lucide-react";

import SideDrawer from "../ui/SideDrawer";
import Avatar from "../ui/Avatar";
import StatusBadge from "../ui/StatusBadge";

const Row = ({ label, children }) => (
  <div className="flex items-start justify-between gap-6 border-b border-border-subtle py-3 last:border-b-0">
    <dt className="shrink-0 text-sm text-text-secondary">{label}</dt>
    <dd className="min-w-0 break-words text-right text-sm font-medium text-text-primary">{children}</dd>
  </div>
);

/**
 * Read-only details of one user (uses data already loaded in the table — no extra API call).
 */
export default function UserViewDrawer({ open, user, statusTone, canEdit, onClose, onEdit }) {
  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      icon={User}
      size="md"
      title="User details"
      subtitle={user?.name}
      footer={
        <>
          <button type="button" onClick={onClose} className="hr-btn hr-btn-outline">
            Close
          </button>

          {canEdit && user && (
            <button type="button" onClick={() => onEdit(user)} className="hr-btn hr-btn-primary">
              Edit user
            </button>
          )}
        </>
      }
    >
      {user && (
        <div className="space-y-6">
          <div className="flex items-center gap-4 rounded-xl border border-border-subtle bg-background p-4">
            <Avatar
              src={user.avatar}
              firstName={user.firstName}
              lastName={user.lastName}
              seed={user.email}
              size="lg"
            />

            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-text-primary">{user.name}</p>
              <p className="truncate text-sm text-text-secondary">{user.email || "—"}</p>
            </div>
          </div>

          <dl>
            <Row label="Phone">{user.phone}</Row>
            <Row label="Joined">{user.date}</Row>
            <Row label="Status">
              <StatusBadge tone={statusTone}>{user.status}</StatusBadge>
            </Row>
            <Row label="Roles">
              {user.roles?.length ? (
                <span className="flex flex-wrap justify-end gap-1.5">
                  {user.roles.map((role) => (
                    <span
                      key={role.id ?? role.roleName}
                      className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700"
                    >
                      {role.roleName}
                    </span>
                  ))}
                </span>
              ) : (
                <span className="text-text-disabled">No role assigned</span>
              )}
            </Row>
          </dl>
        </div>
      )}
    </SideDrawer>
  );
}