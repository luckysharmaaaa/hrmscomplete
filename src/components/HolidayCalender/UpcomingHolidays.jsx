import { Palmtree } from "lucide-react";
import { getType, formatShort, daysFromToday, parseLocalDate } from "../../constants/holidayTypes";

const when = (n) => (n === 0 ? "Today" : n === 1 ? "Tomorrow" : `in ${n} days`);

export default function UpcomingHolidays({ holidays, onSelect, limit = 6 }) {
  const list = holidays
    .filter((h) => daysFromToday(h.date) >= 0)
    .sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date))
    .slice(0, limit);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
      <h3 className="text-base font-bold text-[#0F265C] mb-4">Upcoming holidays</h3>

      {list.length === 0 ? (
        <div className="text-center py-8">
          <Palmtree size={28} className="mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">No upcoming holidays. Add one to see it here.</p>
        </div>
      ) : (
        <ul className="space-y-1">
          {list.map((h) => {
            const t = getType(h.type);
            const n = daysFromToday(h.date);
            return (
              <li key={h.id}>
                <button
                  type="button"
                  onClick={() => onSelect(h.id)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 text-left transition-colors"
                >
                  <span
                    className="w-1 self-stretch rounded-full shrink-0"
                    style={{ backgroundColor: t.color }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-gray-800 truncate">{h.title}</span>
                    <span className="block text-xs text-gray-500">
                      {formatShort(h.date)} · {t.label}
                    </span>
                  </span>
                  <span className={`text-xs font-semibold shrink-0 ${n <= 7 ? "text-orange-600" : "text-gray-400"}`}>
                    {when(n)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}