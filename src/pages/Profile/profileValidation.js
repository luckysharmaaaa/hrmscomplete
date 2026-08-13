import * as Yup from "yup";

export const profileSchema = Yup.object().shape({
  firstName: Yup.string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(100)
    .required("First name is required"),
  lastName: Yup.string()
    .trim()
    .min(1, "Last name is required")
    .max(100)
    .required("Last name is required"),
  email: Yup.string()
    .trim()
    .email("Enter a valid email address")
    .required("Email is required"),
  phone: Yup.string()
    .trim()
    .matches(/^[\d\s\-()+]{10,20}$/, "Enter a valid phone number")
    .nullable()
    .notRequired(),
});

export const passwordSchema = Yup.object().shape({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "New password and confirm password do not match")
    .required("Please confirm your new password"),
});