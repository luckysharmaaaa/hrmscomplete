import React, { useState } from "react";
import {
  FiSearch,
  FiCalendar,
  FiEdit2,
  FiTrash2,
  FiShield,
  FiChevronUp,
  FiChevronDown,
} from "react-icons/fi";

const allRoles = [
  {
    id: 1,
    role: "Admin",
    date: "12 Sep 2024",
    status: "Active",
  },
  {
    id: 2,
    role: "HR Manager",
    date: "24 Oct 2024",
    status: "Active",
  },
  {
    id: 3,
    role: "Recruitment Manager",
    date: "18 Feb 2024",
    status: "Active",
  },
  {
    id: 4,
    role: "Payroll Manager",
    date: "17 Oct 2024",
    status: "Active",
  },
  {
    id: 5,
    role: "Leave Manager",
    date: "20 Jul 2024",
    status: "Active",
  },
  {
    id: 6,
    role: "Performance Manager",
    date: "10 Apr 2024",
    status: "Active",
  },
  {
    id: 7,
    role: "Reports Analyst",
    date: "29 Aug 2024",
    status: "Active",
  },
  {
    id: 8,
    role: "Employee",
    date: "22 Feb 2024",
    status: "Inactive",
  },
  {
    id: 9,
    role: "Client",
    date: "03 Nov 2024",
    status: "Active",
  },
  {
    id: 10,
    role: "Department Head",
    date: "17 Dec 2024",
    status: "Active",
  },
];

const SortIcon = () => (
  <span className="inline-flex flex-col ml-1 opacity-40 leading-none">
    <FiChevronUp size={10} />
    <FiChevronDown size={10} />
  </span>
);

