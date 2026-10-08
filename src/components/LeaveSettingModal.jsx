import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { CalendarCog, Loader2 } from "lucide-react";

import SideDrawer from "./ui/SideDrawer";
import Switch from "./ui/Switch";
import { createLeaveSetting, updateLeaveSetting } from "../services/leaveService";

const schema = Yup.object({
  leaveCode: Yup.string().trim().required("Leave code is required").max(10),
  leaveName: Yup.string().trim().required("Leave name is required").max(50),
  leavePerMonth: Yup.number()
    .min(0, "Cannot be negative")
    .required("Leave per month is required"),
  maxBalance: Yup.number().min(0, "Cannot be negative").required("Max balance is required"),
  carryForward: Yup.boolean(),
  maxCarryForward: Yup.number().min(0, "Cannot be negative"),
  allowHalfDay: Yup.boolean(),
  isPaid: Yup.boolean(),
});

const EMPTY_VALUES = {
  leaveCode: "",
  leaveName: "",
  leavePerMonth: 0,
  maxBalance: 0,
  carryForward: false,
  maxCarryForward: 0,
  allowHalfDay: true,
  isPaid: true,
};

const FORM_ID = "leave-setting-form";

// Section heading with divider (same as the Roles / User drawers)
const Section = ({ title, description, children }) => (
  <section>
    <div className="mb-4 border-b border-border-subtle pb-3">
      <h3 className="text-sm font-semibold text-primary-700">{title}</h3>
      {description && <p className="mt-0.5 text-xs text-text-secondary">{description}</p>}
    </div>
    {children}
  </section>
);

const FieldError = ({ name }) => (
  <ErrorMessage name={name} component="p" className="mt-1.5 text-xs text-danger-600" />
);

// One policy option: label + help text on the left, switch on the right
const ToggleRow = ({ title, description, checked, disabled, onChange }) => (
  <div className="flex items-center justify-between gap-4 rounded-lg border border-border-subtle bg-background px-4 py-3.5">
    <div className="min-w-0">
      <p className="text-sm font-medium text-text-primary">{title}</p>
      <p className="text-xs text-text-secondary">{description}</p>
    </div>

    <Switch checked={checked} disabled={disabled} ariaLabel={title} onChange={onChange} />
  </div>
);

