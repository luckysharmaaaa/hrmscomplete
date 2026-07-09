import React, { useEffect, useState } from 'react';
import { X, ChevronDown, Building2 } from 'lucide-react';

export default function AddDepartmentModal({ open, onClose, editData, onSubmit }) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('Active');
  const [nameError, setNameError] = useState('');

  // Populate form when editing
  useEffect(() => {
    if (editData) {
      setName(editData.name || '');
      setStatus(editData.status || 'Active');
    } else {
      setName('');
      setStatus('Active');
    }
    setNameError('');
  }, [editData, open]);

  const handleSubmit = () => {
    if (!name.trim()) {
      setNameError('Department name is required.');
      return;
    }
    onSubmit({ name: name.trim(), status });
    onClose();
  };

  return (
    <div className={`drawer drawer-end z-[1000] fixed inset-0 ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      <input type="checkbox" className="drawer-toggle" checked={open} readOnly />
      <div className="drawer-side">
        <label onClick={onClose} className="drawer-overlay"></label>
        <div className="bg-white h-full w-[480px] sm:w-[500px] flex flex-col shadow-2xl overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-orange-50 text-orange-500 rounded-xl shrink-0 shadow-sm border border-orange-100/60">
                <Building2 size={22} />
              </div>
              <div>
                <h2 className="text-[1.4rem] font-bold text-[#0F265C] tracking-tight leading-tight">
                  {editData ? 'Edit Department' : 'Add Department'}
                </h2>
                <p className="text-xs text-gray-400 font-medium mt-0.5">
                  {editData ? 'Update department details' : 'Create a new department'}
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

          {/* Body */}
          <div className="p-6 flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-[14px] font-semibold text-[#0F265C]">
                Department Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setNameError(''); }}
                placeholder="Enter department name"
                className={`w-full border rounded-lg p-2.5 text-sm outline-none transition ${
                  nameError ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-orange-500'
                }`}
              />
              {nameError && <p className="text-xs text-red-500 mt-0.5">{nameError}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[14px] font-semibold text-[#0F265C]">
                Status
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-orange-500 transition appearance-none bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto flex justify-end items-center gap-3 p-5 border-t border-gray-100 bg-white">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition shadow-sm"
            >
              {editData ? 'Save Changes' : 'Add Department'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
