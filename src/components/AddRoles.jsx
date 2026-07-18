import React, { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { BadgeCheck } from "lucide-react";

import RolePermissionTable from "./RolePermissionTable";

const AddRoles = ({
  open,
  onClose,
  onAddRole,
  editRole,
}) => {

  // ===========================================
  // Role Form
  // ===========================================

  const [roleData, setRoleData] = useState({

    roleName: "",

    roleCode: "",

    description: "",

    status: "Active",

  });

  // ===========================================
  // Permission States
  // ===========================================

  const [selectedModules, setSelectedModules] =
    useState([]);

  const [permissions, setPermissions] =
    useState([]);

  // ===========================================
  // Validation
  // ===========================================

  const [errors, setErrors] = useState({});

  // ===========================================
  // Edit Mode
  // ===========================================

  useEffect(() => {

    if (editRole) {

      setRoleData({

        roleName:
          editRole.roleName || "",

        roleCode:
          editRole.roleCode || "",

        description:
          editRole.description || "",

        status:
          editRole.status || "Active",

      });

    }

    else {

      setRoleData({

        roleName: "",

        roleCode: "",

        description: "",

        status: "Active",

      });

      setSelectedModules([]);

      setPermissions([]);

    }

  }, [editRole, open]);
  // ===========================================
  // Input Change
  // ===========================================

  const handleChange = (e) => {

    const { name, value } = e.target;

    setRoleData((prev) => ({

      ...prev,

      [name]: value,

    }));

    setErrors((prev) => ({

      ...prev,

      [name]: "",

    }));

  };

  // ===========================================
  // Validation
  // ===========================================

  const validate = () => {

    const newErrors = {};

    if (!roleData.roleName.trim()) {

      newErrors.roleName =
        "Role Name is required";

    }

    if (!roleData.roleCode.trim()) {

      newErrors.roleCode =
        "Role Code is required";

    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;

  };

  // ===========================================
  // Save Role
  // ===========================================

  const handleSubmit = () => {

    if (!validate()) {

      return;

    }

    onAddRole({

      roleName: roleData.roleName,

      roleCode: roleData.roleCode,

      description: roleData.description,

      status: roleData.status,

      // -----------------------------
      // Selected Modules
      // -----------------------------

      selectedModules,

      // -----------------------------
      // Permissions
      // -----------------------------

      permissions,

    });

    setRoleData({

      roleName: "",

      roleCode: "",

      description: "",

      status: "Active",

    });

    setSelectedModules([]);

    setPermissions([]);

    setErrors({});

    onClose();

  };
  // ===========================================
  // JSX
  // ===========================================

  return (
    <>
      {/* Overlay */}

      {open && (
        <div
          className="fixed inset-0 bg-black/40 h-screen z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}

      <div
        className={`fixed top-0 right-0 h-screen w-[90vw] max-w-350 bg-white z-90 shadow-2xl flex flex-col overflow-hidden transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* ====================================== */}
        {/* Header */}
        {/* ====================================== */}

        <div className="flex items-center justify-between px-6 py-5 border-b bg-white">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">

              <BadgeCheck
                size={24}
                className="text-orange-500"
              />

            </div>

            <div>

              <h2 className="text-2xl font-bold text-[#0F265C]">

                {editRole
                  ? "Edit Role"
                  : "Add Role"}

              </h2>

              <p className="text-sm text-gray-500">

                {editRole
                  ? "Update role information & permissions"
                  : "Create a new role"}

              </p>

            </div>

          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <CloseIcon />
          </button>

        </div>

        {/* ====================================== */}
        {/* Body */}
        {/* ====================================== */}

        <div className="flex-1 overflow-auto">

          {/* Role Information */}

          <div className="p-6">

            {/* <h3 className="text-lg font-semibold text-[#0F265C] mb-6">

              Role 

            </h3> */}

            <div className="grid grid-cols-2 gap-6">

              {/* Role Name */}

              <div>

                <label className="block text-sm font-semibold mb-2">

                  Role Name

                  <span className="text-red-500 ml-1">*</span>

                </label>

                <input
                  type="text"
                  name="roleName"
                  value={roleData.roleName}
                  onChange={handleChange}
                  placeholder="Enter Role Name"
                  className={`input input-bordered w-full ${errors.roleName
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

              {/* Role Code */}

              <div>

                <label className="block text-sm font-semibold mb-2">

                  Role Code

                  <span className="text-red-500 ml-1">*</span>

                </label>

                <input
                  type="text"
                  name="roleCode"
                  value={roleData.roleCode}
                  onChange={handleChange}
                  placeholder="Enter Role Code"
                  className={`input input-bordered w-full ${errors.roleCode
                    ? "border-red-500"
                    : ""
                    }`}
                />

                {errors.roleCode && (

                  <p className="text-red-500 text-sm mt-1">

                    {errors.roleCode}

                  </p>

                )}

              </div>

              {/* Description */}

              <div className="col-span-2">

                <label className="block text-sm font-semibold mb-2">

                  Description

                </label>

                <input
                  type="text"
                  name="description"
                  value={roleData.description}
                  onChange={handleChange}
                  placeholder="Enter Description"
                  className="input input-bordered w-full"
                />

              </div>

              {/* Status */}

              {/* <div>

                <label className="block text-sm font-semibold mb-2">

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

              </div> */}

            </div>

          </div>

          <hr />
          {/* ====================================== */}
          {/* Role Permissions */}
          {/* ====================================== */}

          <div className="p-6">

            <div className="flex items-center justify-between mb-5">

              <h3 className="text-lg font-semibold text-[#0F265C]">

                Role Permissions

              </h3>

              <span className="text-sm text-gray-500">

                Select Modules & Permissions

              </span>

            </div>

            <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">

              <RolePermissionTable

                role={editRole}

                // Selected Modules
                selectedModules={selectedModules}

                setSelectedModules={setSelectedModules}

                // Permissions
                permissions={permissions}

                setPermissions={setPermissions}

              />

            </div>

          </div>

        </div>

        {/* ====================================== */}
        {/* Footer */}
        {/* ====================================== */}

        {/* Footer */}

        <div className="border-t border-gray-200 bg-white px-6   py-4 flex items-center justify-between">

          <div className="flex items-center gap-3 z-80">
            <label className="text-sm font-semibold">Status</label>

            <button
              type="button"
              onClick={() =>
                setRoleData((prev) => ({
                  ...prev,
                  status: prev.status === "Active" ? "Inactive" : "Active",
                }))
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${roleData.status === "Active"
                  ? "bg-orange-500"
                  : "bg-gray-300"
                }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${roleData.status === "Active"
                    ? "translate-x-5"
                    : "translate-x-1"
                  }`}
              />
            </button>

            <span
              className={`text-sm font-medium ${roleData.status === "Active"
                  ? "text-orange-600"
                  : "text-gray-500"
                }`}
            >
              {roleData.status}
            </span>
          </div>



          <div className="flex gap-3">

            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              className="px-5 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white"
            >
              {editRole ? "Update Role" : "Save Role"}
            </button>

          </div>

        </div>

      </div>

    </>
  );


};

export default AddRoles;