import { useState } from "react";
import { Building2, Loader2 } from "lucide-react";

import SideDrawer from "../ui/SideDrawer";
import Switch from "../ui/Switch";

export default function AddDepartmentModal({ open, onClose, editData, onSubmit, submitting = false }) {
  const [name, setName] = useState(editData?.name || "");
  const [description, setDescription] = useState(editData?.description || "");
  const [status, setStatus] = useState(editData?.status || "Active");
  const [nameError, setNameError] = useState("");

  // Fill / reset the form whenever the drawer opens or the edited department changes
  const [prev, setPrev] = useState({ editData, open });
  if (prev.editData !== editData || prev.open !== open) {
    setPrev({ editData, open });
    setName(editData?.name || "");
    setDescription(editData?.description || "");
    setStatus(editData?.status || "Active");
    setNameError("");
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setNameError("Department name is required.");
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      status,
    });
  };

  const isActive = status === "Active";

  return (
    <SideDrawer
      open={open}
      onClose={submitting ? undefined : onClose}
      icon={Building2}
      size="md"
      title={editData ? "Edit Department" : "Add Department"}
      subtitle={editData ? "Update department details" : "Create a new department"}
      footer={
        <>
          <button type="button" onClick={onClose} disabled={submitting} className="hr-btn hr-btn-outline">
            Cancel
          </button>

          <button
            type="submit"
            form="department-form"
            disabled={submitting}
            className="hr-btn hr-btn-primary min-w-[150px]"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {submitting ? "Saving..." : editData ? "Save Changes" : "Add Department"}
          </button>
        </>
      }
    >
      <form id="department-form" onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label htmlFor="department-name" className="hr-label">
            Department Name <span className="text-danger-500">*</span>
          </label>
          <input
            id="department-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setNameError("");
            }}
            disabled={submitting}
            placeholder="e.g. Human Resources"
            aria-invalid={Boolean(nameError)}
            className={`hr-input ${nameError ? "is-error" : ""}`}
          />
          {nameError && (
            <p role="alert" className="mt-1.5 text-xs text-danger-600">
              {nameError}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="department-description" className="hr-label">
            Description
          </label>
          <textarea
            id="department-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={submitting}
            placeholder="What does this department do?"
            rows={4}
            className="hr-input h-auto! resize-none py-2.5"
          />
        </div>

        <div className="flex items-center justify-between gap-4 rounded-lg border border-border-subtle bg-background px-4 py-3.5">
          <div>
            <p className="text-sm font-medium text-text-primary">Active status</p>
            <p className="text-xs text-text-secondary">Department is available for use when active.</p>
          </div>

          <Switch
            checked={isActive}
            disabled={submitting}
            ariaLabel="Toggle department status"
            onChange={() => setStatus(isActive ? "Inactive" : "Active")}
          />
        </div>
      </form>
    </SideDrawer>
  );
}