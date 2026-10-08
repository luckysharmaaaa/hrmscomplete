import ConfirmModal from "../ui/ConfirmModal";

const DeleteUserModal = ({
  isOpen,
  deleteTarget,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  const userName = deleteTarget?.name || "this user";

  return (
    <ConfirmModal
      open={isOpen}
      title="Delete User"
      confirmLabel="Delete User"
      loadingLabel="Deleting..."
      loading={isDeleting}
      onClose={onClose}
      onConfirm={onConfirm}
    >
      <p>
        Are you sure you want to delete{" "}
        <span className="font-semibold text-text-primary">{userName}</span>?
      </p>
      <p className="mt-1 text-xs">The user will be removed from the active user list.</p>
    </ConfirmModal>
  );
};

export default DeleteUserModal;