import React from "react";

const EditUserModal = ({ isOpen, onClose, editUser }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Edit User</h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-xl"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label className="label">
                <span className="label-text">First Name</span>
              </label>

              <input
                type="text"
                className="input input-bordered w-full"
                defaultValue={editUser?.name?.split(" ")[0] || ""}
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="label">
                <span className="label-text">Last Name</span>
              </label>

              <input
                type="text"
                className="input input-bordered w-full"
                defaultValue={editUser?.name?.split(" ")[1] || ""}
              />
            </div>

            {/* Username */}
            <div>
              <label className="label">
                <span className="label-text">Username</span>
              </label>

              <input
                type="text"
                className="input input-bordered w-full"
                defaultValue={editUser?.email?.split("@")[0] || ""}
              />
            </div>

            {/* Email */}
            <div>
              <label className="label">
                <span className="label-text">Email</span>
              </label>

              <input
                type="email"
                className="input input-bordered w-full"
                defaultValue={editUser?.email || ""}
              />
            </div>

            {/* Password */}
            <div>
              <label className="label">
                <span className="label-text">Password</span>
              </label>

              <input type="password" className="input input-bordered w-full" />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="label">
                <span className="label-text">Confirm Password</span>
              </label>

              <input type="password" className="input input-bordered w-full" />
            </div>

            {/* Phone */}
            <div>
              <label className="label">
                <span className="label-text">Phone</span>
              </label>

              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Enter phone number"
              />
            </div>

            {/* Role */}
            <div>
              <label className="label">
                <span className="label-text">Role</span>
              </label>

              <select className="select select-bordered w-full">
                <option>Employee</option>
                <option>Client</option>
              </select>
            </div>
          </div>

          {/* Permissions */}
          <div className="overflow-x-auto mt-6">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Module</th>
                  <th>Read</th>
                  <th>Write</th>
                  <th>Create</th>
                  <th>Delete</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>Employee</td>
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

                <tr>
                  <td>Leaves</td>
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

                <tr>
                  <td>Holidays</td>
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
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t">
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>

          <button className="btn bg-orange-500 hover:bg-orange-600 border-none text-white">
            Update User
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
