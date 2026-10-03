import React, { useCallback, useEffect, useState } from "react";
import { Fingerprint, Loader2, Save, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";

import usePermission from "../../hooks/usePermission";
import {
  getBiometricStatus,
  setBiometricStatus,
} from "../../services/attendanceGateApi";

const p2 = (n) => String(n).padStart(2, "0");
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
};
const fmtDate = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};
const fmtEpoch = (v) =>
  v ? new Date(Number(v) * 1000).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "-";

/**
 * Admin card: is the biometric machine working on the selected date?
 * One click: when it is marked NOT working, ALL office employees can punch
 * from HRMS for that date only. WFH employees always punch from HRMS.
 * Needs RBAC module attendance-biometric-status (view to see, edit to change).
 * Place it on the Attendance Admin page, above the table.
 */
export default function BiometricStatusPanel() {
  const { canView, canEdit, loaded } = usePermission("attendance-biometric-status");

  const [date, setDate] = useState(todayStr());
  const [unavailable, setUnavailable] = useState(false);
  const [reason, setReason] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (d) => {
    setLoading(true);
    try {
      const res = await getBiometricStatus(d);
      setData(res);
      setUnavailable(res.selected.status === "UNAVAILABLE");
      setReason(res.selected.reason || "");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load biometric status");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loaded && canView) load(date);
  }, [loaded, canView, date, load]);

  if (!loaded || !canView) return null;

  const save = async () => {
    setError("");
    if (unavailable && reason.trim().length < 5) {
      setError("Please enter a reason (at least 5 characters).");
      return;
    }
    setSaving(true);
    try {
      await setBiometricStatus({ date, unavailable, reason: reason.trim() });
      toast.success(unavailable ? "Biometric marked NOT working for the selected date" : "Biometric marked working");
      await load(date);
    } catch (e) {
      setError(e?.response?.data?.message || "Could not save the status.");
    } finally {
      setSaving(false);
    }
  };

  const todayUnavailable = data?.today?.status === "UNAVAILABLE";

  return (
    <div className="hr-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-accent-500">
            <Fingerprint size={20} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-primary-700">Biometric status</h2>
            <p className="text-xs text-text-secondary">
              Today:{" "}
              <span className={todayUnavailable ? "font-semibold text-danger-600" : "font-semibold text-success-600"}>
                {todayUnavailable ? "Not working" : "Working"}
              </span>
              {todayUnavailable && data?.today?.reason ? ` · ${data.today.reason}` : ""}
            </p>
          </div>
        </div>

      </div>

      <div className="grid gap-5 px-5 py-4 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="hr-label" htmlFor="bio-date">Date</label>
            <input
              id="bio-date"
              type="date"
              min={todayStr()}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="hr-input"
            />
          </div>

          <div className="flex gap-6">
            {[
              [false, "Working"],
              [true, "Not working"],
            ].map(([value, label]) => (
              <label key={label} className="flex cursor-pointer items-center gap-2 text-sm text-text-primary">
                <input
                  type="radio"
                  name="bio-status"
                  checked={unavailable === value}
                  disabled={!canEdit}
                  onChange={() => setUnavailable(value)}
                  className="accent-orange-500"
                />
                {label}
              </label>
            ))}
          </div>

          {unavailable && (
            <div>
              <label className="hr-label" htmlFor="bio-reason">Reason</label>
              <input
                id="bio-reason"
                value={reason}
                maxLength={255}
                disabled={!canEdit}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Biometric device / network issue"
                className="hr-input"
              />
            </div>
          )}

          {error && <p className="text-xs font-semibold text-danger-600">{error}</p>}

          {canEdit && (
            <button type="button" onClick={save} disabled={saving || loading} className="hr-btn hr-btn-primary">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save
            </button>
          )}
          <p className="flex items-center gap-1.5 text-[11px] text-text-secondary">
            <ShieldCheck size={12} /> When "Not working" is saved, every office employee sees Punch In (HRMS) for that date. It switches back to "Working" automatically the next day.
          </p>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">Recent changes</p>
          {loading ? (
            <p className="text-xs text-text-secondary">Loading…</p>
          ) : data?.recent?.length ? (
            <ul className="divide-y divide-border-subtle rounded-lg border border-border-subtle">
              {data.recent.map((r) => (
                <li key={r.date} className="flex items-center justify-between gap-3 px-3 py-2 text-xs">
                  <span className="font-medium text-text-primary">{fmtDate(r.date)}</span>
                  <span className={r.status === "UNAVAILABLE" ? "font-semibold text-danger-600" : "text-success-600"}>
                    {r.status === "UNAVAILABLE" ? "Not working" : "Working"}
                  </span>
                  <span className="truncate text-text-secondary" title={r.reason || ""}>
                    {r.reason || "-"} · {r.updatedByName || "-"} · {fmtEpoch(r.updatedAt)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-text-secondary">No changes recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
