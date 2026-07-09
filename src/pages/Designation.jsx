import React, { useState } from "react";
import {
  ChevronRight,
  FileText,
  FileSpreadsheet,
  ChevronDown,
  Plus,
} from "lucide-react";
import { DESIGNATION_DATA } from "../components/Designation/designationData";
import DesignationTable from "../components/Designation/DesignationTable";
import AddDesignationDrawer from "../components/Designation/AddDesignationDrawer";
import DeleteDesignationModal from "../components/Designation/DeleteDesignationModal";

const Designation = () => {
  const [designations, setDesignations] = useState(DESIGNATION_DATA);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Open drawer for add
  const handleAdd = () => {
    setEditData(null);
    setIsDrawerOpen(true);
  };

  // Open drawer for edit
  const handleEdit = (des) => {
    setEditData(des);
    setIsDrawerOpen(true);
  };

  // Submit add/edit
  const handleSubmit = ({ title, department, status }) => {
    if (editData) {
      setDesignations((prev) =>
        prev.map((d) =>
          d.id === editData.id ? { ...d, title, department, status } : d
        )
      );
    } else {
      const newId = Math.max(...designations.map((d) => d.id), 0) + 1;
      setDesignations((prev) => [
        {
          id: newId,
          title,
          department,
          employees: 0,
          status,
          createdDate: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        },
        ...prev,
      ]);
    }
    setEditData(null);
  };

  // Confirm delete
  const handleDelete = (id) => {
    setDesignations((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0F265C]">Designations</h1>
          <nav className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
            <span>Employees</span>
            <ChevronRight size={12} />
            <span className="text-orange-500 font-medium">Designations</span>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Export Dropdown */}
          <div className="dropdown dropdown-end">
            <label
              tabIndex={0}
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-sm font-semibold rounded-lg transition shadow-sm cursor-pointer"
            >
              <FileText size={16} className="text-gray-500" />
              <span>Export</span>
              <ChevronDown size={14} />
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-white border border-gray-100 rounded-xl shadow-xl z-50 w-48 p-1.5 mt-2"
            >
              <li>
                <a className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                  <FileText size={16} className="text-red-500 shrink-0" />
                  <span className="font-medium">Export as PDF</span>
                </a>
              </li>
              <li>
                <a className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                  <FileSpreadsheet size={16} className="text-green-600 shrink-0" />
                  <span className="font-medium">Export as Excel</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Add Designation */}
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition shadow-sm"
          >
            <Plus size={15} />
            Add Designation
          </button>
        </div>
      </div>

      {/* ── Designation Table ── */}
      <DesignationTable
        designations={designations}
        onEdit={handleEdit}
        onDelete={(des) => setDeleteTarget(des)}
      />

      {/* ── Add/Edit Drawer ── */}
      <AddDesignationDrawer
        open={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditData(null);
        }}
        editData={editData}
        onSubmit={handleSubmit}
      />

      {/* ── Delete Modal ── */}
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
