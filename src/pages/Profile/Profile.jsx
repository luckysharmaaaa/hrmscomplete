import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Lock, RefreshCw, User, UserCircle } from "lucide-react";

import PageHeader from "../../components/ui/PageHeader";
import ProfileForm from "./ProfileForm";
import ChangePassword from "./ChangePassword";
import ProfileSkeleton from "./ProfileSkeleton";

import { useAuth } from "../../context/AuthContext";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "password", label: "Password", icon: Lock },
];

const Profile = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // The URL is the single source of truth for the active tab, so links from
  // the Navbar (?tab=password) keep working.
  const activeTab =
    searchParams.get("tab") === "password" ? "password" : "profile";

  // AuthContext owns the profile: { user, address, roles, profileImage }.
  const { profile, refreshUser, setProfile } = useAuth();

  const hadProfileOnMount = useRef(Boolean(profile));

  const [loading, setLoading] = useState(!profile);
  const [loadFailed, setLoadFailed] = useState(false);

  // showSpinner = false refreshes quietly in the background (e.g. on tab
  // focus). refreshUser() is de-duplicated, so StrictMode's double effect and
  // the Navbar share one /auth/me request.
  const loadProfile = useCallback(
    async (showSpinner = true) => {
      if (showSpinner) {
        setLoading(true);
        setLoadFailed(false);
      }

      const result = await refreshUser();

      if (showSpinner) {
        setLoadFailed(!result);
        setLoading(false);
      }
    },
    [refreshUser],
  );

  // Initial load. If AuthContext already has the profile, refresh quietly.
  useEffect(() => {
    loadProfile(!hadProfileOnMount.current);
  }, [loadProfile]);

  // Quiet re-fetch when the window regains focus (e.g. a photo was changed
  // elsewhere). Forms only reset if the server data actually changed.
  useEffect(() => {
    const handleFocus = () => loadProfile(false);

    window.addEventListener("focus", handleFocus);

    return () => window.removeEventListener("focus", handleFocus);
  }, [loadProfile]);

  const selectTab = (id) => {
    setSearchParams(id === "profile" ? {} : { tab: id }, { replace: true });
  };

  // Arrow keys move between tabs, as in the WAI-ARIA tabs pattern.
  const handleTabKeyDown = (event, index) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;

    event.preventDefault();

    const step = event.key === "ArrowRight" ? 1 : -1;
    const next = TABS[(index + step + TABS.length) % TABS.length];

    selectTab(next.id);
    document.getElementById(`tab-${next.id}`)?.focus();
  };

  return (
    <div className="w-full space-y-6">
      <PageHeader
        icon={UserCircle}
        title="Account Settings"
        subtitle="Manage your personal information and password"
        breadcrumbs={[{ label: "Pages" }, { label: "Account Settings" }]}
      />

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Account settings"
        className="flex gap-1 border-b border-border-subtle"
      >
        {TABS.map((tab, index) => {
          const Icon = tab.icon;
          const selected = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => selectTab(tab.id)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              className={`-mb-px inline-flex h-11 items-center gap-2 border-b-2 px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30 ${
                selected
                  ? "border-accent-500 text-primary-700"
                  : "border-transparent text-text-secondary hover:text-primary-700"
              }`}
            >
              <Icon size={16} aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <ProfileSkeleton />
      ) : !profile ? (
        <div
          role="alert"
          className="hr-card flex flex-col items-center px-6 py-14 text-center"
        >
          <h2 className="text-lg font-semibold text-primary-700">
            {loadFailed
              ? "We couldn't load your profile"
              : "Your profile isn't available"}
          </h2>

          <p className="mt-1 max-w-sm text-sm text-text-secondary">
            Check your connection and try again. If the problem continues,
            contact your administrator.
          </p>

          <button
            type="button"
            onClick={() => loadProfile(true)}
            className="hr-btn hr-btn-primary mt-6"
          >
            <RefreshCw size={16} aria-hidden="true" />
            Try again
          </button>
        </div>
      ) : (
        <>
          {/* Both panels stay mounted so unsaved edits survive a tab switch. */}
          <div
            id="panel-profile"
            role="tabpanel"
            aria-labelledby="tab-profile"
            hidden={activeTab !== "profile"}
          >
            <ProfileForm
              profileData={profile}
              onSaved={setProfile}
              onImageChanged={(profileImage) =>
                setProfile({ ...profile, profileImage })
              }
            />
          </div>

          <div
            id="panel-password"
            role="tabpanel"
            aria-labelledby="tab-password"
            hidden={activeTab !== "password"}
          >
            <ChangePassword />
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;