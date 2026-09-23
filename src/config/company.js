// Single source of truth for company identity on the frontend.
// Set these in .env (Vite):
//   VITE_COMPANY_NAME=BytesBrick
//   VITE_COMPANY_EMAIL_DOMAIN=bytesbrick.com
//
// If VITE_COMPANY_EMAIL_DOMAIN is empty, domain enforcement and the
// "First-Time Employee Access" option are switched off and Login behaves
// exactly as it did before.

export const COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME || "BytesBrick";

export const COMPANY_EMAIL_DOMAIN = String(
  import.meta.env.VITE_COMPANY_EMAIL_DOMAIN || ""
)
  .trim()
  .toLowerCase()
  .replace(/^@/, "");

export const FIRST_TIME_ACCESS_ENABLED = Boolean(COMPANY_EMAIL_DOMAIN);

/**
 * Friendly UI check only. The backend is the authority on who may sign in.
 */
export const isCompanyEmail = (email) => {
  if (!COMPANY_EMAIL_DOMAIN) return true;

  const parts = String(email || "").trim().toLowerCase().split("@");

  return parts.length === 2 && parts[0] !== "" && parts[1] === COMPANY_EMAIL_DOMAIN;
};