const RolesTable = () => {
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const toggleAll = () => {
    if (selected.length === allRoles.length) {
      setSelected([]);
    } else {
      setSelected(allRoles.map((item) => item.id));
    }
  };

  const toggleOne = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const filteredRoles = allRoles.filter((item) => {
    const matchSearch = item.role
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchStatus = statusFilter
      ? item.status === statusFilter
      : true;

    return matchSearch && matchStatus;
  });

  const totalEntries = filteredRoles.length;
  const totalPages = Math.max(
    1,
    Math.ceil(totalEntries / rowsPerPage)
  );

  const safePage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedRoles = filteredRoles.slice(
    (safePage - 1) * rowsPerPage,
    safePage * rowsPerPage
  );

  const startEntry =
    totalEntries === 0
      ? 0
      : (safePage - 1) * rowsPerPage + 1;

  const endEntry = Math.min(
    safePage * rowsPerPage,
    totalEntries
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-gray-200">
        <h2 className="text-base font-bold text-[#0F265C]">
          Roles List
        </h2>

        <div className="flex items-center gap-2">

          {/* Date */}
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 bg-white cursor-pointer min-w-52">
            <FiCalendar
              size={13}
              className="text-gray-400"
            />
            <span>
              06/09/2026 - 06/15/2026
            </span>
          </div>



          

          {/* Status */}
          <select
            className="select select-bordered select-xs text-xs h-8 min-h-0 rounded-lg bg-white text-black"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="">
              Status
            </option>
            <option value="Active">
              Active
            </option>
            <option value="Inactive">
              Inactive
            </option>
          </select>

          {/* Sort */}
          <select className="select select-bordered select-xs text-xs h-8 min-h-0 rounded-lg min-w-40 bg-white text-black">
            <option>
              Sort By : Last 7 Days
            </option>
            <option>
              Sort By : Last 30 Days
            </option>
            <option>
              Sort By : Last 90 Days
            </option>
          </select>
        </div>
      </div>

      {/* Row Per Page + Search */}
      <div className="flex items-center justify-between gap-2 px-5 py-2.5 border-b border-gray-200 text-sm text-gray-600">
        
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap">Row Per Page</span>
           

          <select
            className="select select-bordered select-xs h-7 min-h-0 text-xs rounded-md bg-white text-black"
            value={rowsPerPage}
            onChange={(e) =>
              setRowsPerPage(
                Number(e.target.value)
              )
            }
          >
            <option value={10}>
              10
            </option>
            <option value={25}>
              25
            </option>
            <option value={50}>
              50
            </option>
          </select>

          <span>Entries</span>
        </div>

        {/* Search */}
        <label className="input input-bordered input-xs flex items-center gap-2 h-8 rounded-lg px-3 text-xs bg-white text-black">
          <FiSearch
            size={13}
            className="text-gray-400"
          />

          <input
            type="text"
            placeholder="Search"
            className="grow bg-transparent outline-none text-xs w-32"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </label>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table table-md w-full">
          <thead className="bg-gray-100 text-gray-600 text-xs font-semibold">
            <tr>
              <th className="w-10 bg-gray-100">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm border-gray-400 checked:bg-orange-500 checked:border-orange-500"
                  checked={
                    selected.length ===
                    allRoles.length
                  }
                  onChange={toggleAll}
                />
              </th>

              <th className="bg-gray-100">
                <span className="inline-flex items-center gap-0.5 font-bold text-lg">
                  Role <SortIcon />
                </span>
              </th>

              <th className="bg-gray-100">
                <span className="inline-flex items-center gap-0.5 font-bold text-lg">
                  Created Date{" "}
                  <SortIcon />
                </span>
              </th>

              <th className="bg-gray-100">
                <span className="inline-flex items-center gap-0.5 font-bold text-lg">
                  Status{" "}
                  <SortIcon />
                </span>
              </th>

              <th className="bg-gray-100 text-center">
                <span className="inline-flex items-center gap-0.5 font-bold text-lg">
                  Actions{" "}
                  <SortIcon />
                </span>
              </th>
            </tr>
          </thead>

          <tbody>
            {paginatedRoles.length ===
            0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center text-gray-400 py-10"
                >
                  No roles found.
                </td>
              </tr>
            ) : (
              paginatedRoles.map(
                (item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm border-gray-400 checked:bg-orange-500 checked:border-orange-500"
                        checked={selected.includes(
                          item.id
                        )}
                        onChange={() =>
                          toggleOne(
                            item.id
                          )
                        }
                      />
                    </td>

                    <td className="text-gray-800 text-sm font-medium">
                      {item.role}
                    </td>

                    <td className="text-gray-500 text-sm">
                      {item.date}
                    </td>

                    <td>
                      <span
                        className={`badge badge-sm border-0 text-white font-semibold text-xs gap-1.5 px-2.5 py-0.5 ${
                          item.status ===
                          "Active"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                        {item.status}
                      </span>
                    </td>

                    <td className="text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button className="btn btn-ghost btn-xs text-gray-400 hover:text-blue-500 hover:bg-blue-50 p-1 min-h-0 h-auto rounded">
                          <FiShield
                            size={14}
                          />
                        </button>

                        <button className="btn btn-ghost btn-xs text-gray-400 hover:text-orange-500 hover:bg-orange-50 p-1 min-h-0 h-auto rounded">
                          <FiEdit2
                            size={14}
                          />
                        </button>

                        <button className="btn btn-ghost btn-xs text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 min-h-0 h-auto rounded">
                          <FiTrash2
                            size={14}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Showing {startEntry} -{" "}
          {endEntry} of{" "}
          {totalEntries} entries
        </p>

        <div className="join">
          <button
            className="join-item btn btn-sm btn-ghost border border-gray-200"
            onClick={() =>
              setCurrentPage((p) =>
                Math.max(1, p - 1)
              )
            }
            disabled={
              safePage === 1
            }
          >
            ❮
          </button>

          {Array.from(
            { length: totalPages },
            (_, i) => i + 1
          ).map((page) => (
            <button
              key={page}
              className={`join-item btn btn-sm border-none ${
                page === safePage
                  ? "bg-orange-500 text-white hover:bg-orange-600"
                  : "btn-ghost border border-gray-200"
              }`}
              onClick={() =>
                setCurrentPage(
                  page
                )
              }
            >
              {page}
            </button>
          ))}

          <button
            className="join-item btn btn-sm btn-ghost border border-gray-200"
            onClick={() =>
              setCurrentPage((p) =>
                Math.min(
                  totalPages,
                  p + 1
                )
              )
            }
            disabled={
              safePage ===
              totalPages
            }
          >
            ❯
          </button>
        </div>
      </div>
    </div>
  );
};

export default RolesTable;