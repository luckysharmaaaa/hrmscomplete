import React, { useState } from "react";
import {
  FiHome,
  FiChevronRight,
  FiChevronsUp,
} from "react-icons/fi";

const Profile = () => {
  // Form State
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

  // Image State
  const [profileImage, setProfileImage] = useState(null);

  // Handle Input Change
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

  // Form Submit
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
    <div className="w-full min-h-screen bg-slate-100">
      {/* Header */}
      <div className="flex items-start justify-between px-6 py-1">
        <div>
          <h1 className="text-3xl font-bold text-[#0F265C]">
            Profile
          </h1>

          <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
            <FiHome size={14} />
            <FiChevronRight size={14} />
            <span>Pages</span>
            <FiChevronRight size={14} />
            <span className="font-medium text-[#0F265C]">
              Profile
            </span>
          </div>
        </div>

        <button className="w-10 h-10 flex items-center justify-center bg-[#FF7A21] border border-gray-300 rounded-md">
          <FiChevronsUp size={16} />
        </button>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          {/* Title */}
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-2xl font-semibold text-[#0F265C]">
              Profile
            </h2>
          </div>

          {/* Basic Information */}
          <h3 className="text-md font-semibold text-gray-900 pb-3">
            Basic Information
          </h3>

          {/* Profile Photo */}
          <div className="bg-slate-50 rounded-lg p-5 flex items-center gap-5 mb-5">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                "IMG"
              )}
            </div>

            <div>
              <h4 className="font-semibold text-[#0F265C]">
                Profile Photo
              </h4>

              <p className="text-sm text-gray-500 mt-1">
                Recommended image size is 40px x 40px
              </p>

              <div className="flex gap-3 mt-2">
                <label className="bg-[#FF7A21] text-white px-2 py-1 text-sm rounded-md cursor-pointer hover:opacity-90">
                  Upload
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>

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

          {/* Input Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            {[
              { label: "First Name", name: "firstName" },
              { label: "Last Name", name: "lastName" },
              { label: "Email", name: "email", type: "email" },
              { label: "Phone", name: "phone" },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                </label>

                <input
                  type={field.type || "text"}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 outline-none focus:border-[#FF7A21]"
                />
              </div>
            ))}
          </div>

          {/* Address */}
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

          {/* Password Section */}
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h3 className="text-md font-semibold text-gray-900">
              Change Password
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                label: "Current Password",
                name: "currentPassword",
              },
              {
                label: "New Password",
                name: "newPassword",
              },
              {
                label: "Confirm Password",
                name: "confirmPassword",
              },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                </label>

                <input
                  type="password"
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 outline-none focus:border-[#FF7A21]"
                />
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-8">
            <button
              type="reset"
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