import usePermission from "../hooks/usePermission";
import { useEffect, useState } from "react";
import { Briefcase, CheckCircle2, Plus, XCircle } from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
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

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const response = await getDesignations();

        const data = response?.data?.data || response?.data || [];

        if (live) setDesignations(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch designations:", error);
        if (live) setDesignations([]);
      }
    })();
    (async () => {
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

        if (live) setDepartments(normalizedDepartments);
      } catch (error) {
        console.error("Failed to fetch departments:", error);
        if (live) setDepartments([]);
      }
    })();
    return () => {
      live = false;
    };
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

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Briefcase}
        title="Designations"
        breadcrumbs={[{ label: "Employees" }, { label: "Designations" }]}
        actions={
          canAdd && (
            <button
              type="button"
              onClick={handleAdd}
              disabled={loading}
              className="hr-btn hr-btn-primary"
            >
              <Plus size={16} />
              Add Designation
            </button>
          )
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={Briefcase}
          tone="primary"
          label="Total Designations"
          value={designations.length}
          hint="All designations"
        />
        <StatCard
          icon={CheckCircle2}
          tone="success"
          label="Active"
          value={designations.filter((d) => d.status === "Active").length}
          hint="Available for use"
        />
        <StatCard
          icon={XCircle}
          tone="accent"
          label="Inactive"
          value={designations.filter((d) => d.status === "Inactive").length}
          hint="Not in use"
        />
      </div>

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