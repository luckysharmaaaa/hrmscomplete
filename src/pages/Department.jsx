import usePermission from "../hooks/usePermission";

import React, { useEffect, useState } from "react";
import {
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  Building2,
  Plus,
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import DepartmentTable from "../components/Department/DepartmentTable";
import AddDepartmentModal from "../components/Department/AddDepartment";
import DeleteDepartmentModal from "../components/Department/DeleteDepartmentModal";

import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../services/department.service";

const Department = () => {
  const { canAdd } = usePermission("department");
  const [departments, setDepartments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(false);

  // ==========================================================
  // Fetch Departments
  // ==========================================================
  const fetchDepartments = async () => {
    try {
      setLoading(true);

      const response = await getDepartments();

      const data = response?.data?.data || response?.data || [];

      setDepartments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleAdd = () => {
    setEditData(null);
    setIsModalOpen(true);
  };

  const handleEdit = (department) => {
    setEditData(department);
    setIsModalOpen(true);
  };

  const handleSubmit = async ({ name, description, status }) => {
    try {
      setLoading(true);

      if (editData) {
        await updateDepartment(editData.id, {
          departmentName: name,
          description,
          status,
        });
      } else {
        await createDepartment({
          departmentName: name,
          description,
          status,
        });
      }

      await fetchDepartments();

      setEditData(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error(
        editData ? "Failed to update department:" : "Failed to create department:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditData(null);
  };

  const handleDeleteRequest = (department) => {
    setDeleteTarget(department);
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);

      await deleteDepartment(id);

      await fetchDepartments();

      setDeleteTarget(null);
    } catch (error) {
      console.error("Failed to delete department:", error);
    } finally {
      setLoading(false);
    }
  };

  const closeDropdown = () => document.activeElement?.blur?.();

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Building2}
        title="Departments"
        breadcrumbs={[{ label: "Employees" }, { label: "Departments" }]}
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

            {/* Add Department — RBAC: department:add */}
            {canAdd && (
              <button
                type="button"
                onClick={handleAdd}
                disabled={loading}
                className="hr-btn hr-btn-primary"
              >
                <Plus size={16} />
                Add Department
              </button>
            )}
          </>
        }
      />

      {/* Department Table */}
      <DepartmentTable
        departments={departments}
        setDepartments={setDepartments}
        onEditDepartment={handleEdit}
        onDeleteDepartment={handleDeleteRequest}
      />

      {/* Add / Edit Department Modal */}
      <AddDepartmentModal
        open={isModalOpen}
        onClose={handleCloseModal}
        editData={editData}
        onSubmit={handleSubmit}
      />

      {/* Delete Department Modal */}
      <DeleteDepartmentModal
        open={!!deleteTarget}
        item={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      {/* Loading Indicator */}
      {loading && (
        <div className="fixed bottom-5 right-5 z-[60] rounded-md border border-border-subtle bg-surface px-4 py-2 text-sm text-text-secondary shadow-lg">
          Processing...
        </div>
      )}
    </div>
  );
};

export default Department;