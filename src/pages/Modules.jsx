import usePermission from "../hooks/usePermission";
import React, { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Users,
  UserRound,
  CalendarDays,
  ClipboardList,
  Clock,
  Building2,
  BriefcaseBusiness,
  Settings,
  ShieldCheck,
  FileCheck,
  WalletCards,
  BarChart3,
  Bell,
  UserCog,
  CalendarCheck,
  ListChecks,
  CircleDollarSign,
  Package,
  Truck,
  Contact,
  GraduationCap,
  MessageSquare,
  Database,
  KeyRound,
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronRight,
  FolderOpen,
  FileText,
  Loader2,
  RefreshCw,
  Inbox,
  CheckCircle2,
  XCircle,
  Layers,
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
  deleteModule,
} from "../services/moduleApi";

const EMPTY_FORM = {
  moduleName: "",
  parentId: "",
  path: "",
  icon: "",
  status: "1",
};

/* -------------------------------------------------------------------------- */
/* Icon Options                                                               */
/* -------------------------------------------------------------------------- */

const ICON_OPTIONS = [
  { name: "LayoutDashboard", label: "Dashboard", Icon: LayoutDashboard },
  { name: "Users", label: "Users", Icon: Users },
  { name: "UserRound", label: "User", Icon: UserRound },
  { name: "CalendarDays", label: "Calendar", Icon: CalendarDays },
  { name: "ClipboardList", label: "Clipboard", Icon: ClipboardList },
  { name: "Clock", label: "Clock", Icon: Clock },
  { name: "Building2", label: "Building", Icon: Building2 },
  { name: "BriefcaseBusiness", label: "Briefcase", Icon: BriefcaseBusiness },
  { name: "Settings", label: "Settings", Icon: Settings },
  { name: "ShieldCheck", label: "Permissions", Icon: ShieldCheck },
  { name: "FileCheck", label: "File Check", Icon: FileCheck },
  { name: "WalletCards", label: "Wallet", Icon: WalletCards },
  { name: "BarChart3", label: "Reports", Icon: BarChart3 },
  { name: "Bell", label: "Notifications", Icon: Bell },
  { name: "UserCog", label: "User Management", Icon: UserCog },
  { name: "CalendarCheck", label: "Calendar Check", Icon: CalendarCheck },
  { name: "ListChecks", label: "Task List", Icon: ListChecks },
  { name: "CircleDollarSign", label: "Finance", Icon: CircleDollarSign },
  { name: "Package", label: "Products", Icon: Package },
  { name: "Truck", label: "Vendors", Icon: Truck },
  { name: "Contact", label: "Contact", Icon: Contact },
  { name: "GraduationCap", label: "Training", Icon: GraduationCap },
  { name: "MessageSquare", label: "Messages", Icon: MessageSquare },
  { name: "Database", label: "Database", Icon: Database },
  { name: "KeyRound", label: "Security", Icon: KeyRound },
  { name: "FolderOpen", label: "Folder", Icon: FolderOpen },
  { name: "FileText", label: "File", Icon: FileText },
];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const getIconComponent = (iconName) =>
  ICON_OPTIONS.find((item) => item.name === iconName)?.Icon || FolderOpen;

const ModuleIcon = ({ iconName, size = 17, className = "" }) => {
  const Icon = getIconComponent(iconName);
  return <Icon size={size} className={className} />;
};

const buildTree = (flatList = []) => {
  const map = new Map();
  const roots = [];

  flatList.forEach((item) => {
    map.set(item.id, { ...item, children: [] });
  });

  flatList.forEach((item) => {
    const current = map.get(item.id);
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId).children.push(current);
    } else {
      roots.push(current);
    }
  });

  return roots;
};

const getDescendantIds = (modules, moduleId) => {
  const descendants = new Set();

  const collect = (parentId) => {
    modules.forEach((module) => {
      if (module.parentId === parentId) {
        descendants.add(module.id);
        collect(module.id);
      }
    });
  };

  collect(moduleId);
  return descendants;
};

const findModuleName = (modules, id) => {
  if (!id) return "-";
  return modules.find((module) => module.id === id)?.moduleName || "-";
};

const countDirectChildren = (modules, moduleId) =>
  modules.filter((module) => module.parentId === moduleId).length;

/* -------------------------------------------------------------------------- */
/* Module Row                                                                 */
/* -------------------------------------------------------------------------- */

