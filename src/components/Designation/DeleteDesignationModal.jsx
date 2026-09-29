import React from "react";
import ConfirmModal from "../ui/ConfirmModal";

export default function DeleteDesignationModal({ open, item, onClose, onConfirm }) {
  if (!item) return null;

  return (
    <ConfirmModal
      open={open}
      title="Delete Designation"
      confirmLabel="Delete"
      onClose={onClose}
      onConfirm={() => onConfirm(item.id)}
    >
      Are you sure you want to delete{" "}
      <span className="font-semibold text-text-primary">"{item.designationName}"</span>?
      This action cannot be undone.
    </ConfirmModal>
  );
}