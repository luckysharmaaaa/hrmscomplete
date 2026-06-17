import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";

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

// ── Yup validation schema ─────────────────────────────────────────────────────
const validationSchema = Yup.object({
  firstName: Yup.string()
    .min(2, "First Name must be at least 2 characters")
    .required("First Name is required"),

  lastName: Yup.string()
    .min(2, "Last Name must be at least 2 characters")
    .required("Last Name is required"),

  userName: Yup.string()
    .min(3, "Username must be at least 3 characters")
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers and underscores",
    )
    .required("Username is required"),

  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),

  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .required("Password is required"),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Confirm Password is required"),

  phone: Yup.string()
    .matches(/^[0-9+\-\s()]{7,15}$/, "Enter a valid phone number")
    .required("Phone is required"),

  role: Yup.string()
    .notOneOf(["Select"], "Please select a role")
    .required("Role is required"),
});

// ── Reusable error message component ─────────────────────────────────────────
const FieldError = ({ error, touched }) =>
  touched && error ? (
    <p className="text-red-500 text-xs mt-1">{error}</p>
  ) : null;

// ── Component ─────────────────────────────────────────────────────────────────
const AddUserDrawer = ({ open, onClose }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [permissions, setPermissions] = useState(INITIAL_PERMISSIONS);

  // ── Formik setup ────────────────────────────────────────────────────────────
  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      role: "Select",
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      console.log("Form submitted:", { ...values, permissions });
      resetForm();
      setPermissions(INITIAL_PERMISSIONS);
      onClose();
    },
  });

  // ── Permission helpers ───────────────────────────────────────────────────────
  const handlePermissionChange = (moduleIndex, permissionKey) => {
    setPermissions((prev) =>
      prev.map((mod, i) =>
        i !== moduleIndex
          ? mod
          : {
              ...mod,
              permissions: {
                ...mod.permissions,
                [permissionKey]: !mod.permissions[permissionKey],
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

  // Close + reset on Cancel
  const handleClose = () => {
    formik.resetForm();
    setPermissions(INITIAL_PERMISSIONS);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={handleClose}
          className="fixed inset-0 bg-black/40 z-90"
        />
      )}

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 h-full w-200 bg-white z-100 transition-transform duration-300 overflow-y-auto ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-3xl font-bold text-[#0F265C]">Add User</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body — wrapped in <form> */}
        <form onSubmit={formik.handleSubmit} noValidate>
          <div className="p-5">
            {/* Form Grid */}
            <div className="grid grid-cols-2 gap-5">
              {/* First Name */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">First Name</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Enter first name"
                  className={`input input-bordered w-full ${
                    formik.touched.firstName && formik.errors.firstName
                      ? "border-red-500 focus:border-red-500"
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
                  placeholder="Enter last name"
                  className={`input input-bordered w-full ${
                    formik.touched.lastName && formik.errors.lastName
                      ? "border-red-500 focus:border-red-500"
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
                  <span className="label-text font-medium">User Name</span>
                </label>
                <input
                  type="text"
                  name="userName"
                  placeholder="Enter username"
                  className={`input input-bordered w-full ${
                    formik.touched.userName && formik.errors.userName
                      ? "border-red-500 focus:border-red-500"
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
                  placeholder="Enter email address"
                  className={`input input-bordered w-full ${
                    formik.touched.email && formik.errors.email
                      ? "border-red-500 focus:border-red-500"
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

              {/* Password */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Min. 8 characters"
                    className={`input input-bordered w-full pr-10 ${
                      formik.touched.password && formik.errors.password
                        ? "border-red-500 focus:border-red-500"
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
                    {showPassword ? (
                      <VisibilityIcon fontSize="small" />
                    ) : (
                      <VisibilityOffIcon fontSize="small" />
                    )}
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
                    Confirm Password
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Repeat password"
                    className={`input input-bordered w-full pr-10 ${
                      formik.touched.confirmPassword &&
                      formik.errors.confirmPassword
                        ? "border-red-500 focus:border-red-500"
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
                    {showConfirm ? (
                      <VisibilityIcon fontSize="small" />
                    ) : (
                      <VisibilityOffIcon fontSize="small" />
                    )}
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
                      ? "border-red-500 focus:border-red-500"
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
                      ? "border-red-500 focus:border-red-500"
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

            {/* ── Module Permissions Table ───────────────────────────── */}
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

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 mt-8 border-t pt-5">
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn bg-orange-500 hover:bg-orange-600 border-none text-white"
              >
                Add User
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddUserDrawer;
