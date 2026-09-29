import React from "react";
import ConfirmModal from "../ui/ConfirmModal";

export default function DeleteDepartmentModal({ open, item, onClose, onConfirm }) {
  if (!item) return null;

  return (
    <ConfirmModal
      open={open}
      title="Delete Department"
      confirmLabel="Delete"
      onClose={onClose}
      onConfirm={() => onConfirm(item.id)}
    >
      Are you sure you want to delete{" "}
      <span className="font-semibold text-text-primary">"{item.name}"</span>? This action
      cannot be undone.
    </ConfirmModal>
  );
}