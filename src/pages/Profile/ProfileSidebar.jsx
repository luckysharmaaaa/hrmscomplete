import React from "react";
import { FiUser, FiLock, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const ProfileSidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove your auth data
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    // Redirect to Login
    navigate("/login");
  };

  const menuItems = [
    {
      id: "profile",
      title: "My Profile",
      icon: <FiUser size={18} />,
    },
    {
      id: "password",
      title: "Update Password",
      icon: <FiLock size={18} />,
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-[#0F265C]">
          Account Settings
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage your account settings
        </p>
      </div>

      {/* Menu */}
      <div className="p-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 mb-2 text-left
              ${
                activeTab === item.id
                  ? "bg-orange-50 text-[#FF7A21] font-semibold border-l-4 border-[#FF7A21]"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            {item.icon}
            <span>{item.title}</span>
          </button>
        ))}
      </div>

      {/* Logout */}
      <div className="border-t border-gray-200 p-4 mt-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition"
        >
          <FiLogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileSidebar;