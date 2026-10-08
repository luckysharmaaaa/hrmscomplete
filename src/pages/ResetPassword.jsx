import { useMemo, useState } from 'react';import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import AuthLayout from "../components/auth/Authlayout";
import { resetPassword } from "../services/loginAPI";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = useMemo(
    () => searchParams.get("token") || "",
    [searchParams]
  );

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("This password reset link is invalid.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await resetPassword(token, password);

      setSuccess(true);

      toast.success("Password reset successfully.");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error?.message ||
        "This reset link is invalid or expired.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // ── Success state ──────────────────────────────────────────
  if (success) {
    return (
      <AuthLayout
        icon={
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-50">
            <CheckCircle2 size={28} className="text-success-600" />
          </div>
        }
        title="Password updated"
        subtitle="Your password has been changed successfully. You can now sign in using your new password."
      >
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="hr-btn hr-btn-primary h-12! w-full"
        >
          Continue to sign in
        </button>
      </AuthLayout>
    );
  }

  // ── Reset form ─────────────────────────────────────────────
  return (
    <AuthLayout
      title="Create new password"
      subtitle="Choose a strong password for your account."
      footer={
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-primary-700"
        >
          <ArrowLeft size={16} />
          Back to sign in
        </button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* PASSWORD */}
        <div>
          <label htmlFor="new-password" className="hr-label">
            New password
          </label>

          <div className="relative">
            <Lock
              size={18}
              strokeWidth={1.8}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-disabled"
            />

            <input
              id="new-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              disabled={loading}
              autoComplete="new-password"
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
            Use at least 8 characters.
          </p>
        </div>

        {/* CONFIRM */}
        <div>
          <label htmlFor="confirm-password" className="hr-label">
            Confirm password
          </label>

          <div className="relative">
            <Lock
              size={18}
              strokeWidth={1.8}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-disabled"
            />

            <input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              disabled={loading}
              autoComplete="new-password"
              className="hr-input h-12! pl-11 pr-12"
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-primary-50 hover:text-primary-700"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="hr-btn hr-btn-primary mt-2 h-12! w-full"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Updating password...
            </>
          ) : (
            "Reset password"
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;