import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const WIDTHS = {
  md: "sm:max-w-[480px]", // simple forms (Modules, Roles, Department ...)
  lg: "sm:max-w-[680px]", // long / two-column forms (Users, Employees ...)
};

/**
 * SideDrawer — every add/edit form in the app opens in this.
 *
 * - Slides in from the RIGHT, full height, above navbar + sidebar
 * - Header is h-18 (72px) = exactly the navbar height
 * - Footer is min-h-18 (72px), buttons right-aligned
 * - X button, Esc and backdrop click close it, page scroll is locked while open
 *
 * Put your <form id="x"> in children and a submit button with form="x" in `footer`.
 */
export default function SideDrawer({
  open,
  onClose,
  title,
  subtitle,
  icon: Icon,
  size = "md",
  children,
  footer,
}) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  // mount -> next tick slide in / slide out -> unmount after animation
  useEffect(() => {
    if (open) {
      setMounted(true);
      const t = setTimeout(() => setVisible(true), 20);
      return () => clearTimeout(t);
    }

    setVisible(false);
    const t = setTimeout(() => setMounted(false), 300);
    return () => clearTimeout(t);
  }, [open]);

  // Esc to close + lock body scroll while mounted
  useEffect(() => {
    if (!mounted) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [mounted, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label={title}>
      {/* Backdrop */}
      <div
        onClick={() => onClose?.()}
        aria-hidden="true"
        className={`absolute inset-0 bg-primary-900/40 transition-opacity duration-300 ease-standard ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Panel */}
      <aside
        className={`absolute right-0 top-0 flex h-full w-full ${WIDTHS[size] || WIDTHS.md} flex-col bg-surface shadow-lg transition-transform duration-300 ease-standard ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header — same 72px height as the navbar */}
        <div className="flex h-18 shrink-0 items-center justify-between gap-3 border-b border-border-subtle px-5">
          <div className="flex min-w-0 items-center gap-3">
            {Icon && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
                <Icon size={20} />
              </div>
            )}
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold leading-tight text-primary-700">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-0.5 truncate text-xs text-text-secondary">{subtitle}</p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onClose?.()}
            className="hr-icon-btn shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            aria-label="Close"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Brand accent line (same as sidebar header) */}
        <div className="h-[3px] shrink-0 bg-gradient-brand" />

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex min-h-18 shrink-0 items-center justify-end gap-3 border-t border-border-subtle bg-surface px-5 py-3">
            {footer}
          </div>
        )}
      </aside>
    </div>,
    document.body
  );
}