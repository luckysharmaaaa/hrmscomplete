import { useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { getType } from "../../constants/holidayTypes";
import "./CalendarOverrides.css";

export default function CalendarView({
  holidays,
  canManage = false,
  onDateClick,
  onEventClick,
  onEventMove,
}) {
  const events = useMemo(
    () =>
      holidays.map((h) => ({
        id: h.id,
        title: h.title,
        start: h.date,
        allDay: true,
        color: getType(h.type).color,
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
        editable={canManage}
        eventStartEditable={canManage}
        eventDurationEditable={false}
        dayCellClassNames={(arg) =>
          arg.date.getDay() === 0 || arg.date.getDay() === 6 ? ["fc-weekend-cell"] : []
        }
        dateClick={(info) => canManage && onDateClick?.(info.dateStr)}
        eventClick={(info) => onEventClick?.(info.event.id)}
        eventDrop={(info) => {
          // startStr is "YYYY-MM-DD" for all-day events (no timezone shift)
          onEventMove?.(info.event.id, info.event.startStr.slice(0, 10));
        }}
      />
    </div>
  );
}