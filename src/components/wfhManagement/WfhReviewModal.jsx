import React from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { formatRange } from "./wfhData";

// action: "APPROVED" | "REJECTED"; item: the row being reviewed
export default function WfhReviewModal({ open, action, item, onClose, onConfirm }) {
  const [comment, setComment] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const [prevOpen, setPrevOpen] = React.useState(open);
  const [prevItem, setPrevItem] = React.useState(item);
  if (open !== prevOpen || item !== prevItem) {
    setPrevOpen(open);
    setPrevItem(item);
    if (open) {
      setComment("");
      setSaving(false);
    }
  }

  if (!open || !item) return null;
  const approving = action === "APPROVED";

  const confirm = async () => {
    setSaving(true);
    try {
      await onConfirm(item.id, action, comment);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={saving ? undefined : onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
      >
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl ${approving ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
            {approving ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0F265C]">
              {approving ? "Approve request" : "Reject request"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {item.name} · {formatRange(item.startDate, item.endDate)}
            </p>
          </div>
        </div>

        <label className="block text-sm font-semibold text-gray-700 mt-5 mb-2">
          Comment <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          rows={3}
          maxLength={500}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={approving ? "Add a note for the employee…" : "Tell the employee why this was rejected…"}
          className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition resize-none"
        />

        <div className="flex justify-end gap-3 mt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 bg-white transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={saving}
            className={`px-5 py-2.5 text-white rounded-lg text-sm font-semibold transition shadow-sm inline-flex items-center gap-2 disabled:opacity-60 ${
              approving ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {saving && <Loader2 size={15} className="animate-spin" />}
            {approving ? "Approve" : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}