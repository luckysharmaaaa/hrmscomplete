import { AlertCircle } from "lucide-react";

import { inputClass } from "./inputClass";

/**
 * A settings block: title + description on the left, fields on the right.
 * Stacks on small screens.
 */
export const SettingsSection = ({ title, description, children }) => (
  <section className="hr-card">
    <div className="grid gap-6 p-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12 lg:p-8">
      <div>
        <h3 className="text-base font-semibold text-primary-700">{title}</h3>
        {description && (
          <p className="mt-1 text-sm leading-6 text-text-secondary">
            {description}
          </p>
        )}
      </div>

      <div>{children}</div>
    </div>
  </section>
);

/**
 * Label + control + error/hint, wired for screen readers
 * (label -> control via htmlFor, message -> control via aria-describedby).
 */
export const Field = ({
  id,
  label,
  required = false,
  error,
  hint,
  className = "",
  children,
}) => (
  <div className={className}>
    <label htmlFor={id} className="hr-label">
      {label}
      {required && (
        <span className="ml-0.5 text-danger-500" aria-hidden="true">
          *
        </span>
      )}
    </label>

    {children}

    {error ? (
      <p
        id={`${id}-error`}
        role="alert"
        className="mt-1.5 flex items-start gap-1.5 text-xs leading-5 text-danger-600"
      >
        <AlertCircle size={14} className="mt-0.5 shrink-0" />
        <span>{error}</span>
      </p>
    ) : hint ? (
      <p id={`${id}-hint`} className="mt-1.5 text-xs leading-5 text-text-secondary">
        {hint}
      </p>
    ) : null}
  </div>
);

/**
 * Formik-connected text input.
 * Errors show once the field has been touched (or a submit was attempted).
 */
export const TextField = ({
  formik,
  name,
  label,
  required = false,
  hint,
  className = "",
  type = "text",
  ...inputProps
}) => {
  const error = formik.touched[name] && formik.errors[name];

  return (
    <Field
      id={name}
      label={label}
      required={required}
      error={error}
      hint={hint}
      className={className}
    >
      <input
        id={name}
        name={name}
        type={type}
        value={formik.values[name] ?? ""}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error ? `${name}-error` : hint ? `${name}-hint` : undefined
        }
        className={inputClass(Boolean(error))}
        {...inputProps}
      />
    </Field>
  );
};