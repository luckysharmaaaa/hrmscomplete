import React, { useState, useEffect } from "react";
import {
  Layers,
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronRight,
  X,
  ToggleLeft,
  ToggleRight,
  FolderOpen,
  FileText,
  AlertTriangle,
} from "lucide-react";

import {
  getAllModules,
  createModule,
  updateModule,
  deleteModule as deleteModuleApi,
} from "../services/moduleApi";


const EMPTY_FORM = { moduleName: "", parentId: "", path: "", icon: "", status: "1" };
function buildTree(flatList) {
  const byId = {};
  flatList.forEach((item) => {
    byId[item.id] = { ...item, children: [] };
  });
  const roots = [];
  flatList.forEach((item) => {
    const node = byId[item.id];
    const parent = byId[item.parentId];
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node); // no parent (or parent not in filtered list) = top level
    }
  });

  return roots;
}

// Returns the set of every descendant id of `moduleId` (children, grandchildren, ...).
// Used to stop a module from being re-parented under one of its own descendants,
// which would create a cycle and crash the recursive tree renderer.
function getDescendantIds(modules, moduleId) {
  const descendants = new Set();
  const stack = modules.filter((m) => m.parentId === moduleId).map((m) => m.id);

  while (stack.length > 0) {
    const currentId = stack.pop();
    if (descendants.has(currentId)) continue; // guard against pre-existing bad data
    descendants.add(currentId);
    modules
      .filter((m) => m.parentId === currentId)
      .forEach((m) => stack.push(m.id));
  }

  return descendants;
}

function findModuleName(modules, id) {
  const found = modules.find((m) => m.id === id);
  return found ? found.moduleName : "—";
}

function StatusToggle({ isActive, onClick }) {
  return (
    <button onClick={onClick} title="Toggle status" className="flex items-center gap-1.5 transition">
      {isActive ? (
        <>
          <ToggleRight size={22} className="text-green-500" />
          <span className="text-xs text-green-600 font-medium">Active</span>
        </>
      ) : (
        <>
          <ToggleLeft size={22} className="text-gray-300" />
          <span className="text-xs text-gray-400 font-medium">Inactive</span>
        </>
      )}
    </button>
  );
}

// One of the 3 summary boxes at the top (Total / Active / Inactive)
function StatCard({ label, value, colorClasses }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
      <div className={`p-2.5 rounded-lg ${colorClasses}`}>
        <Layers size={18} />
      </div>

      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-400">{label}</p>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// 4. TABLE ROW (renders itself, then renders its children below it)
// ------------------------------------------------------------

function ModuleRow({ node, level, allModules, onEdit, onDelete, onToggleStatus }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children.length > 0;
  const isActive = node.status === "1";
  const indentPx = level * 20; // each nesting level shifts right by 20px

  return (
    <>
      <tr className="hover:bg-gray-50 transition group">
        {/* Module name + expand arrow + indentation */}
        <td className="px-5 py-3">
          <div className="flex items-center gap-2" style={{ paddingLeft: `${indentPx}px` }}>
            {hasChildren ? (
              <button
                onClick={() => setIsExpanded((prev) => !prev)}
                className="text-gray-400 hover:text-orange-500 transition shrink-0"
              >
                <ChevronRight size={14} className={`transition-transform ${isExpanded ? "rotate-90" : ""}`} />
              </button>
            ) : (
              <span className="w-3.5 shrink-0" /> // keeps alignment even with no arrow
            )}

            {level === 0 ? (
              <FolderOpen size={15} className="text-orange-400 shrink-0" />
            ) : (
              <FileText size={14} className="text-gray-300 shrink-0" />
            )}

            <span
              className={
                level === 0
                  ? "text-sm font-semibold text-gray-800"
                  : level === 1
                    ? "text-sm font-medium text-gray-600"
                    : "text-sm text-gray-500"
              }
            >
              {node.moduleName}
            </span>
          </div>
        </td>

        {/* Parent name */}
        <td className="px-5 py-3 text-sm text-gray-400">
          {node.parentId ? findModuleName(allModules, node.parentId) : "—"}
        </td>

        {/* Route path */}
        <td className="px-5 py-3">
          {node.path ? (
            <code className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">{node.path}</code>
          ) : (
            <span className="text-gray-300 text-xs">—</span>
          )}
        </td>

        {/* Icon name */}
        <td className="px-5 py-3 text-sm text-gray-400 font-mono">
          {node.icon || <span className="text-gray-300">—</span>}
        </td>

        {/* Status toggle */}
        <td className="px-5 py-3">
          <StatusToggle isActive={isActive} onClick={() => onToggleStatus(node.id, node.status)} />
        </td>

        {/* Edit / Delete buttons (only visible on row hover) */}
        <td className="px-5 py-3">
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
            <button
              onClick={() => onEdit(node)}
              className="p-1.5 rounded-lg hover:bg-orange-50 hover:text-orange-500 text-gray-400 transition"
              title="Edit"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onDelete(node)}
              className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-gray-400 transition"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </td>
      </tr>

      {/* Recursively render child rows underneath, only if expanded */}
      {isExpanded &&
        node.children.map((child) => (
          <ModuleRow
            key={child.id}
            node={child}
            level={level + 1}
            allModules={allModules}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
          />
        ))}
    </>
  );
}

