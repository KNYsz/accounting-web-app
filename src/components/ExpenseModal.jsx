import { useState, useEffect } from 'react';
import { ENTRY_TYPES, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants';
import './ExpenseModal.css';

export default function ExpenseModal({ date, expenses, onAdd, onUpdate, onDelete, onClose }) {
  const [entryType, setEntryType] = useState('expense');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const categories = entryType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useEffect(() => {
    if (!categories.includes(category)) {
      setCategory(categories[0]);
    }
  }, [category, categories]);

  function handleSubmit(e) {
    e.preventDefault();
    const parsedAmount = parseInt(amount, 10);
    if (!parsedAmount || parsedAmount <= 0) {
      setError('金額は1以上の整数を入力してください');
      return;
    }
    onAdd({ date, kind: entryType, category, amount: parsedAmount, description });
    setAmount('');
    setDescription('');
    setError('');
  }

  const formattedDate = date
    ? new Date(date + 'T00:00:00').toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      })
    : '';

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={`${formattedDate}の収支入力`}>
        <button className="modal-close" onClick={onClose} aria-label="閉じる">×</button>
        <h2 className="modal-title">{formattedDate}</h2>

        <form className="expense-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="entry-type">区分</label>
            <div className="type-toggle" id="entry-type" role="radiogroup" aria-label="区分">
              {ENTRY_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`type-btn${entryType === type ? ' active' : ''}`}
                  onClick={() => setEntryType(type)}
                  aria-pressed={entryType === type}
                >
                  {type === 'income' ? '収入' : '支出'}
                </button>
              ))}
            </div>
          </div>
          <div className="form-row">
            <label htmlFor="category">カテゴリ</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label htmlFor="amount">金額 (円)</label>
            <input
              id="amount"
              type="number"
              min="1"
              step="1"
              placeholder="例: 1500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="form-row">
            <label htmlFor="description">メモ</label>
            <input
              id="description"
              type="text"
              placeholder="任意"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={100}
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn-primary">追加</button>
        </form>

        {expenses.length > 0 && (
          <div className="expense-list">
            <h3>この日の収支</h3>
            <ul>
              {expenses.map((exp) => (
                <li key={exp.id} className="expense-item">
                  <span className={`expense-kind ${exp.kind === 'income' ? 'income' : 'expense'}`}>
                    {exp.kind === 'income' ? '収入' : '支出'}
                  </span>
                  <span className="expense-category">{exp.category}</span>
                  <span className="expense-desc">{exp.description}</span>
                  <span className={`expense-amount${exp.kind === 'expense' && !exp.paid ? ' unpaid' : ''}`}>
                    ¥{exp.amount.toLocaleString()}
                  </span>
                  {exp.kind === 'expense' && (
                    <label className="expense-paid-toggle">
                      <input
                        type="checkbox"
                        checked={Boolean(exp.paid)}
                        onChange={(e) => onUpdate(exp.id, { paid: e.target.checked })}
                      />
                      支払済
                    </label>
                  )}
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => onDelete(exp.id)}
                    aria-label="削除"
                  >
                    削除
                  </button>
                </li>
              ))}
            </ul>
            <p className="expense-total">
              収支合計:{' '}
              <strong>
                {(() => {
                  const total = expenses.reduce(
                    (sum, entry) =>
                      sum + (entry.kind === 'expense' ? (entry.paid ? -entry.amount : 0) : entry.amount),
                    0
                  );
                  return `${total >= 0 ? '+' : '-'}¥${Math.abs(total).toLocaleString()}`;
                })()}
              </strong>
            </p>
            <p className="expense-note">※ 未払いの支出は合計に含まれません</p>
          </div>
        )}
      </div>
    </div>
  );
}
