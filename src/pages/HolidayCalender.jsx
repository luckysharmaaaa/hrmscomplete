import usePermission from "../hooks/usePermission";
import { useMemo, useState, useCallback } from "react";
import { CalendarRange, CalendarClock, CalendarDays } from "lucide-react";
import HolidayHeader from "../components/HolidayCalender/HolidayHeader";
import HolidayFilters from "../components/HolidayCalender/HolidayFilters";
import CalendarView from "../components/HolidayCalender/CalendarView";
import UpcomingHolidays from "../components/HolidayCalender/UpcomingHolidays";
import AddHolidayModal from "../components/HolidayCalender/AddHolidayModal";
import HolidayDisclaimer from "../components/HolidayCalender/HolidayDisclaimer";
import useHolidays from "../hooks/useHolidays";
import { HOLIDAY_TYPES, getType, daysFromToday, formatShort, parseLocalDate } from "../constants/holidayTypes";

const StatCard = ({ icon: Icon, label, value, sub, bg, iconColor }) => (
  <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4 shadow-sm">
    <div className={`${bg} p-3 rounded-xl shrink-0`}>
      <Icon size={20} className={iconColor} />
    </div>
    <div className="min-w-0">
      <p className="text-2xl font-bold text-[#0F265C]">{value}</p>
      <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
      {sub}
    </div>
  </div>
);

const ALL = HOLIDAY_TYPES.map((t) => t.value);

/**
 * canManage: pass true only for HR/Admin roles, e.g.
 *   <HolidayCalendar canManage={user.role === "hr" || user.role === "admin"} />
 */
export default function HolidayCalendar() {
  const { canAdd, canEdit, canDelete } = usePermission("holiday-calendar");
  const canManage = canAdd || canEdit || canDelete;
  const { holidays, addHoliday, updateHoliday, removeHoliday } = useHolidays();
  const [drawer, setDrawer] = useState({ open: false, id: null, date: "" });
  const [activeTypes, setActiveTypes] = useState(ALL);

  // ── Filters ──
  const allOn = activeTypes.length === ALL.length;
  const toggleType = (v) =>
    setActiveTypes((prev) => (prev.length === ALL.length ? [v] : prev.includes(v) ? (prev.length === 1 ? ALL : prev.filter((x) => x !== v)) : [...prev, v]));
  const visible = useMemo(() => holidays.filter((h) => activeTypes.includes(h.type)), [holidays, activeTypes]);

  // ── Stats ──
  const now = new Date();
  const year = now.getFullYear();
  const yearCount = holidays.filter((h) => h.date.startsWith(String(year))).length;
  const monthCount = holidays.filter((h) => {
    const d = parseLocalDate(h.date);
    return d.getFullYear() === year && d.getMonth() === now.getMonth();
  }).length;
  const upcoming = holidays
    .filter((h) => daysFromToday(h.date) >= 0)
    .sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date));
  const next = upcoming[0];

  // ── Drawer handlers ──
  const editing = drawer.id ? holidays.find((h) => h.id === drawer.id) || null : null;
  const openAdd = useCallback((date = "") => setDrawer({ open: true, id: null, date }), []);
  const openEdit = useCallback((id) => setDrawer({ open: true, id, date: "" }), []);
  const close = useCallback(() => setDrawer((d) => ({ ...d, open: false })), []);
  const save = (data) => (editing ? updateHoliday(editing.id, data) : addHoliday(data));

  return (
    <div className="p-4 sm:p-6 bg-gray-50/50 min-h-[calc(100vh-64px)]">
      <div className="max-w-7xl mx-auto space-y-5">
        <HolidayHeader onAddHolidayClick={() => openAdd()} canManage={canManage} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={CalendarRange} label={`${year} Holidays`} value={yearCount} bg="bg-blue-50" iconColor="text-blue-500" />
          <StatCard icon={CalendarDays} label="This month" value={monthCount} bg="bg-emerald-50" iconColor="text-emerald-500" />
          <StatCard
            icon={CalendarClock}
            label="Upcoming"
            value={upcoming.length}
            bg="bg-orange-50"
            iconColor="text-orange-500"
            sub={
              next && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: getType(next.type).color }} />
                  <span className="text-xs font-semibold text-orange-600 truncate">Next: {next.title}</span>
                  <span className="text-xs text-gray-400 shrink-0">· {formatShort(next.date)}</span>
                </div>
              )
            }
          />
        </div>

        <HolidayFilters
          holidays={holidays}
          active={activeTypes}
          onToggle={toggleType}
          onReset={() => setActiveTypes(ALL)}
        />

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-5 items-start">
          <CalendarView
            holidays={visible}
            canManage={canManage}
            onDateClick={openAdd}
            onEventClick={canManage ? openEdit : undefined}
            onEventMove={(id, date) => updateHoliday(id, { date })}
          />
          <UpcomingHolidays holidays={visible} onSelect={canManage ? openEdit : () => {}} />
        </div>

        <HolidayDisclaimer />
      </div>

      {canManage && (
        <AddHolidayModal
          isOpen={drawer.open}
          onClose={close}
          onSave={save}
          onDelete={removeHoliday}
          holiday={editing}
          defaultDate={drawer.date}
        />
      )}
    </div>
  );
}