// ```jsx
import usePermission from "../hooks/usePermission";
import { useMemo, useState, useCallback } from "react";

import {
  CalendarRange,
  CalendarClock,
  CalendarDays,
  Plus,
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";

import HolidayFilters from "../components/HolidayCalender/HolidayFilters";
import CalendarView from "../components/HolidayCalender/CalendarView";
import UpcomingHolidays from "../components/HolidayCalender/UpcomingHolidays";
import AddHolidayModal from "../components/HolidayCalender/AddHolidayModal";
import HolidayDisclaimer from "../components/HolidayCalender/HolidayDisclaimer";

import useHolidays from "../hooks/useHolidays";

import {
  HOLIDAY_TYPES,
  getType,
  daysFromToday,
  formatShort,
  parseLocalDate,
} from "../constants/holidayTypes";

// ==========================================================
// Stat Card
// ==========================================================
const StatCard = ({
  icon: Icon,
  label,
  value,
  sub,
  bg,
  iconColor,
}) => (
  <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4 shadow-sm">
    <div className={`${bg} p-3 rounded-xl shrink-0`}>
      <Icon size={20} className={iconColor} />
    </div>

    <div className="min-w-0">
      <p className="text-2xl font-bold text-[#0F265C]">
        {value}
      </p>

      <p className="text-xs text-gray-500 font-medium mt-0.5">
        {label}
      </p>

      {sub}
    </div>
  </div>
);

const ALL = HOLIDAY_TYPES.map((t) => t.value);

export default function HolidayCalendar() {
  const {
    canAdd,
    canEdit,
    canDelete,
  } = usePermission("holiday-calendar");

  const canManage =
    canAdd || canEdit || canDelete;

  const {
    holidays,
    addHoliday,
    updateHoliday,
    removeHoliday,
  } = useHolidays();

  const [drawer, setDrawer] = useState({
    open: false,
    id: null,
    date: "",
  });

  const [activeTypes, setActiveTypes] = useState(ALL);

  // ==========================================================
  // Filters
  // ==========================================================
  const toggleType = (value) => {
    setActiveTypes((prev) =>
      prev.length === ALL.length
        ? [value]
        : prev.includes(value)
        ? prev.length === 1
          ? ALL
          : prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const visible = useMemo(
    () =>
      holidays.filter((holiday) =>
        activeTypes.includes(holiday.type)
      ),
    [holidays, activeTypes]
  );

  // ==========================================================
  // Stats
  // ==========================================================
  const now = new Date();
  const year = now.getFullYear();

  const yearCount = holidays.filter((holiday) =>
    holiday.date.startsWith(String(year))
  ).length;

  const monthCount = holidays.filter((holiday) => {
    const date = parseLocalDate(holiday.date);

    return (
      date.getFullYear() === year &&
      date.getMonth() === now.getMonth()
    );
  }).length;

  const upcoming = holidays
    .filter(
      (holiday) => daysFromToday(holiday.date) >= 0
    )
    .sort(
      (a, b) =>
        parseLocalDate(a.date) -
        parseLocalDate(b.date)
    );

  const next = upcoming[0];

  // ==========================================================
  // Drawer Handlers
  // ==========================================================
  const editing = drawer.id
    ? holidays.find(
        (holiday) => holiday.id === drawer.id
      ) || null
    : null;

  const openAdd = useCallback(
    (date = "") =>
      setDrawer({
        open: true,
        id: null,
        date,
      }),
    []
  );

  const openEdit = useCallback(
    (id) =>
      setDrawer({
        open: true,
        id,
        date: "",
      }),
    []
  );

  const close = useCallback(
    () =>
      setDrawer((current) => ({
        ...current,
        open: false,
      })),
    []
  );

  const save = (data) =>
    editing
      ? updateHoliday(editing.id, data)
      : addHoliday(data);

  return (
    <div className="space-y-6">
      {/* ========================================================
          Common Page Header
      ======================================================== */}
      <PageHeader
        icon={CalendarRange}
        title="Holiday Calendar"
        breadcrumbs={[
          { label: "Employees" },
          { label: "Holiday Calendar" },
        ]}
        actions={
          canAdd && (
            <button
              type="button"
              onClick={() => openAdd()}
              className="hr-btn hr-btn-primary"
            >
              <Plus size={16} />
              Add Holiday
            </button>
          )
        }
      />

      {/* ========================================================
          Holiday Statistics
      ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={CalendarRange}
          label={`${year} Holidays`}
          value={yearCount}
          bg="bg-blue-50"
          iconColor="text-blue-500"
        />

        <StatCard
          icon={CalendarDays}
          label="This month"
          value={monthCount}
          bg="bg-emerald-50"
          iconColor="text-emerald-500"
        />

        <StatCard
          icon={CalendarClock}
          label="Upcoming"
          value={upcoming.length}
          bg="bg-orange-50"
          iconColor="text-orange-500"
          sub={
            next && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    backgroundColor:
                      getType(next.type).color,
                  }}
                />

                <span className="text-xs font-semibold text-orange-600 truncate">
                  Next: {next.title}
                </span>

                <span className="text-xs text-gray-400 shrink-0">
                  · {formatShort(next.date)}
                </span>
              </div>
            )
          }
        />
      </div>

      {/* ========================================================
          Holiday Filters
      ======================================================== */}
      <HolidayFilters
        holidays={holidays}
        active={activeTypes}
        onToggle={toggleType}
        onReset={() => setActiveTypes(ALL)}
      />

      {/* ========================================================
          Calendar + Upcoming Holidays
      ======================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-5 items-start">
        <CalendarView
          holidays={visible}
          canManage={canManage}
          onDateClick={openAdd}
          onEventClick={
            canManage ? openEdit : undefined
          }
          onEventMove={(id, date) =>
            updateHoliday(id, { date })
          }
        />

        <UpcomingHolidays
          holidays={visible}
          onSelect={
            canManage ? openEdit : () => {}
          }
        />
      </div>

      {/* ========================================================
          Disclaimer
      ======================================================== */}
      <HolidayDisclaimer />

      {/* ========================================================
          Add / Edit Holiday Modal
      ======================================================== */}
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
// ```
