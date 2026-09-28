import React, { useState } from "react";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import * as Yup from "yup";

import { createUser } from "../../services/userApi";
import { uploadMedia } from "../../services/mediaApi";
import { isCompanyEmail, COMPANY_EMAIL_DOMAIN } from "../../config/company";

import UserForm from "./Userform";

// ============================================================
// VALIDATION SCHEMA
// ============================================================
// Email rule: ONLY an official company email (@bytesbrick.com)
// is allowed, and it is required.
const validationSchema = Yup.object({
  firstName: Yup.string()
    .min(2, "First Name must be at least 2 characters")
    .required("First Name is required"),

  lastName: Yup.string()
    .min(2, "Last Name must be at least 2 characters")
    .required("Last Name is required"),

  email: Yup.string()
    .trim()
    .email("Enter a valid email address")
    .required("Official email is required")
    .test(
      "is-company-domain",
      `Only @${COMPANY_EMAIL_DOMAIN} email addresses are allowed`,
      (value) => isCompanyEmail(value),
    ),

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

// ============================================================
// INITIAL ADDRESS STATE
// ============================================================
const initialAddressState = {
  addressType: "home",
  countryID: 1,
  countryCode: "IN",
  phoneCode: "+91",
  houseNo: "",
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  locality: "",
  city: "",
  state: "",
  zipCode: "",
  phone: "",
  latitude: "",
  longitude: "",
  isDefault: false,
};

// ============================================================
// ADD USER DRAWER COMPONENT
// ============================================================
const AddUserDrawer = ({ open, onClose, onSuccess, roles = [] }) => {
  // Default status of a newly created user is Active (true).
  const [status, setStatus] = useState(true);

  // IDs of roles selected by the admin.
  const [selectedRoles, setSelectedRoles] = useState([]);

  // Profile image
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  // Address
  const [addressData, setAddressData] = useState(initialAddressState);

  // ==========================================================
  // ROLE CHANGE HANDLER
  // ==========================================================
  const handleRoleChange = (roleId) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((item) => item !== roleId)
        : [...prev, roleId]
    );
  };

  // ==========================================================
  // IMAGE CHANGE HANDLER
  // ==========================================================
  const handleImageChange = (file) => {
    if (profileImagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(profileImagePreview);
    }

    setProfileImageFile(file);
    setProfileImagePreview(URL.createObjectURL(file));
  };

  // ==========================================================
  // REMOVE IMAGE HANDLER
  // ==========================================================
  const handleRemoveImage = () => {
    if (profileImagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(profileImagePreview);
    }

    setProfileImageFile(null);
    setProfileImagePreview(null);
  };

  // ==========================================================
  // ADDRESS CHANGE HANDLER
  // ==========================================================
  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;

    setAddressData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ==========================================================
  // RESET ALL FORM DATA
  // ==========================================================
  const resetAll = (resetForm) => {
    resetForm?.();

    setSelectedRoles([]);
    setStatus(true);

    if (profileImagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(profileImagePreview);
    }
    setProfileImageFile(null);
    setProfileImagePreview(null);

    setAddressData(initialAddressState);
  };

  // ==========================================================
  // FORMIK CONFIGURATION
  // ==========================================================
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
        // STEP 1: VALIDATE ROLE
        if (selectedRoles.length === 0) {
          toast.error("Please select at least one role.");
          return;
        }

        // STEP 2: VALIDATE REQUIRED ADDRESS FIELDS
        if (
          !addressData.addressType ||
          !addressData.addressLine1 ||
          !addressData.city ||
          !addressData.state ||
          !addressData.zipCode ||
          !addressData.countryID ||
          !addressData.countryCode ||
          !addressData.phoneCode
        ) {
          toast.error("Please fill all required address fields.");
          return;
        }

        // STEP 3: CREATE USER PAYLOAD
        const payload = {
          firstName: values.firstName,
          lastName: values.lastName,

          // Official company email only (@bytesbrick.com)
          email: values.email.trim().toLowerCase(),

          phone: values.phone,
          password: values.password,

          // User active/inactive status.
          status,

          // Selected role IDs.
          roles: selectedRoles,

          // Address information.
          address: {
            addressType: addressData.addressType,

            // Backend expects houseNumber.
            houseNumber: addressData.houseNo,

            addressLine1: addressData.addressLine1,
            addressLine2: addressData.addressLine2,
            landmark: addressData.landmark,
            locality: addressData.locality,

            city: addressData.city,
            state: addressData.state,
            zipCode: addressData.zipCode,

            countryID: Number(addressData.countryID),

            countryCode: addressData.countryCode,
            phoneCode: addressData.phoneCode,
            phone: addressData.phone,

            latitude: addressData.latitude
              ? Number(addressData.latitude)
              : null,

            longitude: addressData.longitude
              ? Number(addressData.longitude)
              : null,

            isDefault: addressData.isDefault,
          },
        };

        // STEP 4: CREATE USER
        const response = await createUser(payload);

        // STEP 5: CHECK USER CREATION RESPONSE
        if (response.data.success) {
          const userId = response.data.data.id;

          // STEP 6: UPLOAD PROFILE IMAGE
          // The user already exists at this point. If the image upload
          // fails we warn, but still finish the success path so the admin
          // doesn't re-submit and create a duplicate user.
          if (profileImageFile) {
            try {
              const formData = new FormData();

              formData.append("file", profileImageFile);
              formData.append("title", profileImageFile.name);
              formData.append(
                "altText",
                `${values.firstName} ${values.lastName}`.trim()
              );

              // Tells the backend this media belongs to the new user.
              formData.append("objectID", String(userId));
              formData.append("objectType", "user");

              const mediaResponse = await uploadMedia(formData, "users");

              if (!mediaResponse.data.success) {
                toast.warn(
                  `User created, but the profile photo didn't upload: ${
                    mediaResponse.data.message || "please add it from the user's profile."
                  }`
                );
              }
            } catch (imageError) {
              console.error("Image Upload Error:", imageError);

              toast.warn(
                "User created, but the profile photo didn't upload. You can add it from the user's profile."
              );
            }
          }

          // STEP 7: SUCCESS
          if (!profileImageFile) {
            toast.success(response.data.message);
          }

          resetAll(resetForm);

          onSuccess?.();

          onClose();
        } else {
          toast.error(
            response.data.message || "Failed to create user."
          );
        }
      } catch (error) {
        console.error(error);

        toast.error(
          error.response?.data?.message || "Failed to create user."
        );
      }
    },
  });

  // ==========================================================
  // CLOSE DRAWER HANDLER
  // ==========================================================
  const handleClose = () => {
    resetAll(formik.resetForm);
    onClose();
  };

  return (
    <UserForm
      open={open}
      mode="add"
      formik={formik}
      isPasswordOptional={false}
      roles={roles}
      selectedRoles={selectedRoles}
      onRoleChange={handleRoleChange}
      profileImagePreview={profileImagePreview}
      onImageChange={handleImageChange}
      onRemoveImage={handleRemoveImage}
      addressData={addressData}
      onAddressChange={handleAddressChange}
      status={status}
      onStatusToggle={() => setStatus((s) => !s)}
      onClose={handleClose}
      isSubmitting={formik.isSubmitting}
      submitLabel="Add User"
      submittingLabel="Adding..."
    />
  );
};

export default AddUserDrawer;