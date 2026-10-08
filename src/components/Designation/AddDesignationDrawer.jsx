import { useState } from 'react';import { Briefcase } from "lucide-react";

import SideDrawer from "../ui/SideDrawer";
import Switch from "../ui/Switch";

export default function AddDesignationDrawer({ open, onClose, editData, departments = [], onSubmit }) {
  const [title, setTitle] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [status, setStatus] = useState("Active");

  const [titleError, setTitleError] = useState("");
  const [departmentError, setDepartmentError] = useState("");

  const [prevKey, setPrevKey] = useState({ open, editData });
  if (prevKey.open !== open || prevKey.editData !== editData) {
    setPrevKey({ open, editData });

    if (open) {
      if (editData) {
        setTitle(editData.designationName || "");
        setDepartmentId(
          editData.departmentId !== null && editData.departmentId !== undefined
            ? String(editData.departmentId)
            : ""
        );
        setStatus(editData.status === "Inactive" ? "Inactive" : "Active");
      } else {
        setTitle("");
        setDepartmentId("");
        setStatus("Active");
      }

      setTitleError("");
      setDepartmentError("");
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    let hasError = false;

    if (!title.trim()) {
      setTitleError("Designation name is required.");
      hasError = true;
    }

    if (!departmentId) {
      setDepartmentError("Department is required.");
      hasError = true;
    }

    if (hasError) return;

    onSubmit({
      departmentId: Number(departmentId),
      designationName: title.trim(),
      description: editData?.description?.trim() || null,
      status,
    });
  };

  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      icon={Briefcase}
      size="md"
      title={editData ? "Edit Designation" : "Add Designation"}
      subtitle={editData ? "Update designation details" : "Create a new designation"}
      footer={
        <>
          <button type="button" onClick={onClose} className="hr-btn hr-btn-outline">
            Cancel
          </button>
          <button type="submit" form="designation-form" className="hr-btn hr-btn-primary">
            {editData ? "Save Changes" : "Add Designation"}
          </button>
        </>
      }
    >
      <form id="designation-form" onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="hr-label">
            Designation Name <span className="text-danger-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setTitleError("");
            }}
            placeholder="Enter designation name"
            className={`hr-input ${titleError ? "is-error" : ""}`}
          />
          {titleError && <p className="mt-1.5 text-xs text-danger-600">{titleError}</p>}
        </div>

        <div>
          <label className="hr-label">
            Department <span className="text-danger-500">*</span>
          </label>
          <select
            value={departmentId}
            onChange={(e) => {
              setDepartmentId(e.target.value);
              setDepartmentError("");
            }}
            className={`hr-select ${departmentError ? "is-error" : ""}`}
          >
            <option value="">Select Department</option>
            {Array.isArray(departments) &&
              departments.map((department) => (
                <option key={department.id} value={String(department.id)}>
                  {department.departmentName}
                </option>
              ))}
          </select>
          {departmentError && <p className="mt-1.5 text-xs text-danger-600">{departmentError}</p>}
          {departments.length === 0 && (
            <p className="mt-1.5 text-xs text-text-secondary">No departments available.</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 rounded-md border border-border-subtle bg-background px-4 py-3.5">
          <div>
            <p className="text-sm font-medium text-text-primary">Active Status</p>
            <p className="text-xs text-text-secondary">Designation will be available for use when active</p>
          </div>
          <Switch checked={status === "Active"} onChange={() => setStatus((s) => (s === "Active" ? "Inactive" : "Active"))} />
        </div>
      </form>
    </SideDrawer>
  );
}