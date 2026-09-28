import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "hrms_holidays_v1";

const SEED = [
  { id: "h1", title: "Republic Day", date: "2026-01-26", type: "national", description: "" },
  { id: "h2", title: "Independence Day", date: "2026-08-15", type: "national", description: "" },
  { id: "h3", title: "Gandhi Jayanti", date: "2026-10-02", type: "national", description: "" },
  { id: "h4", title: "Diwali", date: "2026-11-08", type: "company", description: "" },
  { id: "h5", title: "Christmas", date: "2026-12-25", type: "optional", description: "" },
];

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : SEED;
  } catch {
    return SEED;
  }
};

const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : String(Date.now() + Math.random());

/**
 * Holiday state + CRUD. Persists to localStorage for now.
 * TO CONNECT YOUR BACKEND: replace the bodies of add/update/remove with API
 * calls (await api.post(...)), and load initial data in a useEffect.
 */
export default function useHolidays() {
  const [holidays, setHolidays] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(holidays));
    } catch {
      /* storage full / blocked — ignore */
    }
  }, [holidays]);

  const addHoliday = useCallback(
    (data) => setHolidays((prev) => [...prev, { ...data, id: newId() }]),
    [],
  );

  const updateHoliday = useCallback(
    (id, data) =>
      setHolidays((prev) => prev.map((h) => (h.id === id ? { ...h, ...data } : h))),
    [],
  );

  const removeHoliday = useCallback(
    (id) => setHolidays((prev) => prev.filter((h) => h.id !== id)),
    [],
  );

  return { holidays, addHoliday, updateHoliday, removeHoliday };
}