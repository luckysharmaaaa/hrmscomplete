import { useEffect, useState } from 'react';import { useFormik } from "formik";
import { toast } from "react-toastify";
import * as Yup from "yup";

import { createUser } from "../../services/userApi";
import { uploadMedia } from "../../services/mediaApi";
import { isCompanyEmail, COMPANY_EMAIL_DOMAIN } from "../../config/company";

import UserForm from "./Userform";

// ============================================================
// VALIDATION SCHEMA
// ============================================================
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

const initialValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
};

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

const revokeIfBlob = (url) => {
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
};

// ============================================================
// ADD USER DRAWER
// ============================================================
const AddUserDrawer = ({ open, onClose, onSuccess, roles = [] }) => {
  const [status, setStatus] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState([]);

  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  const [addressData, setAddressData] = useState(initialAddressState);

  const handleRoleChange = (roleId) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((item) => item !== roleId)
        : [...prev, roleId],
    );
  };

  const handleImageChange = (file) => {
    revokeIfBlob(profileImagePreview);
    setProfileImageFile(file);
    setProfileImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    revokeIfBlob(profileImagePreview);
    setProfileImageFile(null);
    setProfileImagePreview(null);
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;

    setAddressData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const formik = useFormik({
    initialValues,
    validationSchema,

    onSubmit: async (values, { resetForm }) => {
      try {
        if (selectedRoles.length === 0) {
          toast.error("Please select at least one role.");
          return;
        }

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

        const payload = {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email.trim().toLowerCase(),
          phone: values.phone,
          password: values.password,
          status,
          roles: selectedRoles,
          address: {
            addressType: addressData.addressType,
            houseNumber: addressData.houseNo, // backend expects houseNumber
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
            latitude: addressData.latitude ? Number(addressData.latitude) : null,
            longitude: addressData.longitude ? Number(addressData.longitude) : null,
            isDefault: addressData.isDefault,
          },
        };

        const response = await createUser(payload);

        if (!response.data.success) {
          toast.error(response.data.message || "Failed to create user.");
          return;
        }

        const userId = response.data.data.id;

        // The user already exists. An image failure only warns, so the admin
        // doesn't re-submit and create a duplicate.
        if (profileImageFile) {
          try {
            const formData = new FormData();

            formData.append("file", profileImageFile);
            formData.append("title", profileImageFile.name);
            formData.append(
              "altText",
              `${values.firstName} ${values.lastName}`.trim(),
            );
            formData.append("objectID", String(userId));
            formData.append("objectType", "user");

            const mediaResponse = await uploadMedia(formData, "users");

            if (!mediaResponse.data.success) {
              toast.warn(
                `User created, but the profile photo didn't upload: ${
                  mediaResponse.data.message ||
                  "please add it from the user's profile."
                }`,
              );
            }
          } catch (imageError) {
            console.error("Image Upload Error:", imageError);
            toast.warn(
              "User created, but the profile photo didn't upload. You can add it from the user's profile.",
            );
          }
        }

        // FIX: success toast now shows whether or not a photo was attached
        // (before, it was skipped whenever a photo was selected).
        toast.success(response.data.message || "User created successfully.");

        resetAll(resetForm);
        onSuccess?.();
        onClose();
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || "Failed to create user.");
      }
    },
  });

  // ============================================================
  // RESET — one place, used on close, on success and on reopen
  // ============================================================
  function resetAll(resetForm = formik.resetForm) {
    resetForm?.();

    setSelectedRoles([]);
    setStatus(true);

    revokeIfBlob(profileImagePreview);
    setProfileImageFile(null);
    setProfileImagePreview(null);

    setAddressData(initialAddressState);
  }

  // Every time the drawer opens it starts clean (no data from a previous add).
  useEffect(() => {
    if (open) resetAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Free the preview URL if the drawer unmounts with a photo selected.
  useEffect(() => () => revokeIfBlob(profileImagePreview), [profileImagePreview]);

  const handleClose = () => {
    if (formik.isSubmitting) return; // don't close mid-save
    resetAll();
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