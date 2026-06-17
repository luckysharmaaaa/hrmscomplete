import React, { useState } from "react";
import { FiHome, FiChevronRight } from "react-icons/fi";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AddIcon from "@mui/icons-material/Add";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import UserTable from "../components/UserTable";
import AddUserDrawer from "../components/AddUserDrawer";

const User = () => {
  // drawer logic
  const [openDrawer, setOpenDrawer] = useState(false);

  return (
    <div className="w-full min-h-screen bg-slate-100">
      {/* Header */}
      <div className="flex items-start justify-between px-6 py-5">
        {/* Left */}
        <div>
          <h1 className="text-4xl font-bold text-[#0F265C]">Users</h1>

          <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
            <FiHome size={14} />
            <FiChevronRight size={14} />
            <span>User Management</span>
            <FiChevronRight size={14} />
            <span className="font-medium text-[#0F265C]">Users</span>
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
              className="dropdown-content z-1 menu p-2 shadow bg-white rounded-box w-56"
            >
              <li>
                <button className="text-black! bg-white! hover:bg-gray-100! active:bg-gray-100! focus:bg-gray-100!">
                  <PictureAsPdfOutlinedIcon
                    fontSize="small"
                    sx={{ color: "#ef4444" }}
                  />
                  Export as PDF
                </button>
              </li>

              <li>
                <button className="text-black! bg-white! hover:bg-gray-100! active:bg-gray-100! focus:bg-gray-100!">
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
            className="btn bg-orange-500 hover:bg-orange-600 border-none text-white"
            onClick={() => setOpenDrawer(true)}
          >
            <AddIcon fontSize="small" />
            Add User
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="px-6 pb-6">
        <UserTable />
        <AddUserDrawer open={openDrawer} onClose={() => setOpenDrawer(false)} />
      </div>
    </div>
  );
};

export default User;
