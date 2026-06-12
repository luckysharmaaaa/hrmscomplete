import React from "react";
import {
  FiHome,
  FiChevronRight,
  FiChevronDown,
  FiPlus,
  FiChevronsUp,
} from "react-icons/fi";

const User = () => {
  return (
    <div className="w-full min-h-screen bg-slate-100">
      {/* Header */}
      <div className="flex items-start justify-between px-6 py-5">
        {/* Left Section */}
        <div>
          <h1 className="text-4xl font-bold text-[#0F265C]">Users</h1>

          <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
            <FiHome size={14} />

            <FiChevronRight size={14} />

            <span>User management</span>

            <FiChevronRight size={14} />

            <span className="font-medium text-[#0F265C]">Users</span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Export Button */}
          <button className="flex items-center gap-2 px-5 py-3 bg-[#FF7A21] text-white rounded-md font-medium hover:bg-[#f06b12] transition">
            Export
            <FiChevronDown size={16} />
          </button>

          {/* Add User Button */}
          <button className="flex items-center gap-2 px-5 py-3 bg-[#FF7A21] text-white rounded-md font-medium hover:bg-[#f06b12] transition">
            <FiPlus size={16} />
            Add User
          </button>

          {/* Icon Button */}
          <button className="w-10 h-10 flex items-center justify-center bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            <FiChevronsUp size={16} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold">Users List</h2>

          <div className="mt-4 text-gray-500">User table will go here...</div>
        </div>
      </div>
    </div>
  );
};

export default User;
