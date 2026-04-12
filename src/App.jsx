import { useState } from 'react';
import Calendar from './components/Calendar';
import ExpenseModal from './components/ExpenseModal';
import MonthlySummaryTable from './components/MonthlySummaryTable';
import { useExpenses } from './hooks/useExpenses';
import './App.css';

const MONTHS_JA = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

export default function App() {
  const today = new Date();
  const [view, setView] = useState('calendar'); // 'calendar' | 'summary'
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(null);

  const {
    addExpense,
    deleteExpense,
    getByDate,
    getDailyTotal,
    getMonthlyTotal,
    getMonthlyCategoryTotals,
  } = useExpenses();

  function prevMonth() {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  function goToday() {
    setYear(today.getFullYear());
    setMonth(today.getMonth() + 1);
  }

  const monthlyTotal = getMonthlyTotal(year, month);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">💰 家計簿</h1>
          <span className="app-year">{year}年度</span>
        </div>
        <nav className="app-nav">
          <button
            className={`nav-btn${view === 'calendar' ? ' active' : ''}`}
            onClick={() => setView('calendar')}
          >
            📅 カレンダー
          </button>
          <button
            className={`nav-btn${view === 'summary' ? ' active' : ''}`}
            onClick={() => setView('summary')}
          >
            📊 月別サマリー
          </button>
        </nav>
      </header>

      <main className="app-main">
        {view === 'calendar' && (
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
              onDayClick={setSelectedDate}
            />
            <p className="calendar-hint">日付をクリックして支出を記録できます</p>
          </>
        )}

        {view === 'summary' && (
          <div className="summary-year-nav">
            <button className="icon-btn" onClick={() => setYear((y) => y - 1)} aria-label="前年">‹</button>
            <MonthlySummaryTable
              year={year}
              getMonthlyCategoryTotals={getMonthlyCategoryTotals}
              getMonthlyTotal={getMonthlyTotal}
            />
            <button className="icon-btn" onClick={() => setYear((y) => y + 1)} aria-label="翌年">›</button>
          </div>
        )}
      </main>

      {selectedDate && (
        <ExpenseModal
          date={selectedDate}
          expenses={getByDate(selectedDate)}
          onAdd={addExpense}
          onDelete={deleteExpense}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}
