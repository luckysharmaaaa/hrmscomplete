import React, { useState } from "react";

const modulesData = [
  "Employee",
  "Holidays",
  "Leaves",
  "Events",
  "Sales",
  "Training",
  "Reports",
  "Tickets",
  "Payroll",
];

const permissionsList = [
  "allowAll",
  "read",
  "write",
  "create",
  "delete",
  "import",
  "export",
];

const RolePermissionTable = () => {
  const [permissions, setPermissions] = useState(
    modulesData.map((module) => ({
      module,
      allowAll: false,
      read: false,
      write: false,
      create: false,
      delete: false,
      import: false,
      export: false,
    }))
  );

  const handlePermissionChange = (
    moduleIndex,
    permission
  ) => {
    const updatedPermissions = [...permissions];

    if (permission === "allowAll") {
      const newValue =
        !updatedPermissions[moduleIndex].allowAll;

      permissionsList.forEach((item) => {
        updatedPermissions[moduleIndex][item] =
          newValue;
      });
    } else {
      updatedPermissions[moduleIndex][permission] =
        !updatedPermissions[moduleIndex][permission];

      const allChecked = permissionsList
        .filter((item) => item !== "allowAll")
        .every(
          (item) =>
            updatedPermissions[moduleIndex][item]
        );

      updatedPermissions[moduleIndex].allowAll =
        allChecked;
    }

    setPermissions(updatedPermissions);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-[#0F265C]">
          Permissions
        </h2>

        <p className="text-sm text-gray-600">
          Role Name :
          <span className="font-semibold text-black ml-1">
            Admin
          </span>
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead className="bg-gray-100">
            <tr>
              <th>Modules</th>
              <th>Allow All</th>
              <th>Read</th>
              <th>Write</th>
              <th>Create</th>
              <th>Delete</th>
              <th>Import</th>
              <th>Export</th>
            </tr>
          </thead>

          <tbody>
            {permissions.map(
              (item, moduleIndex) => (
                <tr key={item.module}>
                  <td className="font-medium">
                    {item.module}
                  </td>

                  {permissionsList.map(
                    (permission) => (
                      <td key={permission}>
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          checked={
                            item[permission]
                          }
                          onChange={() =>
                            handlePermissionChange(
                              moduleIndex,
                              permission
                            )
                          }
                        />
                      </td>
                    )
                  )}
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RolePermissionTable;