import ConfirmModal from "../ui/ConfirmModal";

export default function DeleteDepartmentModal({ open, item, loading = false, onClose, onConfirm }) {
  if (!item) return null;

  return (
    <ConfirmModal
      open={open}
      title="Delete department?"
      confirmLabel="Delete"
      loadingLabel="Deleting..."
      loading={loading}
      onClose={onClose}
      onConfirm={() => onConfirm(item.id)}
    >
      Are you sure you want to delete{" "}
      <span className="font-semibold text-text-primary">"{item.name}"</span>? This action cannot be
      undone.
    </ConfirmModal>
  );
}