import React, { useState } from "react";
import { FiHome, FiChevronRight, FiChevronsUp } from "react-icons/fi";
import { Eye, EyeOff } from "lucide-react";

const Profile = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    country: "",
    state: "",
    city: "",
    postalCode: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Image State
  const [profileImage, setProfileImage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };
  // Cancel Image
  const handleCancelImage = () => {
    setProfileImage(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Password Validation
    if (
      formData.newPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      alert("Passwords do not match");
      return;
    }

    console.log("Form Submitted:", formData);
    alert("Profile Updated Successfully");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0F265C]">Profile</h1>

          <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
            <span>Pages</span>
            <FiChevronRight size={12} className="shrink-0" />
            <span className="text-orange-500 font-medium">Profile</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="w-10 h-10 flex items-center justify-center bg-[#FF7A21] border border-gray-300 rounded-md text-white">
            <FiChevronsUp size={16} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div>
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          {/* Form Title */}
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-2xl font-semibold text-[#0F265C]">Profile</h2>
          </div>
          {/* Basic Information */}
          <h3 className="text-md font-semibold text-gray-900 pb-3">
            Basic Information
          </h3>
          {/* Profile Photo */}
          <div className="bg-slate-50 rounded-lg p-5 flex items-center gap-5 mb-2">
            {/* Image Preview */}
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-gray-400">IMG</span>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-[#0F265C]">Profile Photo</h4>

              <p className="text-sm text-gray-500 mt-1">
                Recommended image size is 40px x 40px
              </p>

              <div className="flex gap-3 mt-2">
                {/* Upload Button */}
                <label className="bg-[#FF7A21] text-white px-2 py-1 text-sm rounded-md hover:opacity-90 cursor-pointer">
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                {/* Cancel Button */}
                <button
                  type="button"
                  onClick={handleCancelImage}
                  className="border border-gray-300 px-2 py-1 text-sm rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
          {/* Name + Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-4 py-3 outline-none focus:border-[#FF7A21]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-4 py-3 outline-none focus:border-[#FF7A21]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-4 py-3 outline-none focus:border-[#FF7A21]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-4 py-3 outline-none focus:border-[#FF7A21]"
              />
            </div>
          </div>
          {/* Address Section */}
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h3 className="text-md font-semibold text-gray-900">
              Address Information
            </h3>
          </div>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-3 outline-none focus:border-[#FF7A21]"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-4 py-3 outline-none"
              >
                <option value="">Select</option>
                <option value="India">India</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-4 py-3 outline-none"
              >
                <option value="">Select</option>
                <option value="Delhi">Delhi</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-4 py-3 outline-none"
              >
                <option value="">Select</option>
                <option value="Delhi">Delhi</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postal Code
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-4 py-3 outline-none focus:border-[#FF7A21]"
              />
            </div>
          </div>
          {/* Change Password */}
          <div className="border-b border-gray-200 pb-4 mb-6">
            {" "}
            <h3 className="text-md font-semibold text-gray-900">
              {" "}
              Change Password{" "}
            </h3>{" "}
          </div>{" "}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {" "}
            {/* Current Password */}{" "}
            <div>
              {" "}
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {" "}
                Current Password{" "}
              </label>{" "}
              <div className="relative">
                {" "}
                <input
                  type={showCurrent ? "text" : "password"}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 pr-12 outline-none focus:border-[#FF7A21]"
                />{" "}
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {" "}
                  {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}{" "}
                </button>{" "}
              </div>{" "}
            </div>{" "}
            {/* New Password */}{" "}
            <div>
              {" "}
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {" "}
                New Password{" "}
              </label>{" "}
              <div className="relative">
                {" "}
                <input
                  type={showNew ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 pr-12 outline-none focus:border-[#FF7A21]"
                />{" "}
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {" "}
                  {showNew ? <EyeOff size={20} /> : <Eye size={20} />}{" "}
                </button>{" "}
              </div>{" "}
            </div>{" "}
            {/* Confirm Password */}{" "}
            <div>
              {" "}
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {" "}
                Confirm Password{" "}
              </label>{" "}
              <div className="relative">
                {" "}
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 pr-12 outline-none focus:border-[#FF7A21]"
                />{" "}
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {" "}
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}{" "}
                </button>{" "}
              </div>{" "}
            </div>{" "}
          </div>
          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              className="border border-gray-300 px-5 py-2 rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-[#FF7A21] text-white px-5 py-2 rounded-md hover:opacity-90"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
