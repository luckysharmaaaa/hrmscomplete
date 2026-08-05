import React from "react";
import { FiTrash2 } from "react-icons/fi";

const DeleteUserModal = ({ isOpen, deleteTarget, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <dialog id="delete_modal" className="modal modal-open">
      <div className="modal-box max-w-md rounded-xl p-0 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-800">Delete User</h3>
          <button
            className="btn btn-ghost btn-xs btn-circle text-gray-400 hover:text-gray-700"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-5 py-5 text-center">
          <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
            <FiTrash2 size={24} className="text-red-500" />
          </div>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-900">
              {deleteTarget?.name}
            </span>
            ? This action cannot be undone.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="flex gap-3 px-5 pb-5">
          <button
            className="btn btn-outline flex-1 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="btn flex-1 bg-red-500 hover:bg-red-600 border-none text-white"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Backdrop */}
      <div className="modal-backdrop" onClick={onClose} />
    </dialog>
  );
};

export default DeleteUserModal;
