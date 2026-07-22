import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Calendar,
  EyeOff,
  Eye,
  Image as ImageIcon,
  UserPlus,
  Search,
  Download,
} from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { createEmployee, getImportableUsers } from "../../services/employee.service";

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  empId: "",
  joiningDate: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  company: "",
  department: "",
  designation: "",
  about: "",
  _importedUserId: null, // set when user is selected from the Import modal
};

const DEPTS = [
  "Finance",
  "Engineering",
  "Management",
  "Development",
  "Admin",
  "Analytics",
  "QA",
];
const DESIGNATIONS_LIST = ["Finance", "Developer", "Executive", "Manager"];

// ── Import Employee Modal ─────────────────────────────────────────────────────
function ImportEmployeeModal({ open, onClose, onSelect }) {
  const [search, setSearch] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setSearch("");
      return;
    }
    setLoading(true);
    getImportableUsers()
      .then((res) => setEmployees(res.data?.data ?? []))
      .catch(() => toast.error("Failed to load users."))
      .finally(() => setLoading(false));
  }, [open]);

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    const name = `${e.firstName ?? ""} ${e.lastName ?? ""}`.toLowerCase();
    return (
      name.includes(q) ||
      (e.email ?? "").toLowerCase().includes(q) ||
      (e.phone ?? "").toLowerCase().includes(q)
    );
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 z-10 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-xl">
              <Download size={18} className="text-orange-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F265C]">
                Import Employee
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Select an employee to auto-fill the form
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-gray-50">
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ID, email or department..."
              className="flex-1 text-sm outline-none placeholder-gray-400 bg-transparent"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {loading ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              Loading users…
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              No users found.
            </div>
          ) : (
            filtered.map((user) => {
              const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
              const initials = fullName
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              const alreadyEmployee = !!user.isEmployee;

              return (
                <button
                  key={user.id}
                  disabled={alreadyEmployee}
                  onClick={() => {
                    if (!alreadyEmployee) {
                      onSelect(user);
                      onClose();
                    }
                  }}
                  className={`w-full flex items-center gap-4 px-5 py-3.5 transition text-left group ${
                    alreadyEmployee
                      ? "opacity-50 cursor-not-allowed bg-gray-50"
                      : "hover:bg-orange-50/60 cursor-pointer"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                      alreadyEmployee ? "bg-gray-400" : "bg-orange-400"
                    }`}
                  >
                    {initials || "?"}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-semibold truncate transition ${
                        alreadyEmployee
                          ? "text-gray-400"
                          : "text-gray-800 group-hover:text-orange-600"
                      }`}
                    >
                      {fullName || "—"}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {user.email ?? "—"}
                    </p>
                  </div>

                  {/* Badge */}
                  {alreadyEmployee ? (
                    <span className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-600 border border-green-200">
                      ✓ Employee
                    </span>
                  ) : (
                    <span className="shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full bg-orange-50 text-orange-500 border border-orange-100">
                      Import
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer count */}
        <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400">
          {loading
            ? "Loading…"
            : `${filtered.filter((u) => !u.isEmployee).length} of ${filtered.length} user${filtered.length !== 1 ? "s" : ""} available to import`}
        </div>
      </div>
    </div>
  );
}

// ── Add Employee Drawer ───────────────────────────────────────────────────────
export default function AddEmployeeDrawer({
  open,
  onClose,
  editData,
  onSubmit,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importedFrom, setImportedFrom] = useState(false); // true = fields are locked
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null); // inline error from API (e.g. duplicate email)
  const fileInputRef = useRef(null);

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("First Name is required"),
    lastName: Yup.string(),
    empId: Yup.string().required("Employee ID is required"),
    joiningDate: Yup.string().required("Joining Date is required"),
    username: Yup.string().required("Username is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    password: Yup.string().when(["$isEditing", "_importedUserId"], {
      is: (isEditing, importedUserId) => !isEditing && !importedUserId,
      then: (schema) =>
        schema
          .required("Password is required")
          .min(6, "Password must be at least 6 characters"),
      otherwise: (schema) => schema,
    }),
    confirmPassword: Yup.string().when(["$isEditing", "_importedUserId"], {
      is: (isEditing, importedUserId) => !isEditing && !importedUserId,
      then: (schema) =>
        schema
          .required("Confirm Password is required")
          .oneOf([Yup.ref("password")], "Passwords do not match"),
      otherwise: (schema) => schema,
    }),
    phone: Yup.string().required("Phone Number is required"),
    company: Yup.string().required("Company is required"),
    department: Yup.string().required("Department is required"),
    designation: Yup.string().required("Designation is required"),
    about: Yup.string().required("About is required"),
  });

  const formik = useFormik({
    initialValues: EMPTY_FORM,
    validationSchema,
    context: { isEditing: !!editData },
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const isImporting = !!values._importedUserId;

        const payload = {
          // If importing an existing user, pass their userId so the backend
          // links the employee record instead of creating a duplicate user.
          ...(isImporting ? { userId: values._importedUserId } : {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            phone: values.phone || null,
            password: values.password,
          }),
          employeeCode: values.empId || null,
          joiningDate: values.joiningDate || null,
          about: values.about || null,
          departmentId: null,   // TODO: replace with real ID when dept API is ready
          designationId: null,  // TODO: replace with real ID when designation API is ready
          status: true,
        };

        await createEmployee(payload);
        toast.success("Employee created successfully!");
        onSubmit({
          ...values,
          name: `${values.firstName} ${values.lastName}`.trim(),
          status: "Active",
        });
        onClose();
      } catch (error) {
        const status = error?.response?.status;
        const msg =
          error?.response?.data?.message ||
          "Failed to create employee. Please try again.";
        const code = error?.response?.data?.errors?.code ?? null;

        // 409 Conflict → show inline banner (not a toast)
        if (status === 409) {
          setApiError({ message: msg, code });
        } else {
          toast.error(msg);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Reset form on open/editData change
  useEffect(() => {
    if (open) {
      setApiError(null);
      if (editData) {
        formik.setValues({
          ...EMPTY_FORM,
          firstName: editData.name?.split(" ")[0] || "",
          lastName: editData.name?.split(" ").slice(1).join(" ") || "",
          empId: editData.empId || "",
          email: editData.email || "",
          phone: editData.phone || "",
          department: editData.department || "",
          designation: editData.designation || "",
          joiningDate: editData.joiningDate || "",
        });
      } else {
        formik.setValues(EMPTY_FORM);
      }
      formik.setTouched({});
      setProfileImage(null);
      setImportedFrom(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData, open]);

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  // ── Import handler ───────────────────────────────────────────
  // user is a row from GET /employees/users (users table, no employee record yet)
  const handleImportSelect = (user) => {
    formik.setValues({
      ...EMPTY_FORM,
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      empId: "",           // no employee code yet — user fills this in
      email: user.email ?? "",
      phone: user.phone ?? "",
      department: "",      // no dept yet — user fills this in
      designation: "",     // no designation yet — user fills this in
      joiningDate: "",     // no joining date yet — user fills this in
      username: (user.email ?? "").split("@")[0],
      company: "",
      about: "",
      // passwords stay blank — existing user keeps their password
      password: "",
      confirmPassword: "",
      // Store the userId so createEmployee links to this account
      _importedUserId: user.id,
    });
    formik.setTouched({});
    setImportedFrom(true);
  };


  // ── Image handlers ───────────────────────────────────────────
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert("Image should be below 4 MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCancelImage = () => {
    setProfileImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Field renderer ───────────────────────────────────────────
  // `locked` = disabled when imported (except password fields)
  const field = (
    label,
    key,
    type = "text",
    required = true,
    icon = null,
    onIconClick = null,
    locked = false,
  ) => {
    const hasError = formik.touched[key] && formik.errors[key];
    const isDisabled = locked && importedFrom;

    return (
      <div>
        <label className="block text-[13px] font-semibold text-[#1f2937] mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <input
            id={key}
            name={key}
            type={type}
            disabled={isDisabled}
            value={formik.values[key]}
            onChange={(e) => {
              formik.handleChange(e);
              // Clear the API error banner when the user edits the email
              if (key === "email" && apiError) setApiError(null);
            }}
            onBlur={formik.handleBlur}
            onClick={(e) =>
              type === "date" && e.target.showPicker && e.target.showPicker()
            }
            placeholder={type === "date" ? "dd/mm/yyyy" : ""}
            className={`w-full border rounded-lg px-3.5 py-2.5 text-sm outline-none transition ${
              isDisabled
                ? "bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
                : hasError
                  ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  : "border-gray-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
            } ${
              type === "date"
                ? "[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                : ""
            }`}
          />
          {icon && (
            <div
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 ${
                onIconClick && !isDisabled
                  ? "cursor-pointer hover:text-gray-700 pointer-events-auto"
                  : "pointer-events-none"
              }`}
              onClick={!isDisabled ? onIconClick : undefined}
            >
              {icon}
            </div>
          )}
          {isDisabled && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          )}
        </div>
        {hasError && !isDisabled && (
          <p className="text-red-500 text-xs mt-1">{formik.errors[key]}</p>
        )}
      </div>
    );
  };

  // ── Select renderer ──────────────────────────────────────────
  const selectField = (label, key, options, locked = false) => {
    const hasError = formik.touched[key] && formik.errors[key];
    const isDisabled = locked && importedFrom;

    return (
      <div>
        <label className="block text-[13px] font-semibold text-[#1f2937] mb-1.5">
          {label} <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            name={key}
            disabled={isDisabled}
            value={formik.values[key]}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full border rounded-lg px-3.5 py-2.5 text-sm outline-none transition bg-white appearance-none ${
              isDisabled
                ? "bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
                : hasError
                  ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  : "border-gray-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
            }`}
          >
            <option value="">Select</option>
            {options.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>
        {hasError && !isDisabled && (
          <p className="text-red-500 text-xs mt-1">{formik.errors[key]}</p>
        )}
      </div>
    );
  };

  return (
    <>
      {/* ── Import Employee Modal ── */}
      <ImportEmployeeModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSelect={handleImportSelect}
      />

      {/* ── Drawer ── */}
      <div
        className={`drawer drawer-end z-[1000] fixed inset-0 ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        <input
          type="checkbox"
          className="drawer-toggle"
          checked={open}
          readOnly
        />
        <div className="drawer-side">
          <label onClick={onClose} className="drawer-overlay"></label>
          <div className="bg-white h-full w-[480px] sm:w-[600px] md:w-[700px] flex flex-col shadow-2xl">
            {/* ── Header ── */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-orange-50 text-orange-500 rounded-xl shrink-0 shadow-sm border border-orange-100/60">
                  <UserPlus size={22} />
                </div>
                <div>
                  <h2 className="text-[1.4rem] font-bold text-[#0F265C] tracking-tight leading-tight">
                    {editData ? "Edit Employee" : "Add New Employee"}
                  </h2>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">
                    Employee ID : {formik.values.empId || "EMP -0024"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition p-1 rounded-full hover:bg-gray-100 bg-gray-100/50"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* ── Tab label (Basic Information only) ── */}
            <div className="px-5 border-b border-gray-100 mt-2">
              <span className="inline-block pb-3 text-sm font-semibold text-orange-500 border-b-2 border-orange-500">
                Basic Information
              </span>
            </div>

            {/* ── Form Content ── */}
            <form
              onSubmit={formik.handleSubmit}
              className="flex-1 overflow-y-auto"
            >
              <div className="p-6 space-y-6">
                {/* Profile Image + Import Employee */}
                <div className="flex items-start justify-between gap-4">
                  {/* Left: avatar + upload */}
                  <div className="flex items-center gap-5">
                    <div className="w-24 h-24 rounded-full border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon size={24} className="text-gray-300" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#0F265C] mb-1">
                        Upload Profile Image
                      </h3>
                      <p className="text-xs text-gray-500 mb-3">
                        Image should be below 4 mb
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-1.5 bg-orange-500 text-white text-sm font-semibold rounded hover:bg-orange-600 transition"
                        >
                          Upload
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelImage}
                          className="px-4 py-1.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded hover:bg-gray-50 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right: Import Employee button */}
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <button
                      type="button"
                      onClick={() => setImportModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 border border-orange-400 text-orange-500 text-sm font-semibold rounded-lg hover:bg-orange-50 transition"
                    >
                      <Download size={15} />
                      Import Employee
                    </button>
                    {importedFrom && (
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[11px] text-green-600 font-medium">
                          Fields auto-filled &amp; locked
                        </span>
                        <button
                          type="button"
                          onClick={() => setImportedFrom(false)}
                          className="text-[11px] text-gray-400 underline hover:text-gray-600 ml-1"
                        >
                          Unlock
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Grid */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                  {field(
                    "First Name",
                    "firstName",
                    "text",
                    true,
                    null,
                    null,
                    true,
                  )}
                  {field(
                    "Last Name",
                    "lastName",
                    "text",
                    false,
                    null,
                    null,
                    true,
                  )}
                  {field("Email", "email", "email", true, null, null, true)}
                  {field(
                    "Phone Number",
                    "phone",
                    "tel",
                    true,
                    null,
                    null,
                    true,
                  )}
                  {field(
                    "Employee ID",
                    "empId",
                    "text",
                    true,
                    null,
                    null,
                    true,
                  )}
                  {field(
                    "Joining Date",
                    "joiningDate",
                    "date",
                    true,
                    <Calendar size={16} />,
                    null,
                    true,
                  )}
                  {field(
                    "Password",
                    "password",
                    showPassword ? "text" : "password",
                    !editData,
                    showPassword ? <Eye size={16} /> : <EyeOff size={16} />,
                    () => setShowPassword(!showPassword),
                    false, // password is NEVER locked
                  )}
                  {field(
                    "Confirm Password",
                    "confirmPassword",
                    showConfirmPassword ? "text" : "password",
                    !editData,
                    showConfirmPassword ? (
                      <Eye size={16} />
                    ) : (
                      <EyeOff size={16} />
                    ),
                    () => setShowConfirmPassword(!showConfirmPassword),
                    false, // confirm password is NEVER locked
                  )}
                  {field(
                    "Username",
                    "username",
                    "text",
                    true,
                    null,
                    null,
                    true,
                  )}
                  {field("Company", "company", "text", true, null, null, true)}
                  {selectField("Department", "department", DEPTS, true)}
                  {selectField(
                    "Designation",
                    "designation",
                    DESIGNATIONS_LIST,
                    true,
                  )}
                </div>

                {/* About text area */}
                <div>
                  <label className="block text-[13px] font-semibold text-[#1f2937] mb-1.5">
                    About <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="about"
                    disabled={importedFrom}
                    value={formik.values.about}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full border rounded-lg px-3.5 py-2.5 text-sm outline-none transition min-h-[100px] ${
                      importedFrom
                        ? "bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
                        : formik.touched.about && formik.errors.about
                          ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          : "border-gray-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                    }`}
                  />
                  {formik.touched.about &&
                    formik.errors.about &&
                    !importedFrom && (
                      <p className="text-red-500 text-xs mt-1">
                        {formik.errors.about}
                      </p>
                    )}
                </div>

                {/* ── Dynamic API error banner ── */}
                {apiError && (
                  <div className="flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0 mt-0.5"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>

                    {apiError.code === "ALREADY_EMPLOYEE" ? (
                      // Person is already a fully set-up employee — cannot import
                      <span>
                        {apiError.message} This person already has an employee
                        profile and cannot be added again.
                      </span>
                    ) : (
                      // Person exists in users table but not yet an employee — can import
                      <span>
                        {apiError.message} Please{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setApiError(null);
                            setImportModalOpen(true);
                          }}
                          className="font-semibold underline hover:text-red-800 transition"
                        >
                          Import this user
                        </button>{" "}
                        instead of creating a new account.
                      </span>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition shadow-sm flex items-center gap-2"
                  >
                    {isSubmitting && (
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                    )}
                    {isSubmitting
                      ? "Saving…"
                      : editData
                        ? "Save Changes"
                        : "Save"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
