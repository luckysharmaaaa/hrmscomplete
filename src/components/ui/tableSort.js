/**
 * Converts a value into a sortable value.
 *
 * Priority:
 * 1. Numbers
 * 2. Numeric strings
 * 3. Dates
 * 4. Normal text
 */
export function parseSortValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "number") {
    return value;
  }

  const text = String(value).trim();

  if (!text) {
    return "";
  }

  const numericValue = Number(text);

  if (!Number.isNaN(numericValue)) {
    return numericValue;
  }

  const dateValue = Date.parse(text);

  if (!Number.isNaN(dateValue)) {
    return dateValue;
  }

  return text.toLowerCase();
}

/**
 * Converts sort state into the value expected by a sort menu.
 *
 * Example:
 * { key: "createdAt", dir: "desc" }
 * → "createdAt:desc"
 */
export function sortValueOf(sort) {
  if (!sort?.key) {
    return "";
  }

  return `${sort.key}:${sort.dir === "desc" ? "desc" : "asc"}`;
}

/**
 * Converts a sort-menu value into sort state.
 *
 * Example:
 * "designationName:asc"
 * → { key: "designationName", dir: "asc" }
 */
export function parseSort(value) {
  if (!value) {
    return {
      key: null,
      dir: "asc",
    };
  }

  const [key, dir] = value.split(":");

  return {
    key: key || null,
    dir: dir === "desc" ? "desc" : "asc",
  };
}
