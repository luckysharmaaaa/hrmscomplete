import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

// ── Constants ─────────────────────────────────────────────────────────────────
const PERMISSION_KEYS = [
  "read",
  "write",
  "create",
  "delete",
  "import",
  "export",
];

const INITIAL_PERMISSIONS = ["Employee", "Holidays", "Leaves", "Events"].map(
  (module) => ({
    module,
    permissions: Object.fromEntries(PERMISSION_KEYS.map((k) => [k, false])),
  }),
);

// ── Yup schema — password is optional on edit ─────────────────────────────────
const validationSchema = Yup.object({
  firstName: Yup.string()
    .min(2, "First Name must be at least 2 characters")
    .required("First Name is required"),

  lastName: Yup.string()
    .min(2, "Last Name must be at least 2 characters")
    .required("Last Name is required"),

  userName: Yup.string()
    .min(3, "Username must be at least 3 characters")
    .matches(/^[a-zA-Z0-9_]+$/, "Only letters, numbers and underscores")
    .required("Username is required"),

  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),

  // Password optional — validate only if user types something
  password: Yup.string().test(
    "password-strength",
    "Password must be at least 8 chars, include an uppercase letter and a number",
    (value) => {
      if (!value) return true; // blank = OK (keeping existing password)
      return value.length >= 8 && /[A-Z]/.test(value) && /[0-9]/.test(value);
    },
  ),

  confirmPassword: Yup.string().when("password", {
    is: (val) => val && val.length > 0,
    then: (schema) =>
      schema
        .oneOf([Yup.ref("password")], "Passwords do not match")
        .required("Please confirm your new password"),
    otherwise: (schema) => schema.notRequired(),
  }),

  phone: Yup.string()
    .matches(/^[0-9+\-\s()]{7,15}$/, "Enter a valid phone number")
    .required("Phone is required"),

  role: Yup.string()
    .notOneOf(["Select"], "Please select a role")
    .required("Role is required"),
});

// ── Tiny reusable error label ────────────────────────────────────────────────
const FieldError = ({ error, touched }) =>
  touched && error ? (
    <p className="text-red-500 text-xs mt-1">{error}</p>
  ) : null;

