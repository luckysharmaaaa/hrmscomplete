import React, { useState } from "react";
import { useFormik } from "formik";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";

import { passwordSchema } from "./profileValidation";
import { changePassword } from "../../services/profileApi";

const ChangePassword = () => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const formik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: passwordSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const response = await changePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        });

        toast.success(response?.message || "Password updated successfully");
        resetForm();
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Failed to update password",
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    isSubmitting,
  } = formik;

  const fieldClass = (name) =>
    `w-full border rounded-lg px-4 py-3 pr-12 outline-none focus:border-[#FF7A21] ${
      touched[name] && errors[name] ? "border-red-400" : "border-gray-300"
    }`;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="border-b border-gray-200 pb-5 mb-8">
        <h2 className="text-2xl font-semibold text-[#0F265C]">Update Password</h2>
        <p className="text-sm text-gray-500 mt-1">
          Change your account password to keep your account secure.
        </p>
      </div>

      <div className="space-y-6 max-w-lg">
        {/* Current Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              name="currentPassword"
              value={values.currentPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter Current Password"
              className={fieldClass("currentPassword")}
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {touched.currentPassword && errors.currentPassword && (
            <p className="text-xs text-red-500 mt-1">{errors.currentPassword}</p>
          )}
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              name="newPassword"
              value={values.newPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter New Password"
              className={fieldClass("newPassword")}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">Minimum 8 characters.</p>
          {touched.newPassword && errors.newPassword && (
            <p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Confirm New Password"
              className={fieldClass("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {touched.confirmPassword && errors.confirmPassword && (
            <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-10">
        <button
          type="button"
          onClick={() => resetForm()}
          disabled={isSubmitting}
          className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-[#FF7A21] text-white rounded-lg hover:opacity-90 disabled:opacity-60"
        >
          {isSubmitting ? "Updating..." : "Update Password"}
        </button>
      </div>
    </form>
  );
};

export default ChangePassword;