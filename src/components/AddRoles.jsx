import React, { useEffect, useState } from "react";
import { BadgeCheck, Loader2 } from "lucide-react";

import SideDrawer from "./ui/SideDrawer";
import Switch from "./ui/Switch";
import RolePermissionTable from "./RolePermissionTable";

const EMPTY_ROLE = {
  roleName: "",
  roleCode: "",
  description: "",
  status: "Active",
};

// Section heading with divider (same as the User drawer)
const Section = ({ title, description, children }) => (
  <section>
    <div className="mb-4 border-b border-border-subtle pb-3">
      <h3 className="text-sm font-semibold text-primary-700">{title}</h3>
      {description && (
        <p className="mt-0.5 text-xs text-text-secondary">{description}</p>
      )}
    </div>
    {children}
  </section>
);

const AddRoles = ({
  open,
  onClose,
  onAddRole,
  editRole,
}) => {
  const [roleData, setRoleData] = useState(EMPTY_ROLE);

  const [selectedModules, setSelectedModules] = useState([]);

  const [permissions, setPermissions] = useState({});

  const [errors, setErrors] = useState({});

  const [isSaving, setIsSaving] = useState(false);

  // ============================================================
  // INITIALIZE FORM
  // ============================================================

  useEffect(() => {
    if (editRole) {
      setRoleData({
        roleName: editRole.roleName || "",
        roleCode: editRole.roleCode || "",
        description: editRole.description || "",
        status: editRole.status || "Active",
      });
    } else {
      setRoleData({ ...EMPTY_ROLE });
      setSelectedModules([]);
      setPermissions({});
    }

    setErrors({});
    setIsSaving(false);
  }, [editRole, open]);

  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setRoleData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // ============================================================
  // ROLE CODE FORMATTER
  // ============================================================

  const handleRoleCodeChange = (event) => {
    const value = event.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9_]/g, "");

    setRoleData((prev) => ({
      ...prev,
      roleCode: value,
    }));

    if (errors.roleCode) {
      setErrors((prev) => ({
        ...prev,
        roleCode: "",
      }));
    }
  };

  // ============================================================
  // VALIDATION
  // ============================================================

  const validate = () => {
    const nextErrors = {};

    const roleName = roleData.roleName.trim();
    const roleCode = roleData.roleCode.trim();

    if (!roleName) {
      nextErrors.roleName = "Role name is required.";
    } else if (roleName.length < 2) {
      nextErrors.roleName = "Role name must contain at least 2 characters.";
    }

    if (!roleCode) {
      nextErrors.roleCode = "Role code is required.";
    } else if (!/^[A-Z][A-Z0-9_]*$/.test(roleCode)) {
      nextErrors.roleCode =
        "Use uppercase letters, numbers and underscores only.";
    } else if (roleCode.length < 2) {
      nextErrors.roleCode = "Role code must contain at least 2 characters.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async () => {
    if (isSaving) return;

    if (!validate()) return;

    setIsSaving(true);

    try {
      await onAddRole({
        roleName: roleData.roleName.trim(),
        roleCode: roleData.roleCode.trim(),
        description: roleData.description.trim(),
        status: roleData.status,
        selectedModules,
        permissions,
      });

      setRoleData({ ...EMPTY_ROLE });
      setSelectedModules([]);
      setPermissions({});
      setErrors({});

      onClose();
    } catch (error) {
      // Parent already handles toast.
      // Keep form open so user does not lose entered data.
      console.error("Role save failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================
  // CANCEL
  // ============================================================

  const handleCancel = () => {
    if (isSaving) return;

    onClose();
  };

  const isActive = roleData.status === "Active";

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <SideDrawer
      open={open}
      onClose={handleCancel}
      icon={BadgeCheck}
      size="lg"
      title={editRole ? "Edit Role" : "Create Role"}
      subtitle={
        editRole
          ? "Update role details and access permissions"
          : "Create a custom role and define its access scope"
      }
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          {/* Status */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-text-primary">Status</span>
            <Switch
              checked={isActive}
              disabled={isSaving}
              ariaLabel="Toggle role status"
              onChange={() =>
                setRoleData((prev) => ({
                  ...prev,
                  status: prev.status === "Active" ? "Inactive" : "Active",
                }))
              }
            />
            <span
              className={`text-sm font-medium ${
                isActive ? "text-success-600" : "text-text-secondary"
              }`}
            >
              {roleData.status}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="hr-btn hr-btn-outline"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="role-form"
              disabled={isSaving}
              className="hr-btn hr-btn-primary min-w-[140px]"
            >
              {isSaving && <Loader2 size={16} className="animate-spin" />}
              {isSaving ? "Saving..." : editRole ? "Update Role" : "Create Role"}
            </button>
          </div>
        </div>
      }
    >
      <form
        id="role-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
        className="space-y-8"
      >
        {/* ROLE INFORMATION */}
        <Section
          title="Role Information"
          description="Define the identity and purpose of this role."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Role Name */}
            <div>
              <label htmlFor="roleName" className="hr-label">
                Role Name
                <span className="ml-0.5 text-danger-500">*</span>
              </label>

              <input
                id="roleName"
                name="roleName"
                type="text"
                value={roleData.roleName}
                onChange={handleChange}
                disabled={isSaving}
                placeholder="e.g. Payroll Manager"
                className={`hr-input ${errors.roleName ? "is-error" : ""}`}
              />

              {errors.roleName && (
                <p className="mt-1.5 text-xs text-danger-600">{errors.roleName}</p>
              )}
            </div>

            {/* Role Code */}
            <div>
              <label htmlFor="roleCode" className="hr-label">
                Role Code
                <span className="ml-0.5 text-danger-500">*</span>
              </label>

              <input
                id="roleCode"
                name="roleCode"
                type="text"
                value={roleData.roleCode}
                onChange={handleRoleCodeChange}
                disabled={isSaving}
                placeholder="e.g. PAYROLL_MANAGER"
                className={`hr-input font-mono ${errors.roleCode ? "is-error" : ""}`}
              />

              {errors.roleCode ? (
                <p className="mt-1.5 text-xs text-danger-600">{errors.roleCode}</p>
              ) : (
                <p className="mt-1.5 text-xs text-text-secondary">
                  Uppercase letters, numbers and underscores only.
                </p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="roleDescription" className="hr-label">
                Description
              </label>

              <textarea
                id="roleDescription"
                name="description"
                rows={3}
                value={roleData.description}
                onChange={handleChange}
                disabled={isSaving}
                placeholder="Describe what this role is responsible for..."
                className="hr-input h-auto! resize-none py-2.5"
              />
            </div>
          </div>
        </Section>

        {/* PERMISSIONS */}
        <Section
          title="Module & Permission Access"
          description="Select the modules this role can access and define the permitted actions."
        >
          <RolePermissionTable
            role={editRole}
            selectedModules={selectedModules}
            setSelectedModules={setSelectedModules}
            permissions={permissions}
            setPermissions={setPermissions}
          />
        </Section>
      </form>
    </SideDrawer>
  );
};

export default AddRoles;