import React, { useState } from "react";

const ProfileForm = () => {
  const [profileImage, setProfileImage] = useState(null);

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
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const handleCancelImage = () => {
    setProfileImage(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(formData);

    alert("Profile Updated Successfully");
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Heading */}
      <div className="border-b border-gray-200 pb-5 mb-8">
        <h2 className="text-2xl font-semibold text-[#0F265C]">
          My Profile
        </h2>

        <p className="text-gray-500 text-sm mt-1">
          Update your personal information.
        </p>
      </div>

      {/* Profile Image */}
      <div className="bg-slate-50 rounded-xl p-6 flex items-center gap-6 mb-8">
        <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center">
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-400 text-sm">IMG</span>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-[#0F265C]">
            Profile Photo
          </h3>

          <p className="text-gray-500 text-sm mt-1">
            JPG, PNG (Max 2MB)
          </p>

          <div className="flex gap-3 mt-4">
            <label className="bg-[#FF7A21] text-white px-4 py-2 rounded-md cursor-pointer hover:opacity-90">
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
              className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100"
            >
              Remove
            </button>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div>
          <label className="block mb-2 text-sm font-medium">
            First Name
          </label>

          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3 focus:border-[#FF7A21] outline-none"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">
            Last Name
          </label>

          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3 focus:border-[#FF7A21] outline-none"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">
            Email
          </label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3 focus:border-[#FF7A21] outline-none"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">
            Phone
          </label>

          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3 focus:border-[#FF7A21] outline-none"
          />
        </div>

      </div>

      {/* Address */}
      <div className="mt-10">

        <h3 className="text-lg font-semibold text-[#0F265C] mb-5">
          Address Information
        </h3>

        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          className="w-full border rounded-lg px-4 py-3 mb-6 focus:border-[#FF7A21] outline-none"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <select
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="border rounded-lg px-4 py-3"
          >
            <option value="">Select Country</option>
            <option>India</option>
          </select>

          <select
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="border rounded-lg px-4 py-3"
          >
            <option value="">Select State</option>
            <option>Delhi</option>
          </select>

          <select
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="border rounded-lg px-4 py-3"
          >
            <option value="">Select City</option>
            <option>Delhi</option>
          </select>

          <input
            type="text"
            name="postalCode"
            placeholder="Postal Code"
            value={formData.postalCode}
            onChange={handleChange}
            className="border rounded-lg px-4 py-3 focus:border-[#FF7A21] outline-none"
          />

        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 mt-10">

        <button
          type="button"
          className="border border-gray-300 px-6 py-2.5 rounded-lg hover:bg-gray-100"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="bg-[#FF7A21] text-white px-6 py-2.5 rounded-lg hover:opacity-90"
        >
          Save Changes
        </button>

      </div>
    </form>
  );
};

export default ProfileForm;