const ModuleRow = ({ node, level, allModules, onEdit, onDelete, onToggleStatus, pendingId }) => {
  const { canEdit, canDelete } = usePermission("modules");

  const isActive =
    node.status === "1" || node.status === 1 || node.status === true || node.status === "Active";

  const isPending = pendingId === node.id;

  return (
    <tr>
      {/* Module Name */}
      <td className="hr-td">
        <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 24}px` }}>
          {level > 0 && <ChevronRight size={14} className="shrink-0 text-text-disabled" />}
          <ModuleIcon iconName={node.icon} size={17} className="shrink-0 text-primary-700" />
          <span className="font-semibold text-text-primary">{node.moduleName}</span>
        </div>
      </td>

      {/* Parent */}
      <td className="hr-td text-text-secondary">{findModuleName(allModules, node.parentId)}</td>

      {/* Path */}
      <td className="hr-td text-text-secondary">{node.path || "-"}</td>

      {/* Status */}
      <td className="hr-td">
        <button
          type="button"
          onClick={() => {
            if (!isPending && canEdit) onToggleStatus?.(node.id, node.status);
          }}
          disabled={isPending || !canEdit}
          className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          title={canEdit ? (isActive ? "Click to deactivate" : "Click to activate") : "You do not have permission to edit"}
        >
          <span className={`text-xs font-medium ${isActive ? "text-success-600" : "text-text-secondary"}`}>
            {isPending ? "Updating..." : isActive ? "Active" : "Inactive"}
          </span>
        </button>
      </td>

      {/* Actions */}
      <td className="hr-td">
        <div className="flex items-center justify-center gap-1">
          {canEdit && (
            <button type="button" onClick={() => onEdit?.(node)} className="hr-icon-btn" title="Edit">
              <Pencil size={16} />
            </button>
          )}

          {canDelete && (
            <button type="button" onClick={() => onDelete?.(node)} className="hr-icon-btn danger" title="Delete">
              <Trash2 size={16} />
            </button>
          )}

          {!canEdit && !canDelete && <span className="text-xs text-text-disabled">—</span>}
        </div>
      </td>
    </tr>
  );
};

/* -------------------------------------------------------------------------- */
/* Skeleton Rows                                                              */
/* -------------------------------------------------------------------------- */

const SkeletonRows = ({ count = 6 }) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <tr key={index}>
        {Array.from({ length: 5 }).map((__, cellIndex) => (
          <td key={cellIndex} className="hr-td">
            <div className="h-4 w-24 animate-pulse rounded bg-primary-50" />
          </td>
        ))}
      </tr>
    ))}
  </>
);

/* -------------------------------------------------------------------------- */
/* Module Form Drawer                                                         */
/* -------------------------------------------------------------------------- */

const ModuleFormDrawer = ({ open, onClose, editData, modules, onSubmit, saving }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const isEdit = Boolean(editData);

  useEffect(() => {
    if (!open) return;

    if (editData) {
      setForm({
        moduleName: editData.moduleName || "",
        parentId: editData.parentId ? String(editData.parentId) : "",
        path: editData.path || "",
        icon: editData.icon || "",
        status:
          editData.status === 1 || editData.status === "1" || editData.status === true ? "1" : "0",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, editData]);

  const blockedParentIds = useMemo(() => {
    if (!editData) return new Set();
    return getDescendantIds(modules, editData.id);
  }, [modules, editData]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.moduleName.trim()) return;

    await onSubmit({
      ...form,
      moduleName: form.moduleName.trim(),
      parentId: form.parentId || null,
      path: form.path.trim() || null,
      icon: form.icon || null,
    });
  };

  const toggleFormStatus = () => {
    setForm((prev) => ({ ...prev, status: prev.status === "1" ? "0" : "1" }));
  };

  const canSubmit = form.moduleName.trim().length > 0 && !saving;

  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      icon={Layers}
      size="md"
      title={isEdit ? "Edit Module" : "Add Module"}
      subtitle={isEdit ? "Update configuration for this module" : "Register a new feature module"}
      footer={
        <>
          <button type="button" onClick={onClose} disabled={saving} className="hr-btn hr-btn-outline">
            Cancel
          </button>
          <button type="submit" form="module-form" disabled={!canSubmit} className="hr-btn hr-btn-primary min-w-[140px]">
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? "Saving…" : isEdit ? "Update Module" : "Create Module"}
          </button>
        </>
      }
    >
      <form id="module-form" onSubmit={handleSubmit} className="space-y-5">
        {/* Module Name */}
        <div>
          <label className="hr-label">
            Module Name <span className="text-danger-500">*</span>
          </label>
          <input
            type="text"
            className="hr-input"
            placeholder="Enter module name"
            value={form.moduleName}
            onChange={(e) => handleChange("moduleName", e.target.value)}
            required
          />
        </div>

        {/* Parent Module */}
        <div>
          <label className="hr-label">Parent Module</label>
          <select className="hr-select" value={form.parentId} onChange={(e) => handleChange("parentId", e.target.value)}>
            <option value="">No Parent (Top Level)</option>
            {modules
              .filter((module) => {
                if (!editData) return true;
                if (module.id === editData.id) return false;
                return !blockedParentIds.has(module.id);
              })
              .map((module) => (
                <option key={module.id} value={module.id}>
                  {module.moduleName}
                </option>
              ))}
          </select>
        </div>

        {/* Path */}
        <div>
          <label className="hr-label">Path</label>
          <input
            type="text"
            className="hr-input font-mono"
            placeholder="/module-path"
            value={form.path}
            onChange={(e) => handleChange("path", e.target.value)}
          />
        </div>

        {/* Icon Dropdown */}
        <div>
          <label className="hr-label">Icon</label>

          <div className="relative">
            <select
              className="hr-select pl-10!"
              value={form.icon}
              onChange={(e) => handleChange("icon", e.target.value)}
            >
              <option value="">Select Icon</option>
              {ICON_OPTIONS.map(({ name, label }) => (
                <option key={name} value={name}>
                  {label} ({name})
                </option>
              ))}
            </select>

            <div className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center text-primary-700">
              <ModuleIcon iconName={form.icon} size={17} />
            </div>
          </div>

          {form.icon && (
            <div className="mt-2 flex items-center gap-2 rounded-md border border-border-subtle bg-primary-50 px-3 py-2">
              <ModuleIcon iconName={form.icon} size={18} className="text-primary-700" />
              <span className="text-sm font-medium text-text-primary">
                {ICON_OPTIONS.find((item) => item.name === form.icon)?.label || form.icon}
              </span>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center justify-between gap-4 rounded-md border border-border-subtle bg-background px-4 py-3.5">
          <div>
            <p className="text-sm font-medium text-text-primary">Active Status</p>
            <p className="text-xs text-text-secondary">Module will appear in navigation when active</p>
          </div>
          <Switch checked={form.status === "1"} onChange={toggleFormStatus} ariaLabel="Toggle active status" />
        </div>
      </form>
    </SideDrawer>
  );
};

/* -------------------------------------------------------------------------- */
/* Modules Page                                                               */
/* -------------------------------------------------------------------------- */

const Modules = () => {
  const { canCreate } = usePermission("modules");

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteData, setDeleteData] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [pendingStatusId, setPendingStatusId] = useState(null);

  const fetchModules = async (silent = false) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);

      const response = await getAllModules();
      const data = response?.data?.data || response?.data || response || [];

      setModules(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch modules:", error);
      setModules([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const filteredModules = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return modules;

    return modules.filter((module) => {
      const moduleName = module.moduleName?.toString().toLowerCase() || "";
      const path = module.path?.toString().toLowerCase() || "";
      return moduleName.includes(value) || path.includes(value);
    });
  }, [modules, search]);

  const tree = useMemo(() => buildTree(filteredModules), [filteredModules]);

  const openCreateForm = () => {
    setEditData(null);
    setDrawerOpen(true);
  };

  const openEditForm = (module) => {
    const { children, ...cleanModule } = module;
    setEditData(cleanModule);
    setDrawerOpen(true);
  };

  const handleSave = async (formData) => {
    try {
      setSaving(true);

      if (editData) {
        await updateModule(editData.id, formData);
      } else {
        await createModule(formData);
      }

      setDrawerOpen(false);
      setEditData(null);

      await fetchModules(true);
    } catch (error) {
      console.error("Failed to save module:", error);
    } finally {
      setSaving(false);
    }
  };

  const toggleModuleStatus = async (id, currentStatus) => {
    try {
      setPendingStatusId(id);

      const nextStatus =
        currentStatus === "1" || currentStatus === 1 || currentStatus === true ? "0" : "1";

      await updateModule(id, { status: nextStatus });

      await fetchModules(true);
    } catch (error) {
      console.error("Failed to update module status:", error);
    } finally {
      setPendingStatusId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteData) return;

    try {
      setDeleting(true);

      await deleteModule(deleteData.id);

      setDeleteData(null);

      await fetchModules(true);
    } catch (error) {
      console.error("Failed to delete module:", error);
    } finally {
      setDeleting(false);
    }
  };

  const totalModules = modules.length;

  const activeModules = modules.filter(
    (module) => module.status === "1" || module.status === 1 || module.status === true
  ).length;

  const inactiveModules = totalModules - activeModules;

  const parentModules = modules.filter((module) => !module.parentId).length;

  const renderRows = (nodes, level = 0) =>
    nodes.flatMap((node) => {
      const row = (
        <ModuleRow
          key={node.id}
          node={node}
          level={level}
          allModules={modules}
          onEdit={openEditForm}
          onDelete={setDeleteData}
          onToggleStatus={toggleModuleStatus}
          pendingId={pendingStatusId}
        />
      );

      const children = node.children?.length ? renderRows(node.children, level + 1) : [];
      return [row, ...children];
    });

  const childCountForDelete = deleteData ? countDirectChildren(modules, deleteData.id) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Layers}
        title="Modules"
        subtitle="Manage navigation modules and their hierarchy"
        breadcrumbs={[{ label: "User Management" }, { label: "Modules" }]}
        actions={
          canCreate && (
            <button type="button" onClick={openCreateForm} className="hr-btn hr-btn-primary">
              <Plus size={16} />
              Add Module
            </button>
          )
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FolderOpen} label="Total Modules" value={totalModules} tone="primary" />
        <StatCard icon={CheckCircle2} label="Active Modules" value={activeModules} tone="success" />
        <StatCard icon={XCircle} label="Inactive Modules" value={inactiveModules} tone="danger" />
        <StatCard icon={FolderOpen} label="Parent Modules" value={parentModules} tone="info" />
      </div>

      {/* Main Card */}
      <div className="hr-card overflow-hidden">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-primary-700">Module List</h2>
            <p className="mt-0.5 text-xs text-text-secondary">Manage modules, hierarchy and status.</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-60">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled" />
              <input
                type="text"
                placeholder="Search modules"
                className="hr-input !h-9 pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button
              type="button"
              onClick={() => fetchModules(true)}
              disabled={refreshing}
              className="hr-icon-btn"
              title="Refresh"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="hr-table min-w-[760px]">
            <thead>
              <tr>
                <th className="hr-th">Module Name</th>
                <th className="hr-th">Parent</th>
                <th className="hr-th">Path</th>
                <th className="hr-th">Status</th>
                <th className="hr-th text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <SkeletonRows />
              ) : tree.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                      <Inbox size={22} />
                    </div>
                    <p className="text-sm font-medium text-text-primary">No modules found</p>
                    <p className="mt-1 text-xs text-text-secondary">
                      {search ? "Try changing your search." : "Create a module to get started."}
                    </p>
                  </td>
                </tr>
              ) : (
                renderRows(tree)
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Drawer */}
      <ModuleFormDrawer
        open={drawerOpen}
        onClose={() => {
          if (saving) return;
          setDrawerOpen(false);
          setEditData(null);
        }}
        editData={editData}
        modules={modules}
        onSubmit={handleSave}
        saving={saving}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        open={Boolean(deleteData)}
        title="Delete Module?"
        confirmLabel="Yes, Delete"
        loading={deleting}
        onClose={() => !deleting && setDeleteData(null)}
        onConfirm={handleDelete}
      >
        <p>
          Are you sure you want to delete{" "}
          <span className="font-semibold text-text-primary">"{deleteData?.moduleName}"</span>?
          This action cannot be undone.
        </p>

        {childCountForDelete > 0 && (
          <p className="mt-3 rounded-md border border-warning-500/30 bg-warning-50 px-3 py-2 text-left text-xs text-warning-600">
            This module has {childCountForDelete} sub-module{childCountForDelete !== 1 ? "s" : ""}.
            They won't be deleted, but will move up to the top level of the menu.
          </p>
        )}
      </ConfirmModal>
    </div>
  );
};

export default Modules;