// ------------------------------------------------------------
// 5. MODALS
// ------------------------------------------------------------

// Add/Edit form modal. If `editData` is null -> "Add" mode, otherwise "Edit" mode.
function ModuleFormModal({ isOpen, onClose, editData, allModules, onSave }) {
  const [form, setForm] = useState(editData ?? EMPTY_FORM);

  // Whenever the modal is opened (or which module we're editing changes),
  // reset the form to match.
  useEffect(() => {
    setForm(editData ?? EMPTY_FORM);
  }, [editData, isOpen]);

  if (!isOpen) return null;

  // Can't set a module as its own parent, and can't set it as a child of one of
  // its own descendants either — that would create a cycle in the tree and blow
  // the stack in ModuleRow's recursive rendering.
  const blockedIds = editData ? new Set([editData.id, ...getDescendantIds(allModules, editData.id)]) : new Set();
  const parentOptions = allModules.filter((m) => !blockedIds.has(m.id));

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form); // parent component decides whether this is create or update
  }

  function toggleFormStatus() {
    setForm((prev) => ({ ...prev, status: prev.status === "1" ? "0" : "1" }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-orange-50 text-orange-500 rounded-xl shrink-0 shadow-sm border border-orange-100/30">
              <Layers size={22} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#0F265C] tracking-tight leading-tight">
                {editData ? "Edit Module" : "Add Module"}
              </h2>

              <p className="text-xs text-gray-400 font-medium mt-1">
                {editData
                  ? "Update configuration parameters for this module"
                  : "Register a new feature module in the system"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition p-1 rounded-lg hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form fields */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Module Name <span className="text-red-400">*</span>
            </label>
            <input
              required
              value={form.moduleName}
              onChange={(e) => setForm({ ...form, moduleName: e.target.value })}
              placeholder="e.g. Leave Management"
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Parent Module
            </label>
            <select
              value={form.parentId ?? ""}
              onChange={(e) => setForm({ ...form, parentId: e.target.value || null })}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition bg-white"
            >
              <option value="">— None (Top Level) —</option>
              {parentOptions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.moduleName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Route Path
            </label>
            <input
              value={form.path ?? ""}
              onChange={(e) => setForm({ ...form, path: e.target.value })}
              placeholder="e.g. /apply-leave"
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-700 font-mono outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Icon Name
            </label>
            <input
              value={form.icon ?? ""}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              placeholder="e.g. LayoutDashboard"
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-700 font-mono outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
            />
            <p className="text-[11px] text-gray-400 mt-1">Use Lucide icon component names (e.g. FileText, Users)</p>
          </div>

          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Active Status</p>
              <p className="text-xs text-gray-400">Module will appear in navigation when active</p>
            </div>
            <button type="button" onClick={toggleFormStatus}>
              {form.status === "1" ? (
                <ToggleRight size={28} className="text-green-500" />
              ) : (
                <ToggleLeft size={28} className="text-gray-300" />
              )}
            </button>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              // className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 bg-white transition"
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 bg-white transition"
            >

              Cancel
            </button>
            <button
              type="submit"
              // className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-semibold transition shadow-sm"
              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-semibold transition shadow-sm"
            >
              {editData ? "Update Module" : "Add Module"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Confirmation popup shown before actually deleting a module
function DeleteConfirmModal({ module, onClose, onConfirm }) {
  if (!module) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 z-10 p-6">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="p-3 bg-red-50 rounded-full">
            <AlertTriangle size={24} className="text-red-500" />
          </div>

          <h3 className="text-base font-semibold text-gray-800">
            Delete Module?
          </h3>
          <p className="text-sm text-gray-500">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-700">"{module.moduleName}"</span>? This action cannot be undone.
          </p>
        </div>

        <div className="flex gap-3 mt-6">

          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button

            onClick={() => {
              onConfirm(module.id);
              onClose();
            }}
            className="flex-1 bg-red-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-red-600 transition"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// 6. MAIN PAGE — owns all the state, wires everything together
// ------------------------------------------------------------

export default function Modules() {
  // --- state ---
  const [modules, setModules] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null); // null = "add" mode
  const [moduleToDelete, setModuleToDelete] = useState(null);

  // --- derived data ---
  const matchesSearch = (m) => m.moduleName.toLowerCase().includes(searchText.toLowerCase());
  const visibleModules = searchText ? modules.filter(matchesSearch) : modules;
  const tree = buildTree(visibleModules);

  const activeCount = modules.filter((m) => m.status === "1").length;
  const inactiveCount = modules.filter((m) => m.status === "0").length;

  // --- actions ---
  function openAddForm() {
    setEditingModule(null);
    setIsFormOpen(true);
  }

  function openEditForm(module) {
    // `module` comes from the rendered tree, so it carries a `children` array
    // tacked on by buildTree. Strip that (and any other tree-only fields)
    // before it becomes form state, so it doesn't get sent back to the API.
    const { children, ...cleanModule } = module;
    setEditingModule(cleanModule);
    setIsFormOpen(true);
  }

  // Called by the modal on submit. Handles both create + update.
  async function handleSaveModule(formData) {
    try {
      if (editingModule) {
        await updateModule(editingModule.id, formData);
      } else {
        await createModule(formData);
      }

      await fetchModules();
      setIsFormOpen(false);
    } catch (error) {
      console.error(error);
    }
  }

  async function toggleModuleStatus(id, currentStatus) {
    try {
      await updateModule(id, {
        status: currentStatus === "1" ? "0" : "1",
      });

      await fetchModules();
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteModule(id) {
    try {
      await deleteModuleApi(id);

      await fetchModules();
    } catch (error) {
      console.error(error);
    }
  }

  const fetchModules = async () => {
    try {
      const response = await getAllModules();
      setModules(response.data.data);
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  // --- render ---
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Modules</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage navigation modules and their hierarchy</p>
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition shadow-sm"
        >
          <Plus size={16} />
          Add Module
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Modules" value={modules.length} colorClasses="bg-blue-50 text-blue-500" />
        <StatCard label="Active" value={activeCount} colorClasses="bg-green-50 text-green-500" />
        <StatCard label="Inactive" value={inactiveCount} colorClasses="bg-red-50 text-red-400" />
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Toolbar: title + search box */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold text-gray-700 shrink-0">
            Module Tree
          </h2>

          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 w-64">
            <Search size={14} className="shrink-0 text-gray-400" />
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search modules..."
              className="outline-none text-sm flex-1 placeholder-gray-400 bg-transparent"
            />
            {searchText && (
              <button onClick={() => setSearchText("")} className="text-gray-400 hover:text-gray-600">
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50/60">
                <th className="px-5 py-3 font-semibold">Module Name</th>
                <th className="px-5 py-3 font-semibold">Parent</th>
                <th className="px-5 py-3 font-semibold">Path</th>
                <th className="px-5 py-3 font-semibold">Icon</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tree.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-gray-400 text-sm"
                  >

                    No modules found.
                  </td>
                </tr>
              ) : (
                tree.map((node) => (
                  <ModuleRow
                    key={node.id}
                    node={node}
                    level={0}
                    allModules={modules}
                    onEdit={openEditForm}
                    onDelete={setModuleToDelete}
                    onToggleStatus={toggleModuleStatus}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400">
          Showing {modules.length} module{modules.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Modals */}
      <ModuleFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        editData={editingModule}
        allModules={modules}
        onSave={handleSaveModule}
      />
      <DeleteConfirmModal
        module={moduleToDelete}
        onClose={() => setModuleToDelete(null)}
        onConfirm={deleteModule}
      />
    </div>
  );
}
