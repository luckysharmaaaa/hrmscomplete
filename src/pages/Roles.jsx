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

import RolesTable from "../components/RolesTable";
import AddRoles from "../components/AddRoles";

import {
  saveRoleModules,
  saveRolePermissions,
} from "../services/RolePermissionApi";

const BASE_URL = "http://localhost:5000/api/v1";

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
          status: item.status === "1" || item.status === 1 ? "Active" : "Inactive",
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

      toast.error(
        error.response?.data?.message || "Failed to fetch roles."
      );
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

        console.log("Create Role Response:", response.data);
        console.log("Role ID:", roleId);
      }

      console.log(roleId)

      // ==================================
      // Save Module Mapping
      // ==================================

      await saveRoleModules({

        roleId,

        moduleIds:
          roleData.selectedModules,

      });

      // ==================================
      // Save Permissions
      // ==================================
      const permissionArray = Object.entries(roleData.permissions).map(
        ([moduleId, actions]) => ({
          moduleId: Number(moduleId),
          actions: Object.keys(actions).filter(
            (action) => actions[action]
          ),
        })
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
          : "Role and permissions added successfully!"
      );

    } catch (error) {

      console.error(error);

      toast.error(
        error.response?.data?.message ||
        "Something went wrong."
      );

    }

  }


  // ======================================
  // Delete Role
  // ======================================

  const handleDeleteRole = async (id) => {
  try {
    await api.delete(`/roles/delete/${id}`);

    await fetchRoles();

    toast.success("Role deleted successfully!");
  } catch (error) {
    console.error("Delete Role Error:", error);

    toast.error(
      error.response?.data?.message || "Unable to delete role."
    );
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
  // JSX
  // ======================================

  return (

    <div className="space-y-6 overflow-hidden ">

      {/* Header */}

      <div className="flex items-start justify-between">

        <div>

          <h1 className="text-3xl font-bold text-[#0F265C]">

            Roles

          </h1>

          <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">

            <span>User Management</span>

            <FiChevronRight size={12} />

            <span className="text-orange-500 font-medium">

              Roles

            </span>

          </div>

        </div>

        {/* Right Buttons */}

        <div className="flex items-center gap-3">

          {/* Export */}

          <div className="dropdown dropdown-end">

            <label
              tabIndex={0}
              className="btn bg-orange-500 hover:bg-orange-600 border-none text-white animate-fade-in"
            >

              <DescriptionOutlinedIcon fontSize="small" />

              Export

              <KeyboardArrowDownIcon fontSize="small" />

            </label>

            <ul
              tabIndex={0}
              className="dropdown-content z-10 menu p-2 shadow bg-white rounded-box w-56 animate-fade-in"
            >

              <li>

                <button>

                  <PictureAsPdfOutlinedIcon
                    fontSize="small"
                    sx={{ color: "#ef4444" }}
                  />

                  Export as PDF

                </button>

              </li>

              <li>

                <button>

                  <TableChartOutlinedIcon
                    fontSize="small"
                    sx={{ color: "#16a34a" }}
                  />

                  Export as Excel

                </button>

              </li>

            </ul>

          </div>

          {/* Add Role */}

          <button
            onClick={handleOpenDrawer}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
          >

            <AddIcon fontSize="small" />

            Add Role

          </button>

        </div>

      </div>

      {/* Loading */}

      {

        loading ? (

          <div className="flex justify-center py-20">

            <span className="loading loading-spinner loading-lg text-orange-500"></span>

          </div>

        ) : (<RolesTable
          roles={roles}
          setRoles={setRoles}
          onEditRole={handleEditRole}
          onDeleteRole={handleDeleteRole}
        />

        )

      }

      {/* ====================================== */}
      {/* Add / Edit Drawer */}
      {/* ====================================== */}

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
