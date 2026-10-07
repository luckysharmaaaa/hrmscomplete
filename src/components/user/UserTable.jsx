// ```jsx
import usePermission from "../../hooks/usePermission";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "react-toastify";

import defaultUser from "../../assets/images/logoo.jpg";
import EditUserModal from "./EditUserModal";
import DeleteUserModal from "./DeleteUserModal";
import DateRangePickerButton from "./DateRangePickerButton";
import StatusBadge from "../ui/StatusBadge";
import IconButton from "../ui/IconButton";
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

// Keeps pagination compact:
// 1 … 4 5 6 … 20
const getPageItems = (total, current) => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const items = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) {
    items.push("start-ellipsis");
  }

  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }

  if (end < total - 1) {
    items.push("end-ellipsis");
  }

  items.push(total);

  return items;
};

const UserTable = ({ roles = [], refresh }) => {
  const { canEdit, canDelete } = usePermission("users");

  const [users, setUsers] = useState([]);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const [loading, setLoading] = useState(false);
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

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getAllUsers();
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

        avatar: getFileUrl(item.profileImage) || defaultUser,
      }));

      setUsers(mappedUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);

      toast.error(
        error?.response?.data?.message || "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, refresh]);

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

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedUsers = useMemo(
    () =>
      filteredUsers.slice(
        (safePage - 1) * rowsPerPage,
        safePage * rowsPerPage
      ),
    [filteredUsers, safePage, rowsPerPage]
  );

  const startEntry =
    totalEntries === 0
      ? 0
      : (safePage - 1) * rowsPerPage + 1;

  const endEntry = Math.min(
    safePage * rowsPerPage,
    totalEntries
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

  return (
    <div className="hr-card overflow-hidden">
      {/* ========================================================
          TABLE HEADER
      ======================================================== */}

      <div className="border-b border-border-subtle bg-background px-5 py-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          {/* Title */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold tracking-tight text-primary-700">
                  Users List
                </h2>

                <span
                  className="
                    inline-flex
                    min-w-7
                    items-center
                    justify-center
                    rounded-full
                    bg-primary-50
                    px-2
                    py-0.5
                    text-xs
                    font-semibold
                    text-primary-700
                  "
                >
                  {totalEntries}
                </span>
              </div>

              {pendingCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("Pending");
                    setCurrentPage(1);
                  }}
                  className="
                    inline-flex
                    items-center
                    rounded-full
                    border
                    border-warning-100
                    bg-warning-50
                    px-2.5
                    py-1
                    text-xs
                    font-semibold
                    text-warning-600
                    transition
                    hover:border-warning-200
                    hover:bg-warning-100
                  "
                  title="Show users awaiting approval"
                >
                  {pendingCount} pending approval
                </button>
              )}
            </div>

            <p className="mt-1 text-xs leading-5 text-text-secondary">
              Manage user profiles, roles, access status and
              account details.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <DateRangePickerButton
              value={appliedRange}
              onChange={(newRange) => {
                setAppliedRange(newRange);
                setCurrentPage(1);
              }}
              defaultPreset="This Year"
            />

            <select
              className="hr-select !w-36"
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
              className="hr-select !w-32"
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

            <button
              type="button"
              onClick={fetchUsers}
              disabled={loading}
              className="
                hr-btn
                hr-btn-outline
                !h-10
                !w-10
                !px-0
              "
              title="Refresh users"
              aria-label="Refresh users"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          SEARCH / PAGINATION CONTROLS
      ======================================================== */}

      <div
        className="
          flex
          flex-col
          gap-3
          border-b
          border-border-subtle
          bg-white
          px-5
          py-3
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
          <span>Rows per page</span>

          <select
            className="hr-select !h-9 !w-20"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            aria-label="Rows per page"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="
                ml-1
                text-sm
                font-medium
                text-primary-700
                transition
                hover:text-primary-800
                hover:underline
              "
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative w-full sm:max-w-sm">
          <Search
            size={16}
            strokeWidth={1.8}
            className="
              pointer-events-none
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-text-disabled
            "
          />

          <input
            type="text"
            className="hr-input pl-9"
            placeholder="Search name, email or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Search users"
          />
        </div>
      </div>

      {/* ========================================================
          TABLE
      ======================================================== */}

      <div className="overflow-x-auto">
        <table className="hr-table min-w-[900px]">
          <thead>
            <tr>
              <th className="hr-th">User</th>
              <th className="hr-th">Email</th>
              <th className="hr-th">Created Date</th>
              <th className="hr-th">Role</th>
              <th className="hr-th">Status</th>
              <th className="hr-th text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {/* ==================================================
                LOADING
            ================================================== */}

            {loading && users.length === 0 ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={`skeleton-${index}`}>
                  <td colSpan={6} className="hr-td">
                    <div className="flex animate-pulse items-center gap-4">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-primary-50" />

                      <div className="space-y-2">
                        <div className="h-3 w-36 rounded bg-primary-50" />
                        <div className="h-2.5 w-24 rounded bg-primary-50" />
                      </div>

                      <div className="hidden h-3 w-52 rounded bg-primary-50 sm:block" />
                    </div>
                  </td>
                </tr>
              ))
            ) : paginatedUsers.length === 0 ? (
              /* ==================================================
                  EMPTY STATE
              ================================================== */

              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <div className="mx-auto max-w-sm">
                    <div
                      className="
                        mx-auto
                        mb-4
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-primary-100
                        bg-primary-50
                        text-primary-700
                      "
                    >
                      <Users size={21} strokeWidth={1.8} />
                    </div>

                    <p className="text-sm font-semibold text-text-primary">
                      No users found
                    </p>

                    <p className="mt-1 text-xs leading-5 text-text-secondary">
                      No records match your current search or
                      filter criteria.
                    </p>

                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="
                          mt-3
                          text-xs
                          font-semibold
                          text-primary-700
                          hover:underline
                        "
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              /* ==================================================
                  USER ROWS
              ================================================== */

              paginatedUsers.map((user) => (
                <tr
                  key={user.id}
                  className="
                    transition-colors
                    duration-150
                    hover:bg-primary-50/40
                  "
                >
                  {/* ==================================================
                      USER
                  ================================================== */}

                  <td className="hr-td">
                    <div className="flex items-center gap-3">
                      <div
                        className="
                          h-10
                          w-10
                          shrink-0
                          overflow-hidden
                          rounded-full
                          border
                          border-border-subtle
                          bg-background
                        "
                      >
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            if (
                              e.currentTarget.src !==
                              defaultUser
                            ) {
                              e.currentTarget.src = defaultUser;
                            }
                          }}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="max-w-[190px] truncate text-sm font-semibold text-text-primary">
                          {user.name}
                        </div>

                        <div className="mt-0.5 text-xs text-text-secondary">
                          {user.phone}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* ==================================================
                      EMAIL
                  ================================================== */}

                  <td className="hr-td">
                    <div className="max-w-[280px] truncate text-sm text-text-primary">
                      {user.email || "—"}
                    </div>
                  </td>

                  {/* ==================================================
                      CREATED DATE
                  ================================================== */}

                  <td className="hr-td whitespace-nowrap text-sm text-text-secondary">
                    {user.date}
                  </td>

                  {/* ==================================================
                      ROLE
                  ================================================== */}

                  <td className="hr-td">
                    <div className="flex items-center gap-1.5">
                      {user.roles?.length ? (
                        <>
                          <span
                            className="
                              inline-flex
                              h-7
                              max-w-[150px]
                              items-center
                              truncate
                              rounded-md
                              border
                              border-primary-100
                              bg-primary-50
                              px-2.5
                              text-xs
                              font-semibold
                              text-primary-700
                            "
                          >
                            {user.roles[0]?.roleName || "—"}
                          </span>

                          {user.roles.length > 1 && (
                            <span
                              className="
                                text-xs
                                font-semibold
                                text-text-secondary
                              "
                              title={user.roles
                                .slice(1)
                                .map(
                                  (role) => role?.roleName
                                )
                                .filter(Boolean)
                                .join(", ")}
                            >
                              +{user.roles.length - 1}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-text-disabled">
                          No role assigned
                        </span>
                      )}
                    </div>
                  </td>

                  {/* ==================================================
                      STATUS
                  ================================================== */}

                  <td className="hr-td">
                    <StatusBadge
                      tone={
                        STATUS_TONE[user.status] || "danger"
                      }
                    >
                      {user.status}
                    </StatusBadge>
                  </td>

                  {/* ==================================================
                      ACTIONS
                  ================================================== */}

                  <td className="hr-td">
                    <div className="flex items-center justify-center gap-1">
                      {/* Approve */}
                      {canEdit && user.statusValue === 2 && (
                        <IconButton
                          icon={CheckCircle2}
                          label={`Approve ${user.name}`}
                          tone="success"
                          loading={
                            approvingId === user.id
                          }
                          disabled={Boolean(approvingId)}
                          onClick={() =>
                            handleApprove(user)
                          }
                        />
                      )}

                      {/* Edit */}
                      {canEdit && (
                        <IconButton
                          icon={Pencil}
                          label={`Edit ${user.name}`}
                          loading={
                            editingUserId === user.id
                          }
                          disabled={Boolean(editingUserId)}
                          onClick={() =>
                            handleEdit(user)
                          }
                        />
                      )}

                      {/* Delete */}
                      {canDelete && (
                        <IconButton
                          icon={Trash2}
                          label={`Delete ${user.name}`}
                          tone="danger"
                          disabled={isDeleting}
                          onClick={() => {
                            setDeleteTarget(user);
                            setIsDeleteModalOpen(true);
                          }}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ========================================================
          PAGINATION
      ======================================================== */}

      <div
        className="
          flex
          flex-col
          gap-3
          border-t
          border-border-subtle
          bg-white
          px-5
          py-3
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <p className="text-sm text-text-secondary">
          Showing{" "}
          <span className="font-semibold text-text-primary">
            {startEntry}
          </span>
          {"–"}
          <span className="font-semibold text-text-primary">
            {endEntry}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-text-primary">
            {totalEntries}
          </span>{" "}
          entries
        </p>

        <div className="flex items-center gap-1">
          {/* Previous */}
          <IconButton
            icon={ChevronLeft}
            label="Previous page"
            className="border border-border-subtle"
            disabled={safePage === 1}
            onClick={() =>
              setCurrentPage((prev) =>
                Math.max(prev - 1, 1)
              )
            }
          />

          {/* Pages */}
          {getPageItems(totalPages, safePage).map((item) =>
            typeof item === "string" ? (
              <span
                key={item}
                className="px-1 text-sm text-text-disabled"
              >
                …
              </span>
            ) : (
              <button
                type="button"
                key={item}
                onClick={() => setCurrentPage(item)}
                aria-current={
                  safePage === item ? "page" : undefined
                }
                aria-label={`Page ${item}`}
                className={`
                  flex
                  h-8
                  min-w-8
                  items-center
                  justify-center
                  rounded-md
                  px-2
                  text-sm
                  font-medium
                  transition-colors
                  focus-visible:outline
                  focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-primary-600
                  ${
                    safePage === item
                      ? "bg-primary-700 text-white shadow-sm"
                      : "text-text-secondary hover:bg-primary-50 hover:text-primary-700"
                  }
                `}
              >
                {item}
              </button>
            )
          )}

          {/* Next */}
          <IconButton
            icon={ChevronRight}
            label="Next page"
            className="border border-border-subtle"
            disabled={safePage === totalPages}
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(prev + 1, totalPages)
              )
            }
          />
        </div>
      </div>

      {/* ========================================================
          DELETE MODAL
      ======================================================== */}

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

      {/* ========================================================
          EDIT DRAWER
      ======================================================== */}

      <EditUserModal
        isOpen={isEditModalOpen}
        editUser={editUser}
        roles={roles}
        onClose={closeEditModal}
        onSave={handleSaveUser}
      />
    </div>
  );
};

export default UserTable;

