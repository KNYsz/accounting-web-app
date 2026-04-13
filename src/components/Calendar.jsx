import './Calendar.css';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

export default function Calendar({ year, month, getDailyTotal, getByDate, onDayClick }) {
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const startWeekday = firstDay.getDay(); // 0=Sun

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const cells = [];
  // Empty cells before first day
  for (let i = 0; i < startWeekday; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }

  return (
    <div className="calendar">
      <div className="calendar-grid calendar-header">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={`calendar-weekday${i === 0 ? ' sunday' : i === 6 ? ' saturday' : ''}`}
          >
            {w}
          </div>
        ))}
      </div>
      <div className="calendar-grid calendar-body">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="calendar-cell empty" />;
          }
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const total = getDailyTotal(dateStr);
          const expenses = getByDate(dateStr);
          const isToday = dateStr === todayStr;
          const weekday = (startWeekday + day - 1) % 7;
          const isSunday = weekday === 0;
          const isSaturday = weekday === 6;
          const hasNetActivity = total !== 0 || expenses.length > 0;

          return (
            <div
              key={dateStr}
              className={[
                'calendar-cell',
                isToday ? 'today' : '',
                isSunday ? 'sunday' : '',
                isSaturday ? 'saturday' : '',
                hasNetActivity ? 'has-expense' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onDayClick(dateStr)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onDayClick(dateStr)}
              aria-label={`${dateStr}${total !== 0 ? ` ${total > 0 ? '+' : '-'}¥${Math.abs(total).toLocaleString()}` : ''}`}
            >
              <span className="day-number">{day}</span>
              {total !== 0 && (
                <span className={`day-total${total < 0 ? ' negative' : ''}`}>
                  {total > 0 ? '+' : '-'}¥{Math.abs(total).toLocaleString()}
                </span>
              )}
              {expenses.length > 0 && (
                <span className="day-count">{expenses.length}件</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
