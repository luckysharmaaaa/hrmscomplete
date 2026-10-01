import usePermission from "../hooks/usePermission";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import {
  Layers,
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronRight,
  X,
  FolderOpen,
  FileText,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Inbox,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import SideDrawer from "../components/ui/SideDrawer";
import ConfirmModal from "../components/ui/ConfirmModal";
import Switch from "../components/ui/Switch";
import StatCard from "../components/ui/StatCard";

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

// Every descendant id of `moduleId` — used to stop a module being re-parented
// under one of its own descendants (would create a cycle in the tree).
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

// Direct child count, used to warn before a delete (FK is ON DELETE SET NULL).
function countDirectChildren(modules, id) {
  return modules.filter((m) => m.parentId === id).length;
}

// ------------------------------------------------------------
// TABLE ROW (renders itself, then its children below it)
// ------------------------------------------------------------

function ModuleRow({
  node,
  level,
  allModules,
  onEdit,
  onDelete,
  onToggleStatus,
  pendingId,
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { canEdit, canDelete } = usePermission("modules");
  const hasChildren = node.children.length > 0;
  const isActive = node.status === "1";
  const isPending = pendingId === node.id;

  const nameClass =
    level === 0
      ? "text-sm font-semibold text-text-primary"
      : level === 1
        ? "text-sm font-medium text-text-primary"
        : "text-sm text-text-secondary";

  return (
    <>
      <tr>
        {/* Module name + expand arrow + indentation */}
        <td className="hr-td">
          <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 24}px` }}>
            {hasChildren ? (
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-primary-600"
                aria-label={isExpanded ? `Collapse ${node.moduleName}` : `Expand ${node.moduleName}`}
                aria-expanded={isExpanded}
              >
                <ChevronRight
                  size={15}
                  className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}
                />
              </button>
            ) : (
              <span className="w-6 shrink-0" />
            )}

            {level === 0 ? (
              <FolderOpen size={17} className="shrink-0 text-primary-700" />
            ) : (
              <FileText size={16} className="shrink-0 text-text-disabled" />
            )}

            <span className={nameClass}>{node.moduleName}</span>

            {hasChildren && (
              <span className="rounded-full border border-primary-100 bg-primary-50 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-primary-700">
                {node.children.length}
              </span>
            )}
          </div>
        </td>

        {/* Parent */}
        <td className="hr-td text-text-secondary">
          {node.parentId ? findModuleName(allModules, node.parentId) : "—"}
        </td>

        {/* Path */}
        <td className="hr-td">
          {node.path ? (
            <code className="rounded-md border border-border-subtle bg-background px-2 py-0.5 font-mono text-xs text-primary-700">
              {node.path}
            </code>
          ) : (
            <span className="text-text-disabled">—</span>
          )}
        </td>

        {/* Icon */}
        <td className="hr-td font-mono text-xs text-text-secondary">
          {node.icon || <span className="text-text-disabled">—</span>}
        </td>

        {/* Status */}
        <td className="hr-td">
          <div className="flex items-center gap-2.5">
            <Switch
              checked={isActive}
              disabled={isPending || !canEdit}
              onChange={() => onToggleStatus(node.id, node.status)}
              ariaLabel={isActive ? "Active — click to deactivate" : "Inactive — click to activate"}
            />
            <span
              className={`text-xs font-medium ${isActive ? "text-success-600" : "text-text-secondary"}`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </td>

        {/* Actions */}
        <td className="hr-td">
          <div className="flex items-center justify-center gap-1">
            {canEdit && (
<button
              type="button"
              onClick={() => onEdit(node)}
              className="hr-icon-btn"
              title="Edit"
              aria-label={`Edit ${node.moduleName}`}
            >
              <Pencil size={16} />
            </button>
)}
            {canDelete && (
<button
              type="button"
              onClick={() => onDelete(node)}
              className="hr-icon-btn danger"
              title="Delete"
              aria-label={`Delete ${node.moduleName}`}
            >
              <Trash2 size={16} />
            </button>
)}
          </div>
        </td>
      </tr>

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
            pendingId={pendingId}
          />
        ))}
    </>
  );
}

function SkeletonRows() {
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <tr key={i}>
          <td className="hr-td" colSpan={6}>
            <div
              className="h-4 animate-pulse rounded bg-primary-50"
              style={{ width: `${70 - i * 8}%`, marginLeft: i > 2 ? 24 : 0 }}
            />
          </td>
        </tr>
      ))}
    </>
  );
}

// ------------------------------------------------------------
// ADD / EDIT DRAWER (opens from the right)
// ------------------------------------------------------------

function ModuleFormDrawer({ isOpen, onClose, editData, allModules, onSave }) {
  const [form, setForm] = useState(editData ?? EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const nameInputRef = useRef(null);

  // Reset the form whenever the drawer opens / a different module is edited
  useEffect(() => {
    setForm(editData ?? EMPTY_FORM);
    setFormError(null);
    setIsSaving(false);
  }, [editData, isOpen]);

  // Focus the first field once the slide-in animation is done
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => nameInputRef.current?.focus(), 350);
    return () => clearTimeout(t);
  }, [isOpen]);

  // A module can't be its own parent, nor a child of its own descendants
  const blockedIds = editData
    ? new Set([editData.id, ...getDescendantIds(allModules, editData.id)])
    : new Set();
  const parentOptions = allModules.filter((m) => !blockedIds.has(m.id));

  const trimmedName = form.moduleName.trim();
  const canSubmit = trimmedName.length > 0 && !isSaving;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSaving(true);
    setFormError(null);
    try {
      await onSave({ ...form, moduleName: trimmedName });
      // On success the parent closes the drawer.
    } catch (err) {
      setFormError(
        err?.response?.data?.message || "Couldn't save this module. Please try again."
      );
      setIsSaving(false);
    }
  }

  function toggleFormStatus() {
    setForm((prev) => ({ ...prev, status: prev.status === "1" ? "0" : "1" }));
  }

  return (
    <SideDrawer
      open={isOpen}
      onClose={onClose}
      icon={Layers}
      size="md"
      title={editData ? "Edit Module" : "Add Module"}
      subtitle={
        editData
          ? "Update configuration for this module"
          : "Register a new feature module in the system"
      }
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="hr-btn hr-btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="module-form"
            disabled={!canSubmit}
            className="hr-btn hr-btn-primary min-w-[150px]"
          >
            {isSaving && <Loader2 size={16} className="animate-spin" />}
            {isSaving ? "Saving…" : editData ? "Update Module" : "Add Module"}
          </button>
        </>
      }
    >
      <form id="module-form" onSubmit={handleSubmit} className="space-y-5">
        {formError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-md border border-danger-500/20 bg-danger-50 px-3.5 py-2.5 text-xs text-danger-600"
          >
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div>
          <label htmlFor="moduleName" className="hr-label">
            Module Name <span className="text-danger-500">*</span>
          </label>
          <input
            id="moduleName"
            ref={nameInputRef}
            required
            value={form.moduleName}
            onChange={(e) => setForm({ ...form, moduleName: e.target.value })}
            placeholder="e.g. Leave Management"
            className="hr-input"
          />
        </div>

        <div>
          <label htmlFor="parentId" className="hr-label">
            Parent Module
          </label>
          <select
            id="parentId"
            value={form.parentId ?? ""}
            onChange={(e) => setForm({ ...form, parentId: e.target.value || null })}
            className="hr-select"
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
          <label htmlFor="path" className="hr-label">
            Route Path
          </label>
          <input
            id="path"
            value={form.path ?? ""}
            onChange={(e) => setForm({ ...form, path: e.target.value })}
            placeholder="e.g. /apply-leave"
            className="hr-input font-mono"
          />
        </div>

        <div>
          <label htmlFor="icon" className="hr-label">
            Icon Name
          </label>
          <input
            id="icon"
            value={form.icon ?? ""}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
            placeholder="e.g. LayoutDashboard"
            className="hr-input font-mono"
          />
          <p className="mt-1.5 text-xs text-text-secondary">
            Use Lucide icon component names (e.g. FileText, Users)
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-md border border-border-subtle bg-background px-4 py-3.5">
          <div>
            <p className="text-sm font-medium text-text-primary">Active Status</p>
            <p className="text-xs text-text-secondary">
              Module will appear in navigation when active
            </p>
          </div>
          <Switch
            checked={form.status === "1"}
            onChange={toggleFormStatus}
            ariaLabel="Toggle active status"
          />
        </div>
      </form>
    </SideDrawer>
  );
}

// ------------------------------------------------------------
// MAIN PAGE — owns all the state, wires everything together
// ------------------------------------------------------------

export default function Modules() {
  const { canAdd } = usePermission("modules");
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null); // null = "add" mode
  const [moduleToDelete, setModuleToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingToggleId, setPendingToggleId] = useState(null);

  // --- derived data ---
  const matchesSearch = (m) =>
    m.moduleName.toLowerCase().includes(searchText.toLowerCase());
  const visibleModules = searchText ? modules.filter(matchesSearch) : modules;
  const tree = buildTree(visibleModules);

  const activeCount = modules.filter((m) => m.status === "1").length;
  const inactiveCount = modules.filter((m) => m.status === "0").length;

  // --- data fetch ---
  const fetchModules = useCallback(async ({ silent } = {}) => {
    if (!silent) setIsLoading(true);
    setLoadError(null);
    try {
      const response = await getAllModules();
      setModules(response.data.data);
    } catch (error) {
      console.error("Error fetching modules:", error);
      setLoadError("Couldn't load modules. Check your connection and try again.");
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  // --- actions ---
  function openAddForm() {
    setEditingModule(null);
    setIsFormOpen(true);
  }

  function openEditForm(module) {
    // Strip the tree-only `children` array so it never reaches the API
    const { children, ...cleanModule } = module;
    setEditingModule(cleanModule);
    setIsFormOpen(true);
  }

  // Throws back to the drawer on failure so it can show an inline error.
  async function handleSaveModule(formData) {
    if (editingModule) {
      await updateModule(editingModule.id, formData);
      toast.success(`"${formData.moduleName}" updated.`);
    } else {
      await createModule(formData);
      toast.success(`"${formData.moduleName}" added.`);
    }
    await fetchModules({ silent: true });
    setIsFormOpen(false);
  }

  async function toggleModuleStatus(id, currentStatus) {
    setPendingToggleId(id);
    try {
      await updateModule(id, {
        status: currentStatus === "1" ? "0" : "1",
      });
      await fetchModules({ silent: true });
    } catch (error) {
      console.error(error);
      toast.error("Couldn't update status. Please try again.");
    } finally {
      setPendingToggleId(null);
    }
  }

  async function deleteModule() {
    if (!moduleToDelete || isDeleting) return;
    const target = moduleToDelete;

    setIsDeleting(true);
    try {
      await deleteModuleApi(target.id);
      await fetchModules({ silent: true });
      setModuleToDelete(null);
      toast.success(`"${target.moduleName ?? "Module"}" deleted.`);
    } catch (error) {
      console.error(error);
      toast.error("Couldn't delete this module. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  const deleteChildCount = moduleToDelete
    ? countDirectChildren(modules, moduleToDelete.id)
    : 0;

  // --- render ---
  return (
    <div className="space-y-6">
      <PageHeader
        icon={Layers}
        title="Modules"
        subtitle="Manage navigation modules and their hierarchy"
        breadcrumbs={[{ label: "User Management" }, { label: "Modules" }]}
        actions={
          canAdd && (
<button type="button" onClick={openAddForm} className="hr-btn hr-btn-primary">
            <Plus size={16} />
            Add Module
          </button>
)
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Layers} label="Total Modules" value={modules.length} tone="primary" />
        <StatCard icon={CheckCircle2} label="Active" value={activeCount} tone="success" />
        <StatCard icon={XCircle} label="Inactive" value={inactiveCount} tone="danger" />
      </div>

      {/* Table card */}
      <div className="hr-card overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-5 py-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-primary-700">Module Tree</h2>
            <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-700">
              {modules.length}
            </span>
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled"
            />
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search modules..."
              aria-label="Search modules"
              className="hr-input pl-9 pr-9"
            />
            {searchText && (
              <button
                type="button"
                onClick={() => setSearchText("")}
                className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-text-secondary hover:bg-primary-50 hover:text-primary-700"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="hr-table min-w-[880px]">
            <thead>
              <tr>
                <th className="hr-th">Module Name</th>
                <th className="hr-th">Parent</th>
                <th className="hr-th">Path</th>
                <th className="hr-th">Icon</th>
                <th className="hr-th">Status</th>
                <th className="hr-th text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <SkeletonRows />
              ) : loadError ? (
                <tr>
                  <td colSpan={6} className="py-14">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <AlertTriangle size={24} className="text-danger-500" />
                      <p className="text-sm text-text-secondary">{loadError}</p>
                      <button
                        type="button"
                        onClick={() => fetchModules()}
                        className="hr-btn hr-btn-outline hr-btn-sm mt-1"
                      >
                        <RefreshCw size={14} />
                        Try again
                      </button>
                    </div>
                  </td>
                </tr>
              ) : tree.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                        <Inbox size={22} />
                      </div>
                      {searchText ? (
                        <>
                          <p className="text-sm font-medium text-text-primary">
                            No modules match "{searchText}"
                          </p>
                          <button
                            type="button"
                            onClick={() => setSearchText("")}
                            className="hr-btn hr-btn-outline hr-btn-sm"
                          >
                            Clear search
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-text-primary">No modules yet</p>
                          {canAdd && (
<button
                            type="button"
                            onClick={openAddForm}
                            className="hr-btn hr-btn-primary hr-btn-sm"
                          >
                            <Plus size={14} />
                            Add your first module
                          </button>
)}
                        </>
                      )}
                    </div>
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
                    pendingId={pendingToggleId}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        <div className="flex h-12 items-center border-t border-border-subtle px-5 text-xs text-text-secondary">
          {searchText
            ? `Showing ${visibleModules.length} of ${modules.length} module${modules.length !== 1 ? "s" : ""}`
            : `Showing ${modules.length} module${modules.length !== 1 ? "s" : ""}`}
        </div>
      </div>

      {/* Add / Edit drawer */}
      <ModuleFormDrawer
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        editData={editingModule}
        allModules={modules}
        onSave={handleSaveModule}
      />

      {/* Delete confirmation */}
      <ConfirmModal
        open={Boolean(moduleToDelete)}
        title="Delete Module?"
        loading={isDeleting}
        confirmLabel="Yes, Delete"
        onClose={() => !isDeleting && setModuleToDelete(null)}
        onConfirm={deleteModule}
      >
        <p>
          Are you sure you want to delete{" "}
          <span className="font-semibold text-text-primary">"{moduleToDelete?.moduleName}"</span>?
          This action cannot be undone.
        </p>

        {deleteChildCount > 0 && (
          <p className="mt-3 rounded-md border border-warning-500/30 bg-warning-50 px-3 py-2 text-left text-xs text-warning-600">
            This module has {deleteChildCount} sub-module{deleteChildCount !== 1 ? "s" : ""}. They
            won't be deleted, but will move up to the top level of the menu.
          </p>
        )}
      </ConfirmModal>
    </div>
  );
}