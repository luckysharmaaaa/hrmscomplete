import React, { useState, useEffect } from "react";
import api from "../services/api";
import { FiChevronRight } from "react-icons/fi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AddIcon from "@mui/icons-material/Add";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";

import RolesTable from "../components/RolesTable";
import AddRoles from "../components/AddRoles";

import {
  saveRoleModules,
  saveRolePermissions,
} from "../services/RolePermissionApi";

const Roles = () => {
  // ======================================
  // States
  // ======================================

  const [roles, setRoles] = useState([]);

  const [loading, setLoading] = useState(false);

  const [openDrawer, setOpenDrawer] = useState(false);

  const [editRole, setEditRole] = useState(null);

  // ======================================
  // Get All Roles
  // ======================================

  const fetchRoles = async () => {
    try {
      setLoading(true);

      const response = await api.get("/roles");

      if (response.data?.success) {
        const formattedRoles = response.data.data.map((item) => ({
          id: item.id,
          roleName: item.roleName,
          roleCode: item.roleCode,
          description: item.description,
          status:
            item.status === "1" || item.status === 1 ? "Active" : "Inactive",
          createdAt: item.createdAt
            ? new Date(item.createdAt * 1000).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "-",
        }));

        setRoles(formattedRoles);
      } else {
        setRoles([]);
      }
    } catch (error) {
      console.error("Fetch Roles Error:", error);

      toast.error(error.response?.data?.message || "Failed to fetch roles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // ======================================
  // Open Drawer
  // ======================================

  const handleOpenDrawer = () => {
    setEditRole(null);

    setOpenDrawer(true);
  };

  // ======================================
  // Edit Role
  // ======================================

  const handleEditRole = (role) => {
    setEditRole(role);

    setOpenDrawer(true);
  };

  // ======================================
  // Add / Update Role
  // ======================================

  const handleAddRole = async (roleData) => {
    try {
      let roleId = null;

      // ==================================
      // UPDATE ROLE
      // ==================================

      if (editRole) {
        roleId = editRole.id;

        await api.put(`/roles/update/${roleId}`, {
          roleName: roleData.roleName,
          roleCode: roleData.roleCode,
          description: roleData.description,
          status: roleData.status === "Active" ? "1" : "0",
        });
      }

      // ==================================
      // CREATE ROLE
      // ==================================
      else {
        const response = await api.post("/roles/add", {
          roleName: roleData.roleName,
          roleCode: roleData.roleCode,
          description: roleData.description,
          status: roleData.status === "Active" ? "1" : "0",
        });

        roleId = response.data?.data?.id;
      }

      // ==================================
      // Save Module Mapping
      // ==================================

      await saveRoleModules({
        roleId,

        moduleIds: roleData.selectedModules,
      });

      // ==================================
      // Save Permissions
      // ==================================
      const permissionArray = Object.entries(roleData.permissions).map(
        ([moduleId, actions]) => ({
          moduleId: Number(moduleId),
          actions: Object.keys(actions).filter((action) => actions[action]),
        }),
      );

      await saveRolePermissions({
        roleId,
        permissions: permissionArray,
      });
      // ==================================
      // Refresh
      // ==================================

      await fetchRoles();

      setOpenDrawer(false);

      setEditRole(null);

      toast.success(
        editRole
          ? "Role updated successfully!"
          : "Role and permissions added successfully!",
      );
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Something went wrong.");

      throw error; // let AddRoles know the save failed, so it keeps the drawer open with the entered data
    }
  };

  // ======================================
  // Delete Role
  // Single source of truth for deleting — RolesTable only confirms and
  // calls this. (Previously RolesTable also fired its own axios.delete,
  // so every click deleted the role twice.)
  // ======================================

  const handleDeleteRole = async (id) => {
    try {
      await api.delete(`/roles/delete/${id}`);

      setRoles((prev) => prev.filter((role) => role.id !== id));

      toast.success("Role deleted successfully!");
    } catch (error) {
      console.error("Delete Role Error:", error);

      toast.error(error.response?.data?.message || "Unable to delete role.");

      throw error; // let RolesTable know the delete failed, so it can re-enable its confirm button
    }
  };

  // ======================================
  // Close Drawer
  // ======================================

  const handleCloseDrawer = () => {
    setOpenDrawer(false);

    setEditRole(null);
  };

  // ======================================
  // Export — CSV is a real file download; "PDF" opens the browser's
  // print dialog (choose "Save as PDF" there) since we don't ship a PDF
  // generation library. Both were previously dead buttons.
  // ======================================

  const exportCSV = () => {
    if (!roles.length) {
      toast.info("No roles to export yet.");
      return;
    }

    const headers = ["Role Name", "Role Code", "Description", "Status", "Created Date"];
    const rows = roles.map((r) => [
      r.roleName,
      r.roleCode,
      r.description || "",
      r.status,
      r.createdAt,
    ]);

    const escapeCell = (val) => `"${String(val ?? "").replace(/"/g, '""')}"`;
    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCell).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `roles-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    if (!roles.length) {
      toast.info("No roles to export yet.");
      return;
    }
    toast.info("Opening print dialog — choose “Save as PDF” as the destination.");
    window.print();
  };

  // ======================================
  // JSX
  // ======================================

  return (
    <div className="space-y-5">
      {/* Header banner — same navy → blue treatment as the Modules page,
          so the two admin screens read as one product. */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F265C] via-[#173a82] to-[#2563eb] px-6 py-7 shadow-lg shadow-blue-900/10">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-10 w-24 h-24 bg-sky-400/10 rounded-full translate-y-1/2" />

        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-white/10 border border-white/10 rounded-xl backdrop-blur-sm shrink-0">
              <ShieldOutlinedIcon fontSize="small" sx={{ color: "#7dd3fc" }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Roles</h1>
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-white/50 leading-none">
                <span>User Management</span>
                <FiChevronRight size={12} className="shrink-0" />
                <span className="text-sky-300 font-medium">Roles</span>
              </div>
            </div>
          </div>

          {/* Right Buttons */}
          <div className="flex items-center gap-3">
            {/* Export */}
            <div className="dropdown dropdown-end">
              <label
                tabIndex={0}
                className="flex items-center gap-2 h-10 px-4 bg-white/10 hover:bg-white/20 border border-white/15 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer backdrop-blur-sm"
              >
                <DescriptionOutlinedIcon fontSize="small" />
                Export
                <KeyboardArrowDownIcon fontSize="small" />
              </label>

              <ul
                tabIndex={0}
                className="dropdown-content menu bg-white border border-gray-100 rounded-xl shadow-xl z-50 w-52 p-1.5 mt-2"
              >
                <li>
                  <button
                    onClick={exportPDF}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <PictureAsPdfOutlinedIcon
                      fontSize="small"
                      sx={{ color: "#ef4444" }}
                    />
                    <span className="font-medium">Print / Save as PDF</span>
                  </button>
                </li>

                <li>
                  <button
                    onClick={exportCSV}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <TableChartOutlinedIcon
                      fontSize="small"
                      sx={{ color: "#16a34a" }}
                    />
                    <span className="font-medium">Export as CSV</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Add Role */}
            <button
              onClick={handleOpenDrawer}
              className="flex items-center gap-2 h-10 px-4 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm shadow-orange-900/20"
            >
              <AddIcon fontSize="small" />
              Add Role
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-24">
          <span className="loading loading-spinner loading-lg text-blue-500"></span>
        </div>
      ) : (
        <RolesTable
          roles={roles}
          setRoles={setRoles}
          onEditRole={handleEditRole}
          onDeleteRole={handleDeleteRole}
        />
      )}

      {/* ====================================== */}
      {/* Add / Edit Drawer */}
      {/* ====================================== */}

      <AddRoles
        open={openDrawer}
        onClose={handleCloseDrawer}
        onAddRole={handleAddRole}
        editRole={editRole}
        existingRoles={roles}
      />
    </div>
  );
};

export default Roles;