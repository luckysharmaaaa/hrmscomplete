import React, { useState } from "react";
import { useFormik } from "formik";
import { toast } from "react-toastify";


import { useEffect } from "react";
import { getRoles } from "../services/userApi";

import * as Yup from "yup";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { User } from "lucide-react";
// import { createUser } from "../api/userApi";
import { createUser } from "../services/userApi";

// ========================= Validation =========================

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

  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain an uppercase letter")
    .matches(/[0-9]/, "Password must contain a number")
    .required("Password is required"),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Confirm Password is required"),

  phone: Yup.string()
    .matches(/^[0-9+\-\s()]{7,15}$/, "Enter a valid phone number")
    .required("Phone is required"),
});

// ========================= Error Component =========================

const FieldError = ({ error, touched }) =>
  touched && error ? (
    <p className="text-red-500 text-xs mt-1">{error}</p>
  ) : null;

// ========================= Component =========================
const AddUserDrawer = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Status Switch
const [status, setStatus] = useState("0"); // Active
  // Assign Roles
  const [selectedRoles, setSelectedRoles] = useState([]);

  const [roles, setRoles] = useState([]);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await getRoles();

      setRoles(response.data.data || []);
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
        "Failed to fetch roles."
      );
    }
  };



  const handleRoleChange = (roleId) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((item) => item !== roleId)
        : [...prev, roleId]
    );
  };

  // ========================= Formik =========================

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",

      phone: "",
    },

    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (selectedRoles.length === 0) {
          toast.warning("Please select a role!");
          return;
        }

        const payload = {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
          password: values.password,
          status,
          roles: selectedRoles,
        };

        const response = await createUser(payload);

        if (response.data.success) {
          toast.success(response.data.message);

          resetForm();
          setSelectedRoles([]);
          setStatus(true);

          onSuccess?.();
          onClose();
        }
      } catch (error) {
        console.error(error);

        toast.error(
          error.response?.data?.message ||
          "Failed to update user."
        );
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    setSelectedRoles([]);
    setStatus(true);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}=
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-999"
          onClick={handleClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-200 bg-white shadow-2xl z-1000 overflow-y-auto transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"
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
                Add User
              </h2>

              <p className="text-xs text-gray-400">
                Create a new user profile
              </p>

            </div>

          </div>

          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-md border hover:bg-red-50 hover:text-red-500"
          >
            ✕
          </button>

        </div>

        <form onSubmit={formik.handleSubmit} noValidate>

          <div className="p-5">

            <div className="grid grid-cols-2 gap-5">

              {/* </div> */}
              {/* First Name */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">First Name</span>
                </label>

                <input
                  type="text"
                  name="firstName"
                  placeholder="Enter first name"
                  className={`input input-bordered w-full ${formik.touched.firstName && formik.errors.firstName
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
                  placeholder="Enter last name"
                  className={`input input-bordered w-full ${formik.touched.lastName && formik.errors.lastName
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
                  <span className="label-text font-medium">Email</span>
                </label>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  className={`input input-bordered w-full ${formik.touched.email && formik.errors.email
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
                  <span className="label-text font-medium">Phone</span>
                </label>

                <input
                  type="text"
                  name="phone"
                  placeholder="Enter phone number"
                  className={`input input-bordered w-full ${formik.touched.phone && formik.errors.phone
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
                  <span className="label-text font-medium">Password</span>
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Minimum 8 characters"
                    className={`input input-bordered w-full pr-10 ${formik.touched.password && formik.errors.password
                      ? "border-red-500"
                      : ""
                      }`}
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
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
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Repeat password"
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
                    onClick={() => setShowConfirm(!showConfirm)}
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
                    className={`cursor-pointer rounded-xl border p-4 transition-all duration-200
        ${selectedRoles.includes(role.id)
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 bg-white hover:border-orange-300"
                      }`}
                  >


                    <div className="flex items-center gap-3">

                      <input
                        type="checkbox"
                        className="checkbox checkbox-warning checkbox-sm"
                        checked={selectedRoles.includes(role.id)}
                        onChange={() => handleRoleChange(role.id)}
                      />

                      <span className="font-medium text-gray-700">
                        {role.roleName}
                      </span>

                    </div>

                  </label>

                ))}

              </div>

            </div>




            {/* ================= Footer ================= */}

            <div className="mt-8 border-t pt-4 flex items-center justify-between">

              {/* Left Side */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-gray-700">
                  Status
                </label>

                <button
                  type="button"
                  onClick={() => setStatus(!status)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${status ? "bg-orange-500" : "bg-gray-300"
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${status ? "translate-x-6" : "translate-x-1"
                      }`}
                  />
                </button>

                <span
                  className={`text-sm font-medium ${status ? "text-orange-500" : "text-gray-500"
                    }`}
                >
                  {status ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Right Side */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2 border rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md"
                >
                  Add User
                </button>
              </div>

            </div>

          </div>
        </form>
      </div>
    </>
  );
};

export default AddUserDrawer;