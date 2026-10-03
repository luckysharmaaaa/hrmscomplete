import usePermission from "../hooks/usePermission";
import React, { useEffect, useState } from "react";
import {
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  Briefcase,
  Plus,
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import DesignationTable from "../components/Designation/DesignationTable";
import AddDesignationDrawer from "../components/Designation/AddDesignationDrawer";
import DeleteDesignationModal from "../components/Designation/DeleteDesignationModal";

import {
  getDesignations,
  createDesignation,
  updateDesignation,
  deleteDesignation,
} from "../services/designation.service";

import { getDepartments } from "../services/department.service";

const Designation = () => {
  const { canAdd } = usePermission("designations");
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(false);

  // ==========================================================
  // GET DESIGNATIONS
  // ==========================================================

  const fetchDesignations = async () => {
    try {
      const response = await getDesignations();

      const data = response?.data?.data || response?.data || [];

      setDesignations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch designations:", error);
      setDesignations([]);
    }
  };

  // ==========================================================
  // GET DEPARTMENTS
  // ==========================================================

  const fetchDepartments = async () => {
    try {
      const response = await getDepartments();

      const data = response?.data?.data || response?.data || [];

      // Different APIs can return departmentName / name / department_name.
      // The drawer expects department.id + department.departmentName.
      const normalizedDepartments = Array.isArray(data)
        ? data.map((department) => ({
            ...department,
            id: department.id ?? department.departmentId ?? department.department_id,
            departmentName:
              department.departmentName ??
              department.name ??
              department.department_name ??
              "",
          }))
        : [];

      setDepartments(normalizedDepartments);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
      setDepartments([]);
    }
  };

  useEffect(() => {
    fetchDesignations();
    fetchDepartments();
  }, []);

  const handleAdd = () => {
    setEditData(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (designation) => {
    setEditData(designation);
    setIsDrawerOpen(true);
  };

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);

      if (editData) {
        await updateDesignation(editData.id, formData);
      } else {
        await createDesignation(formData);
      }

      await fetchDesignations();

      setIsDrawerOpen(false);
      setEditData(null);
    } catch (error) {
      console.error("Failed to save designation:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);

      await deleteDesignation(id);

      await fetchDesignations();

      setDeleteTarget(null);
    } catch (error) {
      console.error("Failed to delete designation:", error);
    } finally {
      setLoading(false);
    }
  };

  const closeDropdown = () => document.activeElement?.blur?.();

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Briefcase}
        title="Designations"
        breadcrumbs={[{ label: "Employees" }, { label: "Designations" }]}
        actions={
          <>
            {/* Export */}
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="hr-btn hr-btn-glass">
                <Download size={16} />
                Export
                <ChevronDown size={16} />
              </div>

              <ul
                tabIndex={0}
                className="dropdown-content z-50 mt-2 w-52 rounded-lg border border-border-subtle bg-surface p-1.5 shadow-lg"
              >
                <li>
                  <button
                    type="button"
                    onClick={closeDropdown}
                    className="flex h-10 w-full items-center gap-2.5 rounded-md px-3 text-sm text-text-primary transition-colors hover:bg-primary-50 hover:text-primary-700"
                  >
                    <FileText size={16} className="text-danger-500" />
                    Export as PDF
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={closeDropdown}
                    className="flex h-10 w-full items-center gap-2.5 rounded-md px-3 text-sm text-text-primary transition-colors hover:bg-primary-50 hover:text-primary-700"
                  >
                    <FileSpreadsheet size={16} className="text-success-600" />
                    Export as Excel
                  </button>
                </li>
              </ul>
            </div>

            {/* Add Designation — RBAC: designations:add */}
            {canAdd && (
              <button
                type="button"
                onClick={handleAdd}
                disabled={loading}
                className="hr-btn hr-btn-primary"
              >
                <Plus size={16} />
                Add Designation
              </button>
            )}
          </>
        }
      />

      {/* Designation Table */}
      <DesignationTable
        designations={designations}
        departments={departments}
        onEdit={handleEdit}
        onDelete={(designation) => setDeleteTarget(designation)}
      />

      {/* Add / Edit Drawer */}
      <AddDesignationDrawer
        open={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditData(null);
        }}
        editData={editData}
        departments={departments}
        onSubmit={handleSubmit}
      />

      {/* Delete Modal */}
      <DeleteDesignationModal
        open={!!deleteTarget}
        item={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default Designation;