import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import AuthLayout from "../components/auth/Authlayout";
import { loginUser } from "../services/loginAPI";
import { useAuth } from "../context/AuthContext";
import {
  COMPANY_NAME,
  COMPANY_EMAIL_DOMAIN,
  isCompanyEmail,
} from "../config/company";

// Only company-domain accounts can sign in.
const DOMAIN_MESSAGE = `Please sign in with your company email (name@${COMPANY_EMAIL_DOMAIN}).`;

const LOGIN_FAILED_MESSAGE = "Invalid email or password.";

const Login = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ============================================================
  // INPUT CHANGE
  // ============================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================================================
  // LOGIN
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent duplicate login requests
    if (loading) {
      return;
    }

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    // ----------------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------------
    if (!email) {
      toast.error("Please enter your email address", {
        toastId: "login-validation",
      });
      return;
    }

    // Company domain only — blocked here for quick feedback.
    // (The backend enforces this too, so it can't be bypassed.)
    if (!isCompanyEmail(email)) {
      toast.error(DOMAIN_MESSAGE, {
        toastId: "login-validation",
      });
      return;
    }

    if (!password) {
      toast.error("Please enter your password", {
        toastId: "login-validation",
      });
      return;
    }

    try {
      setLoading(true);

      const response = await loginUser(email, password);

      const data =
        response?.data?.data ||
        response?.data ||
        response;

      if (!data?.accessToken) {
        throw new Error("Authentication token was not received");
      }

      // Stores tokens AND updates AuthContext, so Navbar/Profile see the
      // user immediately without making their own /auth/me calls.
      await authLogin(data);

      toast.success("Login successful");

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      const status = error?.response?.status;

      const message =
        status === 401 || status === 400
          ? error?.response?.data?.message || LOGIN_FAILED_MESSAGE
          : error?.response?.data?.message ||
            error?.message ||
            "Unable to sign in. Please try again.";

      toast.error(message, { toastId: "login-error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle={`Sign in to your ${COMPANY_NAME} account.`}
      footer="Having trouble signing in? Contact your HR administrator."
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* EMAIL */}
        <div>
          <label htmlFor="email" className="hr-label">
            Work email
          </label>

          <div className="relative">
            <Mail
              size={18}
              strokeWidth={1.8}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-disabled"
            />

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              placeholder={`name@${COMPANY_EMAIL_DOMAIN}`}
              disabled={loading}
              className="hr-input h-12! pl-11"
            />
          </div>
        </div>

        {/* PASSWORD */}
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-4">
            <label
              htmlFor="password"
              className="text-[13px] font-medium text-text-primary"
            >
              Password
            </label>

            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              disabled={loading}
              className="shrink-0 text-[13px] font-medium text-primary-700 transition-colors hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Forgot password?
            </button>
          </div>

          <div className="relative">
            <Lock
              size={18}
              strokeWidth={1.8}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-disabled"
            />

            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              placeholder="Enter your password"
              disabled={loading}
              className="hr-input h-12! pl-11 pr-12"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={loading}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-primary-50 hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {showPassword ? (
                <EyeOff size={18} strokeWidth={1.8} />
              ) : (
                <Eye size={18} strokeWidth={1.8} />
              )}
            </button>
          </div>
        </div>

        {/* SIGN IN */}
        <button
          type="submit"
          disabled={loading}
          className="hr-btn hr-btn-primary mt-2 h-12! w-full"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Login;