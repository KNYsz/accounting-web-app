import { useState } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import ExpenseModal from './components/ExpenseModal';
import CalendarPage from './pages/CalendarPage';
import SummaryPage from './pages/SummaryPage';
import { useExpenses } from './hooks/useExpenses';
import './App.css';

const BUDGET_STORAGE_KEY = 'accounting_web_app_budgets_by_year';
const MIN_YEAR = 2026;
const MIN_MONTH = 4;

function loadBudgetsByYear() {
  try {
    const raw = localStorage.getItem(BUDGET_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveBudgetsByYear(budgetsByYear) {
  localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budgetsByYear));
}

export default function App() {
  const today = new Date();
  const [year, setYear] = useState(Math.max(today.getFullYear(), MIN_YEAR));
  const [month, setMonth] = useState(
    today.getFullYear() < MIN_YEAR ? MIN_MONTH : today.getMonth() + 1
  );
  const [selectedDate, setSelectedDate] = useState(null);
  const [budgetsByYear, setBudgetsByYear] = useState(loadBudgetsByYear);
  const [budgetInput, setBudgetInput] = useState('');

  const {
    addExpense,
    deleteExpense,
    getByDate,
    getDailyTotal,
    getMonthlyTotal,
    getMonthlyCategoryTotals,
  } = useExpenses();

  function prevMonth() {
    if (year === MIN_YEAR && month === MIN_MONTH) {
      return;
    }

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
    if (today.getFullYear() < MIN_YEAR) {
      setYear(MIN_YEAR);
      setMonth(MIN_MONTH);
      return;
    }

    setYear(today.getFullYear());
    setMonth(today.getMonth() + 1);
  }

  function handleBudgetSave(e) {
    e.preventDefault();
    const parsed = parseInt(budgetInput, 10);
    if (!parsed || parsed <= 0) {
      return;
    }

    setBudgetsByYear((prev) => {
      const next = { ...prev, [fiscalYear]: parsed };
      saveBudgetsByYear(next);
      return next;
    });
    setBudgetInput('');
  }

  const monthlyTotal = getMonthlyTotal(year, month);
  const fiscalYear = month >= 4 ? year : year - 1;
  const fiscalSpentFromStartYear = Array.from({ length: 9 }, (_, i) => getMonthlyTotal(fiscalYear, i + 4)).reduce((sum, value) => sum + value, 0);
  const fiscalSpentFromNextYear = Array.from({ length: 3 }, (_, i) => getMonthlyTotal(fiscalYear + 1, i + 1)).reduce((sum, value) => sum + value, 0);
  const fiscalSpent = fiscalSpentFromStartYear + fiscalSpentFromNextYear;
  const fiscalBudget = budgetsByYear[fiscalYear] || 0;
  const remainingBudget = fiscalBudget - fiscalSpent;
  const hasBudget = fiscalBudget > 0;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">💰 家計簿</h1>
          <span className="app-year">{fiscalYear}年度</span>
        </div>
        <nav className="app-nav">
          <NavLink
            className={({ isActive }) => `nav-btn${isActive ? ' active' : ''}`}
            to="/calendar"
          >
            📅 カレンダー
          </NavLink>
          <NavLink
            className={({ isActive }) => `nav-btn${isActive ? ' active' : ''}`}
            to="/summary"
          >
            📊 月別サマリー
          </NavLink>
        </nav>
      </header>

      <section className="budget-panel" aria-label="年度予算">
        <div className="budget-info">
          <p className="budget-title">{fiscalYear}年度 会計費管理</p>
          <p className="budget-meta">
            期間: <strong>{fiscalYear}年4月〜{fiscalYear + 1}年3月</strong>
            {' / '}
            使用額: <strong>¥{fiscalSpent.toLocaleString()}</strong>
            {' / '}
            予算: <strong>{hasBudget ? `¥${fiscalBudget.toLocaleString()}` : '未入力'}</strong>
          </p>
          {hasBudget && (
            <p className={`budget-remaining${remainingBudget < 0 ? ' is-over' : ''}`}>
              残り予算: {remainingBudget >= 0 ? `¥${remainingBudget.toLocaleString()}` : `-¥${Math.abs(remainingBudget).toLocaleString()}`}
            </p>
          )}
        </div>
        <form className="budget-form" onSubmit={handleBudgetSave}>
          <label htmlFor="annual-budget" className="budget-label">{fiscalYear}年度予算</label>
          <input
            id="annual-budget"
            className="budget-input"
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            placeholder="例: 600000"
            value={budgetInput}
            onChange={(e) => setBudgetInput(e.target.value)}
          />
          <button className="budget-save-btn" type="submit">保存</button>
        </form>
      </section>

      <main className="app-main">
        <Routes>
          <Route
            path="/calendar"
            element={(
              <CalendarPage
                year={year}
                month={month}
                monthlyTotal={monthlyTotal}
                prevMonth={prevMonth}
                nextMonth={nextMonth}
                goToday={goToday}
                getDailyTotal={getDailyTotal}
                getByDate={getByDate}
                onDayClick={setSelectedDate}
              />
            )}
          />
          <Route
            path="/summary"
            element={(
              <SummaryPage
                year={year}
                onPrevYear={() => setYear((y) => Math.max(MIN_YEAR, y - 1))}
                onNextYear={() => setYear((y) => y + 1)}
                getMonthlyCategoryTotals={getMonthlyCategoryTotals}
                getMonthlyTotal={getMonthlyTotal}
              />
            )}
          />
          <Route path="*" element={<Navigate to="/calendar" replace />} />
        </Routes>
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