// ── Component ─────────────────────────────────────────────────────────────────
const EditUserModal = ({ isOpen, onClose, editUser, onSave }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [permissions, setPermissions] = useState(INITIAL_PERMISSIONS);

  // ── Formik ──────────────────────────────────────────────────────────────────
  const formik = useFormik({
    enableReinitialize: true, // repopulate when editUser changes
    initialValues: {
      firstName: editUser?.name?.split(" ")[0] ?? "",
      lastName: editUser?.name?.split(" ")[1] ?? "",
      userName: editUser?.email?.split("@")[0] ?? "",
      email: editUser?.email ?? "",
      password: "",
      confirmPassword: "",
      phone: editUser?.phone ?? "",
      role: editUser?.role ?? "Select",
    },
    validationSchema,
    onSubmit: (values) => {
      const updatedFields = {
        name: `${values.firstName} ${values.lastName}`.trim(),
        email: values.email,
        phone: values.phone,
        role: values.role,
      };
      onSave(updatedFields);
    },
  });

  // Reset password visibility when modal closes/opens
  useEffect(() => {
    if (!isOpen) {
      setShowPassword(false);
      setShowConfirm(false);
      setPermissions(INITIAL_PERMISSIONS);
    }
  }, [isOpen]);

  // ── Permission helpers ───────────────────────────────────────────────────────
  const handlePermissionChange = (moduleIndex, key) => {
    setPermissions((prev) =>
      prev.map((mod, i) =>
        i !== moduleIndex
          ? mod
          : {
              ...mod,
              permissions: {
                ...mod.permissions,
                [key]: !mod.permissions[key],
              },
            },
      ),
    );
  };

  const handleSelectAll = (moduleIndex) => {
    setPermissions((prev) =>
      prev.map((mod, i) => {
        if (i !== moduleIndex) return mod;
        const allChecked = Object.values(mod.permissions).every(Boolean);
        return {
          ...mod,
          permissions: Object.fromEntries(
            PERMISSION_KEYS.map((k) => [k, !allChecked]),
          ),
        };
      }),
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">Edit User</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-xl"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <form
          onSubmit={formik.handleSubmit}
          noValidate
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="overflow-y-auto flex-1 p-6">
            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">First Name</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  className={`input input-bordered w-full ${
                    formik.touched.firstName && formik.errors.firstName
                      ? "border-red-500"
                      : ""
                  }`}
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <FieldError
                  error={formik.errors.firstName}
                  touched={formik.touched.firstName}
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">Last Name</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  className={`input input-bordered w-full ${
                    formik.touched.lastName && formik.errors.lastName
                      ? "border-red-500"
                      : ""
                  }`}
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <FieldError
                  error={formik.errors.lastName}
                  touched={formik.touched.lastName}
                />
              </div>

              {/* Username */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">Username</span>
                </label>
                <input
                  type="text"
                  name="userName"
                  className={`input input-bordered w-full ${
                    formik.touched.userName && formik.errors.userName
                      ? "border-red-500"
                      : ""
                  }`}
                  value={formik.values.userName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <FieldError
                  error={formik.errors.userName}
                  touched={formik.touched.userName}
                />
              </div>

              {/* Email */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">Email</span>
                </label>
                <input
                  type="email"
                  name="email"
                  className={`input input-bordered w-full ${
                    formik.touched.email && formik.errors.email
                      ? "border-red-500"
                      : ""
                  }`}
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <FieldError
                  error={formik.errors.email}
                  touched={formik.touched.email}
                />
              </div>

              {/* Password (optional) */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    New Password{" "}
                    <span className="text-gray-400 font-normal text-xs">
                      (leave blank to keep current)
                    </span>
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Leave blank to keep current"
                    className={`input input-bordered w-full pr-10 ${
                      formik.touched.password && formik.errors.password
                        ? "border-red-500"
                        : ""
                    }`}
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
                <FieldError
                  error={formik.errors.password}
                  touched={formik.touched.password}
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    Confirm New Password
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Repeat new password"
                    className={`input input-bordered w-full pr-10 ${
                      formik.touched.confirmPassword &&
                      formik.errors.confirmPassword
                        ? "border-red-500"
                        : ""
                    }`}
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? "🙈" : "👁"}
                  </button>
                </div>
                <FieldError
                  error={formik.errors.confirmPassword}
                  touched={formik.touched.confirmPassword}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">Phone</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  placeholder="Enter phone number"
                  className={`input input-bordered w-full ${
                    formik.touched.phone && formik.errors.phone
                      ? "border-red-500"
                      : ""
                  }`}
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <FieldError
                  error={formik.errors.phone}
                  touched={formik.touched.phone}
                />
              </div>

              {/* Role */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">Role</span>
                </label>
                <select
                  name="role"
                  className={`select select-bordered w-full ${
                    formik.touched.role && formik.errors.role
                      ? "border-red-500"
                      : ""
                  }`}
                  value={formik.values.role}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="Select">Select</option>
                  <option value="Admin">Admin</option>
                  <option value="Employee">Employee</option>
                  <option value="Client">Client</option>
                </select>
                <FieldError
                  error={formik.errors.role}
                  touched={formik.touched.role}
                />
              </div>
            </div>

            {/* ── Permissions Table ──────────────────────────────────────── */}
            <div className="mt-6 border rounded-lg overflow-hidden">
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
                    <th>All</th>
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((mod, moduleIndex) => (
                    <tr key={mod.module} className="hover:bg-gray-50">
                      <td className="font-medium text-gray-700">
                        {mod.module}
                      </td>

                      {PERMISSION_KEYS.map((key) => (
                        <td key={key}>
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                            checked={mod.permissions[key]}
                            onChange={() =>
                              handlePermissionChange(moduleIndex, key)
                            }
                          />
                        </td>
                      ))}

                      <td>
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm checkbox-warning"
                          checked={Object.values(mod.permissions).every(
                            Boolean,
                          )}
                          onChange={() => handleSelectAll(moduleIndex)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t shrink-0">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn bg-orange-500 hover:bg-orange-600 border-none text-white"
            >
              Update User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
