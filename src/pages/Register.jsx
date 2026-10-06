import React, { useState } from "react";
import { Clock, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import AuthLayout from "../components/auth/Authlayout";
import GoogleAuthSection from "../components/auth/GoogleAuthSection";
import { googleSetPassword } from "../services/loginAPI";
import { COMPANY_NAME, COMPANY_EMAIL_DOMAIN } from "../config/company";

// Same rules as the Admin "Add user" form. The backend enforces them again.
const validatePassword = (password) => {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter.";
  if (!/[0-9]/.test(password)) return "Password must contain a number.";
  return "";
};

const Register = () => {
  const navigate = useNavigate();

  // signup -> (password) -> pending
  const [stage, setStage] = useState("signup");
  const [message, setMessage] = useState("");

  // Kept only in memory. It is the proof of identity for the password step.
  const [credential, setCredential] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const handlePending = (data, backendMessage, googleCredential) => {
    setMessage(backendMessage || "Your account is awaiting administrator approval.");

    if (data?.needsPassword && googleCredential) {
      setCredential(googleCredential);
      setStage("password");
      return;
    }

    setStage("pending");
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();

    if (saving) return;

    const problem = validatePassword(password);

    if (problem) {
      toast.error(problem, { toastId: "register-password" });
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.", { toastId: "register-password" });
      return;
    }

    try {
      setSaving(true);

      const response = await googleSetPassword(credential, password);

      toast.success("Password created successfully.");
      setMessage(
        response?.data?.message ||
          "Your account is awaiting administrator approval."
      );
      setCredential("");
      setPassword("");
      setConfirmPassword("");
      setStage("pending");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Unable to save your password. Please try again.",
        { toastId: "register-password" }
      );
    } finally {
      setSaving(false);
    }
  };

  // ── Pending approval ───────────────────────────────────────
  if (stage === "pending") {
    return (
      <AuthLayout
        icon={
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-warning-50">
            <Clock size={28} className="text-warning-600" />
          </div>
        }
        title="Awaiting approval"
        subtitle={message}
      >
        <p className="mb-6 text-center text-sm leading-6 text-text-secondary">
          Once an administrator approves your account, you can sign in with
          your email and password, or with Google.
        </p>

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="hr-btn hr-btn-outline h-12! w-full"
        >
          Back to sign in
        </button>
      </AuthLayout>
    );
  }

  // ── Create password ────────────────────────────────────────
  if (stage === "password") {
    return (
      <AuthLayout
        title="Create your password"
        subtitle="Your account has been created. Set a password so you can also sign in with your email."
        footer={
          <button
            type="button"
            onClick={() => {
              setCredential("");
              setStage("signup");
            }}
            className="text-sm font-medium text-text-secondary transition-colors hover:text-primary-700"
          >
            Start over
          </button>
        }
      >
        <form onSubmit={handleSetPassword} className="space-y-5" noValidate>
          <div>
            <label htmlFor="register-password" className="hr-label">
              Password
            </label>

            <div className="relative">
              <Lock
                size={18}
                strokeWidth={1.8}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-disabled"
              />

              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                autoComplete="new-password"
                disabled={saving}
                className="hr-input h-12! pl-11 pr-12"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-primary-50 hover:text-primary-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <p className="mt-2 text-xs text-text-secondary">
              At least 8 characters, with an uppercase letter and a number.
            </p>
          </div>

          <div>
            <label htmlFor="register-confirm" className="hr-label">
              Confirm password
            </label>

            <div className="relative">
              <Lock
                size={18}
                strokeWidth={1.8}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-disabled"
              />

              <input
                id="register-confirm"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                autoComplete="new-password"
                disabled={saving}
                className="hr-input h-12! pl-11"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="hr-btn hr-btn-primary mt-2 h-12! w-full"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              "Create password"
            )}
          </button>
        </form>
      </AuthLayout>
    );
  }

  // ── Sign-up ────────────────────────────────────────────────
  return (
    <AuthLayout
      title="Create your account"
      subtitle={`Use your ${COMPANY_NAME} Google account (name@${COMPANY_EMAIL_DOMAIN}) to get started.`}
      footer="Not a company email? Contact your HR administrator to have an account created for you."
    >
      {/* No role / permission fields here by design — access is assigned by an Admin. */}
      <GoogleAuthSection mode="register" onPending={handlePending} />

      <p className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-primary-700 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;