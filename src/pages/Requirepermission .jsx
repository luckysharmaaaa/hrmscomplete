import React from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Forbidden from "../../pages/Forbidden";

/**
 * Route guard driven by role_permissions.
 *
 *   <Route
 *     path="/designations"
 *     element={
 *       <RequirePermission module="designations">
 *         <Designations />
 *       </RequirePermission>
 *     }
 *   />
 *
 * - waits for permissions to load (no flash of "Access denied")
 * - shows the 403 page when the permission is missing
 * - pass redirectTo="/dashboard" to redirect instead
 */
export default function RequirePermission({
  module: moduleSlug,
  action = "view",
  redirectTo,
  children,
}) {
  const { hasPermission, permissionsLoaded } = useAuth();

  if (!permissionsLoaded) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-primary-700">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  if (!hasPermission(moduleSlug, action)) {
    return redirectTo ? <Navigate to={redirectTo} replace /> : <Forbidden />;
  }

  return <>{children}</>;
}