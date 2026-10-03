import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Copy,
  XCircle,
  Loader2,
  History,
  ArrowLeft,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  previewAttendanceImport,
  importAttendance,
  getImportHistory,
  getImportErrors,
} from "../../services/attendanceImportApi";

const ACCEPT = ".xlsx,.xls,.csv";
const MAX_MB = 10;

const STATUS_STYLE = {
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  COMPLETED_WITH_ERRORS: "bg-amber-50 text-amber-700 border-amber-100",
  FAILED: "bg-red-50 text-red-600 border-red-100",
  PROCESSING: "bg-blue-50 text-blue-600 border-blue-100",
};

const fmtEpoch = (v) =>
  v
    ? new Date(Number(v) * 1000).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

const Tile = ({ label, value, cls }) => (
  <div className={`rounded-xl border px-3.5 py-3 ${cls}`}>
    <p className="text-[11px] font-semibold opacity-80">{label}</p>
    <p className="text-xl font-bold mt-0.5 tabular-nums">{value ?? 0}</p>
  </div>
);

const ErrorTable = ({ errors, truncated }) => (
  <div className="border border-gray-100 rounded-xl overflow-hidden">
    <div className="max-h-64 overflow-auto">
      <table className="w-full text-xs">
        <thead className="bg-gray-50 sticky top-0">
          <tr className="text-left text-gray-500">
            <th className="px-3 py-2 font-semibold">Row</th>
            <th className="px-3 py-2 font-semibold">Employee code</th>
            <th className="px-3 py-2 font-semibold">Date</th>
            <th className="px-3 py-2 font-semibold">Time</th>
            <th className="px-3 py-2 font-semibold">Error</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {errors.map((e, i) => (
            <tr key={`${e.rowNumber}-${i}`}>
              <td className="px-3 py-2 tabular-nums text-gray-500">{e.rowNumber}</td>
              <td className="px-3 py-2 text-gray-700">{e.employeeCode || "-"}</td>
              <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{e.punchDate || "-"}</td>
              <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{e.punchTime || "-"}</td>
              <td className="px-3 py-2 text-red-600 font-medium">{e.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {truncated && (
      <p className="px-3 py-2 text-[11px] text-gray-400 border-t border-gray-100">
        Showing the first rows only. Open the import in History to page through all errors.
      </p>
    )}
  </div>
);

const ImportAttendanceDrawer = ({ open, onClose, onImported }) => {
  const inputRef = useRef(null);

  const [tab, setTab] = useState("import"); // import | history
  const [phase, setPhase] = useState("idle"); // idle | validating | preview | importing | done
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [errorsView, setErrorsView] = useState(null); // { id, rows }

  const busy = phase === "validating" || phase === "importing";

  const reset = useCallback(() => {
    setTab("import");
    setPhase("idle");
    setFile(null);
    setProgress(0);
    setPreview(null);
    setResult(null);
    setError("");
    setErrorsView(null);
  }, []);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await getImportHistory(1, 20);
      setHistory(res?.data || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load import history");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && tab === "history") loadHistory();
  }, [open, tab, loadHistory]);

  const pickFile = (f) => {
    if (!f) return;
    const ok = /\.(xlsx|xls|csv)$/i.test(f.name);
    if (!ok) return setError("Only .xlsx, .xls and .csv files are supported.");
    if (f.size > MAX_MB * 1024 * 1024) return setError(`File is larger than ${MAX_MB} MB.`);
    if (f.size === 0) return setError("The file is empty.");
    setError("");
    setFile(f);
    setPreview(null);
    setResult(null);
    setPhase("idle");
  };

  const handleValidate = async () => {
    if (!file) return;
    setError("");
    setProgress(0);
    setPhase("validating");
    try {
      const data = await previewAttendanceImport(file, setProgress);
      setPreview(data);
      setPhase("preview");
    } catch (e) {
      setError(e?.response?.data?.message || "Could not validate the file.");
      setPhase("idle");
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setError("");
    setProgress(0);
    setPhase("importing");
    try {
      const data = await importAttendance(file, setProgress);
      setResult(data);
      setPhase("done");
      if (data.status === "COMPLETED") toast.success("Attendance imported");
      else toast.warn("Attendance imported with some errors");
      onImported?.();
    } catch (e) {
      setError(e?.response?.data?.message || "Import failed. No attendance was changed.");
      setPhase("preview");
    }
  };

  const openErrors = async (id) => {
    try {
      const res = await getImportErrors(id, 1, 200);
      setErrorsView({ id, rows: res?.data || [], total: res?.pagination?.total || 0 });
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load errors");
    }
  };

  const nothingToImport = preview && preview.validRecords === 0;

  return (
    <>
      {open && (
        <div
          onClick={() => !busy && onClose()}
          className="fixed inset-0 bg-black/40 z-[999] backdrop-blur-[1px]"
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[640px] bg-white z-[1000] transition-transform duration-300 shadow-2xl flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-orange-50 text-orange-500 rounded-xl border border-orange-100/30">
              <Upload size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0F265C]">Import Attendance</h2>
              <p className="text-xs text-gray-400 mt-0.5">Upload the gate machine export</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition disabled:opacity-40"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* TABS */}
        <div className="px-5 pt-3 flex gap-1 border-b border-gray-100">
          {[
            ["import", "Import", FileSpreadsheet],
            ["history", "History", History],
          ].map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              disabled={busy}
              onClick={() => {
                setTab(key);
                setErrorsView(null);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold border-b-2 -mb-px transition disabled:opacity-50 ${
                tab === key
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {tab === "import" && (
            <>
              {/* DROP ZONE */}
              {phase !== "done" && (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    if (!busy) pickFile(e.dataTransfer.files?.[0]);
                  }}
                  className={`rounded-xl border-2 border-dashed px-6 py-8 text-center transition ${
                    dragging ? "border-orange-400 bg-orange-50/50" : "border-gray-200 bg-gray-50/40"
                  }`}
                >
                  <FileSpreadsheet size={28} className="mx-auto text-gray-300" />

                  {file ? (
                    <div className="mt-3">
                      <p className="text-sm font-semibold text-[#0F265C] break-all">{file.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-gray-500">
                      Drag and drop an Excel or CSV file here
                    </p>
                  )}

                  <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPT}
                    className="hidden"
                    onChange={(e) => {
                      pickFile(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => inputRef.current?.click()}
                    className="mt-4 px-4 py-2 border border-gray-200 bg-white text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    {file ? "Choose a different file" : "Choose file"}
                  </button>

                  <p className="mt-3 text-[11px] text-gray-400">
                    .xlsx, .xls or .csv, up to {MAX_MB} MB
                  </p>
                </div>
              )}

              {/* PROGRESS */}
              {busy && (
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                    <span className="inline-flex items-center gap-1.5">
                      <Loader2 size={13} className="animate-spin" />
                      {phase === "validating" ? "Validating file…" : "Importing attendance…"}
                    </span>
                    <span className="tabular-nums">{progress < 100 ? `${progress}%` : "Processing"}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* ERROR */}
              {error && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl">
                  <XCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600 font-medium">{error}</p>
                </div>
              )}

              {/* PREVIEW SUMMARY */}
              {phase === "preview" && preview && (
                <>
                  <div>
                    <h3 className="text-sm font-bold text-[#0F265C] mb-2.5">Import summary</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <Tile label="Total records" value={preview.totalRecords} cls="bg-gray-50 border-gray-100 text-gray-700" />
                      <Tile label="Valid records" value={preview.validRecords} cls="bg-emerald-50 border-emerald-100 text-emerald-700" />
                      <Tile label="Duplicate records" value={preview.duplicateRecords} cls="bg-amber-50 border-amber-100 text-amber-700" />
                      <Tile label="Invalid records" value={preview.invalidRecords} cls="bg-red-50 border-red-100 text-red-600" />
                    </div>
                    {preview.validRecords > 0 && (
                      <p className="text-xs text-gray-400 mt-2.5">
                        {preview.employeesAffected} employee{preview.employeesAffected === 1 ? "" : "s"} ·{" "}
                        {preview.dateFrom === preview.dateTo
                          ? preview.dateFrom
                          : `${preview.dateFrom} to ${preview.dateTo}`}
                      </p>
                    )}
                  </div>

                  {preview.invalidRecords > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-[#0F265C] mb-2.5">Rows that will be skipped</h3>
                      <ErrorTable errors={preview.errors} truncated={preview.errorsTruncated} />
                    </div>
                  )}

                  {nothingToImport && (
                    <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-100 rounded-xl">
                      <AlertCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700">
                        There are no new valid punches in this file. Fix the errors above and upload again.
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* RESULT */}
              {phase === "done" && result && (
                <>
                  <div
                    className={`flex items-start gap-2.5 p-3.5 rounded-xl border ${
                      result.status === "COMPLETED"
                        ? "bg-emerald-50 border-emerald-100"
                        : "bg-amber-50 border-amber-100"
                    }`}
                  >
                    {result.status === "COMPLETED" ? (
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm font-bold text-[#0F265C]">
                        {result.status === "COMPLETED" ? "Import completed" : "Import completed with errors"}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {result.attendanceCreated} attendance records created, {result.attendanceUpdated} updated
                        {result.attendanceSkipped > 0 &&
                          `, ${result.attendanceSkipped} left unchanged because they were regularized or edited manually`}
                        .
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <Tile label="Total records" value={result.totalRecords} cls="bg-gray-50 border-gray-100 text-gray-700" />
                    <Tile label="Imported" value={result.successRecords} cls="bg-emerald-50 border-emerald-100 text-emerald-700" />
                    <Tile label="Duplicates" value={result.duplicateRecords} cls="bg-amber-50 border-amber-100 text-amber-700" />
                    <Tile label="Failed" value={result.failedRecords} cls="bg-red-50 border-red-100 text-red-600" />
                  </div>

                  {result.failedRecords > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-[#0F265C] mb-2.5">Failed records</h3>
                      <ErrorTable errors={result.errors} truncated={result.errorsTruncated} />
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* HISTORY */}
          {tab === "history" && !errorsView && (
            <>
              {historyLoading ? (
                <p className="py-10 text-center text-sm text-gray-400">Loading…</p>
              ) : history.length === 0 ? (
                <div className="py-14 text-center">
                  <Copy size={22} className="mx-auto text-gray-300" />
                  <p className="text-sm font-semibold text-gray-500 mt-3">No imports yet</p>
                  <p className="text-xs text-gray-400 mt-0.5">Imported files will be listed here.</p>
                </div>
              ) : (
                <div className="border border-gray-100 rounded-xl overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50">
                      <tr className="text-left text-gray-500">
                        <th className="px-3 py-2 font-semibold">File</th>
                        <th className="px-3 py-2 font-semibold">Uploaded</th>
                        <th className="px-3 py-2 font-semibold text-right">Total</th>
                        <th className="px-3 py-2 font-semibold text-right">Imported</th>
                        <th className="px-3 py-2 font-semibold text-right">Dup.</th>
                        <th className="px-3 py-2 font-semibold text-right">Failed</th>
                        <th className="px-3 py-2 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {history.map((h) => (
                        <tr key={h.id}>
                          <td className="px-3 py-2.5 text-gray-700 font-medium max-w-[160px] truncate" title={h.fileName}>
                            {h.fileName}
                          </td>
                          <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">
                            {fmtEpoch(h.uploadedAt)}
                            <div className="text-[10px] text-gray-400">{h.uploadedByName || "-"}</div>
                          </td>
                          <td className="px-3 py-2.5 text-right tabular-nums">{h.totalRecords}</td>
                          <td className="px-3 py-2.5 text-right tabular-nums text-emerald-700">{h.successRecords}</td>
                          <td className="px-3 py-2.5 text-right tabular-nums text-amber-700">{h.duplicateRecords}</td>
                          <td className="px-3 py-2.5 text-right tabular-nums">
                            {h.failedRecords > 0 ? (
                              <button
                                type="button"
                                onClick={() => openErrors(h.id)}
                                className="text-red-600 font-semibold underline underline-offset-2"
                              >
                                {h.failedRecords}
                              </button>
                            ) : (
                              0
                            )}
                          </td>
                          <td className="px-3 py-2.5">
                            <span
                              title={h.errorMessage || ""}
                              className={`inline-flex px-2 py-0.5 rounded-md border text-[10px] font-semibold whitespace-nowrap ${
                                STATUS_STYLE[h.status] || STATUS_STYLE.PROCESSING
                              }`}
                            >
                              {String(h.status).replace(/_/g, " ").toLowerCase().replace(/^./, (c) => c.toUpperCase())}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {tab === "history" && errorsView && (
            <>
              <button
                type="button"
                onClick={() => setErrorsView(null)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft size={13} />
                Back to history
              </button>
              <h3 className="text-sm font-bold text-[#0F265C]">
                Failed records for import #{errorsView.id} ({errorsView.total})
              </h3>
              <ErrorTable errors={errorsView.rows} truncated={errorsView.total > errorsView.rows.length} />
            </>
          )}
        </div>

        {/* FOOTER */}
        {tab === "import" && (
          <div className="bg-white border-t border-gray-100 px-5 py-4 flex items-center justify-end gap-3">
            {phase === "done" ? (
              <>
                <button
                  type="button"
                  onClick={reset}
                  className="px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Import another file
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition shadow-sm shadow-orange-200"
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={phase === "preview" ? () => setPhase("idle") : onClose}
                  disabled={busy}
                  className="px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>

                {phase === "preview" ? (
                  <button
                    type="button"
                    onClick={handleImport}
                    disabled={busy || nothingToImport}
                    className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition shadow-sm shadow-orange-200"
                  >
                    <Upload size={15} />
                    Import attendance
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleValidate}
                    disabled={!file || busy}
                    className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition shadow-sm shadow-orange-200"
                  >
                    {phase === "validating" && <Loader2 size={15} className="animate-spin" />}
                    Validate file
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ImportAttendanceDrawer;