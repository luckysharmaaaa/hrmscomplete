import { useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { getType } from "../../constants/holidayTypes";
import "./CalendarOverrides.css";

export default function CalendarView({
  holidays,
  canAdd = false, // click an empty day -> add
  canEdit = false, // drag & drop to move
  canOpen = false, // click a holiday -> open drawer (edit / delete)
  onDateClick,
  onEventClick,
  onEventMove,
}) {
  const events = useMemo(
    () =>
      holidays.map((h) => ({
        id: String(h.id),
        title: h.title,
        start: h.date,
        allDay: true,
        color: getType(h.type).color,
        extendedProps: { typeLabel: getType(h.type).label },
      })),
    [holidays],
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 calendar-wrapper">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "title",
          center: "",
          right: "prev,today,next dayGridMonth,timeGridWeek",
        }}
        height="auto"
        events={events}
        dayMaxEvents={3}
        fixedWeekCount={false}
        editable={canEdit}
        eventStartEditable={canEdit}
        eventDurationEditable={false}
        dayCellClassNames={(arg) =>
          arg.date.getDay() === 0 || arg.date.getDay() === 6 ? ["fc-weekend-cell"] : []
        }
        eventDidMount={(info) => {
          // native tooltip: "Diwali · Company Holiday"
          info.el.title = `${info.event.title} · ${info.event.extendedProps.typeLabel}`;
        }}
        dateClick={(info) => canAdd && onDateClick?.(info.dateStr)}
        eventClick={(info) => canOpen && onEventClick?.(info.event.id)}
        eventDrop={(info) => {
          // startStr is "YYYY-MM-DD" for all-day events (no timezone shift)
          Promise.resolve(onEventMove?.(info.event.id, info.event.startStr.slice(0, 10))).catch(
            () => info.revert(), // API failed -> snap the event back
          );
        }}
      />
    </div>
  );
}