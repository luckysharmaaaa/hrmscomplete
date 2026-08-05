import React, { useState, useEffect } from "react";
import { FiChevronRight } from "react-icons/fi";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AddIcon from "@mui/icons-material/Add";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";

import UserTable from "../components/user/UserTable";
import AddUserDrawer from "../components/user/AddUserDrawer";
import { getRoles } from "../services/userApi";

const User = ({ refresh }) => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [refreshTable, setRefreshTable] = useState(false);

  // Roles are fetched once here (instead of separately inside
  // AddUserDrawer and EditUserModal) and passed down to both, so the
  // /roles endpoint is only called a single time per page load.
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await getRoles();
      setRoles(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch roles", error);
    }
  };

  // Optional: refresh user table after create
  const handleUserCreated = () => {
    setOpenDrawer(false);
    setRefreshTable((prev) => !prev);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        {/* Left */}
        <div>
          <h1 className="text-3xl font-bold text-[#0F265C]">Users</h1>

          <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
            <span>User Management</span>
            <FiChevronRight size={12} className="shrink-0" />
            <span className="text-orange-500 font-medium">Users</span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Export Dropdown */}
          <div className="dropdown dropdown-end">
            <label
              tabIndex={0}
              className="btn bg-orange-500 hover:bg-orange-600 border-none text-white"
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

          {/* Add User */}
          <button
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg hover:shadow-md transition shadow-sm"
            onClick={() => setOpenDrawer(true)}
          >
            <AddIcon fontSize="small" />
            Add User
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div>
        <UserTable refresh={refreshTable} roles={roles} />

        <AddUserDrawer
          open={openDrawer}
          onClose={() => setOpenDrawer(false)}
          onSuccess={handleUserCreated}
          roles={roles}
        />
      </div>
    </div>
  );
};

export default User;
