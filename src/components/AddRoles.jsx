import React, { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { BadgeCheck, Loader2 } from "lucide-react";
import RolePermissionTable from "./RolePermissionTable";

// ============================================================
// FIXED ROLE TYPES
// ============================================================
// RBAC only makes sense with a closed set of roles that permissions are
// actually designed around. Previously "Role Name" and "Role Code" were
// free-text inputs, so the system could end up with any number of
// one-off, undocumented roles. This locks creation to the four types
// the org actually uses; editing an existing legacy/custom role (if one
// already exists in the DB) still works — see `availableTemplates` below.
const ROLE_TEMPLATES = [
  {
    code: "SUPER_ADMIN",
    label: "Super Admin",
    description: "Full system access across every module.",
  },
  {
    code: "ADMIN",
    label: "Admin",
    description: "Manages day-to-day operations, users, and settings.",
  },
  {
    code: "HR",
    label: "HR",
    description: "Manages employees, leave, attendance, and payroll.",
  },
  {
    code: "EMPLOYEE",
    label: "Employee",
    description: "Self-service access to their own records.",
  },
];

const EMPTY_ROLE = {
  roleName: "",
  roleCode: "",
  description: "",
  status: "Active",
};

const AddRoles = ({
  open,
  onClose,
  onAddRole,
  editRole,
  existingRoles = [],
}) => {

  const [roleData, setRoleData] = useState(EMPTY_ROLE);

  const [selectedModules, setSelectedModules] = useState([]);

  const [permissions, setPermissions] = useState({});

  const [errors, setErrors] = useState({});

  const [isSaving, setIsSaving] = useState(false);

  // ===========================================
  // Edit Mode
  // ===========================================

  useEffect(() => {
    if (editRole) {
      setRoleData({
        roleName: editRole.roleName || "",
        roleCode: editRole.roleCode || "",
        description: editRole.description || "",
        status: editRole.status || "Active",
      });
    } else {
      setRoleData(EMPTY_ROLE);
      setSelectedModules([]);
      setPermissions({});
    }

    setErrors({});
    setIsSaving(false);
  }, [editRole, open]);

  // ===========================================
  // Body scroll lock while the drawer is open
  // ===========================================

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // ===========================================
  // Escape to close (not while saving)
  // ===========================================

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e) {
      if (e.key === "Escape" && !isSaving) onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, isSaving, onClose]);

  // ===========================================
  // Which role types are still available to pick
  // A role type already used by ANOTHER role is hidden. The role
  // currently being edited keeps its own slot even if "taken".
  // ===========================================

  const takenCodes = new Set(
    existingRoles
      .filter((r) => !editRole || r.id !== editRole.id)
      .map((r) => r.roleCode)
  );

  const availableTemplates = ROLE_TEMPLATES.filter(
    (t) => !takenCodes.has(t.code)
  );

  // A role already in the DB whose code doesn't match any of the four
  // standard templates (created before this restriction existed). Keep
  // it selectable while editing so the dropdown isn't blank/broken for it.
  const isLegacyRole =
    editRole && !ROLE_TEMPLATES.some((t) => t.code === editRole.roleCode);

  // ===========================================
  // Role Type Change — sets name + code together
  // ===========================================

  const handleRoleTypeChange = (e) => {
    const code = e.target.value;
    const template = ROLE_TEMPLATES.find((t) => t.code === code);

    setRoleData((prev) => ({
      ...prev,
      roleCode: code,
      roleName: template ? template.label : prev.roleName,
      description: prev.description || template?.description || "",
    }));

    setErrors((prev) => ({ ...prev, roleName: "", roleCode: "" }));
  };

  // ===========================================
  // Description Change
  // ===========================================

  const handleDescriptionChange = (e) => {
    setRoleData((prev) => ({ ...prev, description: e.target.value }));
  };

  // ===========================================
  // Validation
  // ===========================================

  const validate = () => {
    const newErrors = {};

    if (!roleData.roleCode.trim()) {
      newErrors.roleName = "Select a role type";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ===========================================
  // Save Role
  //
  // Previously this called onAddRole(...) without waiting for it, then
  // immediately cleared the form and closed the drawer — so if the save
  // failed, everything you'd typed was already gone with no way back.
  // Now it waits for the result and only resets/closes on success.
  // (Requires Roles.jsx's handleAddRole to re-throw on failure — it
  // already toasts the error, this just lets AddRoles know to keep the
  // drawer open.)
  // ===========================================

  const handleSubmit = async () => {
    if (!validate() || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      await onAddRole({
        roleName: roleData.roleName,
        roleCode: roleData.roleCode,
        description: roleData.description,
        status: roleData.status,
        selectedModules,
        permissions,
      });

      // Only reached on success — Roles.jsx's onAddRole re-throws on failure.
      setRoleData(EMPTY_ROLE);
      setSelectedModules([]);
      setPermissions({});
      setErrors({});
      onClose();
    } catch {
      // Error already toasted by the parent. Keep the drawer open with
      // the entered data intact so nothing is lost.
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (isSaving) return;
    onClose();
  };

  // ===========================================
  // JSX
  // ===========================================

  return (
    <>
      {/* Overlay */}

      {open && (
        <div
          onClick={handleCancel}
          className="fixed inset-0 bg-black/40 z-[999]"
        />
      )}

      {/* Drawer */}

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-role-title"
        className={`fixed top-0 right-0 h-full w-full max-w-[500px] bg-white z-[1000] transition-transform duration-300 overflow-y-auto shadow-2xl flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ====================================== */}
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-orange-50 text-orange-500 rounded-xl shrink-0 shadow-sm border border-orange-100/30">
              <BadgeCheck size={22} />
            </div>
            <div>
              <h2 id="add-role-title" className="text-2xl font-bold text-[#0F265C] tracking-tight leading-tight">
                {editRole ? "Edit Role" : "Add Role"}
              </h2>
              <p className="text-xs text-gray-400 font-medium mt-1">
                {editRole
                  ? "Update permission scopes for this role"
                  : "Create a new role level for user assignments"}
              </p>
            </div>
          </div>

          <button
            onClick={handleCancel}
            disabled={isSaving}
            aria-label="Close"
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition"
          >
            <CloseIcon />
          </button>
        </div>

        {/* ====================================== */}
        {/* Body */}
        {/* ====================================== */}

        <div className="flex-1 overflow-auto">
          {/* Role Information */}

          <div className="p-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Role Type */}

              <div className="col-span-2">
                <label htmlFor="roleType" className="block text-sm font-semibold text-gray-700 mb-2">
                  Role Type
                  <span className="text-red-500 ml-1">*</span>
                </label>

                {availableTemplates.length === 0 && !isLegacyRole ? (
                  <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3.5 py-2.5">
                    All four standard roles (Super Admin, Admin, HR, Employee) already exist.
                    Edit one of them instead of creating a new one.
                  </p>
                ) : (
                  <select
                    id="roleType"
                    name="roleType"
                    value={roleData.roleCode}
                    onChange={handleRoleTypeChange}
                    disabled={isSaving}
                    className={`select select-bordered w-full focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 ${
                      errors.roleName ? "border-red-500" : ""
                    }`}
                  >
                    <option value="">Select a role type</option>
                    {availableTemplates.map((t) => (
                      <option key={t.code} value={t.code}>
                        {t.label}
                      </option>
                    ))}
                    {isLegacyRole && (
                      <option value={editRole.roleCode}>
                        {editRole.roleName} (existing custom role)
                      </option>
                    )}
                  </select>
                )}

                {errors.roleName && (
                  <p className="text-red-500 text-sm mt-1">{errors.roleName}</p>
                )}
              </div>

              {/* Role Code — auto-derived, not user-editable, so it can
                  never drift out of sync with the selected role type. */}

              <div className="col-span-2">
                <label htmlFor="roleCode" className="block text-sm font-semibold text-gray-700 mb-2">
                  Role Code
                </label>

                <input
                  id="roleCode"
                  type="text"
                  value={roleData.roleCode}
                  readOnly
                  disabled
                  placeholder="Auto-filled from role type"
                  className="input input-bordered w-full bg-gray-50 text-gray-500 font-mono cursor-not-allowed"
                />
              </div>

              {/* Description */}

              <div className="col-span-2">
                <label htmlFor="roleDescription" className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>

                <textarea
                  id="roleDescription"
                  name="description"
                  rows={2}
                  value={roleData.description}
                  onChange={handleDescriptionChange}
                  disabled={isSaving}
                  placeholder="What this role is for"
                  className="textarea textarea-bordered w-full resize-none focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />
          {/* ====================================== */}
          {/* Role Permissions */}
          {/* ====================================== */}

          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-[#0F265C]">
                Role Permissions
              </h3>

              <span className="text-sm text-gray-400">
                Select Modules &amp; Permissions
              </span>
            </div>

            <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
              <RolePermissionTable
                role={editRole}
                selectedModules={selectedModules}
                setSelectedModules={setSelectedModules}
                permissions={permissions}
                setPermissions={setPermissions}
              />
            </div>
          </div>
        </div>

        {/* ====================================== */}
        {/* Footer */}
        {/* ====================================== */}

        <div className="border-t border-gray-100 bg-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-700">Status</label>

            <button
              type="button"
              disabled={isSaving}
              onClick={() =>
                setRoleData((prev) => ({
                  ...prev,
                  status: prev.status === "Active" ? "Inactive" : "Active",
                }))
              }
              aria-pressed={roleData.status === "Active"}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 disabled:opacity-50 ${
                roleData.status === "Active" ? "bg-emerald-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                  roleData.status === "Active"
                    ? "translate-x-5"
                    : "translate-x-1"
                }`}
              />
            </button>

            <span
              className={`text-sm font-medium ${
                roleData.status === "Active"
                  ? "text-emerald-600"
                  : "text-gray-500"
              }`}
            >
              {roleData.status}
            </span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 transition"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSaving || (availableTemplates.length === 0 && !isLegacyRole)}
              className="px-5 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {isSaving && <Loader2 size={15} className="animate-spin" />}
              {isSaving ? "Saving…" : editRole ? "Update Role" : "Save Role"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddRoles;