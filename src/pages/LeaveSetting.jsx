import React, { useState, useEffect, useRef } from "react";
import {
  Loader2,
  MoreVertical,
  Pencil,
  Power,
  Search,
  SlidersHorizontal,
  Plus,
  CalendarDays,
} from "lucide-react";
import { FiChevronRight } from "react-icons/fi";
import LeaveSettingModal from "../components/LeaveSettingModal";
import { getLeaveSettings, updateLeaveSetting } from "../services/leaveService";

// Rotating accent palette — border + avatar per card, cycled by index
const PALETTE = [
  { border: "border-l-yellow-400", bg: "bg-yellow-400" },
  { border: "border-l-pink-500", bg: "bg-pink-500" },
  { border: "border-l-lime-600", bg: "bg-lime-600" },
  { border: "border-l-gray-800", bg: "bg-gray-800" },
  { border: "border-l-blue-500", bg: "bg-blue-500" },
  { border: "border-l-orange-500", bg: "bg-orange-500" },
  { border: "border-l-purple-500", bg: "bg-purple-500" },
];

const FILTER_STATUS_OPTIONS = ["All", "Active", "Inactive"];
const FILTER_PAYMENT_OPTIONS = ["All", "Paid", "Unpaid"];

const FilterDropdown = ({ statusFilter, setStatusFilter, paymentFilter, setPaymentFilter }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const activeCount = (statusFilter !== "All" ? 1 : 0) + (paymentFilter !== "All" ? 1 : 0);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3.5 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 transition"
      >
        <SlidersHorizontal size={14} />
        Filter
        {activeCount > 0 && (
          <span className="ml-1 bg-orange-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-30 p-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1.5">Status</p>
            <div className="flex gap-1.5">
              {FILTER_STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setStatusFilter(opt)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                    statusFilter === opt
                      ? "bg-orange-500 text-white border-orange-500"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1.5">Payment</p>
            <div className="flex gap-1.5">
              {FILTER_PAYMENT_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setPaymentFilter(opt)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                    paymentFilter === opt
                      ? "bg-orange-500 text-white border-orange-500"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          {activeCount > 0 && (
            <button
              onClick={() => {
                setStatusFilter("All");
                setPaymentFilter("All");
              }}
              className="text-xs text-orange-500 font-medium hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};


const LeaveTypeCard = ({ leave, color, onEdit, onToggle }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const isActive = leave.status === "1";
  const isPaid = Number(leave.isPaid) === 1;

  return (
    <div
      className={`relative bg-white border border-gray-200 ${color.border} border-l-4 rounded-lg px-5 py-4 shadow-sm hover:shadow-md transition`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full ${color.bg} flex items-center justify-center text-white text-sm font-bold shrink-0`}
          >
            {leave.leaveCode?.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm leading-tight">
              {leave.leaveName}
            </p>
            {!isActive && (
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
                Inactive
              </span>
            )}
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded transition"
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-100 rounded-lg shadow-lg z-20 py-1">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(leave);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Pencil size={14} /> Edit
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onToggle(leave);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Power size={14} /> {isActive ? "Deactivate" : "Activate"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
        <div>
          <p className="text-gray-400 font-medium mb-0.5">Payment</p>
          <p className={`font-semibold ${isPaid ? "text-green-600" : "text-gray-500"}`}>
            {isPaid ? "Paid" : "Unpaid"}
          </p>
        </div>
        <div>
          <p className="text-gray-400 font-medium mb-0.5">Total Days</p>
          <p className="font-semibold text-gray-700">{Number(leave.maxBalance)}</p>
        </div>
      </div>
    </div>
  );
};

const LeaveSettings = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  const fetchSettings = () => {
    setLoading(true);
    getLeaveSettings()
      .then(setLeaveTypes)
      .catch(() => setLeaveTypes([]))
      .finally(() => setLoading(false));
  };

  useEffect(fetchSettings, []);

  const handleToggle = async (leave) => {
    const nextStatus = leave.status === "1" ? "0" : "1";
    setLeaveTypes((prev) =>
      prev.map((item) => (item.id === leave.id ? { ...item, status: nextStatus } : item)),
    );
    try {
      await updateLeaveSetting(leave.id, { status: nextStatus });
    } catch {
      setLeaveTypes((prev) =>
        prev.map((item) => (item.id === leave.id ? { ...item, status: leave.status } : item)),
      );
    }
  };

  const filtered = leaveTypes.filter((l) => {
    const matchesSearch = l.leaveName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" ? l.status === "1" : l.status !== "1");
    const matchesPayment =
      paymentFilter === "All" ||
      (paymentFilter === "Paid" ? Number(l.isPaid) === 1 : Number(l.isPaid) !== 1);
    return matchesSearch && matchesStatus && matchesPayment;
  });
  const paginated = filtered;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Leave Types</h1>
          <nav className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
            <span>Leave</span>
            <FiChevronRight size={12} />
            <span className="text-gray-600 font-medium">Leave Types</span>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 bg-white w-56">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              placeholder="Search"
              className="outline-none text-sm flex-1 placeholder-gray-400 bg-transparent"
            />
          </div>
          <FilterDropdown
            statusFilter={statusFilter}
            setStatusFilter={(v) => {
              setStatusFilter(v);
            }}
            paymentFilter={paymentFilter}
            setPaymentFilter={(v) => {
              setPaymentFilter(v);
            }}
          />
          <button
            onClick={() => {
              setSelectedLeave(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition shadow-sm"
          >
            <Plus size={15} />
            Create
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-gray-400" /> Unpaid
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500" /> Paid
        </span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading leave types...</span>
        </div>
      ) : paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2 bg-white border border-gray-100 rounded-xl">
          <CalendarDays size={28} className="text-gray-300" />
          <p className="text-sm">No leave types found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginated.map((leave, i) => (
            <LeaveTypeCard
              key={leave.id}
              leave={leave}
              color={PALETTE[i % PALETTE.length]}
              onEdit={(l) => {
                setSelectedLeave(l);
                setModalOpen(true);
              }}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Drawer */}
      <LeaveSettingModal
        open={modalOpen}
        leave={selectedLeave}
        onClose={() => {
          setModalOpen(false);
          setSelectedLeave(null);
        }}
        onSaved={fetchSettings}
      />
    </div>
  );
};

export default LeaveSettings;