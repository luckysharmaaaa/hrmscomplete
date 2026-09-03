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
  const [searchParams] = useSearchParams();

  const initialTab =
    searchParams.get("tab") === "password" ? "password" : "profile";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const { setProfile: setAuthProfile } = useAuth();

  // showSpinner = false lets us silently refresh in the background
  // (e.g. on tab focus) without flashing the skeleton loader again.
  const loadProfile = useCallback(
    async (showSpinner = true) => {
      if (showSpinner) setLoading(true);

      try {
        const response = await getMyProfile();
        const data = response?.data || null;

        setProfileData(data);
        setAuthProfile(data); // keep Navbar in sync from every fetch, not just saves
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Failed to load your profile",
        );
      } finally {
        if (showSpinner) setLoading(false);
      }
    },
    [setAuthProfile],
  );

  // Initial load on mount — this was missing before, which left the
  // page stuck on the skeleton forever since `focus` never fires on
  // first render (the window already has focus when we mount).
  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Silent re-fetch when this tab regains focus (e.g. you uploaded a
  // photo in User Management, then switched back here).
  useEffect(() => {
    const handleFocus = () => loadProfile(false);
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [loadProfile]);

  // Keep tab in sync with Navbar URL (?tab=password / ?tab=profile)
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-162.5">
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