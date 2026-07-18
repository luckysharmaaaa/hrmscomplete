import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { User } from "lucide-react";
import { toast } from "react-toastify";

import {
  updateUser,
  getRoles,
} from "../services/userApi";

/* ===========================================
   Validation
=========================================== */

const validationSchema = Yup.object({
  firstName: Yup.string()
    .min(2, "First Name must be at least 2 characters")
    .required("First Name is required"),

  lastName: Yup.string()
    .min(2, "Last Name must be at least 2 characters")
    .required("Last Name is required"),

  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),

  password: Yup.string().test(
    "password-strength",
    "Password must be at least 8 characters, include one uppercase letter and one number",
    (value) => {
      if (!value) return true;

      return (
        value.length >= 8 &&
        /[A-Z]/.test(value) &&
        /[0-9]/.test(value)
      );
    }
  ),

  confirmPassword: Yup.string().when("password", {
    is: (val) => val && val.length > 0,
    then: (schema) =>
      schema
        .oneOf([Yup.ref("password")], "Passwords do not match")
        .required("Confirm Password is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  phone: Yup.string()
    .matches(
      /^[0-9+\-\s()]{7,15}$/,
      "Enter a valid phone number"
    )
    .required("Phone is required"),
});

/* ===========================================
   Error Component
=========================================== */

const FieldError = ({ error, touched }) =>
  touched && error ? (
    <p className="text-red-500 text-xs mt-1">
      {error}
    </p>
  ) : null;

/* ===========================================
   Component
=========================================== */

const EditUserModal = ({
  isOpen,
  onClose,
  editUser,
  onSave,
}) => {

  const [visible, setVisible] = useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  // true = Active
  // false = Inactive
  const [status, setStatus] =
    useState(false);

  // All roles from API
  const [roles, setRoles] =
    useState([]);

  // Only role IDs
  const [selectedRoles, setSelectedRoles] =
    useState([]);

  /* ===========================================
     Drawer Animation
  =========================================== */

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setVisible(true);
      }, 10);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  /* ===========================================
     Fetch Roles
  =========================================== */

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await getRoles();

      if (response.data.success) {
        setRoles(response.data.data || []);
      }

    } catch (error) {
      console.error(error);
    }
  };

  /* ===========================================
     Load User Data
  =========================================== */

  useEffect(() => {

    if (!editUser) return;

    // Status
    setStatus(Number(editUser.status) === 1);

    // Roles
    setSelectedRoles(
      editUser.roles
        ? editUser.roles.map((role) =>
          Number(role.roleId)
        )
        : []
    );

  }, [editUser]);

  /* ===========================================
     Role Checkbox
  =========================================== */

  const handleRoleChange = (roleId) => {

    setSelectedRoles((prev) =>

      prev.includes(roleId)

        ? prev.filter((id) => id !== roleId)

        : [...prev, roleId]

    );

  };
  const formik = useFormik({
    enableReinitialize: true,

    initialValues: {
      firstName: editUser?.firstName || "",
      lastName: editUser?.lastName || "",
      email: editUser?.email || "",
      phone: editUser?.phone || "",
      password: "",
      confirmPassword: "",
    },

    validationSchema,

    onSubmit: async (
      values,
      { setSubmitting }
    ) => {
      try {
        if (selectedRoles.length === 0) {
          toast.warning(
            "Please select at least one role."
          );
          return;
        }

        // Backend Payload
        const payload = {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),

          // Keep password empty if not changed
          password:
            values.password.trim() === ""
              ? ""
              : values.password,

          status: status ? "1" : "0",

          // IMPORTANT
          roles: selectedRoles,

          updatedBy: null,
        };

        console.log(
          "Updating User ID:",
          editUser.id
        );

        console.log(
          "Payload:",
          JSON.stringify(payload, null, 2)
        );

        const response =
          await updateUser(
            editUser.id,
            payload
          );

        if (response.data.success) {
          toast.success(
            response.data.message
          );

          onSave?.();

          onClose();
        }
      } catch (error) {
        console.error(
          "Update Error:",
          error
        );

        console.log(
          error.response?.data
        );

        toast.error(
          error.response?.data?.message ||
          "Failed to update user."
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  /* ===========================================
     Reset Password Visibility
  =========================================== */

  useEffect(() => {
    if (!isOpen) {
      setShowPassword(false);
      setShowConfirm(false);
    }
  }, [isOpen]);

  if (!isOpen && !visible) return null;
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-999"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-200 bg-white shadow-2xl z-1000 overflow-y-auto transition-transform duration-300 ${visible
            ? "translate-x-0"
            : "translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
              <User size={22} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#0F265C]">
                Edit User
              </h2>

              <p className="text-xs text-gray-400">
                Update user profile information
              </p>
            </div>

          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md border hover:bg-red-50 hover:text-red-500"
          >
            ✕
          </button>

        </div>

        <form
          onSubmit={formik.handleSubmit}
          noValidate
        >

          <div className="p-6">

            <div className="grid grid-cols-2 gap-5">

              {/* First Name */}

              <div>

                <label className="label">
                  <span className="label-text font-medium">
                    First Name
                  </span>
                </label>

                <input
                  type="text"
                  name="firstName"
                  className={`input input-bordered w-full ${formik.touched.firstName &&
                      formik.errors.firstName
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
                  <span className="label-text font-medium">
                    Last Name
                  </span>
                </label>

                <input
                  type="text"
                  name="lastName"
                  className={`input input-bordered w-full ${formik.touched.lastName &&
                      formik.errors.lastName
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

              {/* Email */}

              <div>

                <label className="label">
                  <span className="label-text font-medium">
                    Email
                  </span>
                </label>

                <input
                  type="email"
                  name="email"
                  className={`input input-bordered w-full ${formik.touched.email &&
                      formik.errors.email
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

              {/* Phone */}

              <div>

                <label className="label">
                  <span className="label-text font-medium">
                    Phone
                  </span>
                </label>

                <input
                  type="text"
                  name="phone"
                  className={`input input-bordered w-full ${formik.touched.phone &&
                      formik.errors.phone
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

              {/* Password */}

              <div>

                <label className="label">
                  <span className="label-text font-medium">
                    Password
                  </span>
                </label>

                <div className="relative">

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    placeholder="Leave blank to keep current password"
                    className={`input input-bordered w-full pr-10 ${formik.touched.password &&
                        formik.errors.password
                        ? "border-red-500"
                        : ""
                      }`}
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2"
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
                    type={
                      showConfirm
                        ? "text"
                        : "password"
                    }
                    name="confirmPassword"
                    className={`input input-bordered w-full pr-10 ${formik.touched.confirmPassword &&
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
                    onClick={() =>
                      setShowConfirm(!showConfirm)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2"
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

            </div>

            {/* ================= Assign Roles starts here ================= */}
            {/* ================= Assign Roles ================= */}

            <div className="mt-8">

              <div className="mb-4">

                <h3 className="text-lg font-semibold text-[#0F265C]">
                  Assign Roles
                </h3>

                <p className="text-sm text-gray-500">
                  Select one or more roles for this user.
                </p>

              </div>

              <div className="grid grid-cols-2 gap-4">

                {roles.map((role) => (

                  <label
                    key={role.id}
                    className={`cursor-pointer rounded-xl border p-4 transition-all ${selectedRoles.includes(role.id)
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-orange-300"
                      }`}
                  >

                    <div className="flex items-center gap-3">

                      <input
                        type="checkbox"
                        className="checkbox checkbox-warning checkbox-sm"
                        checked={selectedRoles.includes(role.id)}
                        onChange={() =>
                          handleRoleChange(role.id)
                        }
                      />

                      <span className="font-medium">
                        {role.roleName}
                      </span>

                    </div>

                  </label>

                ))}

              </div>

            </div>

            {/* ================= Status ================= */}

            <div className="mt-8 border-t pt-5 flex items-center justify-between">

              <div className="flex items-center gap-3">

                <label className="font-semibold">
                  Status
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setStatus(!status)
                  }
                  className={`relative inline-flex h-6 w-11 rounded-full transition ${status
                      ? "bg-orange-500"
                      : "bg-gray-300"
                    }`}
                >

                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white transform transition ${status
                        ? "translate-x-6"
                        : "translate-x-1"
                      }`}
                  />

                </button>

                <span
                  className={`font-medium ${status
                      ? "text-orange-500"
                      : "text-gray-500"
                    }`}
                >
                  {status
                    ? "Active"
                    : "Inactive"}
                </span>

              </div>

              <div className="flex gap-3">

                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 border rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={formik.isSubmitting}
                  className="px-5 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50"
                >
                  {formik.isSubmitting
                    ? "Updating..."
                    : "Update User"}
                </button>

              </div>

            </div>

          </div>

        </form>

      </div>

    </>

  );

};

export default EditUserModal;