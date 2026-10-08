import usePermission from "../hooks/usePermission";
import { useEffect, useState } from 'react';import { Loader2, Plus, Users } from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import UserTable from "../components/user/UserTable";
import UserStatCards from "../components/user/UserStatCards";
import AddUserDrawer from "../components/user/AddUserDrawer";
import { getRoles } from "../services/userApi";

const User = ({ refresh }) => {
  const { canAdd } = usePermission("users");
  const [openDrawer, setOpenDrawer] = useState(false);
  const [refreshTable, setRefreshTable] = useState(false);
  const [roles, setRoles] = useState([]);

  // Filled by the table once it has loaded; feeds the summary cards.
  const [users, setUsers] = useState(null);
  const [rolesLoading, setRolesLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchRoles = async () => {
      try {
        setRolesLoading(true);
        const response = await getRoles();

        if (mounted) {
          setRoles(response?.data?.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch roles:", error);
      } finally {
        if (mounted) {
          setRolesLoading(false);
        }
      }
    };

    fetchRoles();

    return () => {
      mounted = false;
    };
  }, []);

  // Parent-level refresh support.
  const [prevRefresh, setPrevRefresh] = useState(refresh);
  if (refresh !== prevRefresh) {
    setPrevRefresh(refresh);
    if (refresh !== undefined) {
      setRefreshTable((prev) => !prev);
    }
  }

  const handleUserCreated = () => {
    setOpenDrawer(false);
    setRefreshTable((prev) => !prev);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Users}
        title="Users"
        subtitle="Manage user profiles, roles and access permissions across the system."
        breadcrumbs={[{ label: "User Management" }, { label: "Users" }]}
        actions={
          canAdd && (
            <button
              type="button"
              className="hr-btn hr-btn-primary"
              onClick={() => setOpenDrawer(true)}
              disabled={rolesLoading}
              title={rolesLoading ? "Loading roles..." : "Add a new user"}
            >
              {rolesLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              {rolesLoading ? "Loading..." : "Add User"}
            </button>
          )
        }
      />

      <UserStatCards users={users} />

      <UserTable refresh={refreshTable} roles={roles} onUsersLoaded={setUsers} />

      <AddUserDrawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        onSuccess={handleUserCreated}
        roles={roles}
      />
    </div>
  );
};

export default User;