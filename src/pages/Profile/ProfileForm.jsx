import React, { useMemo } from "react";
import { useFormik } from "formik";
import { toast } from "react-toastify";

import ProfileImage from "./ProfileImage";
import { profileSchema } from "./profileValidation";
import { updateMyProfile } from "../../services/profileApi";

const ADDRESS_TYPES = ["home", "work", "other"];

const ProfileForm = ({ profileData, onSaved, onImageChanged }) => {
  const user = profileData?.user;
  const address = profileData?.address;
  const roles = profileData?.roles || [];
  const profileImage = profileData?.profileImage;

  const initialValues = useMemo(
    () => ({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",

      addressType: address?.addressType || "home",
      houseNumber: address?.houseNumber || "",
      addressLine1: address?.addressLine1 || "",
      addressLine2: address?.addressLine2 || "",
      landmark: address?.landmark || "",
      locality: address?.locality || "",
      city: address?.city || "",
      state: address?.state || "",
      zipCode: address?.zipCode || "",
      countryID: address?.countryID ?? "",
      countryCode: address?.countryCode || "",
      phoneCode: address?.phoneCode || "",
      latitude: address?.latitude ?? "",
      longitude: address?.longitude ?? "",
      isDefault: Boolean(address?.isDefault),
    }),
    [user, address],
  );

  const formik = useFormik({
    initialValues,
    validationSchema: profileSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const hasAddressInput = Boolean(
          values.addressLine1 || values.city || values.state || values.zipCode,
        );

        const payload = {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone || null,
        };

        if (hasAddressInput) {
          payload.address = {
            addressType: values.addressType || "home",
            houseNumber: values.houseNumber || null,
            addressLine1: values.addressLine1,
            addressLine2: values.addressLine2 || null,
            landmark: values.landmark || null,
            locality: values.locality || null,
            city: values.city,
            state: values.state,
            zipCode: values.zipCode,
            countryID: values.countryID ? Number(values.countryID) : null,
            countryCode: values.countryCode,
            phoneCode: values.phoneCode,
            latitude: values.latitude === "" ? null : Number(values.latitude),
            longitude: values.longitude === "" ? null : Number(values.longitude),
            isDefault: values.isDefault,
          };
        }

        const response = await updateMyProfile(payload);

        toast.success(response?.message || "Profile updated successfully");
        onSaved?.(response?.data);
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Failed to update profile",
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
    `w-full border rounded-lg px-4 py-3 outline-none focus:border-[#FF7A21] ${
      touched[name] && errors[name] ? "border-red-400" : "border-gray-300"
    }`;

  const FieldError = ({ name }) =>
    touched[name] && errors[name] ? (
      <p className="text-xs text-red-500 mt-1">{errors[name]}</p>
    ) : null;

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Heading */}
      <div className="border-b border-gray-200 pb-5 mb-8">
        <h2 className="text-2xl font-semibold text-[#0F265C]">My Profile</h2>
        <p className="text-gray-500 text-sm mt-1">
          Update your personal information.
        </p>
      </div>

      {/* Profile Photo */}
      <div className="mb-8">
        <ProfileImage user={user} profileImage={profileImage} onChange={onImageChanged} />
      </div>

      {/* Personal Information */}
      <h3 className="text-lg font-semibold text-[#0F265C] mb-5">
        Personal Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">First Name</label>
          <input
            type="text"
            name="firstName"
            value={values.firstName}
            onChange={handleChange}
            onBlur={handleBlur}
            className={fieldClass("firstName")}
          />
          <FieldError name="firstName" />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={values.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
            className={fieldClass("lastName")}
          />
          <FieldError name="lastName" />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={fieldClass("email")}
          />
          <FieldError name="email" />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Phone</label>
          <input
            type="text"
            name="phone"
            value={values.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            className={fieldClass("phone")}
          />
          <FieldError name="phone" />
        </div>
      </div>

      {/* Address */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold text-[#0F265C] mb-5">
          Address Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Address Type</label>
            <select
              name="addressType"
              value={values.addressType}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
            >
              {ADDRESS_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">House No.</label>
            <input
              type="text"
              name="houseNumber"
              value={values.houseNumber}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-[#FF7A21]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block mb-2 text-sm font-medium text-gray-700">Address Line 1</label>
            <input
              type="text"
              name="addressLine1"
              value={values.addressLine1}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-[#FF7A21]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block mb-2 text-sm font-medium text-gray-700">Address Line 2</label>
            <input
              type="text"
              name="addressLine2"
              value={values.addressLine2}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-[#FF7A21]"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Landmark</label>
            <input
              type="text"
              name="landmark"
              value={values.landmark}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-[#FF7A21]"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Locality</label>
            <input
              type="text"
              name="locality"
              value={values.locality}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-[#FF7A21]"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              name="city"
              value={values.city}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-[#FF7A21]"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">State</label>
            <input
              type="text"
              name="state"
              value={values.state}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-[#FF7A21]"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Postal Code</label>
            <input
              type="text"
              name="zipCode"
              value={values.zipCode}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-[#FF7A21]"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Country ID</label>
            <input
              type="number"
              name="countryID"
              value={values.countryID}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-[#FF7A21]"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Country Code</label>
            <input
              type="text"
              name="countryCode"
              placeholder="e.g. IN"
              value={values.countryCode}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-[#FF7A21]"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Phone Code</label>
            <input
              type="text"
              name="phoneCode"
              placeholder="e.g. +91"
              value={values.phoneCode}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-[#FF7A21]"
            />
          </div>

          <div className="flex items-center gap-2 md:col-span-2">
            <input
              type="checkbox"
              id="isDefault"
              name="isDefault"
              checked={values.isDefault}
              onChange={handleChange}
              className="h-4 w-4"
            />
            <label htmlFor="isDefault" className="text-sm text-gray-700">
              Set as default address
            </label>
          </div>
        </div>
      </div>

      {/* Account Information (read-only) */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold text-[#0F265C] mb-5">
          Account Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Role</label>
            <div className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 text-gray-600">
              {roles.length > 0 ? roles.map((r) => r.roleName).join(", ") : "Not assigned"}
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Status</label>
            <div className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 text-gray-600">
              {user?.status === "1" ? "Active" : "Inactive"}
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 mt-10">
        <button
          type="button"
          onClick={() => resetForm()}
          disabled={isSubmitting}
          className="border border-gray-300 px-6 py-2.5 rounded-lg hover:bg-gray-100 disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#FF7A21] text-white px-6 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;