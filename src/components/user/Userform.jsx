import { useState } from 'react';import { toast } from "react-toastify";
import { Eye, EyeOff, User, X } from "lucide-react";

import SideDrawer from "../ui/SideDrawer";
import Switch from "../ui/Switch";

// Allowed profile image file types
const ALLOWED_IMAGE_TYPES = [
  "image/jpg",
  "image/jpeg",
  "image/png",
  "image/webp",
];

// Default image shown when user has no profile image
import DEFAULT_AVATAR from "../../assets/images/avatar_logo.webp";

// Reusable validation error component
export const FieldError = ({ error, touched }) =>
  touched && error ? (
    <p className="mt-1.5 text-xs text-danger-600">{error}</p>
  ) : null;

// Label + control + error wrapper — identical spacing for every field
const Field = ({ label, htmlFor, required, error, touched, hint, children, className = "" }) => (
  <div className={className}>
    <label htmlFor={htmlFor} className="hr-label">
      {label}
      {required && <span className="ml-0.5 text-danger-500">*</span>}
    </label>
    {children}
    <FieldError error={error} touched={touched} />
    {hint}
  </div>
);

// Section heading with divider
const Section = ({ title, description, children }) => (
  <section>
    <div className="mb-4 border-b border-border-subtle pb-3">
      <h3 className="text-sm font-semibold text-primary-700">{title}</h3>
      {description && <p className="mt-0.5 text-xs text-text-secondary">{description}</p>}
    </div>
    {children}
  </section>
);

/**
 * UserForm
 *
 * Reusable UI for Add User and Edit User — opens in the shared right-side drawer.
 *
 * IMPORTANT: this component only handles UI.
 * API calls are handled by AddUserDrawer / EditUserModal.
 */
