import Calendar from '../components/Calendar';

const MONTHS_JA = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

export default function CalendarPage({
  year,
  month,
  monthlyTotal,
  prevMonth,
  nextMonth,
  goToday,
  getDailyTotal,
  getByDate,
  onDayClick,
}) {
  return (
    <>
      <div className="month-nav">
        <button className="icon-btn" onClick={prevMonth} aria-label="前月">‹</button>
        <div className="month-title">
          <span className="month-label">{year}年 {MONTHS_JA[month - 1]}</span>
          {monthlyTotal > 0 && (
            <span className="month-total">今月の合計: ¥{monthlyTotal.toLocaleString()}</span>
          )}
        </div>
        <button className="icon-btn" onClick={nextMonth} aria-label="翌月">›</button>
        <button className="today-btn" onClick={goToday}>今日</button>
      </div>
      <Calendar
        year={year}
        month={month}
        getDailyTotal={getDailyTotal}
        getByDate={getByDate}
        onDayClick={onDayClick}
      />
      <p className="calendar-hint">日付をクリックして支出を記録できます</p>
    </>
  );
}
