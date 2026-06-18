import React, { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";

const AddRoles = ({open,onClose,onAddRole,editRole,}) => {
  const [roleData, setRoleData] = useState({
    roleName: "",
    status: "Active",
  });

  const [errors, setErrors] = useState({});

  // Fill data when editing
  useEffect(() => {
    if (editRole) {
      setRoleData({
        roleName: editRole.role,
        status: editRole.status,
      });
    } else {
      setRoleData({
        roleName: "",
        status: "Active",
      });
    }
  }, [editRole, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setRoleData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Remove error while typing
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validate = () => {
    let newErrors = {};

    if (!roleData.roleName.trim()) {
      newErrors.roleName =
        "Role name is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const newRole = {
      id: editRole
        ? editRole.id
        : Date.now(),
      role: roleData.roleName,
      date: new Date().toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      ),
      status: roleData.status,
    };

    onAddRole(newRole);

    // Reset form
    setRoleData({
      roleName: "",
      status: "Active",
    });

    setErrors({});

    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-40"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-125 bg-white z-50 transition-transform duration-300 overflow-y-auto shadow-lg ${
          open
            ? "translate-x-0"
            : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-3xl font-bold text-[#0F265C]">
            {editRole
              ? "Edit Role"
              : "Add Role"}
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="space-y-5">
            {/* Role Name */}
            <div>
              <label className="block font-medium mb-2">
                Role Name
              </label>

              <input
                type="text"
                name="roleName"
                value={roleData.roleName}
                onChange={handleChange}
                placeholder="Enter role name"
                className={`input input-bordered w-full ${
                  errors.roleName
                    ? "border-red-500"
                    : ""
                }`}
              />

              {errors.roleName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.roleName}
                </p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block font-medium mb-2">
                Status
              </label>

              <select
                name="status"
                value={roleData.status}
                onChange={handleChange}
                className="select select-bordered w-full"
              >
                <option value="Active">
                  Active
                </option>
                <option value="Inactive">
                  Inactive
                </option>
              </select>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 mt-10 border-t pt-5">
            <button
              onClick={onClose}
              className="btn btn-outline"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              className="btn bg-orange-500 hover:bg-orange-600 border-none text-white"
            >
              {editRole
                ? "Update Role"
                : "Add Role"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddRoles;