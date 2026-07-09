import React, { useState } from "react";
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

// ── Mock Data (replace with API call later) ──────────────────
const MOCK_MODULES = [
  {
    id: 1,
    moduleName: "Dashboard",
    parentId: null,
    path: "/dashboard",
    icon: "LayoutDashboard",
    status: "1",
  },
  {
    id: 2,
    moduleName: "Attendance",
    parentId: null,
    path: null,
    icon: "FileText",
    status: "1",
  },
  {
    id: 3,
    moduleName: "Leave",
    parentId: 2,
    path: null,
    icon: "ClipboardList",
    status: "1",
  },
  {
    id: 4,
    moduleName: "Apply Leave",
    parentId: 3,
    path: "/apply-leave",
    icon: "ClipboardCheck",
    status: "1",
  },
  {
    id: 5,
    moduleName: "Leave History",
    parentId: 3,
    path: "/leave-history",
    icon: "History",
    status: "1",
  },
  {
    id: 6,
    moduleName: "Leave Setting",
    parentId: 3,
    path: "/leave-setting",
    icon: "Settings2",
    status: "0",
  },
  {
    id: 7,
    moduleName: "Attendance Admin",
    parentId: 2,
    path: "/attendance-admin",
    icon: "CalendarCheck",
    status: "1",
  },
  {
    id: 8,
    moduleName: "Attendance Employee",
    parentId: 2,
    path: "/attendance-employee",
    icon: "CalendarDays",
    status: "1",
  },
  {
    id: 9,
    moduleName: "Holiday Calendar",
    parentId: 2,
    path: "/holiday-calender",
    icon: "CalendarDays",
    status: "1",
  },
  {
    id: 10,
    moduleName: "WFH Management",
    parentId: 2,
    path: "/wfh-management",
    icon: "Home",
    status: "1",
  },
  {
    id: 11,
    moduleName: "Users",
    parentId: null,
    path: "/user",
    icon: "Users",
    status: "1",
  },
  {
    id: 12,
    moduleName: "Roles & Permissions",
    parentId: null,
    path: "/rolespermissions",
    icon: "ShieldCheck",
    status: "1",
  },
  {
    id: 13,
    moduleName: "Roles",
    parentId: null,
    path: "/roles",
    icon: "BadgeCheck",
    status: "1",
  },
  {
    id: 14,
    moduleName: "Profile",
    parentId: null,
    path: "/profile",
    icon: "UserCircle",
    status: "1",
  },
  {
    id: 15,
    moduleName: "Modules",
    parentId: null,
    path: "/modules",
    icon: "Layers",
    status: "1",
  },
];

const EMPTY_FORM = {
  moduleName: "",
  parentId: "",
  path: "",
  icon: "",
  status: "1",
};

// ── Helper: build tree ────────────────────────────────────────
function buildTree(modules) {
  const map = {};
  modules.forEach((m) => (map[m.id] = { ...m, children: [] }));
  const roots = [];
  modules.forEach((m) => {
    if (m.parentId && map[m.parentId]) {
      map[m.parentId].children.push(map[m.id]);
    } else {
      roots.push(map[m.id]);
    }
  });
  return roots;
}

// ── Flat row renderer with indentation ───────────────────────
function ModuleRow({ node, level = 0, modules, onEdit, onDelete, onToggle }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;
  const parentName = node.parentId
    ? (modules.find((m) => m.id === node.parentId)?.moduleName ?? "—")
    : "—";

  return (
    <>
      <tr className="hover:bg-gray-50 transition group">
        {/* Module Name */}
        <td className="px-5 py-3">
          <div
            className="flex items-center gap-2"
            style={{ paddingLeft: `${level * 20}px` }}
          >
            {hasChildren ? (
              <button
                onClick={() => setExpanded((p) => !p)}
                className="text-gray-400 hover:text-orange-500 transition shrink-0"
              >
                <ChevronRight
                  size={14}
                  className={`transition-transform ${expanded ? "rotate-90" : ""}`}
                />
              </button>
            ) : (
              <span className="w-[14px] shrink-0" />
            )}
            {level === 0 ? (
              <FolderOpen size={15} className="text-orange-400 shrink-0" />
            ) : (
              <FileText size={14} className="text-gray-300 shrink-0" />
            )}
            <span
              className={`text-sm ${level === 0 ? "font-semibold text-gray-800" : level === 1 ? "font-medium text-gray-600" : "text-gray-500"}`}
            >
              {node.moduleName}
            </span>
          </div>
        </td>

        {/* Parent */}
        <td className="px-5 py-3 text-sm text-gray-400">{parentName}</td>

        {/* Path */}
        <td className="px-5 py-3">
          {node.path ? (
            <code className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
              {node.path}
            </code>
          ) : (
            <span className="text-gray-300 text-xs">—</span>
          )}
        </td>

        {/* Icon */}
        <td className="px-5 py-3 text-sm text-gray-400 font-mono text-xs">
          {node.icon || <span className="text-gray-300">—</span>}
        </td>

        {/* Status */}
        <td className="px-5 py-3">
          <button
            onClick={() => onToggle(node.id, node.status)}
            title="Toggle status"
            className="flex items-center gap-1.5 transition"
          >
            {node.status === "1" ? (
              <>
                <ToggleRight size={22} className="text-green-500" />
                <span className="text-xs text-green-600 font-medium">
                  Active
                </span>
              </>
            ) : (
              <>
                <ToggleLeft size={22} className="text-gray-300" />
                <span className="text-xs text-gray-400 font-medium">
                  Inactive
                </span>
              </>
            )}
          </button>
        </td>

        {/* Actions */}
        <td className="px-5 py-3">
          <div className="flex items-center gap-2 transition">
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

      {/* Render children */}
      {expanded &&
        hasChildren &&
        node.children.map((child) => (
          <ModuleRow
            key={child.id}
            node={child}
            level={level + 1}
            modules={modules}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggle={onToggle}
          />
        ))}
    </>
  );
}

