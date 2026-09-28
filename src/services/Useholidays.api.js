import { useState, useEffect, useCallback } from "react";
import api from "../services/api"; // <-- your axios instance (baseURL + auth header). Adjust path.

// ── DB row  <->  UI object ──────────────────────────────
// DB:  { id, holidayName, holidayDate, holidayType, description }
// UI:  { id, title, date, type, description }
const fromRow = (r) => ({
  id: r.id,
  title: r.holidayName,
  date: String(r.holidayDate).slice(0, 10),
  type: String(r.holidayType || "COMPANY").toLowerCase(),
  description: r.description || "",
});

const toPayload = (h) => ({
  ...(h.title !== undefined && { holidayName: h.title }),
  ...(h.date !== undefined && { holidayDate: h.date }),
  ...(h.type !== undefined && { holidayType: h.type.toUpperCase() }),
  ...(h.description !== undefined && { description: h.description || null }),
});

// Accepts either { data: [...] } or { data: { data: [...] } }
const unwrap = (res) => res?.data?.data ?? res?.data;

/**
 * ASSUMED endpoints (change to match your backend):
 *   GET    /holidays        POST   /holidays
 *   PUT    /holidays/:id    DELETE /holidays/:id   (soft delete)
 */
export default function useHolidays() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const rows = unwrap(await api.get("/holidays"));
      setHolidays((rows || []).map(fromRow));
    } catch (e) {
      setError(e?.response?.data?.message || "Could not load holidays.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // All three re-throw so callers can show an error / revert a drag.
  const addHoliday = useCallback(async (data) => {
    const saved = unwrap(await api.post("/holidays", toPayload(data)));
    // If your API returns the new row use it, else reload
    if (saved?.id) setHolidays((p) => [...p, fromRow(saved)]);
    else await reload();
  }, [reload]);

  const updateHoliday = useCallback(async (id, data) => {
    await api.put(`/holidays/${id}`, toPayload(data));
    setHolidays((p) => p.map((h) => (h.id === id ? { ...h, ...data } : h)));
  }, []);

  const removeHoliday = useCallback(async (id) => {
    await api.delete(`/holidays/${id}`);
    setHolidays((p) => p.filter((h) => h.id !== id));
  }, []);

  return { holidays, loading, error, reload, addHoliday, updateHoliday, removeHoliday };
}