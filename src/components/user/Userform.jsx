import React, { useState } from "react";
import { toast } from "react-toastify";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { User, X } from "lucide-react";

// Allowed profile image file types
const ALLOWED_IMAGE_TYPES = [
  "image/jpg",
  "image/jpeg",
  "image/png",
  "image/webp",
];

// Default image shown when user has no profile image
import DEFAULT_AVATAR  from "../../assets/images/avatar_logo.webp"


// Reusable validation error component
export const FieldError = ({ error, touched }) =>
  touched && error ? (
    <p className="text-red-500 text-xs mt-1">{error}</p>
  ) : null;

/**
 * UserForm
 *
 * Reusable UI for Add User and Edit User.
 *
 * IMPORTANT:
 * This component only handles UI.
 * API calls are handled by AddUserDrawer / EditUserModal.
 */
const UserForm = ({
  open,
  mode,
  formik,
  isPasswordOptional = false,
  pendingCompanyEmail = false,

  roles = [],
  selectedRoles = [],
  onRoleChange,

  // Profile image props
  profileImagePreview,
  onImageChange,
  onRemoveImage,
  onSaveProfileImage,
  isSavingImage = false,

  // Address props
  addressData,
  onAddressChange,

  // Status
  status,
  onStatusToggle,

  // Drawer
  onClose,

  // Main form submit
  isSubmitting = false,
  submitLabel = "Save",
  submittingLabel = "Saving...",
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isEdit = mode === "edit";

  // True when an actual profile image exists
  const hasRealImage = Boolean(profileImagePreview);

  // Always show an image
  const displayImage = profileImagePreview || DEFAULT_AVATAR;

  // Handles image selection from the file picker
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Check whether selected file type is allowed
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Only JPG, JPEG, PNG, and WEBP images are allowed.");
      return;
    }

    // Send selected file to parent component
    onImageChange(file);
  };

  return (
    <>
      {/* ================= Backdrop ================= */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-999"
          onClick={onClose}
        />
      )}

      {/* ================= Sliding Panel ================= */}
      <div
        className={`fixed top-0 right-0 h-full w-200 bg-white z-1000 transition-transform duration-300 shadow-2xl flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ================= Header ================= */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-orange-50 text-orange-500 rounded-xl shrink-0 shadow-sm border border-orange-100/30">
              <User size={22} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#0F265C] tracking-tight leading-tight">
                {isEdit ? "Edit User" : "Add User"}
              </h2>

              <p className="text-xs text-gray-400 font-medium mt-1">
                {isEdit
                  ? "Update user profile information"
                  : "Create a new user profile and allocate module access permissions"}
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all text-base cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* ================= Main Form ================= */}
        <form
          onSubmit={formik.handleSubmit}
          noValidate
          className="flex flex-col flex-1 min-h-0"
        >
          {/* Scrollable content */}
          <div className="p-5 overflow-y-auto flex-1 min-h-0">
            <div className="grid grid-cols-2 gap-5">

              {/* ================= First Name ================= */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    First Name
                  </span>
                </label>

                <input
                  type="text"
                  name="firstName"
                  placeholder="Enter first name"
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

              {/* ================= Last Name ================= */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    Last Name
                  </span>
                </label>

                <input
                  type="text"
                  name="lastName"
                  placeholder="Enter last name"
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

              {/* ================= Email (official company email) ================= */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    Official Email
                  </span>
                </label>

                <input
                  type="email"
                  name="email"
                  placeholder="name@bytesbrick.com"
                  disabled={Boolean(formik.values.alternateEmail)}
                  className={`input input-bordered w-full disabled:bg-gray-100 disabled:cursor-not-allowed ${
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

                {formik.values.alternateEmail ? (
                  <p className="text-xs text-gray-400 mt-1">
                    Clear the Personal Email field to enter an official
                    email instead.
                  </p>
                ) : (
                  !formik.values.email && (
                    <p className="text-xs text-gray-400 mt-1">
                      Leave blank if this employee doesn't have one yet
                      — use Personal Email instead.
                    </p>
                  )
                )}
              </div>

              {/* ================= Personal Email (no official email yet) ================= */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    Personal Email
                    <span className="ml-1 text-xs font-normal text-gray-400">
                      (if no official email yet)
                    </span>
                  </span>
                </label>

                <input
                  type="email"
                  name="alternateEmail"
                  placeholder="name@gmail.com"
                  disabled={Boolean(formik.values.email)}
                  className={`input input-bordered w-full disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    formik.touched.alternateEmail &&
                    formik.errors.alternateEmail
                      ? "border-red-500"
                      : ""
                  }`}
                  value={formik.values.alternateEmail}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />

                <FieldError
                  error={formik.errors.alternateEmail}
                  touched={formik.touched.alternateEmail}
                />

                {formik.values.email ? (
                  <p className="text-xs text-gray-400 mt-1">
                    Clear the Official Email field to use a personal
                    email instead.
                  </p>
                ) : (
                  pendingCompanyEmail && (
                    <p className="text-xs text-amber-600 mt-1">
                      This user currently signs in with their personal
                      email. They'll switch to the official email
                      automatically once you assign one above.
                    </p>
                  )
                )}
              </div>

              {/* ================= Phone ================= */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    Phone
                  </span>
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

              {/* ================= Password ================= */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    Password
                    {isPasswordOptional ? " (optional)" : ""}
                  </span>
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder={
                      isPasswordOptional
                        ? "Leave blank to keep current password"
                        : "Minimum 8 characters"
                    }
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

              {/* ================= Confirm Password ================= */}
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
                    className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                      selectedRoles.includes(role.id)
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 bg-white hover:border-orange-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-warning checkbox-sm"
                        checked={selectedRoles.includes(role.id)}
                        onChange={() => onRoleChange(role.id)}
                      />

                      <span className="font-medium text-gray-700">
                        {role.roleName}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
                        {/* ================= Profile Image ================= */}
            <div className="mt-8">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-[#0F265C]">
                  Profile Image
                </h3>

                <p className="text-sm text-gray-500">
                  Upload a profile picture (JPG, JPEG, PNG, WEBP).
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="flex flex-col md:flex-row items-center gap-6">

                  {/* Profile image preview */}
                  <div className="relative">
                    <div className="w-28 h-28 rounded-full border-2 border-dashed border-orange-300 bg-orange-50 overflow-hidden flex items-center justify-center">
                      <img
                        src={displayImage}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = DEFAULT_AVATAR;
                        }}
                      />
                    </div>

                    {/* Remove image button */}
                    {hasRealImage && (
                      <button
                        type="button"
                        onClick={onRemoveImage}
                        className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow hover:bg-red-600 transition"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  {/* Image actions */}
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-gray-800 mb-2">
                      Upload Photo
                    </h4>

                    <p className="text-sm text-gray-500 mb-4">
                      Supported formats: JPG, JPEG, PNG and WEBP
                      <br />
                      Recommended size: 300 × 300 px
                    </p>

                    <div className="flex items-center gap-3">

                      {/* Choose Image */}
                      <label className="btn bg-orange-500 hover:bg-orange-600 border-none text-white">
                        Choose Image

                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>

                      {/* ================= NEW: Save Image ================= */}
                      {isEdit && (
                        <button
                          type="button"
                          onClick={onSaveProfileImage}
                          disabled={isSavingImage}
                          className="btn bg-green-500 hover:bg-green-600 border-none text-white disabled:opacity-50"
                        >
                          {isSavingImage ? "Saving..." : "Save Image"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ================= Address ================= */}
            <div className="mt-8">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-[#0F265C]">
                  Address
                </h3>

                <p className="text-sm text-gray-500">
                  Add an address for this user (optional).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-5">

                {/* Address Type */}
                <div>
                  <label className="label">
                    <span className="label-text font-medium">
                      Address Type
                    </span>
                  </label>

                  <select
                    name="addressType"
                    className="select select-bordered w-full"
                    value={addressData.addressType}
                    onChange={onAddressChange}
                  >
                    <option value="">Select Address Type</option>
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                    <option value="warehouse">Warehouse</option>
                    <option value="branch">Branch</option>
                  </select>
                </div>

                {/* House Number */}
                <div>
                  <label className="label">
                    <span className="label-text font-medium">
                      House No/Name
                    </span>
                  </label>

                  <input
                    type="text"
                    name="houseNo"
                    placeholder="Enter house number"
                    className="input input-bordered w-full"
                    value={addressData.houseNo}
                    onChange={onAddressChange}
                  />
                </div>

                {/* Address Line 1 */}
                <div>
                  <label className="label">
                    <span className="label-text font-medium">
                      Address Line 1
                    </span>
                  </label>

                  <input
                    type="text"
                    name="addressLine1"
                    placeholder="Enter address line 1"
                    className="input input-bordered w-full"
                    value={addressData.addressLine1}
                    onChange={onAddressChange}
                  />
                </div>

                {/* Address Line 2 */}
                <div>
                  <label className="label">
                    <span className="label-text font-medium">
                      Address Line 2
                    </span>
                  </label>

                  <input
                    type="text"
                    name="addressLine2"
                    placeholder="Enter address line 2"
                    className="input input-bordered w-full"
                    value={addressData.addressLine2}
                    onChange={onAddressChange}
                  />
                </div>

                {/* Landmark */}
                <div>
                  <label className="label">
                    <span className="label-text font-medium">
                      Landmark
                    </span>
                  </label>

                  <input
                    type="text"
                    name="landmark"
                    placeholder="Enter landmark"
                    className="input input-bordered w-full"
                    value={addressData.landmark}
                    onChange={onAddressChange}
                  />
                </div>

                {/* Locality */}
                <div>
                  <label className="label">
                    <span className="label-text font-medium">
                      Locality
                    </span>
                  </label>

                  <input
                    type="text"
                    name="locality"
                    placeholder="Enter locality"
                    className="input input-bordered w-full"
                    value={addressData.locality}
                    onChange={onAddressChange}
                  />
                </div>

                {/* City */}
                <div>
                  <label className="label">
                    <span className="label-text font-medium">
                      City
                    </span>
                  </label>

                  <input
                    type="text"
                    name="city"
                    placeholder="Enter city"
                    className="input input-bordered w-full"
                    value={addressData.city}
                    onChange={onAddressChange}
                  />
                </div>

                {/* State */}
                <div>
                  <label className="label">
                    <span className="label-text font-medium">
                      State
                    </span>
                  </label>

                  <input
                    type="text"
                    name="state"
                    placeholder="Enter state"
                    className="input input-bordered w-full"
                    value={addressData.state}
                    onChange={onAddressChange}
                  />
                </div>

                {/* Zip Code */}
                <div>
                  <label className="label">
                    <span className="label-text font-medium">
                      Zip Code
                    </span>
                  </label>

                  <input
                    type="text"
                    name="zipCode"
                    placeholder="Enter zip code"
                    className="input input-bordered w-full"
                    value={addressData.zipCode}
                    onChange={onAddressChange}
                  />
                </div>

                {/* Country ID */}
                <div>
                  <label className="label">
                    <span className="label-text font-medium">
                      Country ID
                    </span>
                  </label>

                  <input
                    type="text"
                    name="countryID"
                    placeholder="Enter country ID"
                    className="input input-bordered w-full"
                    value={addressData.countryID}
                    onChange={onAddressChange}
                  />
                </div>

                {/* Country Code */}
                <div>
                  <label className="label">
                    <span className="label-text font-medium">
                      Country Code
                    </span>
                  </label>

                  <input
                    type="text"
                    name="countryCode"
                    placeholder="e.g. IN"
                    className="input input-bordered w-full"
                    value={addressData.countryCode}
                    onChange={onAddressChange}
                  />
                </div>

                {/* Phone Code */}
                <div>
                  <label className="label">
                    <span className="label-text font-medium">
                      Phone Code
                    </span>
                  </label>

                  <input
                    type="text"
                    name="phoneCode"
                    placeholder="e.g. +91"
                    className="input input-bordered w-full"
                    value={addressData.phoneCode}
                    onChange={onAddressChange}
                  />
                </div>

                {/* Address Phone */}
                <div>
                  <label className="label">
                    <span className="label-text font-medium">
                      Address Phone
                    </span>
                  </label>

                  <input
                    type="text"
                    name="phone"
                    placeholder="Enter phone number"
                    className="input input-bordered w-full"
                    value={addressData.phone}
                    onChange={onAddressChange}
                  />
                </div>

                {/* Default Address */}
                <div className="flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    name="isDefault"
                    id="isDefault"
                    className="checkbox checkbox-warning checkbox-sm"
                    checked={addressData.isDefault}
                    onChange={onAddressChange}
                  />

                  <label
                    htmlFor="isDefault"
                    className="text-sm font-medium text-gray-700"
                  >
                    Set as default address
                  </label>
                </div>

              </div>
            </div>
          </div>
                    {/* ================= Footer ================= */}
          <div className="shrink-0 bg-white border-t py-2 px-10 flex items-center justify-between">

            {/* ================= Status ================= */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-gray-700">
                Status
              </label>

              <button
                type="button"
                onClick={onStatusToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                  status ? "bg-orange-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                    status ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>

              <span
                className={`text-sm font-medium ${
                  status ? "text-orange-500" : "text-gray-500"
                }`}
              >
                {status ? "Active" : "Inactive"}
              </span>
            </div>

            {/* ================= Footer Buttons ================= */}
            <div className="flex gap-3">

              {/* Cancel */}
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-1.5 border rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>

              {/* Main User Update Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-md disabled:opacity-50"
              >
                {isSubmitting ? submittingLabel : submitLabel}
              </button>

            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default UserForm;