import React, { useState } from "react";
import ConfirmModal from "../ui/ConfirmModal";

export default function DeleteModal({ open, item, onClose, onConfirm }) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!item) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(item.id);
      onClose();
    } catch (error) {
      console.error("Delete failed:", error);
      // Keep the modal open on failure so the user knows it didn't work.
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ConfirmModal
      open={open}
      title="Delete Employee?"
      confirmLabel="Yes, Delete"
      loadingLabel="Deleting..."
      loading={isDeleting}
      onClose={onClose}
      onConfirm={handleConfirm}
    >
      You want to delete the employee record for{" "}
      <span className="font-semibold text-text-primary">{item.name}</span>. This can't be
      undone.
    </ConfirmModal>
  );
}