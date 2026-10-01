// Pure helpers for the role-permission matrix. No React, no API calls.
// State shape: { [moduleId]: ["view","add",...] } with actions kept in `actions` order.
// `actions` comes from the DB (GET /permissions/actions); ACTIONS is only the fallback.

export const ACTIONS = ["view", "add", "edit", "approved", "delete"];

export const ACTION_LABELS = {
  view: "View",
  add: "Add",
  edit: "Edit",
  approved: "Approved",
  delete: "Delete",
};

const ordered = (list, actions) => actions.filter((a) => list.includes(a));

/** role_permissions rows -> matrix state */
export const fromRows = (rows = [], actions = ACTIONS) => {
  const state = {};
  rows.forEach((row) => {
    if (!actions.includes(row.action)) return;
    const id = Number(row.moduleId);
    state[id] = ordered([...(state[id] || []), row.action], actions);
  });
  return state;
};

const has = (state, id, action) => (state[id] || []).includes(action);

const withActions = (state, id, list, actions) => {
  const next = { ...state };
  if (list.length === 0) delete next[id];
  else next[id] = ordered(list, actions);
  return next;
};

/**
 * Rules (also enforced by the API):
 *  - ticking any other action also ticks View
 *  - unticking View clears every action of that module
 */
export const toggleAction = (state, id, action, actions = ACTIONS) => {
  const current = state[id] || [];
  if (current.includes(action)) {
    return action === "view"
      ? withActions(state, id, [], actions)
      : withActions(state, id, current.filter((a) => a !== action), actions);
  }
  return withActions(state, id, [...current, action, "view"], actions);
};

/** "All" checkbox of one row. */
export const toggleRow = (state, id, actions = ACTIONS) =>
  (state[id] || []).length === actions.length
    ? withActions(state, id, [], actions)
    : withActions(state, id, actions, actions);

/** Header checkbox of one column, applied to the given (visible) modules. */
export const setColumn = (state, ids, action, on, actions = ACTIONS) => {
  let next = state;
  ids.forEach((id) => {
    const current = next[id] || [];
    if (on) next = withActions(next, id, [...current, action, "view"], actions);
    else if (action === "view") next = withActions(next, id, [], actions);
    else next = withActions(next, id, current.filter((a) => a !== action), actions);
  });
  return next;
};

/** "none" | "some" | "all" for a row. */
export const rowStatus = (state, id, actions = ACTIONS) => {
  const n = (state[id] || []).length;
  return n === 0 ? "none" : n === actions.length ? "all" : "some";
};

/** "none" | "some" | "all" for a column across the given modules. */
export const columnStatus = (state, ids, action) => {
  if (ids.length === 0) return "none";
  const n = ids.filter((id) => has(state, id, action)).length;
  return n === 0 ? "none" : n === ids.length ? "all" : "some";
};

export const isDirty = (a, b) => {
  const norm = (s) =>
    Object.keys(s)
      .filter((k) => s[k].length > 0)
      .sort((x, y) => Number(x) - Number(y))
      .map((k) => `${k}:${s[k].join(",")}`)
      .join("|");
  return norm(a) !== norm(b);
};

/** matrix state -> body for POST /role-permissions/sync */
export const toPayload = (state) =>
  Object.keys(state)
    .filter((k) => state[k].length > 0)
    .map((k) => ({ moduleId: Number(k), actions: state[k] }));

/** Flat module list -> [{ module, children }] using parentId. Search keeps a parent if it or any child matches. */
export const buildTree = (modules = [], query = "") => {
  const q = query.trim().toLowerCase();
  const matches = (m) =>
    !q ||
    String(m.moduleName || "").toLowerCase().includes(q) ||
    String(m.slug || "").toLowerCase().includes(q);

  const byId = new Map(modules.map((m) => [m.id, m]));
  const childrenOf = new Map();
  const roots = [];

  modules.forEach((m) => {
    if (m.parentId && byId.has(m.parentId)) {
      childrenOf.set(m.parentId, [...(childrenOf.get(m.parentId) || []), m]);
    } else {
      roots.push(m);
    }
  });

  const byName = (a, b) => String(a.moduleName).localeCompare(String(b.moduleName));

  return roots
    .sort(byName)
    .map((root) => {
      const kids = (childrenOf.get(root.id) || []).sort(byName);
      const shownKids = matches(root) ? kids : kids.filter(matches);
      return { module: root, children: shownKids, keep: matches(root) || shownKids.length > 0 };
    })
    .filter((n) => n.keep)
    .map(({ module, children }) => ({ module, children }));
};

/** ids of every module row currently shown in a tree. */
export const visibleIds = (tree) => tree.flatMap((n) => [n.module.id, ...n.children.map((c) => c.id)]);
