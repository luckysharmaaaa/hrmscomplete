import usePermission from "../../hooks/usePermission";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Eye,
  Mail,
  Pencil,
  Phone,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "react-toastify";

import EditUserModal from "./EditUserModal";
import DeleteUserModal from "./DeleteUserModal";
import UserViewDrawer from "./UserViewDrawer";
import DateRangePickerButton from "./DateRangePickerButton";
import StatusBadge from "../ui/StatusBadge";
import Avatar from "../ui/Avatar";
import DataTable from "../ui/DataTable";
import { getFileUrl } from "../../services/profileApi";

import {
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
} from "../../services/userApi";

// users.status:
// 0 = Inactive
// 1 = Active
// 2 = Pending approval
const STATUS_LABEL = {
  1: "Active",
  2: "Pending",
};

const STATUS_TONE = {
  Active: "success",
  Pending: "warning",
  Inactive: "danger",
};

// Role pills: known roles keep a fixed colour, new roles get a stable one.
const ROLE_TONES = {
  blue: "bg-[#E6EEFF] text-[#2F5FD0]",
  pink: "bg-[#FCE7F6] text-[#C026A3]",
  purple: "bg-[#F1E6FF] text-[#8B2FE0]",
  teal: "bg-[#DDF5F1] text-[#0F8A7B]",
  amber: "bg-[#FEF0D3] text-[#B7791F]",
};

const ROLE_TONE_BY_NAME = {
  employee: "blue",
  "super admin": "blue",
  hr: "pink",
  admin: "purple",
};

const ROLE_TONE_FALLBACK = ["blue", "pink", "purple", "teal", "amber"];

const roleTone = (name = "") => {
  const key = String(name).trim().toLowerCase();
  const tone =
    ROLE_TONE_BY_NAME[key] ||
    ROLE_TONE_FALLBACK[[...key].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % ROLE_TONE_FALLBACK.length];

  return ROLE_TONES[tone];
};

