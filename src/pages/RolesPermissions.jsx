
import React, { useState } from "react";
import { FiHome, FiChevronRight } from "react-icons/fi";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AddIcon from "@mui/icons-material/Add";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";

// import RolesTable from "../components/RolesTable";
// import AddRoles from "../components/AddRoles";
import RolePermissionTable from "../components/RolePermissionTable";
const RolesPermissions = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [editRole, setEditRole] = useState(null);
  const [roles, setRoles] = useState([
    {
      id: 1,
      role: "Admin",
      date: "12 Sep 2024",
      status: "Active",
    },
    {
      id: 2,
      role: "HR Manager",
      date: "24 Oct 2024",
      status: "Active",
    },
    {
      id: 3,
      role: "Recruitment Manager",
      date: "18 Feb 2024",
      status: "Active",
    },
    {
      id: 4,
      role: "Payroll Manager",
      date: "17 Oct 2024",
      status: "Active",
    },
    {
      id: 5,
      role: "Leave Manager",
      date: "20 Jul 2024",
      status: "Active",
    },
    {
      id: 6,
      role: "Performance Manager",
      date: "10 Apr 2024",
      status: "Active",
    },
    {
      id: 7,
      role: "Reports Analyst",
      date: "29 Aug 2024",
      status: "Active",
    },
    {
      id: 8,
      role: "Employee",
      date: "22 Feb 2024",
      status: "Inactive",
    },
    {
      id: 9,
      role: "Client",
      date: "03 Nov 2024",
      status: "Active",
    },
    {
      id: 10,
      role: "Department Head",
      date: "17 Dec 2024",
      status: "Active",
    },
  ]);

  const handleOpenDrawer = () => {
    setEditRole(null); // clear old edit data
    setOpenDrawer(true); // open drawer
  };

  const handleEditRole = (role) => {
    setEditRole(role); // store clicked role
    setOpenDrawer(true); // open drawer
  };
  const handleAddRole = (newRole) => {

    // Check duplicate role
    const roleAlreadyExists = roles.some((role) =>
      role.role.toLowerCase().trim() === newRole.role.toLowerCase().trim() && role.id !== newRole.id
    );

    // Show alert if duplicate
    if (roleAlreadyExists) {
      alert(
        "Role already exists!"
      );
      return;
    }
    if (editRole) {
      const updatedRoles = roles.map((role) => role.id === newRole.id ? newRole : role);

      setRoles(updatedRoles);
    }
    else {
      setRoles([
        newRole,
        ...roles,
      ]);
    }

    // Reset edit mode
    setEditRole(null);
  };

  const handleCloseDrawer = () => {
    setOpenDrawer(false);
    setEditRole(null);
  };

  return (
    <div className="space-y-6">
      {/* ================= Header ================= */}
      <div className="flex items-start justify-between">
        {/* Left Side */}
        <div>
          <h1 className="text-3xl font-bold text-[#0F265C]">
            Roles &amp; Permissions
          </h1>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
            <span>User Management</span>
            <FiChevronRight size={12} className="shrink-0" />
            <span className="text-orange-500 font-medium">Roles &amp; Permissions</span>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Export Dropdown */}
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
                <button className="text-black bg-white hover:bg-gray-100 transition">
                  <PictureAsPdfOutlinedIcon
                    fontSize="small"
                    sx={{ color: "#ef4444" }}
                  />
                  Export as PDF
                </button>
              </li>

              <li>
                <button className="text-black bg-white hover:bg-gray-100 transition">
                  <TableChartOutlinedIcon
                    fontSize="small"
                    sx={{ color: "#16a34a" }}
                  />
                  Export as Excel
                </button>
              </li>
            </ul>
          </div>

          {/* Add Role Button */}
          <button
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg hover:shadow-md transition shadow-sm"
            onClick={handleOpenDrawer}
          >
            <AddIcon fontSize="small" />
            Add Role
          </button>
        </div>
      </div>

      <div>
        <RolePermissionTable />
      </div>

    </div>
  );
};

export default RolesPermissions;

