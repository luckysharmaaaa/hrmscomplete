import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";

const permissions = ["Employee", "Holidays", "Leaves", "Events"];

const AddUserDrawer = ({ open, onClose }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      {/* Overlay */}
      {open && (
        <div onClick={onClose} className="fixed inset-0 bg-black/40 z-40" />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[800px] bg-white z-50 transition-transform duration-300 overflow-y-auto ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-3xl font-bold text-[#0F265C]">Add User</h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {/* Form Grid */}
          <div className="grid grid-cols-2 gap-5">
            {/* First Name */}
            <div>
              <label className="label">
                <span className="label-text font-medium">First Name</span>
              </label>
              <input type="text" className="input input-bordered w-full" />
            </div>

            {/* Last Name */}
            <div>
              <label className="label">
                <span className="label-text font-medium">Last Name</span>
              </label>
              <input type="text" className="input input-bordered w-full" />
            </div>

            {/* User Name */}
            <div>
              <label className="label">
                <span className="label-text font-medium">User Name</span>
              </label>
              <input type="text" className="input input-bordered w-full" />
            </div>

            {/* Email */}
            <div>
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <input type="email" className="input input-bordered w-full" />
            </div>

            {/* Password */}
            <div>
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <VisibilityIcon fontSize="small" />
                  ) : (
                    <VisibilityOffIcon fontSize="small" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="label">
                <span className="label-text font-medium">Confirm Password</span>
              </label>

              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  className="input input-bordered w-full pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? (
                    <VisibilityIcon fontSize="small" />
                  ) : (
                    <VisibilityOffIcon fontSize="small" />
                  )}
                </button>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="label">
                <span className="label-text font-medium">Phone</span>
              </label>
              <input type="text" className="input input-bordered w-full" />
            </div>

            {/* Role */}
            <div>
              <label className="label">
                <span className="label-text font-medium">Role</span>
              </label>

              <select className="select select-bordered w-full">
                <option>Select</option>
                <option>Admin</option>
                <option>Employee</option>
                <option>Client</option>
              </select>
            </div>
          </div>

          {/* Permission Table */}
          <div className="mt-8 border rounded-lg overflow-hidden">
            <table className="table w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th>Module Permissions</th>
                  <th>Read</th>
                  <th>Write</th>
                  <th>Create</th>
                  <th>Delete</th>
                  <th>Import</th>
                  <th>Export</th>
                </tr>
              </thead>

              <tbody>
                {permissions.map((module) => (
                  <tr key={module}>
                    <td>{module}</td>

                    <td>
                      <input type="checkbox" className="checkbox checkbox-sm" />
                    </td>

                    <td>
                      <input type="checkbox" className="checkbox checkbox-sm" />
                    </td>

                    <td>
                      <input type="checkbox" className="checkbox checkbox-sm" />
                    </td>

                    <td>
                      <input type="checkbox" className="checkbox checkbox-sm" />
                    </td>

                    <td>
                      <input type="checkbox" className="checkbox checkbox-sm" />
                    </td>

                    <td>
                      <input type="checkbox" className="checkbox checkbox-sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 mt-8 border-t pt-5">
            <button onClick={onClose} className="btn btn-outline">
              Cancel
            </button>

            <button className="btn bg-orange-500 hover:bg-orange-600 border-none text-white">
              Add User
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddUserDrawer;
