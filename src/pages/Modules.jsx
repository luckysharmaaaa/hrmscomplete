import usePermission from "../hooks/usePermission";
import { createElement, useCallback, useEffect, useMemo, useState } from "react";
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
  ChevronRight,
  ChevronDown,
  Download,
  Eye,
  FileSpreadsheet,
  FolderOpen,
  FileText,
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Layers,
} from "lucide-react";
import { toast } from "react-toastify";

import PageHeader from "../components/ui/PageHeader";
import SideDrawer from "../components/ui/SideDrawer";
import ConfirmModal from "../components/ui/ConfirmModal";
import Switch from "../components/ui/Switch";
import StatCard from "../components/ui/StatCard";
import StatusBadge from "../components/ui/StatusBadge";
import DataTable from "../components/ui/DataTable";

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

const ModuleIcon = ({ iconName, size = 17, className = "" }) =>
  createElement(getIconComponent(iconName), { size, className });

// status can arrive as 1 / "1" / true / "Active"
const isActiveStatus = (status) =>
  status === 1 || status === "1" || status === true || status === "Active";

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

// Flattens the tree into display rows so the table can be paginated.
const flattenTree = (nodes, level = 0) =>
  nodes.flatMap((node) => [
    { node, level },
    ...(node.children?.length ? flattenTree(node.children, level + 1) : []),
  ]);

// Sorts siblings at every level, so the hierarchy is never broken.
const sortTree = (nodes, sort) => {
  if (!sort.key) return nodes;

  const direction = sort.dir === "asc" ? 1 : -1;

  const valueOf = (node) =>
    sort.key === "status"
      ? (isActiveStatus(node.status) ? 1 : 0)
      : String(node[sort.key] || "").toLowerCase();

  return [...nodes]
    .sort((a, b) => {
      const x = valueOf(a);
      const y = valueOf(b);

      if (typeof x === "number") return (x - y) * direction;
      return x.localeCompare(y) * direction;
    })
    .map((node) => ({ ...node, children: sortTree(node.children || [], sort) }));
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
  if (!id) return "—";
  return modules.find((module) => module.id === id)?.moduleName || "—";
};

const countDirectChildren = (modules, moduleId) =>
  modules.filter((module) => module.parentId === moduleId).length;

/* -------------------------------------------------------------------------- */
/* Read-only details drawer (same pattern as UserViewDrawer)                  */
/* -------------------------------------------------------------------------- */

const DetailRow = ({ label, children }) => (
  <div className="flex items-start justify-between gap-6 border-b border-border-subtle py-3 last:border-b-0">
    <dt className="shrink-0 text-sm text-text-secondary">{label}</dt>
    <dd className="min-w-0 break-words text-right text-sm font-medium text-text-primary">{children}</dd>
  </div>
);

const ModuleViewDrawer = ({ open, module, allModules, canEdit, onClose, onEdit }) => {
  const isActive = module ? isActiveStatus(module.status) : false;

  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      icon={Layers}
      size="md"
      title="Module details"
      subtitle={module?.moduleName}
      footer={
        <>
          <button type="button" onClick={onClose} className="hr-btn hr-btn-outline">
            Close
          </button>

          {canEdit && module && (
            <button type="button" onClick={() => onEdit(module)} className="hr-btn hr-btn-primary">
              Edit module
            </button>
          )}
        </>
      }
    >
      {module && (
        <div className="space-y-6">
          <div className="flex items-center gap-4 rounded-xl border border-border-subtle bg-background p-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">
              <ModuleIcon iconName={module.icon} size={22} />
            </span>

            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-text-primary">{module.moduleName}</p>
              <p className="truncate font-mono text-sm text-text-secondary">{module.path || "—"}</p>
            </div>
          </div>

          <dl>
            <DetailRow label="Parent">{findModuleName(allModules, module.parentId)}</DetailRow>
            <DetailRow label="Path">{module.path || "—"}</DetailRow>
            <DetailRow label="Status">
              <StatusBadge tone={isActive ? "success" : "danger"}>
                {isActive ? "Active" : "Inactive"}
              </StatusBadge>
            </DetailRow>
            <DetailRow label="Sub-modules">{module.children?.length ?? 0}</DetailRow>
          </dl>
        </div>
      )}
    </SideDrawer>
  );
};

