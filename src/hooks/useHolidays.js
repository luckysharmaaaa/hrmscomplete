// src/hooks/useHolidays.js
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../services/api"; // <- adjust if your axios instance is exported differently
import { getType } from "../constants/holidayTypes";

// Works whether your axios interceptor returns the full response or only response.data
const unwrap = (res) => {
  const body = res && res.config ? res.data : res;
  return body && body.data !== undefined ? body.data : body;
};

const errorMessage = (e, fallback) =>
  e?.response?.data?.message || e?.message || fallback;

const fromApi = (h) => ({
  id: h.id,
  title: h.holidayName,
  date: h.holidayDate,
  type: getType(h.holidayType).value, // old REGIONAL/RESTRICTED rows show as Company
  description: h.description || "",
});

const toApi = (d) => {
  const out = {};
  if (d.title !== undefined) out.holidayName = d.title;
  if (d.date !== undefined) out.holidayDate = d.date;
  if (d.type !== undefined) out.holidayType = d.type;
  if (d.description !== undefined) out.description = d.description;
  return out;
};

const byDate = (a, b) => a.date.localeCompare(b.date);

export default function useHolidays() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const list = unwrap(await api.get("/holidays"));
      setHolidays((Array.isArray(list) ? list : []).map(fromApi).sort(byDate));
    } catch (e) {
      toast.error(errorMessage(e, "Could not load holidays."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const list = unwrap(await api.get("/holidays"));
        if (!live) return;
        setHolidays((Array.isArray(list) ? list : []).map(fromApi).sort(byDate));
      } catch (e) {
        if (live) toast.error(errorMessage(e, "Could not load holidays."));
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  // All write helpers toast the error and re-throw so the drawer can stay open.

  const addHoliday = useCallback(async (data) => {
    try {
      const created = fromApi(unwrap(await api.post("/holidays", toApi(data))));
      setHolidays((prev) => [...prev, created].sort(byDate));
      toast.success("Holiday added.");
      return created;
    } catch (e) {
      toast.error(errorMessage(e, "Could not add the holiday."));
      throw e;
    }
  }, []);

  // rows: [{ title, date, type, description }]
  const addHolidays = useCallback(async (rows) => {
    try {
      const created = unwrap(
        await api.post("/holidays/bulk", { holidays: rows.map(toApi) }),
      ).map(fromApi);
      setHolidays((prev) => [...prev, ...created].sort(byDate));
      toast.success(
        created.length === 1 ? "Holiday added." : `${created.length} holidays added.`,
      );
      return created;
    } catch (e) {
      toast.error(errorMessage(e, "Could not add the holidays."));
      throw e;
    }
  }, []);

  const updateHoliday = useCallback(async (id, data) => {
    try {
      const updated = fromApi(unwrap(await api.put(`/holidays/${id}`, toApi(data))));
      setHolidays((prev) =>
        prev.map((h) => (String(h.id) === String(id) ? updated : h)).sort(byDate),
      );
      toast.success("Holiday updated.");
      return updated;
    } catch (e) {
      toast.error(errorMessage(e, "Could not update the holiday."));
      load(); // resync (e.g. after a failed drag & drop)
      throw e;
    }
  }, [load]);

  const removeHoliday = useCallback(async (id) => {
    try {
      await api.delete(`/holidays/${id}`);
      setHolidays((prev) => prev.filter((h) => String(h.id) !== String(id)));
      toast.success("Holiday deleted.");
    } catch (e) {
      toast.error(errorMessage(e, "Could not delete the holiday."));
      throw e;
    }
  }, []);

  return {
    holidays,
    loading,
    addHoliday,
    addHolidays,
    updateHoliday,
    removeHoliday,
    reload: load,
  };
}