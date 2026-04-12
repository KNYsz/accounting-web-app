import { useState, useCallback } from 'react';

const STORAGE_KEY = 'accounting_web_app_expenses';

function loadExpenses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveExpenses(expenses) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

export function useExpenses() {
  const [expenses, setExpenses] = useState(loadExpenses);

  const addExpense = useCallback((expense) => {
    setExpenses((prev) => {
      const next = [...prev, { ...expense, id: crypto.randomUUID() }];
      saveExpenses(next);
      return next;
    });
  }, []);

  const updateExpense = useCallback((id, updates) => {
    setExpenses((prev) => {
      const next = prev.map((e) => (e.id === id ? { ...e, ...updates } : e));
      saveExpenses(next);
      return next;
    });
  }, []);

  const deleteExpense = useCallback((id) => {
    setExpenses((prev) => {
      const next = prev.filter((e) => e.id !== id);
      saveExpenses(next);
      return next;
    });
  }, []);

  const getByDate = useCallback(
    (dateStr) => expenses.filter((e) => e.date === dateStr),
    [expenses]
  );

  const getByMonth = useCallback(
    (year, month) => {
      const prefix = `${year}-${String(month).padStart(2, '0')}`;
      return expenses.filter((e) => e.date.startsWith(prefix));
    },
    [expenses]
  );

  const getDailyTotal = useCallback(
    (dateStr) =>
      expenses
        .filter((e) => e.date === dateStr)
        .reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  const getMonthlyTotal = useCallback(
    (year, month) => {
      const prefix = `${year}-${String(month).padStart(2, '0')}`;
      return expenses
        .filter((e) => e.date.startsWith(prefix))
        .reduce((sum, e) => sum + e.amount, 0);
    },
    [expenses]
  );

  const getMonthlyCategoryTotals = useCallback(
    (year, month) => {
      const prefix = `${year}-${String(month).padStart(2, '0')}`;
      const monthExpenses = expenses.filter((e) => e.date.startsWith(prefix));
      return monthExpenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {});
    },
    [expenses]
  );

  return {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    getByDate,
    getByMonth,
    getDailyTotal,
    getMonthlyTotal,
    getMonthlyCategoryTotals,
  };
}
