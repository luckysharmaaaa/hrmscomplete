// Set these in .env (Vite):
//   VITE_COMPANY_NAME=BytesBrick
//
// NOTE: the email domain must match the backend (utils/Companyemail.ts),
// which is the authority on who may sign in. Don't change one without the other.

export const COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME || "BytesBrick";

export const COMPANY_EMAIL_DOMAIN = String(
  import.meta.env.VITE_COMPANY_EMAIL_DOMAIN || "bytesbrick.com"
)
  .trim()
  .toLowerCase()
  .replace(/^@/, "");

/**
 * Friendly UI check (Login, Add/Edit User forms). The backend enforces
 * the same rule, so this can't be used to bypass anything.
 */
export const isCompanyEmail = (email) => {
  const parts = String(email || "").trim().toLowerCase().split("@");

  return (
    parts.length === 2 &&
    parts[0] !== "" &&
    parts[1] === COMPANY_EMAIL_DOMAIN
  );
};