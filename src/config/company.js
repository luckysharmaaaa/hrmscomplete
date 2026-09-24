// Set these in .env (Vite). The domain defaults to bytesbrick.com, so the
// company-email-only rule is always on.
//   VITE_COMPANY_NAME=BytesBrick
//   VITE_COMPANY_EMAIL_DOMAIN=bytesbrick.com
//   VITE_FIRST_TIME_ACCESS=true   (optional; leave unset while it is not used)

export const COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME || "BytesBrick";

export const COMPANY_EMAIL_DOMAIN = String(
  import.meta.env.VITE_COMPANY_EMAIL_DOMAIN || "bytesbrick.com"
)
  .trim()
  .toLowerCase()
  .replace(/^@/, "");

// Off by default: sign-in is company-email only.
export const FIRST_TIME_ACCESS_ENABLED =
  import.meta.env.VITE_FIRST_TIME_ACCESS === "true";

/**
 * Friendly UI check only. The backend is the authority on who may sign in.
 */
export const isCompanyEmail = (email) => {
  if (!COMPANY_EMAIL_DOMAIN) return true;

  const parts = String(email || "").trim().toLowerCase().split("@");

  return parts.length === 2 && parts[0] !== "" && parts[1] === COMPANY_EMAIL_DOMAIN;
};