const UserForm = ({
  open,
  mode,
  formik,
  isPasswordOptional = false,

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

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Only JPG, JPEG, PNG, and WEBP images are allowed.");
      e.target.value = "";
      return;
    }

    onImageChange(file);

    // allow picking the same file again after removing it
    e.target.value = "";
  };

  const inputClass = (name) =>
    `hr-input ${formik.touched[name] && formik.errors[name] ? "is-error" : ""}`;

  // Text input bound to the address state (same name => same key in addressData)
  const addressText = (name, label, placeholder) => (
    <Field label={label} htmlFor={`addr-${name}`}>
      <input
        id={`addr-${name}`}
        type="text"
        name={name}
        placeholder={placeholder}
        className="hr-input"
        value={addressData[name] ?? ""}
        onChange={onAddressChange}
      />
    </Field>
  );

  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      icon={User}
      size="lg"
      title={isEdit ? "Edit User" : "Add User"}
      subtitle={
        isEdit
          ? "Update user profile information"
          : "Create a new user profile and allocate access"
      }
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          {/* Status */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-text-primary">Status</span>
            <Switch checked={Boolean(status)} onChange={onStatusToggle} ariaLabel="Toggle user status" />
            <span
              className={`text-sm font-medium ${
                status ? "text-success-600" : "text-text-secondary"
              }`}
            >
              {status ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} className="hr-btn hr-btn-outline">
              Cancel
            </button>

            <button
              type="submit"
              form="user-form"
              disabled={isSubmitting}
              className="hr-btn hr-btn-primary min-w-[130px]"
            >
              {isSubmitting ? submittingLabel : submitLabel}
            </button>
          </div>
        </div>
      }
    >
      <form
        id="user-form"
        onSubmit={formik.handleSubmit}
        noValidate
        className="space-y-8"
      >
        {/* ================= Basic Information ================= */}
        <Section title="Basic Information" description="Name, contact details and sign-in credentials.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="First Name"
              htmlFor="firstName"
              required
              error={formik.errors.firstName}
              touched={formik.touched.firstName}
            >
              <input
                id="firstName"
                type="text"
                name="firstName"
                placeholder="Enter first name"
                className={inputClass("firstName")}
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Field>

            <Field
              label="Last Name"
              htmlFor="lastName"
              required
              error={formik.errors.lastName}
              touched={formik.touched.lastName}
            >
              <input
                id="lastName"
                type="text"
                name="lastName"
                placeholder="Enter last name"
                className={inputClass("lastName")}
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Field>

            {/* Official company email (only @bytesbrick.com allowed) */}
            <Field
              label="Official Email"
              htmlFor="email"
              required
              className="sm:col-span-2"
              error={formik.errors.email}
              touched={formik.touched.email}
            >
              <input
                id="email"
                type="email"
                name="email"
                placeholder="name@bytesbrick.com"
                className={inputClass("email")}
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Field>

            <Field
              label="Phone"
              htmlFor="phone"
              required
              error={formik.errors.phone}
              touched={formik.touched.phone}
              className="sm:col-span-2"
            >
              <input
                id="phone"
                type="text"
                name="phone"
                placeholder="Enter phone number"
                className={inputClass("phone")}
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Field>

            {/* Password */}
            <Field
              label={`Password${isPasswordOptional ? " (optional)" : ""}`}
              htmlFor="password"
              required={!isPasswordOptional}
              error={formik.errors.password}
              touched={formik.touched.password}
            >
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder={
                    isPasswordOptional
                      ? "Leave blank to keep current"
                      : "Minimum 8 characters"
                  }
                  className={`${inputClass("password")} pr-10`}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-text-secondary hover:bg-primary-50 hover:text-primary-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
            </Field>

            {/* Confirm password */}
            <Field
              label="Confirm Password"
              htmlFor="confirmPassword"
              required={!isPasswordOptional}
              error={formik.errors.confirmPassword}
              touched={formik.touched.confirmPassword}
            >
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Repeat password"
                  className={`${inputClass("confirmPassword")} pr-10`}
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />

                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-text-secondary hover:bg-primary-50 hover:text-primary-700"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
            </Field>
          </div>
        </Section>

        {/* ================= Assign Roles ================= */}
        <Section title="Assign Roles" description="Select one or more roles for this user.">
          {roles.length === 0 ? (
            <p className="text-sm text-text-secondary">No roles available.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {roles.map((role) => {
                const checked = selectedRoles.includes(role.id);

                return (
                  <label
                    key={role.id}
                    className={`flex h-12 cursor-pointer items-center gap-3 rounded-md border px-4 transition-colors ${
                      checked
                        ? "border-primary-700 bg-primary-50"
                        : "border-border-strong bg-surface hover:border-primary-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-primary-700"
                      checked={checked}
                      onChange={() => onRoleChange(role.id)}
                    />

                    <span
                      className={`truncate text-sm font-medium ${
                        checked ? "text-primary-700" : "text-text-primary"
                      }`}
                    >
                      {role.roleName}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </Section>

        {/* ================= Profile Image ================= */}
        <Section title="Profile Image" description="Upload a profile picture (JPG, JPEG, PNG, WEBP).">
          <div className="flex flex-col items-center gap-5 rounded-md border border-border-subtle bg-background p-5 sm:flex-row">
            {/* Preview */}
            <div className="relative shrink-0">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-primary-200 bg-primary-50">
                <img
                  src={displayImage}
                  alt="Profile preview"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = DEFAULT_AVATAR;
                  }}
                />
              </div>

              {hasRealImage && (
                <button
                  type="button"
                  onClick={onRemoveImage}
                  className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-danger-500 text-white shadow-sm transition hover:bg-danger-600"
                  aria-label="Remove image"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex-1 text-center sm:text-left">
              <h4 className="text-sm font-semibold text-text-primary">Upload Photo</h4>

              <p className="mb-4 mt-1 text-xs text-text-secondary">
                Supported formats: JPG, JPEG, PNG and WEBP. Recommended size: 300 × 300 px.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                <label className="hr-btn hr-btn-outline cursor-pointer">
                  Choose Image
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>

                {isEdit && (
                  <button
                    type="button"
                    onClick={onSaveProfileImage}
                    disabled={isSavingImage}
                    className="hr-btn hr-btn-blue"
                  >
                    {isSavingImage ? "Saving..." : "Save Image"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </Section>

        {/* ================= Address ================= */}
        <Section title="Address" description="Add an address for this user (optional).">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Address Type" htmlFor="addr-addressType">
              <select
                id="addr-addressType"
                name="addressType"
                className="hr-select"
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
            </Field>

            {addressText("houseNo", "House No/Name", "Enter house number")}
            {addressText("addressLine1", "Address Line 1", "Enter address line 1")}
            {addressText("addressLine2", "Address Line 2", "Enter address line 2")}
            {addressText("landmark", "Landmark", "Enter landmark")}
            {addressText("locality", "Locality", "Enter locality")}
            {addressText("city", "City", "Enter city")}
            {addressText("state", "State", "Enter state")}
            {addressText("zipCode", "Zip Code", "Enter zip code")}
            {addressText("countryID", "Country ID", "Enter country ID")}
            {addressText("countryCode", "Country Code", "e.g. IN")}
            {addressText("phoneCode", "Phone Code", "e.g. +91")}
            {addressText("phone", "Address Phone", "Enter phone number")}

            <label
              htmlFor="isDefault"
              className="flex h-10 cursor-pointer items-center gap-2.5 self-end text-sm font-medium text-text-primary"
            >
              <input
                type="checkbox"
                name="isDefault"
                id="isDefault"
                className="h-4 w-4 accent-primary-700"
                checked={Boolean(addressData.isDefault)}
                onChange={onAddressChange}
              />
              Set as default address
            </label>
          </div>
        </Section>
      </form>
    </SideDrawer>
  );
};

export default UserForm;