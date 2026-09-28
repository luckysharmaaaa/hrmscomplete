import React, { useEffect, useState } from "react";
import { ChevronDown, FileText, FileSpreadsheet, Download, Plus, Loader2, Users } from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import UserTable from "../components/user/UserTable";
import AddUserDrawer from "../components/user/AddUserDrawer";
import { getRoles } from "../services/userApi";

const User = ({ refresh }) => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [refreshTable, setRefreshTable] = useState(false);
  const [roles, setRoles] = useState([]);
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
  useEffect(() => {
    if (refresh === undefined) return;
    setRefreshTable((prev) => !prev);
  }, [refresh]);

  const handleUserCreated = () => {
    setOpenDrawer(false);
    setRefreshTable((prev) => !prev);
  };

  // Closes the daisyUI focus-dropdown after an item is clicked
  const closeDropdown = () => document.activeElement?.blur?.();

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Users}
        title="Users"
        subtitle="Manage user profiles, roles and access"
        breadcrumbs={[{ label: "User Management" }, { label: "Users" }]}
        actions={
          <>
            {/* Export */}
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="hr-btn hr-btn-glass">
                <Download size={16} />
                Export
                <ChevronDown size={16} />
              </div>

              <ul
                tabIndex={0}
                className="dropdown-content z-50 mt-2 w-52 rounded-lg border border-border-subtle bg-surface p-1.5 shadow-lg"
              >
                <li>
                  <button
                    type="button"
                    onClick={closeDropdown}
                    className="flex h-10 w-full items-center gap-2.5 rounded-md px-3 text-sm text-text-primary transition-colors hover:bg-primary-50 hover:text-primary-700"
                  >
                    <FileText size={16} className="text-danger-500" />
                    Export as PDF
                  </button>
                </li>

                <li>
                  <button
                    type="button"
                    onClick={closeDropdown}
                    className="flex h-10 w-full items-center gap-2.5 rounded-md px-3 text-sm text-text-primary transition-colors hover:bg-primary-50 hover:text-primary-700"
                  >
                    <FileSpreadsheet size={16} className="text-success-600" />
                    Export as Excel
                  </button>
                </li>
              </ul>
            </div>

            {/* Add User */}
            <button
              type="button"
              className="hr-btn hr-btn-primary"
              onClick={() => setOpenDrawer(true)}
              disabled={rolesLoading}
              title={rolesLoading ? "Loading roles..." : "Add a new user"}
            >
              {rolesLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {rolesLoading ? "Loading..." : "Add User"}
            </button>
          </>
        }
      />

      {/* User Table */}
      <UserTable refresh={refreshTable} roles={roles} />

      {/* Add User Drawer */}
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