// ── Add / Edit Modal ──────────────────────────────────────────
function ModuleModal({ open, onClose, editData, modules }) {
  const [form, setForm] = useState(editData ?? EMPTY_FORM);

  React.useEffect(() => {
    setForm(editData ?? EMPTY_FORM);
  }, [editData, open]);

  const parentOptions = modules.filter(
    (m) => !editData || m.id !== editData.id,
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: call createModule / updateModule API here
    console.log("Submit:", form);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-[999] transition-opacity duration-300 ${
          open
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[460px] bg-white z-[1000] transition-transform duration-300 shadow-2xl flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
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
            className="text-gray-400 hover:text-gray-600 transition p-1.5 rounded-lg hover:bg-gray-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 p-5 overflow-y-auto space-y-5">
            {/* Module Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Module Name <span className="text-red-400">*</span>
              </label>
              <input
                required
                value={form.moduleName}
                onChange={(e) =>
                  setForm({ ...form, moduleName: e.target.value })
                }
                placeholder="e.g. Leave Management"
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition bg-white"
              />
            </div>

            {/* Parent Module */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Parent Module
              </label>
              <select
                value={form.parentId ?? ""}
                onChange={(e) =>
                  setForm({ ...form, parentId: e.target.value || null })
                }
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

            {/* Path */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Route Path
              </label>
              <input
                value={form.path ?? ""}
                onChange={(e) => setForm({ ...form, path: e.target.value })}
                placeholder="e.g. /apply-leave"
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-700 font-mono outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition bg-white"
              />
            </div>

            {/* Icon */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Icon Name
              </label>
              <input
                value={form.icon ?? ""}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                placeholder="e.g. LayoutDashboard"
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-700 font-mono outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition bg-white"
              />
              <p className="text-[11px] text-gray-400 mt-1.5">
                Use Lucide icon component names (e.g. FileText, Users)
              </p>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  Active Status
                </p>
                <p className="text-xs text-gray-400">
                  Module will appear in navigation when active
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setForm({ ...form, status: form.status === "1" ? "0" : "1" })
                }
              >
                {form.status === "1" ? (
                  <ToggleRight
                    size={32}
                    className="text-green-500 transition"
                  />
                ) : (
                  <ToggleLeft size={32} className="text-gray-300 transition" />
                )}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-5 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 bg-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-semibold transition shadow-sm"
            >
              {editData ? "Update Module" : "Add Module"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────
function DeleteModal({ open, module, onClose, onConfirm }) {
  if (!open || !module) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
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
            <span className="font-semibold text-gray-700">
              "{module.moduleName}"
            </span>
            ? This action cannot be undone.
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

// ── Main Modules Page ─────────────────────────────────────────
export default function Modules() {
  const [modules, setModules] = useState(MOCK_MODULES);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Filter by search then build tree
  const filtered = modules.filter((m) =>
    m.moduleName.toLowerCase().includes(search.toLowerCase()),
  );
  const tree = buildTree(search ? filtered : modules);

  const handleEdit = (module) => {
    setEditData(module);
    setModalOpen(true);
  };

  const handleDelete = (module) => setDeleteTarget(module);

  const handleToggle = (id, currentStatus) => {
    // TODO: call toggleModuleStatus API
    setModules((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status: currentStatus === "1" ? "0" : "1" } : m,
      ),
    );
  };

  const handleDeleteConfirm = (id) => {
    // TODO: call deleteModule API
    setModules((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0F265C]">Modules</h1>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
            <span>Administration</span>
            <ChevronRight size={12} className="shrink-0" />
            <span className="text-orange-500 font-medium">Modules</span>
          </div>
        </div>
        <button
          onClick={() => {
            setEditData(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition shadow-sm"
        >
          <Plus size={16} />
          Add Module
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Modules",
            value: modules.length,
            color: "bg-blue-50 text-blue-500",
          },
          {
            label: "Active",
            value: modules.filter((m) => m.status === "1").length,
            color: "bg-green-50 text-green-500",
          },
          {
            label: "Inactive",
            value: modules.filter((m) => m.status === "0").length,
            color: "bg-red-50 text-red-400",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4"
          >
            <div className={`p-2.5 rounded-lg ${color}`}>
              <Layers size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold text-gray-700 shrink-0">
            Module Tree
          </h2>
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 w-64">
            <Search size={14} className="shrink-0 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search modules..."
              className="outline-none text-sm flex-1 placeholder-gray-400 bg-transparent"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Tree Table */}
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
                    modules={modules}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggle={handleToggle}
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

      {/* ── Modals ── */}
      <ModuleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editData={editData}
        modules={modules}
      />
      <DeleteModal
        open={!!deleteTarget}
        module={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
