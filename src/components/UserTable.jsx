import {
  FiCalendar,
  FiEdit,
  FiTrash2,
  FiShield,
  FiSearch,
} from "react-icons/fi";

const users = [
  {
    id: 1,
    name: "Anthony Lewis",
    email: "anthony@example.com",
    date: "12 Sep 2024",
    role: "Employee",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=1",
  },
  {
    id: 2,
    name: "Brian Villalobos",
    email: "brian@example.com",
    date: "24 Oct 2024",
    role: "Employee",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=2",
  },
  {
    id: 3,
    name: "Sophie Headrick",
    email: "sophie@example.com",
    date: "18 Feb 2024",
    role: "Client",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=3",
  },
];
export default function UsersTable() {
  return (
    <div className=" py-2 bg-gray-100 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Header */}
        <div className="p-5 border-b">
          <h2 className="text-xl font-semibold">Users List</h2>
        </div>

        {/* Filters */}
        <div className="p-5 flex flex-wrap justify-between gap-4 border-b">
          <div className="flex gap-3">
            <div className="flex items-center border rounded-md px-3 py-2">
              <FiCalendar className="mr-2" />
              <span>06/06/2026 - 06/12/2026</span>
            </div>

            <select className="border rounded-md px-3 py-2">
              <option>Role</option>
            </select>

            <select className="border rounded-md px-3 py-2">
              <option>Status</option>
            </select>

            <select className="border rounded-md px-3 py-2">
              <option>Sort By : Last 7 Days</option>
            </select>
          </div>

          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2 border rounded-md"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4">
                  <input type="checkbox" />
                </th>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Created Date</th>
                <th className="text-left p-4">Role</th>
                <th className="text-left p-4">Status</th>
                <th className="text-center p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-4">
                    <input type="checkbox" />
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </td>

                  <td className="p-4 text-gray-600">{user.email}</td>

                  <td className="p-4 text-gray-600">{user.date}</td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded text-sm ${
                        user.role === "Employee"
                          ? "bg-pink-100 text-pink-600"
                          : "bg-purple-100 text-purple-600"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded text-sm text-white ${
                        user.status === "Active"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex justify-center gap-4">
                      <button>
                        <FiShield />
                      </button>

                      <button>
                        <FiEdit />
                      </button>

                      <button className="text-red-500">
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 flex justify-between items-center">
          <p className="text-gray-500">
            Showing 1 - 10 of 10 entries
          </p>

          <div className="flex items-center gap-2">
            <button className="w-8 h-8 border rounded">
              {"<"}
            </button>

            <button className="w-8 h-8 bg-orange-500 text-white rounded">
              1
            </button>

            <button className="w-8 h-8 border rounded">
              {">"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}