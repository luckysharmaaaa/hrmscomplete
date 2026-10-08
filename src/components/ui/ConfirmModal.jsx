import { useEffect } from 'react';import { createPortal } from "react-dom";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";


export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  children,
  confirmLabel = "Delete",
  loadingLabel = "Deleting...",
  cancelLabel = "Cancel",
  loading = false,
  icon: Icon = AlertTriangle,
  confirmIcon: ConfirmIcon = Trash2,
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape" && !loading) onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, loading, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-primary-900/40"
        onClick={loading ? undefined : onClose}
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-lg bg-surface shadow-lg">
        <div className="h-[3px] bg-gradient-brand" />

        <div className="px-6 pb-2 pt-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-danger-50 text-danger-500">
            <Icon size={26} />
          </div>

          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>

          <div className="mt-2 text-sm leading-6 text-text-secondary">{children}</div>
        </div>

        <div className="flex gap-3 px-6 pb-6 pt-4">
          <button
            type="button"
            className="hr-btn hr-btn-outline flex-1"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            className="hr-btn hr-btn-danger flex-1"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ConfirmIcon size={16} />}
            {loading ? loadingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}