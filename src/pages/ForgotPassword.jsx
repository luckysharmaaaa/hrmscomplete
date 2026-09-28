import React, { useState } from "react";
import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// import AuthLayout from "../components/auth/Authlayout.jsx";
import AuthLayout from "../components/auth/Authlayout";

import { forgotPassword } from "../services/loginAPI";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      setLoading(true);

      await forgotPassword(email);

      setSubmitted(true);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error?.message ||
        "Unable to process your request. Please try again.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // ── Success state ──────────────────────────────────────────
  if (submitted) {
    return (
      <AuthLayout
        icon={
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-50">
            <CheckCircle2 size={28} className="text-success-600" />
          </div>
        }
        title="Check your email"
        subtitle={
          <>
            If an account exists for{" "}
            <span className="font-medium text-text-primary">{email}</span>, you
            will receive a password reset link shortly.
          </>
        }
      >
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

  // ── Request form ───────────────────────────────────────────
  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="Enter the email address associated with your account and we'll send you a link to reset your password."
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
        <div>
          <label htmlFor="forgot-email" className="hr-label">
            Email address
          </label>

          <div className="relative">
            <Mail
              size={18}
              strokeWidth={1.8}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-disabled"
            />

            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              disabled={loading}
              className="hr-input h-12! pl-11"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="hr-btn hr-btn-primary h-12! w-full"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Sending...
            </>
          ) : (
            "Send reset link"
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;