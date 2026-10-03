// ```jsx
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

const getIconComponent = (iconName) => {
  return (
    ICON_OPTIONS.find((item) => item.name === iconName)?.Icon || FolderOpen
  );
};

const ModuleIcon = ({ iconName, size = 17, className = "" }) => {
  const Icon = getIconComponent(iconName);

  return <Icon size={size} className={className} />;
};

const buildTree = (flatList = []) => {
  const map = new Map();
  const roots = [];

  flatList.forEach((item) => {
    map.set(item.id, {
      ...item,
      children: [],
    });
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

const countDirectChildren = (modules, moduleId) => {
  return modules.filter((module) => module.parentId === moduleId).length;
};

/* -------------------------------------------------------------------------- */
/* Module Row                                                                 */
/* -------------------------------------------------------------------------- */

const ModuleRow = ({
  node,
  level,
  allModules,
  onEdit,
  onDelete,
  onToggleStatus,
  pendingId,
}) => {
  const { canEdit, canDelete } = usePermission("modules");

  const isActive =
    node.status === "1" ||
    node.status === 1 ||
    node.status === true ||
    node.status === "Active";

  const isPending = pendingId === node.id;

  return (
    <tr>
      {/* Module Name */}
      <td className="hr-td">
        <div
          className="flex items-center gap-2"
          style={{ paddingLeft: `${level * 24}px` }}
        >
          {level > 0 && (
            <ChevronRight
              size={14}
              className="shrink-0 text-text-disabled"
            />
          )}

          <ModuleIcon
            iconName={node.icon}
            size={17}
            className="shrink-0 text-primary-700"
          />

          <span className="font-semibold text-text-primary">
            {node.moduleName}
          </span>
        </div>
      </td>

      {/* Parent */}
      <td className="hr-td text-text-secondary">
        {findModuleName(allModules, node.parentId)}
      </td>

      {/* Path */}
      <td className="hr-td text-text-secondary">
        {node.path || "-"}
      </td>

      {/* Status */}
      <td className="hr-td">
        <button
          type="button"
          onClick={() => {
            if (!isPending && canEdit) {
              onToggleStatus?.(node.id, node.status);
            }
          }}
          disabled={isPending || !canEdit}
          className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          title={
            canEdit
              ? isActive
                ? "Click to deactivate"
                : "Click to activate"
              : "You do not have permission to edit"
          }
        >
          <span
            className={`text-xs font-medium ${
              isActive
                ? "text-success-600"
                : "text-text-secondary"
            }`}
          >
            {isPending
              ? "Updating..."
              : isActive
              ? "Active"
              : "Inactive"}
          </span>
        </button>
      </td>

      {/* Actions */}
      <td className="hr-td">
        <div className="flex items-center justify-center gap-1">
          {canEdit && (
            <button
              type="button"
              onClick={() => onEdit?.(node)}
              className="hr-icon-btn"
              title="Edit"
            >
              <Pencil size={16} />
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={() => onDelete?.(node)}
              className="hr-icon-btn danger"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

/* -------------------------------------------------------------------------- */
/* Skeleton Rows                                                              */
/* -------------------------------------------------------------------------- */

const SkeletonRows = ({ count = 6 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <tr key={index}>
          {Array.from({ length: 5 }).map((__, cellIndex) => (
            <td key={cellIndex} className="hr-td">
              <div className="h-4 w-24 animate-pulse rounded bg-border-subtle" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

/* -------------------------------------------------------------------------- */
/* Module Form Drawer                                                         */
/* -------------------------------------------------------------------------- */

const ModuleFormDrawer = ({
  open,
  onClose,
  editData,
  modules,
  onSubmit,
  saving,
}) => {
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
          editData.status === 1 ||
          editData.status === "1" ||
          editData.status === true
            ? "1"
            : "0",
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
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
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
    setForm((prev) => ({
      ...prev,
      status: prev.status === "1" ? "0" : "1",
    }));
  };

  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Module" : "Add Module"}
    >
      <form onSubmit={handleSubmit} className="flex h-full flex-col">
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {/* Module Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">
              Module Name <span className="text-danger-500">*</span>
            </label>

            <input
              type="text"
              className="hr-input"
              placeholder="Enter module name"
              value={form.moduleName}
              onChange={(e) =>
                handleChange("moduleName", e.target.value)
              }
              required
            />
          </div>

          {/* Parent Module */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">
              Parent Module
            </label>

            <select
              className="hr-select"
              value={form.parentId}
              onChange={(e) =>
                handleChange("parentId", e.target.value)
              }
            >
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
            <label className="mb-1.5 block text-sm font-medium text-text-primary">
              Path
            </label>

            <input
              type="text"
              className="hr-input"
              placeholder="/module-path"
              value={form.path}
              onChange={(e) =>
                handleChange("path", e.target.value)
              }
            />
          </div>

          {/* Icon Dropdown */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">
              Icon
            </label>

            <div className="relative">
              <select
                className="hr-select !pl-10"
                value={form.icon}
                onChange={(e) =>
                  handleChange("icon", e.target.value)
                }
              >
                <option value="">Select Icon</option>

                {ICON_OPTIONS.map(
                  ({ name, label }) => (
                    <option key={name} value={name}>
                      {label} ({name})
                    </option>
                  )
                )}
              </select>

              <div className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center text-primary-700">
                <ModuleIcon
                  iconName={form.icon}
                  size={17}
                />
              </div>
            </div>

            {form.icon && (
              <div className="mt-2 flex items-center gap-2 rounded-md border border-border-subtle bg-primary-50 px-3 py-2">
                <ModuleIcon
                  iconName={form.icon}
                  size={18}
                  className="text-primary-700"
                />

                <span className="text-sm font-medium text-text-primary">
                  {ICON_OPTIONS.find(
                    (item) => item.name === form.icon
                  )?.label || form.icon}
                </span>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center justify-between rounded-lg border border-border-subtle px-4 py-3">
            <div>
              <p className="text-sm font-medium text-text-primary">
                Active Status
              </p>

              <p className="mt-0.5 text-xs text-text-secondary">
                Enable this module for active use.
              </p>
            </div>

            <Switch
              checked={form.status === "1"}
              onChange={toggleFormStatus}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border-subtle p-4">
          <button
            type="button"
            onClick={onClose}
            className="hr-btn-secondary"
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="hr-btn-primary"
            disabled={saving || !form.moduleName.trim()}
          >
            {saving && (
              <Loader2
                size={16}
                className="mr-2 animate-spin"
              />
            )}

            {isEdit ? "Update Module" : "Create Module"}
          </button>
        </div>
      </form>
    </SideDrawer>
  );
};

/* -------------------------------------------------------------------------- */
/* Modules Page                                                               */
/* -------------------------------------------------------------------------- */

const Modules = () => {
  const { canCreate, canEdit, canDelete } =
    usePermission("modules");

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
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getAllModules();

      const data =
        response?.data?.data ||
        response?.data ||
        response ||
        [];

      setModules(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch modules:", error);

      setModules([]);

      if (!silent) {
        // Keep existing application toast/error behavior if API
        // already handles it upstream.
      }
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
      const moduleName =
        module.moduleName?.toString().toLowerCase() || "";

      const path =
        module.path?.toString().toLowerCase() || "";

      return (
        moduleName.includes(value) ||
        path.includes(value)
      );
    });
  }, [modules, search]);

  const tree = useMemo(
    () => buildTree(filteredModules),
    [filteredModules]
  );

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
    if (!canEdit) return;

    try {
      setPendingStatusId(id);

      const nextStatus =
        currentStatus === "1" ||
        currentStatus === 1 ||
        currentStatus === true
          ? "0"
          : "1";

      await updateModule(id, {
        status: nextStatus,
      });

      await fetchModules(true);
    } catch (error) {
      console.error(
        "Failed to update module status:",
        error
      );
    } finally {
      setPendingStatusId(null);
    }
  };

  const openDeleteModal = (module) => {
    setDeleteData(module);
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
    (module) =>
      module.status === "1" ||
      module.status === 1 ||
      module.status === true
  ).length;

  const inactiveModules = totalModules - activeModules;

  const parentModules = modules.filter(
    (module) => !module.parentId
  ).length;

  const renderRows = (nodes, level = 0) => {
    return nodes.flatMap((node) => {
      const row = (
        <ModuleRow
          key={node.id}
          node={node}
          level={level}
          allModules={modules}
          onEdit={openEditForm}
          onDelete={openDeleteModal}
          onToggleStatus={toggleModuleStatus}
          pendingId={pendingStatusId}
        />
      );

      const children = node.children?.length
        ? renderRows(node.children, level + 1)
        : [];

      return [row, ...children];
    });
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <PageHeader
        title="Modules"
        description="Manage application modules and their hierarchy."
        action={
          canCreate
            ? {
                label: "Add Module",
                icon: Plus,
                onClick: openCreateForm,
              }
            : undefined
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Modules"
          value={totalModules}
          icon={FolderOpen}
        />

        <StatCard
          title="Active Modules"
          value={activeModules}
          icon={CheckCircle2}
        />

        <StatCard
          title="Inactive Modules"
          value={inactiveModules}
          icon={XCircle}
        />

        <StatCard
          title="Parent Modules"
          value={parentModules}
          icon={FolderOpen}
        />
      </div>

      {/* Main Card */}
      <div className="hr-card overflow-hidden">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-primary-700">
              Module List
            </h2>

            <p className="mt-0.5 text-xs text-text-secondary">
              Manage modules, hierarchy and status.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-60">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled"
              />

              <input
                type="text"
                placeholder="Search modules"
                className="hr-input !h-9 pl-8"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>

            <button
              type="button"
              onClick={() => fetchModules(true)}
              disabled={refreshing}
              className="hr-icon-btn"
              title="Refresh"
            >
              <RefreshCw
                size={16}
                className={
                  refreshing ? "animate-spin" : ""
                }
              />
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
                <th className="hr-th text-center">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <SkeletonRows />
              ) : tree.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-14 text-center"
                  >
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                      <Inbox size={22} />
                    </div>

                    <p className="text-sm font-medium text-text-primary">
                      No modules found
                    </p>

                    <p className="mt-1 text-xs text-text-secondary">
                      {search
                        ? "Try changing your search."
                        : "Create a module to get started."}
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
        title="Delete Module"
        message={
          deleteData
            ? `Are you sure you want to delete "${deleteData.moduleName}"?${
                countDirectChildren(
                  modules,
                  deleteData.id
                ) > 0
                  ? " Its child modules will be moved to the top level."
                  : ""
              }`
            : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => {
          if (!deleting) {
            setDeleteData(null);
          }
        }}
        loading={deleting}
        danger
      />
    </div>
  );
};

export default Modules;
// ```
