import React, { useEffect, useState } from "react";
import api from "../services/api"; // adjust the path
import {
  FiChevronDown,
  FiChevronRight,
} from "react-icons/fi";

const BASE_URL = "http://localhost:5000/api/v1";
const token = localStorage.getItem("token");

const headers = {
  Authorization: `Bearer ${token}`,
};

const permissionColumns = [
  "view",
  "add",
  "edit",
  "approved",
  "delete",
];

const RolePermissionTable = ({
  role,
  selectedModules,
  setSelectedModules,
  permissions,
  setPermissions,
}) => {

  const [modules, setModules] = useState([]);

  const [expanded, setExpanded] = useState({});

  const [loading, setLoading] = useState(false);

  // ============================
  // Load Modules
  // ============================

  useEffect(() => {
    loadModules();
  }, []);

  // ============================
  // Load Role Permissions
  // ============================

  useEffect(() => {
    if (role?.id) {
      loadRoleData(role.id);
    }
  }, [role]);

  // ============================
  // Get Modules
  // ============================

  const loadModules = async () => {
    try {

      setLoading(true);

     const res = await api.get("/modules" ,{
    headers,
  });

      const list = res.data.data || [];

      const tree = buildTree(list);

      setModules(tree);

      const expandState = {};

      const expandAll = (items) => {

        items.forEach((item) => {

          expandState[item.id] = true;

          if (item.children.length) {
            expandAll(item.children);
          }

        });

      };

      expandAll(tree);

      setExpanded(expandState);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }
  };

  // ============================
  // Load Existing Mapping
  // ============================

  const loadRoleData = async (roleId) => {

    try {

      const [moduleRes, permissionRes] =
        await Promise.all([

         api.get(`/role-module-mapping/${roleId}` ,   { headers }),

          api.get(`/role-permissions/${roleId}` ,   { headers } ),

        ]);

      // -------------------------
      // Selected Modules
      // -------------------------

      console.log("Module API Response:", moduleRes.data);

      const moduleIds = Array.isArray(moduleRes.data.data)
        ? moduleRes.data.data.map((item) => item.moduleId)
        : [];

      console.log("moduleIds:", moduleIds);

      setSelectedModules(moduleIds);

      // -------------------------
      // Permissions
      // -------------------------

      const permissionObject = {};

      permissionRes.data.data.forEach((item) => {

        if (!permissionObject[item.moduleId]) {

          permissionObject[item.moduleId] = {};

        }

        permissionObject[item.moduleId][item.action] = true;

      });

      setPermissions(permissionObject);

    } catch (error) {

      console.error(error);

    }

  };
  // ============================
  // Build Module Tree
  // ============================

  const buildTree = (list) => {

    const map = {};

    list.forEach((item) => {

      map[item.id] = {
        ...item,
        children: [],
      };

    });

    const roots = [];

    list.forEach((item) => {

      if (
        item.parentId &&
        map[item.parentId]
      ) {

        map[item.parentId].children.push(
          map[item.id]
        );

      } else {

        roots.push(map[item.id]);

      }

    });

    return roots;

  };

  // ============================
  // Expand / Collapse
  // ============================

  const toggleExpand = (id) => {

    setExpanded((prev) => ({

      ...prev,

      [id]: !prev[id],

    }));

  };

  // ============================
  // Check Module Selected
  // ============================

  const isModuleSelected = (moduleId) => {

    return selectedModules.includes(moduleId);

  };

  // ============================
  // Check Permission
  // ============================

  const hasPermission = (
    moduleId,
    action
  ) => {

    return (
      permissions[moduleId]?.[action] ||
      false
    );

  };

  // ============================
  // Toggle Module
  // ============================

  const toggleModule = (moduleId) => {
    if (selectedModules.includes(moduleId)) {

      setSelectedModules(
        selectedModules.filter((id) => id !== moduleId)
      );

      // Remove all permissions of this module
      setPermissions((prev) => {
        const copy = { ...prev };
        delete copy[moduleId];
        return copy;
      });

    } else {

      setSelectedModules([
        ...selectedModules,
        moduleId,
      ]);

    }
  };

  // ============================
  // Toggle Permission
  // ============================

  const togglePermission = (
    moduleId,
    action
  ) => {

    setPermissions((prev) => ({

      ...prev,

      [moduleId]: {

        ...prev[moduleId],

        [action]:
          !prev[moduleId]?.[action],

      },

    }));

  };
  // ============================
  // Render Tree Rows
  // ============================

  const renderRows = (
    items,
    level = 0
  ) => {

    return items.map((module) => (

      <React.Fragment key={module.id}>

        <tr className="hover:bg-gray-50">

          {/* Module */}

          <td>

            <div
              className="flex items-center"
              style={{
                paddingLeft: `${level * 24}px`,
              }}
            >

              {module.children.length > 0 ? (

                <button
                  type="button"
                  onClick={() =>
                    toggleExpand(module.id)
                  }
                  className="mr-2"
                >

                  {expanded[module.id] ? (

                    <FiChevronDown size={16} />

                  ) : (

                    <FiChevronRight size={16} />

                  )}

                </button>

              ) : (

                <div className="w-6 mr-2" />

              )}

              <input
                type="checkbox"
                className="checkbox checkbox-sm checkbox-primary mr-3"
                checked={isModuleSelected(module.id)}
                onChange={() =>
                  toggleModule(module.id)
                }
              />

              <span
                className={
                  level === 0
                    ? "font-semibold"
                    : ""
                }
              >
                {module.moduleName}
              </span>

            </div>

          </td>

          {/* Permission Columns */}

          {permissionColumns.map((action) => (

            <td
              key={action}
              className="text-center"
            >

              <input
                type="checkbox"
                className="checkbox checkbox-sm checkbox-primary"
                checked={hasPermission(
                  module.id,
                  action
                )}
                disabled={
                  !isModuleSelected(module.id)
                }
                onChange={() =>
                  togglePermission(
                    module.id,
                    action
                  )
                }
              />

            </td>

          ))}

        </tr>

        {/* Children */}

        {expanded[module.id] &&
          module.children.length > 0 &&
          renderRows(
            module.children,
            level + 1
          )}

      </React.Fragment>

    ));

  };
  // ============================
  // Loading
  // ============================

  if (loading) {

    return (

      <div className="flex justify-center items-center h-64">

        <span className="loading loading-spinner loading-lg text-orange-500"></span>

      </div>

    );

  }

  // ============================
  // UI
  // ============================

  return (

    <div className="rounded-xl border border-gray-200 bg-white">

      <div className="overflow-y-scroll flex-1 mb-10">

        <table className="table table-pin-rows w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="min-w-87.5">
                Module
              </th>

              {permissionColumns.map((item) => (

                <th
                  key={item}
                  className="text-center capitalize"
                >
                  {item}
                </th>

              ))}

            </tr>

          </thead>

          <tbody>

            {modules.length === 0 ? (

              <tr>

                <td
                  colSpan={
                    permissionColumns.length + 1
                  }
                  className="text-center py-10 text-gray-500"
                >

                  No Modules Found

                </td>

              </tr>

            ) : (

              renderRows(modules)

            )}

          </tbody>

        </table>

      </div>

    </div>

  );

};

export default RolePermissionTable;