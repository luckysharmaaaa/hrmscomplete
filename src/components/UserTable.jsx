import React, { useState, useRef, useEffect } from "react";
import {
  FiSearch,
  FiCalendar,
  FiEdit2,
  FiTrash2,
  FiHeart,
  FiChevronUp,
  FiChevronDown,
} from "react-icons/fi";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import EditUserModal from "./EditUserModal";
import DeleteUserModal from "./DeleteUserModal";

const allUsers = [
  {
    id: 1,
    name: "Anthony Lewis",
    email: "anthony@example.com",
    date: "05 Jan 2026",
    role: "Employee",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=1",
  },
  {
    id: 2,
    name: "Brian Villalobos",
    email: "brian@example.com",
    date: "12 Jan 2026",
    role: "Employee",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=2",
  },
  {
    id: 3,
    name: "Sophie Headrick",
    email: "sophie@example.com",
    date: "20 Jan 2026",
    role: "Client",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=3",
  },
  {
    id: 4,
    name: "Stephan Peralt",
    email: "peral@example.com",
    date: "02 Feb 2026",
    role: "Employee",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=4",
  },
  {
    id: 5,
    name: "Thomas Bordelon",
    email: "thomas@example.com",
    date: "10 Feb 2026",
    role: "Client",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=5",
  },
  {
    id: 6,
    name: "Doglas Martini",
    email: "martinwr@example.com",
    date: "18 Feb 2026",
    role: "Employee",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=6",
  },
  {
    id: 7,
    name: "Cameron Drake",
    email: "cameron@example.com",
    date: "25 Feb 2026",
    role: "Client",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=7",
  },
  {
    id: 8,
    name: "Harvey Smith",
    email: "harvey@example.com",
    date: "05 Mar 2026",
    role: "Employee",
    status: "Inactive",
    avatar: "https://i.pravatar.cc/40?img=8",
  },
  {
    id: 9,
    name: "Michael Walker",
    email: "michael@example.com",
    date: "12 Mar 2026",
    role: "Client",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=9",
  },
  {
    id: 10,
    name: "Doris Crowley",
    email: "doris@example.com",
    date: "20 Mar 2026",
    role: "Client",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=10",
  },
  {
    id: 11,
    name: "Emma Johnson",
    email: "emma@example.com",
    date: "01 Apr 2026",
    role: "Employee",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=11",
  },
  {
    id: 12,
    name: "Daniel Parker",
    email: "daniel@example.com",
    date: "08 Apr 2026",
    role: "Client",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=12",
  },
  {
    id: 13,
    name: "Olivia Brown",
    email: "olivia@example.com",
    date: "15 Apr 2026",
    role: "Employee",
    status: "Inactive",
    avatar: "https://i.pravatar.cc/40?img=13",
  },
  {
    id: 14,
    name: "James Wilson",
    email: "james@example.com",
    date: "22 Apr 2026",
    role: "Employee",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=14",
  },
  {
    id: 15,
    name: "Charlotte Davis",
    email: "charlotte@example.com",
    date: "30 Apr 2026",
    role: "Client",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=15",
  },
  {
    id: 16,
    name: "William Moore",
    email: "william@example.com",
    date: "05 May 2026",
    role: "Employee",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=16",
  },
  {
    id: 17,
    name: "Sophia Taylor",
    email: "sophia@example.com",
    date: "12 May 2026",
    role: "Client",
    status: "Inactive",
    avatar: "https://i.pravatar.cc/40?img=17",
  },
  {
    id: 18,
    name: "Benjamin Anderson",
    email: "benjamin@example.com",
    date: "18 May 2026",
    role: "Employee",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=18",
  },
  {
    id: 19,
    name: "Amelia Thomas",
    email: "amelia@example.com",
    date: "25 May 2026",
    role: "Client",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=19",
  },
  {
    id: 20,
    name: "Henry Jackson",
    email: "henry@example.com",
    date: "30 May 2026",
    role: "Employee",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=20",
  },
  {
    id: 21,
    name: "Mia White",
    email: "mia@example.com",
    date: "03 Jun 2026",
    role: "Client",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=21",
  },
  {
    id: 22,
    name: "Lucas Harris",
    email: "lucas@example.com",
    date: "08 Jun 2026",
    role: "Employee",
    status: "Inactive",
    avatar: "https://i.pravatar.cc/40?img=22",
  },
  {
    id: 23,
    name: "Evelyn Martin",
    email: "evelyn@example.com",
    date: "14 Jun 2026",
    role: "Client",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=23",
  },
  {
    id: 24,
    name: "Alexander Lee",
    email: "alexander@example.com",
    date: "20 Jun 2026",
    role: "Employee",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=24",
  },
  {
    id: 25,
    name: "Harper Walker",
    email: "harper@example.com",
    date: "28 Jun 2026",
    role: "Client",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=25",
  },
  {
    id: 26,
    name: "Elijah Hall",
    email: "elijah@example.com",
    date: "04 Jul 2026",
    role: "Employee",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=26",
  },
  {
    id: 27,
    name: "Abigail Allen",
    email: "abigail@example.com",
    date: "10 Jul 2026",
    role: "Client",
    status: "Inactive",
    avatar: "https://i.pravatar.cc/40?img=27",
  },
  {
    id: 28,
    name: "Matthew Young",
    email: "matthew@example.com",
    date: "18 Jul 2026",
    role: "Employee",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=28",
  },
  {
    id: 29,
    name: "Ella King",
    email: "ella@example.com",
    date: "25 Jul 2026",
    role: "Client",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=29",
  },
  {
    id: 30,
    name: "David Wright",
    email: "david@example.com",
    date: "31 Jul 2026",
    role: "Employee",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=30",
  },
  {
    id: 31,
    name: "Scarlett Scott",
    email: "scarlett@example.com",
    date: "05 Aug 2026",
    role: "Client",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=31",
  },
  {
    id: 32,
    name: "Joseph Green",
    email: "joseph@example.com",
    date: "12 Aug 2026",
    role: "Employee",
    status: "Inactive",
    avatar: "https://i.pravatar.cc/40?img=32",
  },
  {
    id: 33,
    name: "Grace Baker",
    email: "grace@example.com",
    date: "18 Aug 2026",
    role: "Client",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=33",
  },
  {
    id: 34,
    name: "Samuel Adams",
    email: "samuel@example.com",
    date: "25 Aug 2026",
    role: "Employee",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=34",
  },
  {
    id: 35,
    name: "Chloe Nelson",
    email: "chloe@example.com",
    date: "02 Sep 2026",
    role: "Client",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=35",
  },
  {
    id: 36,
    name: "Andrew Carter",
    email: "andrew@example.com",
    date: "10 Sep 2026",
    role: "Employee",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=36",
  },
  {
    id: 37,
    name: "Lily Mitchell",
    email: "lily@example.com",
    date: "18 Sep 2026",
    role: "Client",
    status: "Inactive",
    avatar: "https://i.pravatar.cc/40?img=37",
  },
  {
    id: 38,
    name: "Christopher Perez",
    email: "christopher@example.com",
    date: "24 Sep 2026",
    role: "Employee",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=38",
  },
  {
    id: 39,
    name: "Aria Roberts",
    email: "aria@example.com",
    date: "05 Oct 2026",
    role: "Client",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=39",
  },
  {
    id: 40,
    name: "Jack Turner",
    email: "jack@example.com",
    date: "15 Oct 2026",
    role: "Employee",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=40",
  },
];

