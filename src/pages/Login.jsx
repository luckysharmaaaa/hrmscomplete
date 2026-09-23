import React, { useState } from "react";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import login from "../assets/images/logo.png";
import loginBg from "../assets/images/Login_bg.png";
import { loginUser } from "../services/loginAPI";
import { useAuth } from "../context/AuthContext";
import {
  COMPANY_EMAIL_DOMAIN,
  COMPANY_NAME,
  FIRST_TIME_ACCESS_ENABLED,
  isCompanyEmail,
} from "../config/company";

const inputClass =
  "h-12 w-full rounded-lg border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-[#F28C28] focus:ring-2 focus:ring-[#F28C28]/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

const Login = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCompanyEmailNotice, setShowCompanyEmailNotice] =
    useState(false);

  const emailLabel = COMPANY_EMAIL_DOMAIN ? "Work email" : "Email address";
  const emailPlaceholder = COMPANY_EMAIL_DOMAIN
    ? `name@${COMPANY_EMAIL_DOMAIN}`
    : "Enter your email";
  const subtitle = COMPANY_EMAIL_DOMAIN
    ? `Sign in to your ${COMPANY_NAME} account.`
    : "Sign in to your account to continue.";

  // ============================================================
  // INPUT CHANGE
  // ============================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "email" && showCompanyEmailNotice) {
      setShowCompanyEmailNotice(false);
    }
  };

  // Tell the user about a non-company email as soon as they leave the field.
  const handleEmailBlur = () => {
    const value = formData.email.trim();

    if (value && !isCompanyEmail(value)) {
      setShowCompanyEmailNotice(true);
    }
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

    const email = formData.email.trim();
    const password = formData.password;

    // ----------------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------------
    if (!email) {
      toast.error(`Please enter your ${emailLabel.toLowerCase()}`, {
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

    // Friendly hint only. The backend enforces the real rule.
    if (!isCompanyEmail(email)) {
      setShowCompanyEmailNotice(true);
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

      navigate("/profile", {
        replace: true,
      });
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error?.message ||
        error?.message ||
        "Unable to sign in. Please try again.";

      toast.error(message, { toastId: "login-error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">

        {/* LEFT SIDE — existing image only */}
        <div className="relative hidden min-h-screen lg:block">
          <img
            src={loginBg}
            alt="SmartHR"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        {/* RIGHT SIDE */}
        <div className="flex min-h-screen items-center justify-center bg-white px-5 py-10 sm:px-8 lg:px-10 xl:px-16">
          <div className="flex w-full max-w-[410px] flex-col items-center">

            {/* LOGO */}
            <div className="mb-9 flex w-full justify-center">
              <img
                src={login}
                alt="Technovatic Solutions"
                className="h-auto max-h-14 w-auto max-w-[160px] object-contain"
              />
            </div>

            {/* HEADING */}
            <div className="mb-8 w-full text-center">
              <h1 className="text-[30px] font-semibold leading-tight tracking-tight text-[#17233C] sm:text-[32px]">
                Welcome back
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {subtitle}
              </p>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="w-full space-y-5"
              noValidate
            >
              {/* EMAIL */}
              <div className="w-full">
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  {emailLabel}
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    strokeWidth={1.8}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleEmailBlur}
                    autoComplete="email"
                    placeholder={emailPlaceholder}
                    disabled={loading}
                    aria-invalid={showCompanyEmailNotice}
                    aria-describedby={
                      showCompanyEmailNotice
                        ? "company-email-notice"
                        : undefined
                    }
                    className={inputClass}
                  />
                </div>

                {showCompanyEmailNotice && (
                  <div
                    id="company-email-notice"
                    role="alert"
                    className="mt-3 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-5 text-amber-800"
                  >
                    <AlertCircle
                      size={18}
                      className="mt-0.5 shrink-0"
                    />
                    <p>
                      Please sign in using your official BytesBrick company account.
                      {FIRST_TIME_ACCESS_ENABLED &&
                        " If you are accessing the portal for the first time, use First-Time Employee Access below."}
                    </p>
                  </div>
                )}
              </div>

              {/* PASSWORD */}
              <div className="w-full">
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    disabled={loading}
                    className="shrink-0 text-sm font-medium text-[#F28C28] transition-colors hover:text-[#D87516] focus:outline-none focus:ring-2 focus:ring-[#F28C28]/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <Lock
                    size={18}
                    strokeWidth={1.8}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
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
                    className={`${inputClass} pr-12`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={loading}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-md p-1 text-slate-400 transition-colors hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
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
                className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#F28C28] px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#E17E1C] hover:shadow focus:outline-none focus:ring-2 focus:ring-[#F28C28]/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:shadow-sm"
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

            {/* FIRST-TIME ACCESS */}
            {FIRST_TIME_ACCESS_ENABLED && (
              <div className="mt-8 w-full border-t border-slate-200 pt-6 text-center">
                <p className="text-sm text-slate-500">
                  Don&apos;t have your {COMPANY_NAME} email yet?
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/first-time-access")}
                  disabled={loading}
                  className="mt-3 flex h-12 w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:border-[#F28C28] hover:text-[#D87516] focus:outline-none focus:ring-2 focus:ring-[#F28C28]/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  First-Time Employee Access
                </button>
              </div>
            )}

            {/* FOOTER */}
            <div className="mt-9 w-full">
              <p className="text-center text-xs leading-5 text-slate-400">
                © {new Date().getFullYear()} SmartHR.{" "}
                All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;