import usePermission from "../hooks/usePermission";
import React, { useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Plus,
  ShieldCheck,
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import RolesTable from "../components/RolesTable";
import AddRoles from "../components/AddRoles";

import {
  saveRoleModules,
  saveRolePermissions,
} from "../services/RolePermissionApi";

const Roles = () => {
  const { canAdd } = usePermission("roles");
  const [roles, setRoles] = useState([]);

  const [loading, setLoading] = useState(false);

  const [openDrawer, setOpenDrawer] = useState(false);

  const [editRole, setEditRole] = useState(null);

  // ============================================================
  // FETCH ROLES
  // ============================================================

  const fetchRoles = async () => {
    try {
      setLoading(true);

      const response = await api.get("/roles");

      const data = Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      const formattedRoles = data.map((item) => ({
        id: item.id,
        roleName: item.roleName || "",
        roleCode: item.roleCode || "",
        description: item.description || "",
        status:
          item.status === "1" || item.status === 1
            ? "Active"
            : "Inactive",
        createdAt: item.createdAt
          ? new Date(item.createdAt * 1000).toLocaleDateString(
              "en-GB",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
              },
            )
          : "-",
      }));

      setRoles(formattedRoles);
    } catch (error) {
      console.error("Fetch Roles Error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load roles.",
      );

      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // ============================================================
  // ADD ROLE
  // ============================================================

  const handleOpenDrawer = () => {
    setEditRole(null);
    setOpenDrawer(true);
  };

  // ============================================================
  // EDIT ROLE
  // ============================================================

  const handleEditRole = (role) => {
    setEditRole(role);
    setOpenDrawer(true);
  };

  // ============================================================
  // SAVE ROLE
  // ============================================================

  const handleAddRole = async (roleData) => {
    try {
      let roleId;

      const payload = {
        roleName: roleData.roleName,
        roleCode: roleData.roleCode,
        description: roleData.description,
        status: roleData.status === "Active" ? "1" : "0",
      };

      // --------------------------------------------------------
      // UPDATE
      // --------------------------------------------------------

      if (editRole?.id) {
        roleId = editRole.id;

        await api.put(
          `/roles/update/${roleId}`,
          payload,
        );
      }

      // --------------------------------------------------------
      // CREATE
      // --------------------------------------------------------

      else {
        const response = await api.post(
          "/roles/add",
          payload,
        );

        roleId =
          response.data?.data?.id ||
          response.data?.data?.roleId ||
          response.data?.id;

        if (!roleId) {
          throw new Error(
            "Role was created but the server did not return the role ID.",
          );
        }
      }

      // --------------------------------------------------------
      // SAVE MODULE MAPPINGS
      // --------------------------------------------------------

      await saveRoleModules({
        roleId,
        moduleIds: Array.isArray(roleData.selectedModules)
          ? roleData.selectedModules
          : [],
      });

      // --------------------------------------------------------
      // SAVE PERMISSIONS
      // --------------------------------------------------------

      const permissionObject =
        roleData.permissions &&
        typeof roleData.permissions === "object"
          ? roleData.permissions
          : {};

      const permissionArray = Object.entries(
        permissionObject,
      ).map(([moduleId, actions]) => ({
        moduleId: Number(moduleId),

        actions:
          actions && typeof actions === "object"
            ? Object.keys(actions).filter(
                (action) => actions[action] === true,
              )
            : [],
      }));

      await saveRolePermissions({
        roleId,
        permissions: permissionArray,
      });

      // --------------------------------------------------------
      // REFRESH
      // --------------------------------------------------------

      await fetchRoles();

      setOpenDrawer(false);
      setEditRole(null);

      toast.success(
        editRole
          ? "Role updated successfully."
          : "Role created successfully.",
      );
    } catch (error) {
      console.error("Save Role Error:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to save role.",
      );

      // Important:
      // AddRoles uses this to keep the drawer open.
      throw error;
    }
  };

  // ============================================================
  // DELETE ROLE
  // ============================================================

  const handleDeleteRole = async (id) => {
    try {
      await api.delete(`/roles/delete/${id}`);

      setRoles((prev) =>
        prev.filter((role) => role.id !== id),
      );

      toast.success("Role deleted successfully.");
    } catch (error) {
      console.error("Delete Role Error:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to delete role.",
      );

      throw error;
    }
  };

  // ============================================================
  // CLOSE DRAWER
  // ============================================================

  const handleCloseDrawer = () => {
    setOpenDrawer(false);
    setEditRole(null);
  };

  // ============================================================
  // EXPORT CSV
  // ============================================================

  const exportCSV = () => {
    if (!roles.length) {
      toast.info("No roles available to export.");
      return;
    }

    const headers = [
      "Role Name",
      "Role Code",
      "Description",
      "Status",
      "Created Date",
    ];

    const rows = roles.map((role) => [
      role.roleName,
      role.roleCode,
      role.description || "",
      role.status,
      role.createdAt,
    ]);

    const escapeCell = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCell).join(","))
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `roles-${Date.now()}.csv`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
  };

  // ============================================================
  // EXPORT PDF
  // ============================================================

  const exportPDF = () => {
    if (!roles.length) {
      toast.info("No roles available to export.");
      return;
    }

    window.print();
  };

  // Closes the daisyUI focus-dropdown after an item is clicked
  const closeDropdown = () => document.activeElement?.blur?.();

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ShieldCheck}
        title="Roles"
        subtitle="Create roles and control what each role can access"
        breadcrumbs={[
          { label: "User Management" },
          { label: "Roles & Permissions" },
        ]}
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
                className="dropdown-content z-50 mt-2 w-56 rounded-lg border border-border-subtle bg-surface p-1.5 shadow-lg"
              >
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      exportPDF();
                      closeDropdown();
                    }}
                    className="flex h-10 w-full items-center gap-2.5 rounded-md px-3 text-sm text-text-primary transition-colors hover:bg-primary-50 hover:text-primary-700"
                  >
                    <FileText size={16} className="text-danger-500" />
                    Print / Save as PDF
                  </button>
                </li>

                <li>
                  <button
                    type="button"
                    onClick={() => {
                      exportCSV();
                      closeDropdown();
                    }}
                    className="flex h-10 w-full items-center gap-2.5 rounded-md px-3 text-sm text-text-primary transition-colors hover:bg-primary-50 hover:text-primary-700"
                  >
                    <FileSpreadsheet size={16} className="text-success-600" />
                    Export as CSV
                  </button>
                </li>
              </ul>
            </div>

            {/* Add Role */}
            {canAdd && (
<button
              type="button"
              onClick={handleOpenDrawer}
              className="hr-btn hr-btn-primary"
            >
              <Plus size={16} />
              Add Role
            </button>
)}
          </>
        }
      />

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 size={32} className="animate-spin text-primary-700" />
        </div>
      ) : (
        <RolesTable
          roles={roles}
          setRoles={setRoles}
          onEditRole={handleEditRole}
          onDeleteRole={handleDeleteRole}
        />
      )}

      {/* Add / Edit drawer */}
      <AddRoles
        open={openDrawer}
        onClose={handleCloseDrawer}
        onAddRole={handleAddRole}
        editRole={editRole}
      />
    </div>
  );
};

export default Roles;