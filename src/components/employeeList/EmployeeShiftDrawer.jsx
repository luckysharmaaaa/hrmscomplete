import { useEffect, useState } from 'react';import { Clock, History, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

import SideDrawer from "../ui/SideDrawer";

import {
  getShifts,
  getEmployeeShift,
  assignEmployeeShift,
  getEmployeeShiftHistory,
} from "../../services/employeeShift.service";

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(timeStr) {
  if (!timeStr) return "-";
  const [h, m] = timeStr.split(":");
  const hour = Number(h);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${m} ${suffix}`;
}

export default function EmployeeShiftDrawer({ open, onClose, employee }) {
  const [shifts, setShifts] = useState([]);
  const [currentShift, setCurrentShift] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedShiftId, setSelectedShiftId] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const [prevOpen, setPrevOpen] = useState(open);
  const [prevEmpId, setPrevEmpId] = useState(employee?.id);
  if (open !== prevOpen || employee?.id !== prevEmpId) {
    setPrevOpen(open);
    setPrevEmpId(employee?.id);
    if (open) {
      setSelectedShiftId("");
      setEffectiveFrom("");
      setNotes("");
      if (employee?.id) {
        setLoading(true);
      }
    }
  }

  const fetchData = async () => {
    if (!employee?.id) return;
    try {
      const [shiftsRes, currentRes, historyRes] = await Promise.all([
        getShifts(),
        getEmployeeShift(employee.id),
        getEmployeeShiftHistory(employee.id),
      ]);

      setShifts(shiftsRes.data?.data ?? []);
      setCurrentShift(currentRes.data?.data ?? null);
      setHistory(historyRes.data?.data ?? []);
    } catch (error) {
      console.error("SHIFT DRAWER FETCH ERROR:", error);
      toast.error("Failed to load shift details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    (async () => {
      await fetchData();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, employee?.id]);

  const handleAssign = async (e) => {
    e.preventDefault();

    if (!selectedShiftId || !effectiveFrom) {
      toast.error("Please select a shift and effective date.");
      return;
    }

    setSaving(true);
    try {
      await assignEmployeeShift(employee.id, {
        shiftId: Number(selectedShiftId),
        effectiveFrom,
        notes: notes || null,
      });

      toast.success(currentShift ? "Shift changed successfully" : "Shift assigned successfully");

      setSelectedShiftId("");
      setEffectiveFrom("");
      setNotes("");

      if (employee?.id) {
        setLoading(true);
      }
      await fetchData();
    } catch (error) {
      console.error("ASSIGN SHIFT ERROR:", error);
      toast.error(error?.response?.data?.message || "Failed to assign shift.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      icon={Clock}
      size="md"
      title="Shift Details"
      subtitle={`${employee?.name || ""}${employee?.empId ? ` · ${employee.empId}` : ""}`}
    >
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 size={24} className="animate-spin text-primary-700" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Current Shift */}
          <div>
            <h3 className="hr-label mb-2">Current Shift</h3>

            {currentShift ? (
              <div className="space-y-2 rounded-md border border-primary-100 bg-primary-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary-700">{currentShift.shiftName}</span>
                  {currentShift.shiftCode && (
                    <span className="rounded-full border border-primary-200 bg-surface px-2 py-0.5 text-[11px] font-semibold text-primary-700">
                      {currentShift.shiftCode}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-text-secondary">
                  <p><span className="text-text-disabled">Start:</span> {formatTime(currentShift.startTime)}</p>
                  <p><span className="text-text-disabled">End:</span> {formatTime(currentShift.endTime)}</p>
                  <p><span className="text-text-disabled">Break:</span> {currentShift.breakMinutes} min</p>
                  <p><span className="text-text-disabled">Grace:</span> {currentShift.graceMinutes} min</p>
                </div>

                <p className="border-t border-primary-100 pt-1 text-xs text-text-secondary">
                  Effective from <span className="font-medium">{formatDate(currentShift.effectiveFrom)}</span>
                </p>
              </div>
            ) : (
              <p className="rounded-md border border-dashed border-border-strong p-4 text-center text-sm text-text-secondary">
                No shift assigned yet.
              </p>
            )}
          </div>

          {/* Assign / Change */}
          <form onSubmit={handleAssign} className="space-y-4">
            <h3 className="hr-label">{currentShift ? "Change Shift" : "Assign Shift"}</h3>

            <div>
              <label className="hr-label">
                Shift <span className="text-danger-500">*</span>
              </label>
              <select value={selectedShiftId} onChange={(e) => setSelectedShiftId(e.target.value)} className="hr-select">
                <option value="">Select shift</option>
                {shifts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.shiftName} ({formatTime(s.startTime)} - {formatTime(s.endTime)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="hr-label">
                Effective From <span className="text-danger-500">*</span>
              </label>
              <input
                type="date"
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
                className="hr-input"
              />
            </div>

            <div>
              <label className="hr-label">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="hr-input h-auto! min-h-[70px] resize-none py-2.5"
                placeholder="Optional"
              />
            </div>

            <button type="submit" disabled={saving} className="hr-btn hr-btn-primary w-full">
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? "Saving..." : currentShift ? "Change Shift" : "Assign Shift"}
            </button>
          </form>

          {/* History */}
          <div>
            <h3 className="hr-label mb-2 flex items-center gap-1.5">
              <History size={14} />
              Shift History
            </h3>

            {history.length === 0 ? (
              <p className="text-xs text-text-secondary">No history yet.</p>
            ) : (
              <div className="space-y-2">
                {history.map((h) => (
                  <div key={h.id} className="rounded-md border border-border-subtle p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-text-primary">{h.shiftName}</span>
                      {!h.effectiveTo && (
                        <span className="rounded-full border border-success-500/30 bg-success-50 px-2 py-0.5 text-[10px] font-semibold text-success-600">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-text-secondary">
                      {formatDate(h.effectiveFrom)} – {h.effectiveTo ? formatDate(h.effectiveTo) : "Present"}
                    </p>
                    {h.notes && <p className="mt-1 text-text-secondary">{h.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </SideDrawer>
  );
}