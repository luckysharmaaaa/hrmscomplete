import React, { useState, useEffect } from "react";
import {
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiChevronUp,
  FiChevronDown,
} from "react-icons/fi";
import defaultUser from "../../assets/images/logoo.jpg";

import EditUserModal from "./EditUserModal";
import DeleteUserModal from "./DeleteUserModal";
import DateRangePickerButton from "./DateRangePickerButton";

import { getAllUsers, getUserById, deleteUser } from "../../services/userApi";

const SortIcon = () => (
  <span className="inline-flex flex-col ml-1 opacity-40 leading-none">
    <FiChevronUp size={10} />
    <FiChevronDown size={10} />
  </span>
);

// Prepend the backend's static file base URL if the API only returns a
// relative path (e.g. "uploads/abc.jpg") instead of a full URL.
// Your axios baseURL is "http://localhost:5000/api/v1" (services/api.js),
// so the static file root is that same host minus the "/api/v1" suffix.
const FILE_BASE_URL = "http://localhost:5000";

const resolveImageUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path; // already a full URL
  return `${FILE_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

// Shows whether this user still needs their official company email
// assigned (created with only a personal alternateEmail so far), or
// already has one — mirrors the backend's `pendingCompanyEmail` flag.
const EmailStatusCell = ({ user }) =>
  user.pendingCompanyEmail ? (
    <span
      className="badge badge-warning badge-outline gap-1 whitespace-nowrap"
      title={
        user.alternateEmail
          ? `Signs in with personal email: ${user.alternateEmail}`
          : undefined
      }
    >
      New — No Official Email
    </span>
  ) : (
    <span className="badge badge-success badge-outline gap-1 whitespace-nowrap">
      Official Email
    </span>
  );

const UserTable = ({ roles = [] }) => {
  const [users, setUsers] = useState([]);

  const [selected, setSelected] = useState([]);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [search, setSearch] = useState("");

  const today = new Date();

  // Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [sortBy, setSortBy] = useState("This Year");
  const [appliedRange, setAppliedRange] = useState([
    {
      startDate: new Date(today.getFullYear(), 0, 1),
      endDate: new Date(today.getFullYear(), 11, 31),
      key: "selection",
    },
  ]);

  // ==========================================
  // Fetch Users
  // ==========================================

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();

      if (response.data.success) {
        const baseUsers = response.data.data.map((item) => ({
          id: item.id,

          firstName: item.firstName,
          lastName: item.lastName,

          name: `${item.firstName} ${item.lastName}`,

          email: item.email,
          alternateEmail: item.alternateEmail,
          pendingCompanyEmail: !!item.pendingCompanyEmail,
          phone: item.phone,

          // status: Number(item.status) === 1 ? "Active" : "Inactive",
          status: Number(item.status) === 1 ? "Active" : "Inactive",



          statusValue: Number(item.status),

          roles: item.roles || [],

          createdAt: item.createdAt,

          date: new Date(item.createdAt * 1000).toLocaleDateString(),

          // Backend now joins media_uses + media directly into the user
          // list response — no extra per-row lookup needed.
          avatar: resolveImageUrl(item.profileImage) || defaultUser,
        }));

        setUsers(baseUsers);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  // ==========================================
  // Edit User
  // ==========================================

  const handleEdit = async (id) => {
    try {
      const response = await getUserById(id);

      if (response.data.success) {
        setEditUser(response.data.data);

        setIsEditModalOpen(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ==========================================
  // Refresh after Edit
  // ==========================================

  const handleSaveUser = async () => {
    await fetchUsers();

    setEditUser(null);

    setIsEditModalOpen(false);
  };
  // ==========================================
  // Sort By
  // ==========================================

  const handleSortByChange = (option) => {
    setSortBy(option);

    if (option === "Custom Range") return;

    const baseToday = new Date();

    let start = new Date(baseToday);
    let end = new Date(baseToday);

    if (option === "Last 7 Days") {
      start.setDate(baseToday.getDate() - 7);
    } else if (option === "Last 30 Days") {
      start.setDate(baseToday.getDate() - 30);
    } else if (option === "Last 90 Days") {
      start.setDate(baseToday.getDate() - 90);
    } else if (option === "This Year") {
      start = new Date(baseToday.getFullYear(), 0, 1);
      end = new Date(baseToday.getFullYear(), 11, 31);
    }

    setAppliedRange([
      {
        startDate: start,
        endDate: end,
        key: "selection",
      },
    ]);

    setCurrentPage(1);
  };

  // ==========================================
  // Delete User
  // ==========================================
  const handleDeleteUser = async () => {
    if (!deleteTarget) return;

    try {
      const response = await deleteUser(deleteTarget.id, { trashedBy: 1 });

      if (response.data.success) {
        await fetchUsers();

        setDeleteTarget(null);
        setIsDeleteModalOpen(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ==========================================
  // Filter Users
  // ==========================================

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.alternateEmail || "").toLowerCase().includes(search.toLowerCase());

    const matchRole = roleFilter
      ? u.roles.some((role) => role.roleName === roleFilter)
      : true;
    const matchStatus = statusFilter ? u.status === statusFilter : true;

    const rowDate = new Date(u.createdAt * 1000);

    const rangeStart = new Date(appliedRange[0].startDate);
    const rangeEnd = new Date(appliedRange[0].endDate);

    rangeStart.setHours(0, 0, 0, 0);
    rangeEnd.setHours(23, 59, 59, 999);

    const matchDate = rowDate >= rangeStart && rowDate <= rangeEnd;

    return matchSearch && matchRole && matchStatus && matchDate;
  });

  // ==========================================
  // Pagination
  // ==========================================

  const totalEntries = filtered.length;

  const totalPages = Math.max(1, Math.ceil(totalEntries / rowsPerPage));

  const safePage = Math.min(currentPage, totalPages);

  const paginated = filtered.slice(
    (safePage - 1) * rowsPerPage,
    safePage * rowsPerPage,
  );

  const startEntry = totalEntries === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;

  const endEntry = Math.min(safePage * rowsPerPage, totalEntries);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-[#0F265C]">Users List</h2>

        <div className="flex items-center gap-2">
          <DateRangePickerButton
            value={appliedRange}
            onChange={(newRange) => {
              setAppliedRange(newRange);
              setSortBy("");
              setCurrentPage(1);
            }}
            defaultPreset="This Year"
          />

          {/* Role Filter */}
          <select
            className="select select-bordered select-sm w-40 bg-white text-black"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Roles</option>

            {[
              ...new Set(
                users.flatMap((u) => u.roles.map((role) => role.roleName)),
              ),
            ].map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            className="select select-bordered select-sm w-36 bg-white text-black"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => handleSortByChange(e.target.value)}
            className="select select-bordered select-sm text-sm h-10 min-h-0 rounded-lg min-w-40 bg-white text-black"
          >
            <option value="" disabled hidden>
              Sort By
            </option>

            {["Last 7 Days", "Last 30 Days", "Last 90 Days", "This Year"].map(
              (item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ),
            )}
          </select>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between px-5 py-3 border-b">
        <div className="flex items-center gap-2">
          <span>Rows Per Page</span>

          <select
            className="select select-bordered select-sm bg-white text-black"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>

        <label className="input input-bordered flex items-center gap-2 bg-white">
          <FiSearch />

          <input
            type="text"
            className="grow"
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </label>
      </div>

      {/* Table */}

      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead className="bg-gray-100">
            <tr>
              <th></th>

              <th>
                <span className="inline-flex items-center">
                  Name
                  <SortIcon />
                </span>
              </th>

              <th>
                <span className="inline-flex items-center">
                  Email
                  <SortIcon />
                </span>
              </th>

              <th>
                <span className="inline-flex items-center">
                  Email Status
                </span>
              </th>

              <th>
                <span className="inline-flex items-center">
                  Created Date
                  <SortIcon />
                </span>
              </th>

              <th>
                <span className="inline-flex items-center">
                  Role
                  <SortIcon />
                </span>
              </th>

              <th>
                <span className="inline-flex items-center">
                  Status
                  <SortIcon />
                </span>
              </th>

              <th className="text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-gray-500">
                  No users found.
                </td>
              </tr>
            ) : (
              paginated.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  {/* Checkbox */}
                  <td></td>

                  {/* Name */}
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="w-10 h-10 rounded-full shrink-0 overflow-hidden">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-full h-full object-cover rounded-full"
                            onError={(e) => {
                              // Broken/expired image URL -> fall back to default.
                              if (e.currentTarget.src !== defaultUser) {
                                e.currentTarget.src = defaultUser;
                              }
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="font-semibold">{user.name}</div>

                        <div className="text-xs text-gray-400">
                          {user.phone}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td>
                    {user.email || (
                      <span className="text-gray-400 italic">
                        {user.alternateEmail || "—"}
                      </span>
                    )}
                  </td>

                  {/* Email Status */}
                  <td>
                    <EmailStatusCell user={user} />
                  </td>

                  {/* Created Date */}
                  <td>{user.date}</td>

                  {/* Role */}
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="badge badge-info badge-outline">
                        {user.roles?.[0]?.roleName || "-"}
                      </span>

                      {user.roles?.length > 1 && (
                        <span
                          className="text-xs text-blue-600 font-medium cursor-pointer"
                          title={user.roles
                            .slice(1)
                            .map((r) => r.roleName)
                            .join(", ")}
                        >
                          +{user.roles.length - 1} more
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td>
                    <span
                      className={`badge text-white ${user.status === "Active"
                          ? "badge-success"
                          : "badge-error"
                        }`}
                    >
                      {user.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="flex justify-center gap-2">
                      <button
                        className="btn btn-ghost btn-sm text-orange-500"
                        onClick={() => handleEdit(user.id)}
                      >
                        <FiEdit2 />
                      </button>

                      <button
                        className="btn btn-ghost btn-sm text-red-500"
                        onClick={() => {
                          setDeleteTarget(user);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* ================= Pagination ================= */}

      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Showing {startEntry} - {endEntry} of {totalEntries} entries
        </p>

        <div className="join">
          <button
            className="join-item btn btn-sm"
            disabled={safePage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            ❮
          </button>

          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`join-item btn btn-sm ${safePage === page ? "btn-warning text-white" : ""
                  }`}
              >
                {page}
              </button>
            ),
          )}

          <button
            className="join-item btn btn-sm"
            disabled={safePage === totalPages}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
          >
            ❯
          </button>
        </div>
      </div>

      {/* ================= Delete Modal ================= */}

      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        deleteTarget={deleteTarget}
        onClose={() => {
          setDeleteTarget(null);
          setIsDeleteModalOpen(false);
        }}
        onConfirm={handleDeleteUser}
      />

      {/* ================= Edit Modal ================= */}

      <EditUserModal
        isOpen={isEditModalOpen}
        editUser={editUser}
        roles={roles}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditUser(null);
        }}
        onSave={handleSaveUser}
      />
    </div>
  );
};

export default UserTable;