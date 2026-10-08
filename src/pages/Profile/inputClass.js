// One source of truth for input styling on the Profile page
// (same 40px control as every other form in the app).
export const inputClass = (hasError = false) =>
  `hr-input ${hasError ? "is-error" : ""}`;