const SortIcon = () => (
  <span className="inline-flex flex-col ml-1 opacity-40 leading-none">
    <FiChevronUp size={10} />
    <FiChevronDown size={10} />
  </span>
);

const UserTable = () => {
  const [user, setUser] = useState(allUsers);
  const [selected, setSelected] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null); // for delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);

  // ── Date Range Picker ────────────────────────────────────────────
  const today = new Date();
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [appliedRange, setAppliedRange] = useState([
    {
      startDate: new Date(today.getFullYear(), 0, 1),
      endDate: new Date(today.getFullYear(), 11, 31),
      key: "selection",
    },
  ]);
  const [tempRange, setTempRange] = useState(appliedRange);
  const [activePreset, setActivePreset] = useState("This Year");
  const datePickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
        setDatePickerOpen(false);
        setTempRange(appliedRange);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [appliedRange]);

  const presets = [
    { label: "Today", start: today, end: today },
    {
      label: "Yesterday",
      start: new Date(today - 86400000),
      end: new Date(today - 86400000),
    },
    { label: "Last 7 Days", start: new Date(today - 6 * 86400000), end: today },
    {
      label: "Last 30 Days",
      start: new Date(today - 29 * 86400000),
      end: today,
    },
    {
      label: "This Year",
      start: new Date(today.getFullYear(), 0, 1),
      end: new Date(today.getFullYear(), 11, 31),
    },
    {
      label: "Next Year",
      start: new Date(today.getFullYear() + 1, 0, 1),
      end: new Date(today.getFullYear() + 1, 11, 31),
    },
    { label: "Custom Range", start: null, end: null },
  ];

  const applyPreset = (preset) => {
    setActivePreset(preset.label);
    if (preset.start) {
      setTempRange([
        { startDate: preset.start, endDate: preset.end, key: "selection" },
      ]);
    }
  };

  const formatDate = (d) =>
    d
      ? d.toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        })
      : "";

  const displayLabel = `${formatDate(appliedRange[0].startDate)} - ${formatDate(appliedRange[0].endDate)}`;

  const handleDeleteUser = () => {
    if (!deleteTarget) return;

    setUser((prev) => prev.filter((user) => user.id !== deleteTarget.id));

    setSelected((prev) => prev.filter((id) => id !== deleteTarget.id));

    setDeleteTarget(null);
    setIsDeleteModalOpen(false);
  };

  const toggleAll = () =>
    setSelected(selected.length === user.length ? [] : user.map((u) => u.id));

  const toggleOne = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const filtered = user.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter ? u.role === roleFilter : true;
    const matchStatus = statusFilter ? u.status === statusFilter : true;

    // Date filter — parse "DD Mon YYYY" and compare against the applied range
    const rowDate = new Date(u.date);
    const rangeStart = new Date(appliedRange[0].startDate);
    const rangeEnd = new Date(appliedRange[0].endDate);
    // Normalize to midnight so partial-day boundaries don't exclude valid rows
    rangeStart.setHours(0, 0, 0, 0);
    rangeEnd.setHours(23, 59, 59, 999);
    const matchDate = rowDate >= rangeStart && rowDate <= rangeEnd;

    return matchSearch && matchRole && matchStatus && matchDate;
  });

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
      {/* ── Top Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-[#0F265C]">Users List</h2>

        <div className="flex items-center gap-2">
          {/* Date Range */}
          <div className="relative" ref={datePickerRef}>
            {/* Trigger Button */}
            <button
              onClick={() => {
                setTempRange(appliedRange);
                setDatePickerOpen((o) => !o);
              }}
              className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 h-10 bg-white cursor-pointer hover:border-gray-300 transition-colors whitespace-nowrap"
            >
              <FiCalendar size={13} className="text-gray-400" />
              <span>{displayLabel}</span>
            </button>

            {/* Dropdown Panel */}
            {datePickerOpen && (
              <div className="absolute top-12 left-0 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden w-fit">
                <div className="flex">
                  {/* Presets Sidebar */}
                  <div className="w-36 border-r border-gray-100 py-2 flex flex-col">
                    {presets.map((p) => (
                      <button
                        key={p.label}
                        onClick={() => applyPreset(p)}
                        className={`text-left px-4 py-2 text-sm transition-colors ${
                          activePreset === p.label
                            ? "bg-orange-500 text-white font-medium"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Calendar */}
                  <div className="drp-no-sidebar">
                    <style>{`.drp-no-sidebar .rdrDefinedRangesWrapper { display: none !important; }`}</style>
                    <DateRangePicker
                      ranges={tempRange}
                      onChange={(item) => {
                        setTempRange([item.selection]);
                        setActivePreset("Custom Range");
                      }}
                      months={1}
                      direction="horizontal"
                      showMonthAndYearPickers
                      rangeColors={["#f97316"]}
                      color="#f97316"
                      showDateDisplay={false}
                      staticRanges={[]}
                      inputRanges={[]}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
                  <span className="text-sm text-gray-500 font-medium">
                    {formatDate(tempRange[0].startDate)} -{" "}
                    {formatDate(tempRange[0].endDate)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      className="btn btn-sm btn-ghost border border-gray-200 text-gray-600 hover:bg-gray-100"
                      onClick={() => {
                        setTempRange(appliedRange);
                        setDatePickerOpen(false);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-sm bg-orange-500 hover:bg-orange-600 border-none text-white"
                      onClick={() => {
                        setAppliedRange(tempRange);
                        setDatePickerOpen(false);
                      }}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Role */}
          <select
            className="select select-bordered select-sm w-32 text-sm h-10 min-h-0 rounded-lg bg-white text-black"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Role</option>
            <option value="Employee">Employee</option>
            <option value="Client">Client</option>
          </select>

          {/* Status */}
          <select
            className="select select-bordered select-sm text-sm h-10 min-h-0 rounded-lg w-32 bg-white text-black"
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
          <select className="select select-bordered select-xs text-sm h-10 min-h-0 rounded-lg min-w-40 bg-white text-black">
            <option>Sort By : Last 7 Days</option>
            <option>Sort By : Last 30 Days</option>
            <option>Sort By : Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* ── Sub-header (rows per page + search) ────────────────────── */}
      <div className="flex items-center justify-between gap-2 px-5 py-2.5 border-b border-gray-200 text-sm text-gray-600">
        {/* Left: rows per page */}
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap text-[15px]">Row Per Page</span>

          <select
            className="select select-bordered select-xs h-10 min-h-0 text-xs rounded-md bg-white text-black"
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

          <span>Entries</span>
        </div>

        {/* Right: search */}
        <label className="input input-bordered input-xs flex items-center gap-2 h-10 rounded-lg px-3 text-xs bg-white text-black">
          <FiSearch size={13} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="grow bg-transparent outline-none text-[16px] w-32 "
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </label>
      </div>

      {/* ── Table ───────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="table table-md w-full">
          <thead className="bg-gray-100 text-gray-600 text-xs font-semibold">
            <tr>
              <th className="w-10 bg-gray-100">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm border-gray-400 checked:bg-orange-500 checked:border-orange-500"
                  checked={selected.length === user.length}
                  onChange={toggleAll}
                />
              </th>
              <th className="bg-gray-100">
                <span className="inline-flex items-center gap-0.5 font-bold text-lg">
                  Name <SortIcon />
                </span>
              </th>
              <th className="bg-gray-100">
                <span className="inline-flex items-center gap-0.5 font-bold text-lg">
                  Email <SortIcon />
                </span>
              </th>
              <th className="bg-gray-100">
                <span className="inline-flex items-center gap-0.5 font-bold text-lg">
                  Created Date <SortIcon />
                </span>
              </th>
              <th className="bg-gray-100">
                <span className="inline-flex items-center gap-0.5 font-bold text-lg">
                  Role <SortIcon />
                </span>
              </th>
              <th className="bg-gray-100">
                <span className="inline-flex items-center gap-0.5 font-bold text-lg">
                  Status <SortIcon />
                </span>
              </th>
              <th className="bg-gray-100 text-center">
                <span className="inline-flex items-center gap-0.5 font-bold text-lg">
                  Actions <SortIcon />
                </span>
              </th>
            </tr>
          </thead>

          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-gray-400 py-10">
                  No users found.
                </td>
              </tr>
            ) : (
              paginated.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Checkbox */}
                  <td>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm border-gray-400 checked:bg-orange-500 checked:border-orange-500"
                      checked={selected.includes(user.id)}
                      onChange={() => toggleOne(user.id)}
                    />
                  </td>

                  {/* Name + Avatar */}
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="avatar">
                        <div className="w-10 h-10 rounded-full">
                          <img src={user.avatar} alt={user.name} />
                        </div>
                      </div>
                      <span className="font-medium text-gray-800 text-[15px]">
                        {user.name}
                      </span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="text-gray-500 text-[15px]">{user.email}</td>

                  {/* Date */}
                  <td className="text-gray-500 text-[15px]">{user.date}</td>

                  {/* Role Badge */}
                  <td>
                    <span
                      className={`badge badge-sm border-0 font-medium text-[15px] px-2.5 py-0.5 ${
                        user.role === "Employee"
                          ? "bg-pink-100 text-pink-600"
                          : "bg-purple-100 text-purple-600"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td>
                    <span
                      className={`badge badge-sm border-0 text-white font-semibold text-[12px] gap-1.5 px-2.5 py-0.5 ${
                        user.status === "Active" ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                      {user.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="text-center">
                    <div className="flex justify-center items-center gap-2">
                      <button
                        className="btn btn-ghost btn-xs text-gray-400 hover:text-orange-500"
                        onClick={() => {
                          setEditUser(user);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        className="btn btn-ghost btn-xs text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 min-h-0 h-auto rounded"
                        title="Delete"
                        onClick={() => {
                          setDeleteTarget(user);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer / Pagination ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Showing {startEntry} - {endEntry} of {totalEntries} entries
        </p>

        <div className="join">
          <button
            className="join-item btn btn-sm btn-ghost border border-gray-200"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
          >
            ❮
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`join-item btn btn-sm border-none ${
                page === safePage
                  ? "bg-orange-500 text-white hover:bg-orange-600"
                  : "btn-ghost border border-gray-200"
              }`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}

          <button
            className="join-item btn btn-sm btn-ghost border border-gray-200"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
          >
            ❯
          </button>
        </div>
      </div>

      {/* ── Delete Confirmation Modal ────────────────────────────── */}
      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        deleteTarget={deleteTarget}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteUser}
      />
      {/* ── Edit Modal ────────────────────────────── */}

      <EditUserModal
        isOpen={isEditModalOpen}
        editUser={editUser}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditUser(null);
        }}
      />
    </div>
  );
};

export default UserTable;
