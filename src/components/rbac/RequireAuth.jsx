import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../context/authValue";

/**
 * Jo bhi logged-in nahi hai use turant /login par bhejta hai.
 * Context state + localStorage token dono check karta hai.
 */
export default function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-400">
        <Loader2 size={22} className="animate-spin" />
      </div>
    );
  }

  const hasToken = !!localStorage.getItem("token");

  if (!isAuthenticated || !hasToken) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}