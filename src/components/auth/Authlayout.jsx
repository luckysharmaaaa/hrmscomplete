import React from "react";

import logo from "../../assets/images/logo.png";
import loginBg from "../../assets/images/Login_bg.png";
import { COMPANY_NAME } from "../../config/company";

/**
 * AuthLayout — one layout for every signed-out page
 * (Login, Forgot password, Reset password, First-time access).
 *
 * LEFT  : image only
 * RIGHT : white panel, everything centred — logo, optional icon, title,
 *         subtitle, form (children), optional footer note, copyright bar.
 *
 * <AuthLayout title="Welcome back" subtitle="Sign in to your account."
 *             footer="Having trouble? Contact your HR administrator.">
 *   ...form...
 * </AuthLayout>
 */
export default function AuthLayout({ title, subtitle, icon, children, footer }) {
  return (
    <div className="flex min-h-screen w-full bg-surface">
      {/* LEFT — image only */}
      <div className="relative hidden lg:block lg:w-1/2">
        <img
          src={loginBg}
          alt={COMPANY_NAME}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      {/* RIGHT — centred content */}
      <div className="flex min-h-screen w-full flex-col lg:w-1/2">
        {/* Brand accent line */}
        <div className="h-[3px] w-full shrink-0 bg-gradient-brand" />

        <main className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-[400px]">
            {/* Logo */}
            <div className="mb-10 flex justify-center">
              <img
                src={logo}
                alt={COMPANY_NAME}
                className="h-auto max-h-14 w-auto max-w-[180px] object-contain"
              />
            </div>

            {/* Optional icon (success states) */}
            {icon && <div className="mb-5 flex justify-center">{icon}</div>}

            {/* Heading */}
            <div className="mb-8 text-center">
              <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-primary-700">
                {title}
              </h1>

              {subtitle && (
                <p className="mt-2.5 text-sm leading-6 text-text-secondary">{subtitle}</p>
              )}
            </div>

            {/* Form / content */}
            {children}

            {/* Optional footer note */}
            {footer && (
              <div className="mt-8 border-t border-border-subtle pt-5 text-center text-xs leading-5 text-text-secondary">
                {footer}
              </div>
            )}
          </div>
        </main>

        {/* Copyright bar */}
        <footer className="shrink-0 border-t border-border-subtle px-6 py-5 text-center">
          <p className="text-xs text-text-secondary">
            © {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}