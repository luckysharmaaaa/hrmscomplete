
/**
 * Switch — one toggle for the whole app (status Active/Inactive etc.)
 * <Switch checked={on} onChange={toggle} ariaLabel="Toggle status" />
 */
export default function Switch({ checked, onChange, disabled = false, ariaLabel = "Toggle" }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-primary-700" : "bg-border-strong"
      }`}
    >
      <span
        className={`inline-block h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 ease-standard ${
          checked ? "translate-x-[23px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );
}