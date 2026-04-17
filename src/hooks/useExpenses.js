import { useState, useCallback } from 'react';

const STORAGE_KEY = 'accounting_web_app_expenses';
const MIN_DATE = '2026-04-01';

function isValidKind(kind) {
  return kind === 'expense' || kind === 'income';
}

function isValidExpenseDate(date) {
  return typeof date === 'string' && date >= MIN_DATE;
}

function normalizeExpense(expense) {
  const normalizedKind = isValidKind(expense.kind) ? expense.kind : 'expense';
  const normalizedPaid =
    normalizedKind === 'income'
      ? true
      : typeof expense.paid === 'boolean'
        ? expense.paid
        : true;

  return {
    ...expense,
    kind: normalizedKind,
    paid: normalizedPaid,
  };
}

function loadExpenses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const filtered = parsed
      .filter((e) => isValidExpenseDate(e.date) && typeof e.amount === 'number' && e.amount > 0)
      .map(normalizeExpense);

    if (filtered.length !== parsed.length) {
      saveExpenses(filtered);
    }

    return filtered;
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
    if (!isValidExpenseDate(expense.date) || !isValidKind(expense.kind)) {
      return;
    }

    setExpenses((prev) => {
      const next = [
        ...prev,
        normalizeExpense({
          ...expense,
          id: crypto.randomUUID(),
          paid:
            expense.kind === 'income'
              ? true
              : typeof expense.paid === 'boolean'
                ? expense.paid
                : false,
        }),
      ];
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
    (dateStr, kind) => expenses.filter((e) => e.date === dateStr && (!kind || e.kind === kind)),
    [expenses]
  );

  const getByMonth = useCallback(
    (year, month, kind) => {
      const prefix = `${year}-${String(month).padStart(2, '0')}`;
      return expenses.filter((e) => e.date.startsWith(prefix) && (!kind || e.kind === kind));
    },
    [expenses]
  );

  const getDailyTotal = useCallback(
    (dateStr, kind) =>
      expenses
        .filter(
          (e) =>
            e.date === dateStr &&
            (!kind || e.kind === kind) &&
            (e.kind !== 'expense' || e.paid)
        )
        .reduce((sum, e) => {
          if (kind === 'expense' || kind === 'income') {
            return sum + e.amount;
          }

          return sum + (e.kind === 'expense' ? -e.amount : e.amount);
        }, 0),
    [expenses]
  );

  const getMonthlyTotal = useCallback(
    (year, month, kind) => {
      const prefix = `${year}-${String(month).padStart(2, '0')}`;
      return expenses
        .filter(
          (e) =>
            e.date.startsWith(prefix) &&
            (!kind || e.kind === kind) &&
            (e.kind !== 'expense' || e.paid)
        )
        .reduce((sum, e) => {
          if (kind === 'expense' || kind === 'income') {
            return sum + e.amount;
          }

          return sum + (e.kind === 'expense' ? -e.amount : e.amount);
        }, 0);
    },
    [expenses]
  );

  const getMonthlyCategoryTotals = useCallback(
    (year, month, kind) => {
      const prefix = `${year}-${String(month).padStart(2, '0')}`;
      const monthExpenses = expenses.filter(
        (e) =>
          e.date.startsWith(prefix) &&
          (!kind || e.kind === kind) &&
          (e.kind !== 'expense' || e.paid)
      );
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
