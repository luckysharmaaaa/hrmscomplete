import React, { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import api from "../services/api";

const DEFAULT_COLUMNS = [
  "view",
  "add",
  "edit",
  "approved",
  "delete",
];

const DEFAULT_LABELS = {
  view: "View",
  add: "Add",
  edit: "Edit",
  approved: "Approved",
  delete: "Delete",
};

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
    if (item.parentId && map[item.parentId]) {
      map[item.parentId].children.push(map[item.id]);
    } else {
      roots.push(map[item.id]);
    }
  });

  return roots;
};

const PermissionCheckbox = ({
  checked,
  disabled = false,
  indeterminate = false,
  onChange,
  ariaLabel,
}) => {
  const checkboxRef = React.useRef(null);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      ref={checkboxRef}
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      aria-label={ariaLabel}
      className="h-4 w-4 cursor-pointer rounded accent-primary-700 transition disabled:cursor-not-allowed disabled:opacity-40"
    />
  );
};

const RolePermissionTable = ({
  role,
  selectedModules,
  setSelectedModules,
  permissions,
  setPermissions,
}) => {
  const [modules, setModules] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionDefs, setActionDefs] = useState(null);

  useEffect(() => {
    api.get("/permissions/actions").then((r) => setActionDefs(r.data?.data || null)).catch(() => {});
  }, []);

  const permissionColumns = actionDefs ? actionDefs.map((a) => a.code) : DEFAULT_COLUMNS;
  const permissionLabels = actionDefs ? Object.fromEntries(actionDefs.map((a) => [a.code, a.label])) : DEFAULT_LABELS;

  const loadModules = useCallback(() => {
    return api
      .get("/modules")
      .then((res) => {
        const list = Array.isArray(res.data.data) ? res.data.data : [];
        const tree = buildTree(list);

        setModules(tree);

        const expandState = {};

        const expandAll = (items) => {
          items.forEach((item) => {
            expandState[item.id] = true;

            if (item.children?.length) {
              expandAll(item.children);
            }
          });
        };

        expandAll(tree);
        setExpanded(expandState);
      })
      .catch((error) => {
        console.error("Failed to load modules:", error);
        setModules([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const loadRoleData = useCallback((roleId) => {
    return Promise.all([
      api.get(`/role-module-mapping/${roleId}`),
      api.get(`/role-permissions/${roleId}`),
    ])
      .then(([moduleRes, permissionRes]) => {
        const moduleData = Array.isArray(moduleRes.data.data)
          ? moduleRes.data.data
          : [];

        const moduleIds = moduleData
          .map((item) => item.moduleId)
          .filter(Boolean);

        setSelectedModules(moduleIds);

        const permissionObject = {};

        const permissionData = Array.isArray(permissionRes.data.data)
          ? permissionRes.data.data
          : [];

        permissionData.forEach((item) => {
          if (!permissionObject[item.moduleId]) {
            permissionObject[item.moduleId] = {};
          }

          permissionObject[item.moduleId][item.action] = true;
        });

        setPermissions(permissionObject);
      })
      .catch((error) => {
        console.error("Failed to load role permissions:", error);
        setSelectedModules([]);
        setPermissions({});
      })
      .finally(() => {
        setLoading(false);
      });
  }, [setSelectedModules, setPermissions]);

  useEffect(() => {
    loadModules();
  }, [loadModules]);

  const [prevRole, setPrevRole] = useState(role);
  if (role !== prevRole) {
    setPrevRole(role);

    if (role?.id) {
      setLoading(true);
    } else {
      setSelectedModules([]);
      setPermissions({});
    }
  }

  useEffect(() => {
    if (role?.id) {
      loadRoleData(role.id);
    }
  }, [role, loadRoleData]);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const isModuleSelected = (moduleId) => {
    return selectedModules.includes(moduleId);
  };

  const hasPermission = (moduleId, action) => {
    return Boolean(permissions[moduleId]?.[action]);
  };

  const getDescendantIds = (module) => {
    const ids = [];

    const walk = (items) => {
      items.forEach((item) => {
        ids.push(item.id);

        if (item.children?.length) {
          walk(item.children);
        }
      });
    };

    walk(module.children || []);

    return ids;
  };

  const getAllModuleIds = (module) => {
    return [module.id, ...getDescendantIds(module)];
  };

  const getModuleCheckboxState = (module) => {
    const selected = isModuleSelected(module.id);
    const descendants = getDescendantIds(module);

    if (!descendants.length) {
      return {
        checked: selected,
        indeterminate: false,
      };
    }

    const selectedDescendants = descendants.filter((id) =>
      selectedModules.includes(id)
    );

    const allSelected =
      selected && selectedDescendants.length === descendants.length;

    const partiallySelected =
      selectedDescendants.length > 0 &&
      selectedDescendants.length < descendants.length;

    return {
      checked: allSelected,
      indeterminate: partiallySelected || (selected && !allSelected),
    };
  };

  const removePermissionsForModules = (moduleIds, current) => {
    const next = { ...current };

    moduleIds.forEach((id) => {
      delete next[id];
    });

    return next;
  };

  const toggleModule = (module) => {
    const moduleIds = getAllModuleIds(module);
    const currentlySelected = isModuleSelected(module.id);

    if (currentlySelected) {
      setSelectedModules((prev) =>
        prev.filter((id) => !moduleIds.includes(id))
      );

      setPermissions((prev) =>
        removePermissionsForModules(moduleIds, prev)
      );

      return;
    }

    setSelectedModules((prev) => {
      const next = new Set(prev);

      moduleIds.forEach((id) => next.add(id));

      return Array.from(next);
    });
  };

  const togglePermission = (moduleId, action) => {
    if (!isModuleSelected(moduleId)) {
      setSelectedModules((prev) =>
        prev.includes(moduleId) ? prev : [...prev, moduleId]
      );
    }

    setPermissions((prev) => {
      const current = prev[moduleId] || {};
      const nextValue = !current[action];

      const nextModulePermissions = {
        ...current,
        [action]: nextValue,
      };

      if (!Object.values(nextModulePermissions).some(Boolean)) {
        const next = { ...prev };
        delete next[moduleId];
        return next;
      }

      return {
        ...prev,
        [moduleId]: nextModulePermissions,
      };
    });
  };

  const areAllPermissionsSelected = (moduleId) => {
    return permissionColumns.every((action) =>
      hasPermission(moduleId, action)
    );
  };

  const hasSomePermission = (moduleId) => {
    return permissionColumns.some((action) =>
      hasPermission(moduleId, action)
    );
  };

  const toggleAllPermissions = (moduleId) => {
    if (!isModuleSelected(moduleId)) {
      setSelectedModules((prev) =>
        prev.includes(moduleId) ? prev : [...prev, moduleId]
      );
    }

    const shouldSelectAll = !areAllPermissionsSelected(moduleId);

    setPermissions((prev) => {
      if (!shouldSelectAll) {
        const next = { ...prev };
        delete next[moduleId];
        return next;
      }

      const allPermissions = {};

      permissionColumns.forEach((action) => {
        allPermissions[action] = true;
      });

      return {
        ...prev,
        [moduleId]: allPermissions,
      };
    });
  };

  const renderRows = (items, level = 0) => {
    return items.map((module) => {
      const moduleState = getModuleCheckboxState(module);
      const allPermissionsSelected = areAllPermissionsSelected(module.id);
      const somePermissionsSelected = hasSomePermission(module.id);

      return (
        <React.Fragment key={module.id}>
          <tr>
            <td className="hr-td !h-12">
              <div
                className="flex min-w-0 items-center"
                style={{ paddingLeft: `${level * 22}px` }}
              >
                {module.children?.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => toggleExpand(module.id)}
                    aria-label={
                      expanded[module.id]
                        ? `Collapse ${module.moduleName}`
                        : `Expand ${module.moduleName}`
                    }
                    className="mr-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-text-secondary transition hover:bg-primary-50 hover:text-primary-700"
                  >
                    {expanded[module.id] ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>
                ) : (
                  <div className="w-7 shrink-0" />
                )}

                <PermissionCheckbox
                  checked={moduleState.checked}
                  indeterminate={moduleState.indeterminate}
                  onChange={() => toggleModule(module)}
                  ariaLabel={`Select ${module.moduleName} module`}
                />

                <span
                  className={`ml-3 truncate text-sm ${
                    level === 0
                      ? "font-semibold text-text-primary"
                      : "font-medium text-text-secondary"
                  }`}
                >
                  {module.moduleName}
                </span>
              </div>
            </td>

            {/* ALL - FIRST */}
            <td className="hr-td !h-12 border-l border-border-subtle text-center">
              <PermissionCheckbox
                checked={allPermissionsSelected}
                indeterminate={
                  somePermissionsSelected && !allPermissionsSelected
                }
                disabled={!isModuleSelected(module.id)}
                onChange={() => toggleAllPermissions(module.id)}
                ariaLabel={`All permissions for ${module.moduleName}`}
              />
            </td>

            {/* INDIVIDUAL PERMISSIONS */}
            {permissionColumns.map((action) => (
              <td key={action} className="hr-td !h-12 text-center">
                <PermissionCheckbox
                  checked={hasPermission(module.id, action)}
                  disabled={!isModuleSelected(module.id)}
                  onChange={() => togglePermission(module.id, action)}
                  ariaLabel={`${permissionLabels[action]} permission for ${module.moduleName}`}
                />
              </td>
            ))}
          </tr>

          {expanded[module.id] &&
            module.children?.length > 0 &&
            renderRows(module.children, level + 1)}
        </React.Fragment>
      );
    });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-md border border-border-subtle bg-surface">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={26} className="animate-spin text-primary-700" />
          <p className="text-sm text-text-secondary">Loading permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-border-subtle bg-surface">
      <div className="max-h-[420px] overflow-auto">
        <table className="hr-table min-w-[560px]">
          <thead>
            <tr>
              <th className="hr-th sticky top-0 z-10 min-w-[270px]">Module</th>

              {/* ALL - FIRST OPTION */}
              <th className="hr-th sticky top-0 z-10 min-w-[70px] bg-orange-50! text-center text-accent-600!">
                All
              </th>

              {permissionColumns.map((action) => (
                <th
                  key={action}
                  className="hr-th sticky top-0 z-10 min-w-[70px] text-center"
                >
                  {permissionLabels[action]}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {modules.length === 0 ? (
              <tr>
                <td
                  colSpan={permissionColumns.length + 2}
                  className="py-12 text-center text-sm text-text-secondary"
                >
                  No modules found.
                </td>
              </tr>
            ) : (
              renderRows(modules)
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-border-subtle bg-background px-4 py-3">
        <p className="text-xs text-text-secondary">
          Select a module first, then choose the permissions required
          for that module. Use "All" to enable or disable every
          permission at once.
        </p>
      </div>
    </div>
  );
};

export default RolePermissionTable;