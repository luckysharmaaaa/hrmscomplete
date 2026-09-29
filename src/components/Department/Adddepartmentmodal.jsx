import React, { useEffect, useState } from "react";
import { Building2 } from "lucide-react";

import SideDrawer from "../ui/SideDrawer";
import Switch from "../ui/Switch";

export default function AddDepartmentModal({ open, onClose, editData, onSubmit }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Active");
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (editData) {
      setName(editData.name || "");
      setDescription(editData.description || "");
      setStatus(editData.status || "Active");
    } else {
      setName("");
      setDescription("");
      setStatus("Active");
    }
    setNameError("");
  }, [editData, open]);

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

  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      icon={Building2}
      size="md"
      title={editData ? "Edit Department" : "Add Department"}
      subtitle={editData ? "Update department details" : "Create a new department"}
      footer={
        <>
          <button type="button" onClick={onClose} className="hr-btn hr-btn-outline">
            Cancel
          </button>
          <button type="submit" form="department-form" className="hr-btn hr-btn-primary">
            {editData ? "Save Changes" : "Add Department"}
          </button>
        </>
      }
    >
      <form id="department-form" onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="hr-label">
            Department Name <span className="text-danger-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setNameError("");
            }}
            placeholder="Enter department name"
            className={`hr-input ${nameError ? "is-error" : ""}`}
          />
          {nameError && <p className="mt-1.5 text-xs text-danger-600">{nameError}</p>}
        </div>

        <div>
          <label className="hr-label">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter department description"
            rows={4}
            className="hr-input h-auto! resize-none py-2.5"
          />
        </div>

        <div className="flex items-center justify-between gap-4 rounded-md border border-border-subtle bg-background px-4 py-3.5">
          <div>
            <p className="text-sm font-medium text-text-primary">Active Status</p>
            <p className="text-xs text-text-secondary">Department will be available for use when active</p>
          </div>
          <Switch checked={status === "Active"} onChange={() => setStatus((s) => (s === "Active" ? "Inactive" : "Active"))} />
        </div>
      </form>
    </SideDrawer>
  );
}