const UserTable = ({ roles = [], refresh, onUsersLoaded }) => {
  const { canEdit, canDelete } = usePermission("users");

  const [users, setUsers] = useState([]);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Read-only "View" drawer
  const [viewUser, setViewUser] = useState(null);

  // Column sorting
  const [sort, setSort] = useState({ key: null, dir: "asc" });
  const [editingUserId, setEditingUserId] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Prevents stale getUserById responses from reopening
  // or overwriting an already closed edit drawer.
  const editRequestRef = useRef(0);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const today = new Date();

  const [appliedRange, setAppliedRange] = useState([
    {
      startDate: new Date(today.getFullYear(), 0, 1),
      endDate: new Date(today.getFullYear(), 11, 31),
      key: "selection",
    },
  ]);

  // ============================================================
  // FETCH USERS
  // ============================================================

  const fetchUsers = useCallback(() => {
    return getAllUsers()
      .then((response) => {
        const data = response?.data?.data;

        if (!Array.isArray(data)) {
          setUsers([]);
          return;
        }

        const mappedUsers = data.map((item) => ({
          id: item.id,
          firstName: item.firstName,
          lastName: item.lastName,

          name:
            `${item.firstName || ""} ${item.lastName || ""}`.trim() ||
            "Unnamed User",

          email: item.email,
          phone: item.phone || "—",

          status: STATUS_LABEL[Number(item.status)] || "Inactive",
          statusValue: Number(item.status),

          roles: Array.isArray(item.roles) ? item.roles : [],

          createdAt: item.createdAt,

          date: item.createdAt
            ? new Date(item.createdAt * 1000).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "—",

          avatar: getFileUrl(item.profileImage) || null,
        }));

        setUsers(mappedUsers);
      })
      .catch((error) => {
        console.error("Failed to fetch users:", error);

        toast.error(
          error?.response?.data?.message || "Unable to load users."
        );
      })
      .finally(() => {
        setLoading(false);
        setHasLoaded(true);
      });
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, refresh]);

  // Show the loading state again whenever a parent-level refresh is requested.
  const [prevRefresh, setPrevRefresh] = useState(refresh);
  if (refresh !== prevRefresh) {
    setPrevRefresh(refresh);
    setLoading(true);
  }

  // Lets the page build its summary cards from the same list.
  useEffect(() => {
    if (hasLoaded) onUsersLoaded?.(users);
  }, [hasLoaded, users, onUsersLoaded]);

  // ============================================================
  // EDIT USER
  // ============================================================

  const handleEdit = async (user) => {
    if (!user?.id || editingUserId) return;

    const requestId = ++editRequestRef.current;

    setEditingUserId(user.id);
    setEditUser(user);
    setIsEditModalOpen(true);

    try {
      const response = await getUserById(user.id);

      if (requestId !== editRequestRef.current) return;

      if (response?.data?.success && response?.data?.data) {
        setEditUser(response.data.data);
      } else {
        console.warn(
          "getUserById returned an unexpected response:",
          response?.data
        );
      }
    } catch (error) {
      if (requestId !== editRequestRef.current) return;

      console.error("Failed to load user details:", error);

      toast.error(
        error?.response?.data?.message ||
          "Could not load complete user details. Please try again."
      );
    } finally {
      if (requestId === editRequestRef.current) {
        setEditingUserId(null);
      }
    }
  };

  const closeEditModal = () => {
    editRequestRef.current += 1;

    setEditingUserId(null);
    setIsEditModalOpen(false);
    setEditUser(null);
  };

  const handleSaveUser = async () => {
    setLoading(true);
    await fetchUsers();
    closeEditModal();
  };

  // ============================================================
  // APPROVE USER
  // ============================================================

  const handleApprove = async (user) => {
    if (!user?.id || approvingId) return;

    try {
      setApprovingId(user.id);

      const response = await updateUser(user.id, {
        status: true,
      });

      if (response?.data?.success) {
        toast.success(`${user.name} has been approved.`);
        setLoading(true);
        await fetchUsers();
      } else {
        toast.error(
          response?.data?.message || "Failed to approve user."
        );
      }
    } catch (error) {
      console.error("Failed to approve user:", error);

      toast.error(
        error?.response?.data?.message || "Failed to approve user."
      );
    } finally {
      setApprovingId(null);
    }
  };

  // ============================================================
  // DELETE USER
  // ============================================================

  const handleDeleteUser = async () => {
    if (!deleteTarget?.id || isDeleting) return;

    try {
      setIsDeleting(true);

      const response = await deleteUser(deleteTarget.id, {
        trashedBy: 1,
      });

      if (response?.data?.success) {
        setUsers((prev) =>
          prev.filter((user) => user.id !== deleteTarget.id)
        );

        setDeleteTarget(null);
        setIsDeleteModalOpen(false);

        toast.success(
          response?.data?.message || "User deleted successfully."
        );
      } else {
        toast.error(
          response?.data?.message || "Failed to delete user."
        );
      }
    } catch (error) {
      console.error("Failed to delete user:", error);

      toast.error(
        error?.response?.data?.message || "Failed to delete user."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // ============================================================
  // ROLE OPTIONS
  // ============================================================

  const roleOptions = useMemo(
    () =>
      [
        ...new Set(
          users.flatMap((user) =>
            (user.roles || [])
              .map((role) => role?.roleName)
              .filter(Boolean)
          )
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [users]
  );

  // ============================================================
  // PENDING COUNT
  // ============================================================

  const pendingCount = useMemo(
    () => users.filter((user) => user.statusValue === 2).length,
    [users]
  );

  // ============================================================
  // FILTERING
  // ============================================================

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    const rangeStart = new Date(appliedRange[0].startDate);
    const rangeEnd = new Date(appliedRange[0].endDate);

    rangeStart.setHours(0, 0, 0, 0);
    rangeEnd.setHours(23, 59, 59, 999);

    return users.filter((user) => {
      const matchSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        String(user.email || "")
          .toLowerCase()
          .includes(query) ||
        String(user.phone || "")
          .toLowerCase()
          .includes(query);

      const matchRole =
        !roleFilter ||
        (user.roles || []).some(
          (role) => role?.roleName === roleFilter
        );

      const matchStatus =
        !statusFilter || user.status === statusFilter;

      const rowDate = user.createdAt
        ? new Date(user.createdAt * 1000)
        : null;

      const matchDate =
        !rowDate ||
        (rowDate >= rangeStart && rowDate <= rangeEnd);

      return (
        matchSearch &&
        matchRole &&
        matchStatus &&
        matchDate
      );
    });
  }, [
    users,
    search,
    roleFilter,
    statusFilter,
    appliedRange,
  ]);

  // ============================================================
  // PAGINATION
  // ============================================================

  const totalEntries = filteredUsers.length;

  const totalPages = Math.max(
    1,
    Math.ceil(totalEntries / rowsPerPage)
  );

  const safePage = Math.min(currentPage, totalPages);

  if (currentPage > totalPages) {
    setCurrentPage(totalPages);
  }

  const sortedUsers = useMemo(() => {
    if (!sort.key) return filteredUsers;

    const valueOf = (user) => {
      switch (sort.key) {
        case "name":
          return user.name.toLowerCase();
        case "email":
          return String(user.email || "").toLowerCase();
        case "role":
          return String(user.roles?.[0]?.roleName || "").toLowerCase();
        case "createdAt":
          return Number(user.createdAt) || 0;
        default:
          return user.status;
      }
    };

    const direction = sort.dir === "asc" ? 1 : -1;

    return [...filteredUsers].sort((a, b) => {
      const x = valueOf(a);
      const y = valueOf(b);

      if (typeof x === "number") return (x - y) * direction;
      return String(x).localeCompare(String(y)) * direction;
    });
  }, [filteredUsers, sort]);

  const paginatedUsers = useMemo(
    () =>
      sortedUsers.slice(
        (safePage - 1) * rowsPerPage,
        safePage * rowsPerPage
      ),
    [sortedUsers, safePage, rowsPerPage]
  );


  // ============================================================
  // RESET FILTERS
  // ============================================================

  const resetFilters = () => {
    setSearch("");
    setRoleFilter("");
    setStatusFilter("");
    setCurrentPage(1);

    const now = new Date();

    setAppliedRange([
      {
        startDate: new Date(now.getFullYear(), 0, 1),
        endDate: new Date(now.getFullYear(), 11, 31),
        key: "selection",
      },
    ]);
  };

  const hasActiveFilters =
    Boolean(search) ||
    Boolean(roleFilter) ||
    Boolean(statusFilter);

  // ============================================================
  // RENDER
  // ============================================================

  const openDelete = (user) => {
    setDeleteTarget(user);
    setIsDeleteModalOpen(true);
  };

  // ============================================================
  // TABLE COLUMNS (shared DataTable, same as Employee List)
  // ============================================================

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
      key: "name",
      header: "User",
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={user.avatar}
            firstName={user.firstName}
            lastName={user.lastName}
            seed={user.email}
          />
          <p className="max-w-[200px] truncate font-semibold text-text-primary" title={user.name}>
            {user.name}
          </p>
        </div>
      ),
    },
    {
      key: "email",
      header: "Contact",
      sortable: true,
      render: (user) => (
        <div className="space-y-0.5 text-[13.5px] leading-5">
          <p className="flex max-w-[260px] items-center gap-2 text-text-primary" title={user.email || undefined}>
            <Mail size={14} className="shrink-0 text-primary-400" aria-hidden="true" />
            <span className="truncate">{user.email || "-"}</span>
          </p>
          <p className="flex items-center gap-2 text-text-secondary">
            <Phone size={14} className="shrink-0 text-primary-400" aria-hidden="true" />
            {user.phone}
          </p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-1.5">
          {user.roles?.length ? (
            <>
              <span
                className={`inline-flex h-7 max-w-[160px] items-center truncate rounded-full px-3.5 text-[13px] font-semibold ${roleTone(
                  user.roles[0]?.roleName
                )}`}
              >
                {user.roles[0]?.roleName || "—"}
              </span>

              {user.roles.length > 1 && (
                <span
                  className="inline-flex h-7 items-center rounded-full bg-background px-2 text-xs font-semibold text-text-secondary"
                  title={user.roles
                    .slice(1)
                    .map((role) => role?.roleName)
                    .filter(Boolean)
                    .join(", ")}
                >
                  +{user.roles.length - 1}
                </span>
              )}
            </>
          ) : (
            <span className="text-xs text-text-disabled">No role assigned</span>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Joined",
      sortable: true,
      className: "whitespace-nowrap text-text-secondary",
      render: (user) => user.date,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (user) => (
        <StatusBadge tone={STATUS_TONE[user.status] || "danger"}>{user.status}</StatusBadge>
      ),
    },
  ];

  return (
    <>
      <DataTable
        title="User List"
        count={totalEntries}
        noun="users"
        minWidth={1000}
        loading={loading}
        filters={
          <>
            {pendingCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("Pending");
                  setCurrentPage(1);
                }}
                className="inline-flex h-10 items-center rounded-lg border border-warning-200 bg-warning-50 px-3 text-sm font-semibold text-warning-600 transition-colors hover:bg-warning-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-600"
                title="Show users awaiting approval"
              >
                {pendingCount} pending approval
              </button>
            )}

            <DateRangePickerButton
              value={appliedRange}
              onChange={(newRange) => {
                setAppliedRange(newRange);
                setCurrentPage(1);
              }}
              defaultPreset="This Year"
            />

            <select
              className="hr-select !h-10 !w-44"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by role"
            >
              <option value="">All Roles</option>
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>

            <select
              className="hr-select !h-10 !w-36"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by status"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
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
        rows={paginatedUsers}
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
        searchPlaceholder="Search by name, email or phone..."
        searchLabel="Search users"
        sort={sort}
        onSortChange={setSort}
        emptyIcon={Users}
        emptyTitle="No users found"
        emptyDescription="Nothing matches your current search or filters. Try adjusting them."
        actions={(user) => [
          {
            label: `Approve ${user.name}`,
            icon: CheckCircle2,
            tone: "success",
            hidden: !(canEdit && user.statusValue === 2),
            loading: approvingId === user.id,
            disabled: Boolean(approvingId),
            onClick: () => handleApprove(user),
          },
          { label: `View ${user.name}`, icon: Eye, onClick: () => setViewUser(user) },
          {
            label: `Edit ${user.name}`,
            icon: Pencil,
            hidden: !canEdit,
            loading: editingUserId === user.id,
            disabled: Boolean(editingUserId),
            onClick: () => handleEdit(user),
          },
          {
            label: `Delete ${user.name}`,
            icon: Trash2,
            tone: "danger",
            hidden: !canDelete,
            disabled: isDeleting,
            onClick: () => openDelete(user),
          },
        ]}
      />

      <UserViewDrawer
        open={Boolean(viewUser)}
        user={viewUser}
        statusTone={STATUS_TONE[viewUser?.status] || "danger"}
        canEdit={canEdit}
        onClose={() => setViewUser(null)}
        onEdit={(user) => {
          setViewUser(null);
          handleEdit(user);
        }}
      />

      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        deleteTarget={deleteTarget}
        isDeleting={isDeleting}
        onClose={() => {
          if (isDeleting) return;

          setDeleteTarget(null);
          setIsDeleteModalOpen(false);
        }}
        onConfirm={handleDeleteUser}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        editUser={editUser}
        roles={roles}
        onClose={closeEditModal}
        onSave={handleSaveUser}
      />
    </>
  );
};

export default UserTable;