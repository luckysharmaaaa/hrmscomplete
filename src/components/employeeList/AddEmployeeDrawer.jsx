import { useEffect, useRef, useState } from 'react';import {
  Calendar,
  Download,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Loader2,
  Search,
  UserPlus,
  X,
} from "lucide-react";

import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";

import SideDrawer from "../ui/SideDrawer";

import {
  createEmployee,
  getImportableUsers,
  updateEmployee,
  getManagers,
} from "../../services/employee.service";

import { getDepartments } from "../../services/department.service";
import { getDesignations } from "../../services/designation.service";
import { uploadMedia } from "../../services/mediaApi";

// ============================================================================
// Constants
// ============================================================================

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  empId: "",
  joiningDate: "",
  managerId: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  company: "",
  departmentId: "",
  designationId: "",
  about: "",
  _importedUserId: null,
};

// ============================================================================
// Import Employee Modal
// ============================================================================

function ImportEmployeeModal({ open, onClose, onSelect }) {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setLoading(true);
    } else {
      setSearch("");
    }
  }

  useEffect(() => {
    if (!open) return;

    const fetchUsers = async () => {
      try {
        const response = await getImportableUsers();
        setUsers(response.data?.data ?? []);
      } catch (error) {
        console.error("IMPORTABLE USERS ERROR:", error);
        toast.error("Failed to load users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [open]);

  const filteredUsers = users.filter((user) => {
    const query = search.toLowerCase().trim();
    const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.toLowerCase();
    return (
      fullName.includes(query) ||
      (user.email ?? "").toLowerCase().includes(query) ||
      (user.phone ?? "").toLowerCase().includes(query)
    );
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-primary-900/40" onClick={onClose} />

      <div className="relative flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-lg bg-surface shadow-lg">
        <div className="h-[3px] bg-gradient-brand" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-primary-50 p-2 text-primary-700">
              <Download size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-primary-700">Import Employee</h3>
              <p className="mt-0.5 text-xs text-text-secondary">Select a user to auto-fill the employee form</p>
            </div>
          </div>

          <button type="button" onClick={onClose} className="hr-icon-btn">
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-border-subtle px-5 py-3">
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or phone..."
              className="hr-input !h-10 pl-8"
            />
          </div>
        </div>

        {/* Users */}
        <div className="flex-1 divide-y divide-border-subtle overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center text-sm text-text-secondary">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-sm text-text-secondary">No users found.</div>
          ) : (
            filteredUsers.map((user) => {
              const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
              const initials =
                fullName.split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";
              const alreadyEmployee = Boolean(user.isEmployee);

              return (
                <button
                  key={user.id}
                  type="button"
                  disabled={alreadyEmployee}
                  onClick={() => {
                    if (alreadyEmployee) return;
                    onSelect(user);
                    onClose();
                  }}
                  className={`flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors ${
                    alreadyEmployee ? "cursor-not-allowed bg-background opacity-60" : "hover:bg-primary-50"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                      alreadyEmployee ? "bg-text-disabled" : "bg-accent-500"
                    }`}
                  >
                    {initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-semibold ${alreadyEmployee ? "text-text-disabled" : "text-text-primary"}`}>
                      {fullName || "—"}
                    </p>
                    <p className="truncate text-xs text-text-secondary">{user.email || "—"}</p>
                  </div>

                  {alreadyEmployee ? (
                    <span className="shrink-0 rounded-full border border-success-500/30 bg-success-50 px-2.5 py-1 text-[11px] font-semibold text-success-600">
                      ✓ Employee
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full border border-accent-500/30 bg-orange-50 px-2.5 py-1 text-[11px] font-medium text-accent-600">
                      Import
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className="border-t border-border-subtle px-5 py-3 text-xs text-text-secondary">
          {loading
            ? "Loading..."
            : `${filteredUsers.filter((u) => !u.isEmployee).length} of ${filteredUsers.length} user${
                filteredUsers.length !== 1 ? "s" : ""
              } available to import`}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Add / Edit Employee Drawer
// ============================================================================

export default function AddEmployeeDrawer({ open, onClose, editData, onSubmit }) {
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [managers, setManagers] = useState([]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileImage, setProfileImage] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importedFrom, setImportedFrom] = useState(false);
  // Which imported fields already have a value (only those get locked).
  const [importLocks, setImportLocks] = useState({ email: false, phone: false });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  const fileInputRef = useRef(null);

  const [prevOpen, setPrevOpen] = useState(open);
  const [prevEditData, setPrevEditData] = useState(editData);
  if (open !== prevOpen || editData !== prevEditData) {
    setPrevOpen(open);
    setPrevEditData(editData);
    if (open) {
      setApiError(null);
      setImportedFrom(false);
      setImportLocks({ email: false, phone: false });
      setProfileImage(null);
      setProfileImageFile(null);
    }
  }

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [departmentResponse, designationResponse, managerResponse] = await Promise.all([
          getDepartments(),
          getDesignations(),
          getManagers(),
        ]);

        setDepartments(departmentResponse.data?.data ?? []);
        setDesignations(designationResponse.data?.data ?? []);
        setManagers(managerResponse.data?.data ?? []);
      } catch (error) {
        console.error("DROPDOWN DATA ERROR:", error);
        toast.error("Failed to load employee dropdown data.");
      }
    };

    fetchDropdownData();
  }, []);

  const departmentOptions = departments.map((d) => ({
    value: d.id,
    label: d.departmentName || d.name || String(d.id),
  }));

  const designationOptions = designations.map((d) => ({
    value: d.id,
    label: d.designationName || d.name || String(d.id),
  }));

  const managerOptions = managers.map((m) => ({
    value: m.id,
    label: `${m.employeeCode || ""} - ${m.firstName || ""} ${m.lastName || ""}`.trim(),
  }));

  const validationSchema = Yup.object({
    firstName: editData ? Yup.string() : Yup.string().required("First Name is required"),
    lastName: Yup.string(),
    empId: editData ? Yup.string() : Yup.string().required("Employee ID is required"),
    joiningDate: editData ? Yup.string() : Yup.string().required("Joining Date is required"),
    email: editData
      ? Yup.string().email("Invalid email format")
      : Yup.string().email("Invalid email format").required("Email is required"),
    password: Yup.string().when("_importedUserId", {
      is: (userId) => !editData && !userId,
      then: (schema) => schema.required("Password is required").min(6, "Password must be at least 6 characters"),
      otherwise: (schema) => schema.notRequired(),
    }),
    confirmPassword: Yup.string().when("_importedUserId", {
      is: (userId) => !editData && !userId,
      then: (schema) =>
        schema.required("Confirm Password is required").oneOf([Yup.ref("password")], "Passwords do not match"),
      otherwise: (schema) => schema.notRequired(),
    }),
    // FIX: an imported user (self-registered / Google) often has NO phone.
    // The phone field is locked after import, so the "required" error was
    // invisible and the Save button silently did nothing. Phone is now only
    // required for brand-new users; for imports it is optional.
    phone: Yup.string().when("_importedUserId", {
      is: (userId) => !editData && !userId,
      then: (schema) => schema.required("Phone Number is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    company: Yup.string().nullable(),
    departmentId: editData ? Yup.string() : Yup.string().required("Department is required"),
    designationId: editData ? Yup.string() : Yup.string().required("Designation is required"),
    about: editData ? Yup.string() : Yup.string().required("About is required"),
    managerId: Yup.string().nullable(),
  });

  const formik = useFormik({
    initialValues: EMPTY_FORM,
    validationSchema,

    onSubmit: async (values) => {
      setIsSubmitting(true);
      setApiError(null);

      try {
        const isImporting = Boolean(values._importedUserId);

        let uploadedMediaId = null;

        if (profileImageFile) {
          const formData = new FormData();
          formData.append("file", profileImageFile);
          formData.append("title", `${values.firstName || "Employee"} Profile Image`);
          formData.append("altText", `${values.firstName || "Employee"} Profile Image`);

          const uploadResponse = await uploadMedia(formData, "employees");
          uploadedMediaId = uploadResponse?.data?.data?.mediaId ?? null;

          if (!uploadedMediaId) {
            throw new Error("Image upload succeeded but no media ID was returned.");
          }
        }

        if (editData) {
          const originalName = editData.name || "";
          const nameParts = originalName.trim().split(" ");
          const originalFirstName = nameParts[0] || "";
          const originalLastName = nameParts.slice(1).join(" ");

          const payload = {
            firstName: values.firstName || originalFirstName,
            lastName: values.lastName ?? originalLastName,
            email: values.email || editData.email || null,
            phone: values.phone || editData.phone || null,
            employeeCode: values.empId || editData.empId || null,
            departmentId: values.departmentId || null,
            designationId: values.designationId || null,
            joiningDate: values.joiningDate || editData.joiningDate || null,
            managerId: values.managerId || null,
            about: values.about || null,
            status: true,
            ...(uploadedMediaId ? { mediaId: uploadedMediaId } : {}),
          };

          await updateEmployee(editData.id, payload);
          toast.success("Employee updated successfully");
        } else {
          const payload = {
            ...(isImporting
              ? { userId: values._importedUserId }
              : {
                  firstName: values.firstName,
                  lastName: values.lastName,
                  email: values.email,
                  phone: values.phone || null,
                  password: values.password,
                }),
            // Imported user had no phone -> send the one typed in the form.
            ...(isImporting && values.phone ? { phone: values.phone } : {}),
            employeeCode: values.empId || null,
            departmentId: values.departmentId || null,
            designationId: values.designationId || null,
            joiningDate: values.joiningDate || null,
            managerId: values.managerId || null,
            about: values.about || null,
            status: true,
            ...(uploadedMediaId ? { mediaId: uploadedMediaId } : {}),
          };

          const response = await createEmployee(payload);
          const employeeId = response?.data?.data?.employeeId;

          if (!employeeId) {
            throw new Error("Employee created but employee ID was not returned.");
          }

          toast.success(isImporting ? "Employee imported successfully" : "Employee created successfully");
        }

        await onSubmit?.();
        onClose();
      } catch (error) {
        console.error("EMPLOYEE SAVE ERROR:", error);

        const status = error?.response?.status;
        const message = error?.response?.data?.message || error?.message || "Something went wrong. Please try again.";
        const code = error?.response?.data?.errors?.code ?? null;

        if (status === 409) {
          setApiError({ message, code });
        } else {
          toast.error(message);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (!open) return;

    if (fileInputRef.current) fileInputRef.current.value = "";

    if (editData) {
      const nameParts = (editData.name || "").trim().split(" ");

      formik.setValues({
        ...EMPTY_FORM,
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        empId: editData.empId || "",
        email: editData.email || "",
        phone: editData.phone || "",
        departmentId: editData.departmentId || "",
        designationId: editData.designationId || "",
        joiningDate: editData.joiningDate || "",
        managerId: editData.managerId || "",
        about: editData.about || "",
      });
    } else {
      formik.setValues({ ...EMPTY_FORM });
    }

    formik.setTouched({});
    formik.setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editData]);

  const handleImportSelect = (user) => {
    formik.setValues({
      ...EMPTY_FORM,
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      _importedUserId: user.id,
    });

    formik.setTouched({});
    formik.setErrors({});
    setImportLocks({ email: Boolean(user.email), phone: Boolean(user.phone) });
    setImportedFrom(true);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image should be below 4 MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setProfileImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setProfileImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleCancelImage = () => {
    setProfileImage(null);
    setProfileImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --------------------------------------------------------------------------
  // Field / Select renderers, now using the hr-* design system
  // --------------------------------------------------------------------------

  const renderField = ({ label, name, type = "text", required = true, icon = null, onIconClick = null, locked = false }) => {
    const hasError = formik.touched[name] && formik.errors[name];
    // Lock only fields that actually came from the imported user, so an
    // empty phone can still be typed in.
    const isDisabled = locked && importedFrom && Boolean(importLocks[name]);
    const isRequired =
      editData ? false : name === "phone" && importedFrom ? false : required;

    return (
      <div>
        <label className="hr-label">
          {label}
          {isRequired && <span className="ml-0.5 text-danger-500">*</span>}
        </label>

        <div className="relative">
          <input
            id={name}
            name={name}
            type={type}
            disabled={isDisabled}
            value={formik.values[name] ?? ""}
            onChange={(event) => {
              formik.handleChange(event);
              if (name === "email" && apiError) setApiError(null);
            }}
            onBlur={formik.handleBlur}
            onClick={(event) => {
              if (type === "date" && event.target.showPicker) event.target.showPicker();
            }}
            placeholder={type === "date" ? "dd/mm/yyyy" : ""}
            className={`hr-input ${icon ? "pr-10" : ""} ${hasError && !isDisabled ? "is-error" : ""}`}
          />

          {icon && (
            <button
              type="button"
              disabled={isDisabled || !onIconClick}
              onClick={onIconClick}
              className={`absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-text-secondary ${
                onIconClick && !isDisabled ? "cursor-pointer hover:bg-primary-50 hover:text-primary-700" : "pointer-events-none"
              }`}
            >
              {icon}
            </button>
          )}
        </div>

        {hasError && !isDisabled && <p className="mt-1.5 text-xs text-danger-600">{formik.errors[name]}</p>}
      </div>
    );
  };

  const renderSelect = ({ label, name, options, required = true, locked = false }) => {
    const hasError = formik.touched[name] && formik.errors[name];
    const isDisabled = locked && importedFrom;
    const isRequired = editData ? false : required;

    return (
      <div>
        <label className="hr-label">
          {label}
          {isRequired && <span className="ml-0.5 text-danger-500">*</span>}
        </label>

        <select
          name={name}
          disabled={isDisabled}
          value={formik.values[name] ?? ""}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`hr-select ${hasError && !isDisabled ? "is-error" : ""}`}
        >
          <option value="">Select</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {hasError && !isDisabled && <p className="mt-1.5 text-xs text-danger-600">{formik.errors[name]}</p>}
      </div>
    );
  };

  return (
    <>
      <ImportEmployeeModal open={importModalOpen} onClose={() => setImportModalOpen(false)} onSelect={handleImportSelect} />

      <SideDrawer
        open={open}
        onClose={onClose}
        icon={UserPlus}
        size="lg"
        title={editData ? "Edit Employee" : "Add New Employee"}
        subtitle={`Employee ID : ${formik.values.empId || "EMP-0024"}`}
        footer={
          <>
            <button type="button" onClick={onClose} disabled={isSubmitting} className="hr-btn hr-btn-outline">
              Cancel
            </button>
            <button type="submit" form="employee-form" disabled={isSubmitting} className="hr-btn hr-btn-primary min-w-[130px]">
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isSubmitting ? "Saving..." : editData ? "Save Changes" : "Save"}
            </button>
          </>
        }
      >
        <form id="employee-form" onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Profile Image + Import */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-5">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-dashed border-border-strong bg-background">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon size={24} className="text-text-disabled" />
                )}
              </div>

              <div>
                <h3 className="mb-1 text-sm font-semibold text-primary-700">Upload Profile Image</h3>
                <p className="mb-3 text-xs text-text-secondary">Image should be below 4 MB</p>

                <div className="flex gap-2">
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="hr-btn hr-btn-primary hr-btn-sm">
                    Upload
                  </button>
                  <button type="button" onClick={handleCancelImage} className="hr-btn hr-btn-outline hr-btn-sm">
                    Cancel
                  </button>
                </div>
              </div>
            </div>

            {!editData && (
              <button type="button" onClick={() => setImportModalOpen(true)} className="hr-btn hr-btn-outline">
                <Download size={15} />
                Import Employee
              </button>
            )}
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            {renderField({ label: "First Name", name: "firstName" })}
            {renderField({ label: "Last Name", name: "lastName", required: false })}
            {renderField({ label: "Email", name: "email", type: "email", locked: true })}
            {renderField({ label: "Phone Number", name: "phone", type: "tel", locked: true })}
            {renderField({ label: "Employee ID", name: "empId" })}
            {renderField({ label: "Joining Date", name: "joiningDate", type: "date", icon: <Calendar size={16} /> })}

            {!editData && (
              <>
                {renderField({
                  label: "Password",
                  name: "password",
                  type: showPassword ? "text" : "password",
                  icon: showPassword ? <Eye size={16} /> : <EyeOff size={16} />,
                  onIconClick: () => setShowPassword((p) => !p),
                })}
                {renderField({
                  label: "Confirm Password",
                  name: "confirmPassword",
                  type: showConfirmPassword ? "text" : "password",
                  icon: showConfirmPassword ? <Eye size={16} /> : <EyeOff size={16} />,
                  onIconClick: () => setShowConfirmPassword((p) => !p),
                })}
              </>
            )}

            {renderSelect({ label: "Manager ID", name: "managerId", options: managerOptions, required: false })}
            {renderField({ label: "Previous Company Name", name: "company", required: false })}
            {renderSelect({ label: "Department", name: "departmentId", options: departmentOptions })}
            {renderSelect({ label: "Designation", name: "designationId", options: designationOptions })}
          </div>

          {/* About */}
          <div>
            <label className="hr-label">
              About
              {!editData && <span className="ml-0.5 text-danger-500">*</span>}
            </label>
            <textarea
              name="about"
              value={formik.values.about}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`hr-input h-auto! min-h-[100px] resize-none py-2.5 ${
                formik.touched.about && formik.errors.about ? "is-error" : ""
              }`}
            />
            {formik.touched.about && formik.errors.about && (
              <p className="mt-1.5 text-xs text-danger-600">{formik.errors.about}</p>
            )}
          </div>

          {/* API Error */}
          {apiError && (
            <div className="flex items-start gap-2.5 rounded-md border border-danger-500/20 bg-danger-50 px-4 py-3 text-sm text-danger-600">
              <span>
                {apiError.code === "ALREADY_EMPLOYEE" ? (
                  <>{apiError.message} This person already has an employee profile and cannot be added again.</>
                ) : (
                  <>
                    {apiError.message} Please{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setApiError(null);
                        setImportModalOpen(true);
                      }}
                      className="font-semibold underline"
                    >
                      Import this user
                    </button>{" "}
                    instead of creating a new account.
                  </>
                )}
              </span>
            </div>
          )}
        </form>
      </SideDrawer>
    </>
  );
}