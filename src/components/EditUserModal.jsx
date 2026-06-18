import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
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

  password: Yup.string().test(
    "password-strength",
    "Password must be at least 8 chars, include an uppercase letter and a number",
    (value) => {
      if (!value) return true;
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

// ── Field Error ───────────────────────────────────────────────────────────────
const FieldError = ({ error, touched }) =>
  touched && error ? (
    <p className="text-red-500 text-xs mt-1">{error}</p>
  ) : null;

// ── Field Label ───────────────────────────────────────────────────────────────
const FieldLabel = ({ children }) => (
  <label className="block text-sm font-medium text-gray-700 mb-1">
    {children}
  </label>
);

// ── Input Class helper ────────────────────────────────────────────────────────
const inputCls = (hasError) =>
  `w-full px-3 py-2 text-sm border rounded-md outline-none transition-colors bg-white text-gray-900 placeholder-gray-400
   ${hasError ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-orange-400"}`;

// ── Component ─────────────────────────────────────────────────────────────────
const EditUserModal = ({ isOpen, onClose, editUser, onSave }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [permissions, setPermissions] = useState(INITIAL_PERMISSIONS);
  const [visible, setVisible] = useState(false);

  // Slide animation
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setVisible(true), 10);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  // ── Formik ────────────────────────────────────────────────────────────────
  const formik = useFormik({
    enableReinitialize: true,
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
      onSave({
        name: `${values.firstName} ${values.lastName}`.trim(),
        email: values.email,
        phone: values.phone,
        role: values.role,
      });
    },
  });

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setShowPassword(false);
      setShowConfirm(false);
      setPermissions(INITIAL_PERMISSIONS);
    }
  }, [isOpen]);

  // ── Permission helpers ────────────────────────────────────────────────────
  const handlePermissionChange = (moduleIndex, key) => {
    setPermissions((prev) =>
      prev.map((mod, i) =>
        i !== moduleIndex
          ? mod
          : {
              ...mod,
              permissions: { ...mod.permissions, [key]: !mod.permissions[key] },
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

  if (!isOpen && !visible) return null;

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 z-[999] transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
      />

      {/* ── Sidebar Drawer ── */}
      <div
        className={`fixed top-0 right-0 h-screen w-[720px] max-w-[95vw] bg-white z-[1000] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${visible ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900 leading-tight">
              Edit User
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Update user information and permissions
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all text-base cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* ── Scrollable Form ── */}
        <form
          onSubmit={formik.handleSubmit}
          noValidate
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="overflow-y-auto flex-1 px-6 py-5">
            {/* ── 2-column grid ── */}
            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <FieldLabel>First Name</FieldLabel>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Enter first name"
                  className={inputCls(
                    formik.touched.firstName && formik.errors.firstName,
                  )}
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
                <FieldLabel>Last Name</FieldLabel>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Enter last name"
                  className={inputCls(
                    formik.touched.lastName && formik.errors.lastName,
                  )}
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
                <FieldLabel>User Name</FieldLabel>
                <input
                  type="text"
                  name="userName"
                  placeholder="Enter username"
                  className={inputCls(
                    formik.touched.userName && formik.errors.userName,
                  )}
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
                <FieldLabel>Email</FieldLabel>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  className={inputCls(
                    formik.touched.email && formik.errors.email,
                  )}
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
                <FieldLabel>
                  Password{" "}
                  <span className="text-gray-400 font-normal text-[11px]">
                    (leave blank to keep)
                  </span>
                </FieldLabel>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Min. 8 characters"
                    className={`${inputCls(formik.touched.password && formik.errors.password)} pr-10`}
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm cursor-pointer"
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
                <FieldLabel>Confirm Password</FieldLabel>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Repeat password"
                    className={`${inputCls(formik.touched.confirmPassword && formik.errors.confirmPassword)} pr-10`}
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm cursor-pointer"
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
                <FieldLabel>Phone</FieldLabel>
                <input
                  type="text"
                  name="phone"
                  placeholder="Enter phone number"
                  className={inputCls(
                    formik.touched.phone && formik.errors.phone,
                  )}
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
                <FieldLabel>Role</FieldLabel>
                <select
                  name="role"
                  className={`${inputCls(formik.touched.role && formik.errors.role)} cursor-pointer`}
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

            {/* ── Divider ── */}
            <hr className="my-5 border-gray-200" />

            {/* ── Permissions Table ── */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Module Permissions
              </p>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2.5 text-gray-700 font-semibold border-b border-gray-200">
                        Module
                      </th>
                      <th className="text-center px-2 py-2.5 text-gray-700 font-semibold border-b border-gray-200">
                        All
                      </th>
                      {PERMISSION_KEYS.map((k) => (
                        <th
                          key={k}
                          className="text-center px-2 py-2.5 text-gray-700 font-semibold border-b border-gray-200 capitalize"
                        >
                          {k.charAt(0).toUpperCase() + k.slice(1)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.map((mod, moduleIndex) => (
                      <tr
                        key={mod.module}
                        className={`hover:bg-gray-50 transition-colors ${moduleIndex < permissions.length - 1 ? "border-b border-gray-100" : ""}`}
                      >
                        <td className="px-3 py-2.5 font-medium text-gray-700">
                          {mod.module}
                        </td>
                        <td className="text-center px-2 py-2.5">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm checkbox-warning"
                            checked={Object.values(mod.permissions).every(
                              Boolean,
                            )}
                            onChange={() => handleSelectAll(moduleIndex)}
                          />
                        </td>
                        {PERMISSION_KEYS.map((key) => (
                          <td key={key} className="text-center px-2 py-2.5">
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="flex justify-end items-center gap-3 px-6 py-4 border-t border-gray-200 shrink-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm font-medium border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold rounded-md text-white bg-orange-500 hover:bg-orange-600 transition-colors shadow-md shadow-orange-200 cursor-pointer"
            >
              Update User
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditUserModal;