/* -------------------------------------------------------------------------- */
/* Module Form Drawer                                                         */
/* -------------------------------------------------------------------------- */

const ModuleFormDrawer = ({ open, onClose, editData, modules, onSubmit, saving }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const isEdit = Boolean(editData);

  const [prevOpen, setPrevOpen] = useState(open);
  const [prevEditData, setPrevEditData] = useState(editData);

  if (open !== prevOpen || editData !== prevEditData) {
    setPrevOpen(open);
    setPrevEditData(editData);

    if (open) {
      if (editData) {
        setForm({
          moduleName: editData.moduleName || "",
          parentId: editData.parentId ? String(editData.parentId) : "",
          path: editData.path || "",
          icon: editData.icon || "",
          status: isActiveStatus(editData.status) ? "1" : "0",
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }

  const blockedParentIds = useMemo(() => {
    if (!editData) return new Set();
    return getDescendantIds(modules, editData.id);
  }, [modules, editData]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.moduleName.trim() || saving) return;

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
      subtitle={
        isEdit
          ? "Update configuration for this module"
          : "Register a new feature module"
      }
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          {/* Status */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-text-primary">Status</span>
            <Switch
              checked={form.status === "1"}
              onChange={toggleFormStatus}
              ariaLabel="Toggle module status"
            />
            <span
              className={`text-sm font-medium ${
                form.status === "1" ? "text-success-600" : "text-text-secondary"
              }`}
            >
              {form.status === "1" ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="hr-btn hr-btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="module-form"
              disabled={!canSubmit}
              className="hr-btn hr-btn-primary min-w-[130px]"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? "Saving…" : isEdit ? "Update Module" : "Create Module"}
            </button>
          </div>
        </div>
      }
    >
      <form id="module-form" onSubmit={handleSubmit} className="space-y-5">
        {/* Module Name */}
        <div>
          <label htmlFor="module-name" className="hr-label">
            Module Name <span className="text-danger-500">*</span>
          </label>
          <input
            id="module-name"
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
          <label htmlFor="module-parent" className="hr-label">Parent Module</label>
          <select
            id="module-parent"
            className="hr-select"
            value={form.parentId}
            onChange={(e) => handleChange("parentId", e.target.value)}
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
          <label htmlFor="module-path" className="hr-label">Path</label>
          <input
            id="module-path"
            type="text"
            className="hr-input font-mono"
            placeholder="/module-path"
            value={form.path}
            onChange={(e) => handleChange("path", e.target.value)}
          />
        </div>

        {/* Icon */}
        <div>
          <label htmlFor="module-icon" className="hr-label">Icon</label>

          <div className="relative">
            <select
              id="module-icon"
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
        </div>
      </form>
    </SideDrawer>
  );
};

/* -------------------------------------------------------------------------- */
/* Modules Page                                                               */
/* -------------------------------------------------------------------------- */

const Modules = () => {
  // Permission check happens once here and is passed down to rows.
  const { canAdd, canEdit, canDelete } = usePermission("modules");

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState({ key: null, dir: "asc" });

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);

  // Read-only "View" drawer
  const [viewData, setViewData] = useState(null);

  const [deleteData, setDeleteData] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ============================================================
  // FETCH
  // ============================================================

  const fetchModules = useCallback(() => {
    return getAllModules()
      .then((response) => {
        const data = response?.data?.data || response?.data || response || [];

        setModules(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("Failed to fetch modules:", error);
        toast.error(error?.response?.data?.message || "Unable to load modules.");
        setModules([]);
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  // ============================================================
  // FILTERING + SORTING
  // ============================================================

  const filteredModules = useMemo(() => {
    const query = search.trim().toLowerCase();

    return modules.filter((module) => {
      const matchSearch =
        !query ||
        String(module.moduleName || "").toLowerCase().includes(query) ||
        String(module.path || "").toLowerCase().includes(query);

      const matchStatus =
        !statusFilter ||
        (isActiveStatus(module.status) ? "Active" : "Inactive") === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [modules, search, statusFilter]);

  const rows = useMemo(
    () => flattenTree(sortTree(buildTree(filteredModules), sort)),
    [filteredModules, sort]
  );

  // ============================================================
  // PAGINATION
  // ============================================================

  const totalEntries = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);

  if (currentPage > totalPages) setCurrentPage(totalPages);

  const paginatedRows = useMemo(
    () => rows.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage),
    [rows, safePage, rowsPerPage]
  );

  const hasActiveFilters = Boolean(search) || Boolean(statusFilter);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setCurrentPage(1);
  };

  // ============================================================
  // ACTIONS
  // ============================================================

  const openCreateForm = () => {
    setEditData(null);
    setDrawerOpen(true);
  };

  const openEditForm = (module) => {
    const { ...cleanModule } = module;
    setEditData(cleanModule);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    if (saving) return;
    setDrawerOpen(false);
    setEditData(null);
  };

  const handleSave = async (formData) => {
    if (saving) return;

    try {
      setSaving(true);

      if (editData) {
        await updateModule(editData.id, formData);
        toast.success("Module updated successfully.");
      } else {
        await createModule(formData);
        toast.success("Module created successfully.");
      }

      setDrawerOpen(false);
      setEditData(null);

      setRefreshing(true);
      await fetchModules();
    } catch (error) {
      console.error("Failed to save module:", error);
      toast.error(error?.response?.data?.message || "Failed to save module.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteData?.id || deleting) return;

    try {
      setDeleting(true);

      await deleteModule(deleteData.id);

      toast.success("Module deleted successfully.");
      setDeleteData(null);

      setRefreshing(true);
      await fetchModules();
    } catch (error) {
      console.error("Failed to delete module:", error);
      toast.error(error?.response?.data?.message || "Failed to delete module.");
    } finally {
      setDeleting(false);
    }
  };

  // Closes the daisyUI focus-dropdown after an item is clicked
  const closeDropdown = () => document.activeElement?.blur?.();

  // ============================================================
  // STATS
  // ============================================================

  const totalModules = modules.length;
  const activeModules = modules.filter((m) => isActiveStatus(m.status)).length;
  const inactiveModules = totalModules - activeModules;
  const parentModules = modules.filter((m) => !m.parentId).length;

  // Show "—" until the first load finishes, never a wrong 0.
  const statValue = (value) => (loading && modules.length === 0 ? "—" : value);

  const childCountForDelete = deleteData
    ? countDirectChildren(modules, deleteData.id)
    : 0;

  // ============================================================
  // TABLE
  // ============================================================

  const tableRows = paginatedRows.map(({ node, level }) => ({ ...node, _level: level }));

  const columns = [
    {
      key: "serial",
      header: "Serial No.",
      width: 96,
      align: "center",
      className: "font-medium text-text-secondary tabular-nums",
      render: (_row, _index, serialNo) => serialNo,
    },
    {
      key: "moduleName",
      header: "Module",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3" style={{ paddingLeft: `${row._level * 24}px` }}>
          {row._level > 0 && (
            <ChevronRight size={14} className="shrink-0 text-text-disabled" aria-hidden="true" />
          )}

          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">
            <ModuleIcon iconName={row.icon} size={18} />
          </span>

          <p className="max-w-[220px] truncate font-semibold text-text-primary" title={row.moduleName}>
            {row.moduleName}
          </p>

          {row.children?.length > 0 && (
            <span
              className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary-50 px-1.5 text-xs font-semibold tabular-nums text-primary-700"
              title={`${row.children.length} sub-module${row.children.length !== 1 ? "s" : ""}`}
            >
              {row.children.length}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "parent",
      header: "Parent",
      className: "text-text-secondary",
      render: (row) => findModuleName(modules, row.parentId),
    },
    {
      key: "path",
      header: "Path",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-text-secondary">{row.path || "—"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => {
        const active = isActiveStatus(row.status);
        return (
          <StatusBadge tone={active ? "success" : "danger"}>
            {active ? "Active" : "Inactive"}
          </StatusBadge>
        );
      },
    },
  ];

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Layers}
        title="Modules"
        subtitle="Manage navigation modules, their hierarchy and visibility across the system."
        breadcrumbs={[{ label: "User Management" }, { label: "Modules" }]}
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

            {/* Add Module — RBAC: modules:add */}
            {canAdd && (
              <button
                type="button"
                onClick={openCreateForm}
                className="hr-btn hr-btn-primary"
              >
                <Plus size={16} />
                Add Module
              </button>
            )}
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={FolderOpen}
          tone="primary"
          label="Total Modules"
          value={statValue(totalModules)}
          hint="All registered modules"
        />
        <StatCard
          icon={CheckCircle2}
          tone="success"
          label="Active Modules"
          value={statValue(activeModules)}
          hint="Currently active"
        />
        <StatCard
          icon={XCircle}
          tone="danger"
          label="Inactive Modules"
          value={statValue(inactiveModules)}
          hint="Currently inactive"
        />
        <StatCard
          icon={Layers}
          tone="accent"
          label="Parent Modules"
          value={statValue(parentModules)}
          hint="Top-level modules"
        />
      </div>

      {/* Module table (shared DataTable, same as Employee List) */}
      <DataTable
        title="Module List"
        count={totalEntries}
        noun="modules"
        minWidth={900}
        loading={loading}
        filters={
          <>
            <button
              type="button"
              onClick={() => {
                setRefreshing(true);
                fetchModules();
              }}
              disabled={refreshing}
              className="hr-btn hr-btn-outline !w-10 !px-0"
              title="Refresh modules"
              aria-label="Refresh modules"
            >
              <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
            </button>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by status"
              className="hr-select !h-10 !w-36"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-sm font-medium text-primary-700 hover:underline"
              >
                Clear filters
              </button>
            )}
          </>
        }
        columns={columns}
        rows={tableRows}
        total={totalEntries}
        page={safePage}
        pageSize={rowsPerPage}
        onPageChange={setCurrentPage}
        onPageSizeChange={(n) => {
          setRowsPerPage(n);
          setCurrentPage(1);
        }}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search by name or path..."
        searchLabel="Search modules"
        sort={sort}
        onSortChange={setSort}
        emptyIcon={Layers}
        emptyTitle="No modules found"
        emptyDescription={
          hasActiveFilters
            ? "Nothing matches your current search or filters. Try adjusting them."
            : "Create a module to get started."
        }
        actions={(row) => [
          { label: `View ${row.moduleName}`, icon: Eye, onClick: () => setViewData(row) },
          { label: `Edit ${row.moduleName}`, icon: Pencil, onClick: () => openEditForm(row), hidden: !canEdit },
          {
            label: `Delete ${row.moduleName}`,
            icon: Trash2,
            tone: "danger",
            onClick: () => setDeleteData(row),
            hidden: !canDelete,
          },
        ]}
      />

      {/* View Drawer */}
      <ModuleViewDrawer
        open={Boolean(viewData)}
        module={viewData}
        allModules={modules}
        canEdit={canEdit}
        onClose={() => setViewData(null)}
        onEdit={(module) => {
          setViewData(null);
          openEditForm(module);
        }}
      />

      {/* Add / Edit Drawer */}
      <ModuleFormDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        editData={editData}
        modules={modules}
        onSubmit={handleSave}
        saving={saving}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        open={Boolean(deleteData)}
        title="Delete Module"
        confirmLabel="Delete Module"
        loading={deleting}
        onClose={() => !deleting && setDeleteData(null)}
        onConfirm={handleDelete}
      >
        <p>
          Are you sure you want to delete{" "}
          <span className="font-semibold text-text-primary">
            "{deleteData?.moduleName}"
          </span>
          ? This action cannot be undone.
        </p>

        {childCountForDelete > 0 && (
          <p className="mt-3 rounded-md border border-warning-500/30 bg-warning-50 px-3 py-2 text-left text-xs text-warning-600">
            This module has {childCountForDelete} sub-module
            {childCountForDelete !== 1 ? "s" : ""}. They won't be deleted, but
            will move up to the top level of the menu.
          </p>
        )}
      </ConfirmModal>
    </div>
  );
};

export default Modules;