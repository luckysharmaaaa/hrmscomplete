import React, { useState } from "react";
import { FiChevronRight, FiChevronsUp } from "react-icons/fi";

import ProfileSidebar from "./ProfileSidebar";
import ProfileForm from "./ProfileForm";
import ChangePassword from "./ChangePassword";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0F265C]">
            Account Settings
          </h1>

          <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
            <span>Pages</span>
            <FiChevronRight size={12} />
            <span className="text-orange-500 font-medium">
              Account Settings
            </span>
          </div>
        </div>

        <button className="w-10 h-10 flex items-center justify-center bg-[#FF7A21] rounded-md text-white">
          <FiChevronsUp size={18} />
        </button>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-3">
          <ProfileSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>

        {/* Right Content */}
        <div className="col-span-12 lg:col-span-9">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[650px]">
            {activeTab === "profile" && <ProfileForm />}

            {activeTab === "password" && <ChangePassword />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;