// ── Add / Edit Leave Setting Drawer ─────────────────────────────
export default function LeaveSettingModal({ open, leave, onClose, onSaved }) {
  const isEdit = !!leave;

  const initialValues = isEdit
    ? {
        leaveCode: leave.leaveCode ?? "",
        leaveName: leave.leaveName ?? "",
        leavePerMonth: Number(leave.leavePerMonth ?? 0),
        maxBalance: Number(leave.maxBalance ?? 0),
        carryForward: !!Number(leave.carryForward),
        maxCarryForward: Number(leave.maxCarryForward ?? 0),
        allowHalfDay: !!Number(leave.allowHalfDay),
        isPaid: !!Number(leave.isPaid),
      }
    : EMPTY_VALUES;

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    setStatus(null);
    try {
      const payload = {
        leaveCode: values.leaveCode.trim(),
        leaveName: values.leaveName.trim(),
        leavePerMonth: Number(values.leavePerMonth),
        maxBalance: Number(values.maxBalance),
        carryForward: values.carryForward ? 1 : 0,
        maxCarryForward: Number(values.maxCarryForward),
        allowHalfDay: values.allowHalfDay ? 1 : 0,
        isPaid: values.isPaid ? 1 : 0,
      };

      if (isEdit) {
        await updateLeaveSetting(leave.id, payload);
      } else {
        await createLeaveSetting(payload);
      }

      onSaved?.();
      onClose();
    } catch (err) {
      setStatus(err?.response?.data?.message || "Failed to save leave setting.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={schema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, status, values, setFieldValue }) => (
        <SideDrawer
          open={open}
          onClose={isSubmitting ? undefined : onClose}
          icon={CalendarCog}
          size="md"
          title={isEdit ? "Edit Leave Type" : "Add Leave Type"}
          subtitle={isEdit ? "Update this leave type's policy" : "Define a new leave type policy"}
          footer={
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="hr-btn hr-btn-outline"
              >
                Cancel
              </button>

              <button
                type="submit"
                form={FORM_ID}
                disabled={isSubmitting}
                className="hr-btn hr-btn-primary min-w-[150px]"
              >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {isSubmitting ? "Saving..." : isEdit ? "Update Leave Type" : "Add Leave Type"}
              </button>
            </>
          }
        >
          <Form id={FORM_ID} noValidate className="space-y-8">
            {status && (
              <div
                role="alert"
                className="rounded-lg border border-danger-100 bg-danger-50 px-4 py-2.5 text-sm text-danger-600"
              >
                {status}
              </div>
            )}

            {/* BASIC INFORMATION */}
            <Section title="Basic Information" description="How this leave type is named and identified.">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="leaveCode" className="hr-label">
                    Leave Code <span className="text-danger-500">*</span>
                  </label>
                  <Field
                    id="leaveCode"
                    name="leaveCode"
                    placeholder="e.g. CL"
                    disabled={isEdit}
                    className="hr-input font-mono"
                  />
                  {isEdit && (
                    <p className="mt-1.5 text-xs text-text-secondary">The code can't be changed.</p>
                  )}
                  <FieldError name="leaveCode" />
                </div>

                <div>
                  <label htmlFor="leaveName" className="hr-label">
                    Leave Name <span className="text-danger-500">*</span>
                  </label>
                  <Field
                    id="leaveName"
                    name="leaveName"
                    placeholder="e.g. Casual Leave"
                    className="hr-input"
                  />
                  <FieldError name="leaveName" />
                </div>
              </div>
            </Section>

            {/* ENTITLEMENT */}
            <Section title="Entitlement" description="How many days an employee earns and can hold.">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="leavePerMonth" className="hr-label">
                    Leave / Month <span className="text-danger-500">*</span>
                  </label>
                  <Field
                    id="leavePerMonth"
                    type="number"
                    step="0.5"
                    min="0"
                    name="leavePerMonth"
                    className="hr-input"
                  />
                  <p className="mt-1.5 text-xs text-text-secondary">Days credited every month.</p>
                  <FieldError name="leavePerMonth" />
                </div>

                <div>
                  <label htmlFor="maxBalance" className="hr-label">
                    Max Balance <span className="text-danger-500">*</span>
                  </label>
                  <Field
                    id="maxBalance"
                    type="number"
                    step="0.5"
                    min="0"
                    name="maxBalance"
                    className="hr-input"
                  />
                  <p className="mt-1.5 text-xs text-text-secondary">Most days an employee can hold.</p>
                  <FieldError name="maxBalance" />
                </div>
              </div>
            </Section>

            {/* POLICY */}
            <Section title="Policy Options" description="Rules that apply when this leave is used.">
              <div className="space-y-3">
                <ToggleRow
                  title="Paid leave"
                  description="Salary is paid for the days taken."
                  checked={values.isPaid}
                  disabled={isSubmitting}
                  onChange={() => setFieldValue("isPaid", !values.isPaid)}
                />

                <ToggleRow
                  title="Allow half day"
                  description="Employees can apply for half a day."
                  checked={values.allowHalfDay}
                  disabled={isSubmitting}
                  onChange={() => setFieldValue("allowHalfDay", !values.allowHalfDay)}
                />

                <ToggleRow
                  title="Allow carry forward"
                  description="Unused days move into the next year."
                  checked={values.carryForward}
                  disabled={isSubmitting}
                  onChange={() => setFieldValue("carryForward", !values.carryForward)}
                />

                <div>
                  <label htmlFor="maxCarryForward" className="hr-label">
                    Max carry forward (days)
                  </label>
                  <Field
                    id="maxCarryForward"
                    type="number"
                    step="0.5"
                    min="0"
                    name="maxCarryForward"
                    placeholder="Max carry forward days"
                    disabled={!values.carryForward}
                    className="hr-input"
                  />
                  <FieldError name="maxCarryForward" />
                </div>
              </div>
            </Section>
          </Form>
        </SideDrawer>
      )}
    </Formik>
  );
}