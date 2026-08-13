import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { toast } from "react-toastify";

import ProfileForm from "./ProfileForm";
import ChangePassword from "./ChangePassword";
import ProfileSkeleton from "./ProfileSkeleton";

import { getMyProfile } from "../../services/profileApi";
import { useAuth } from "../../context/AuthContext";

const Profile = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab =
    searchParams.get("tab") === "password" ? "password" : "profile";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const { setProfile: setAuthProfile } = useAuth();

  const loadProfile = useCallback(async () => {
    setLoading(true);

    try {
      const response = await getMyProfile();

      setProfileData(response?.data || null);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load your profile",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Keep tab in sync with Navbar URL
  useEffect(() => {
    const tab =
      searchParams.get("tab") === "password" ? "password" : "profile";

    setActiveTab(tab);
  }, [searchParams]);

  const handleProfileUpdated = (updated) => {
    setProfileData(updated);
    setAuthProfile(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Main Content */}
      <div className="w-full">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[650px]">
          {loading ? (
            <ProfileSkeleton />
          ) : (
            <>
              {activeTab === "profile" && (
                <ProfileForm
                  profileData={profileData}
                  onSaved={handleProfileUpdated}
                  onImageChanged={(profileImage) =>
                    handleProfileUpdated({
                      ...profileData,
                      profileImage,
                    })
                  }
                />
              )}

              {activeTab === "password" && <ChangePassword />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;