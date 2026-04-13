import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants';
import './MonthlySummaryTable.css';

const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

export default function MonthlySummaryTable({ year, kind, getMonthlyCategoryTotals, getMonthlyTotal }) {
  const categories = kind === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const kindLabel = kind === 'income' ? '収入' : '支出';

  const rows = categories.map((cat) => {
    const monthlyAmounts = Array.from({ length: 12 }, (_, i) => {
      const totals = getMonthlyCategoryTotals(year, i + 1, kind);
      return totals[cat] || 0;
    });
    const annualTotal = monthlyAmounts.reduce((s, a) => s + a, 0);
    return { cat, monthlyAmounts, annualTotal };
  });

  const monthTotals = Array.from({ length: 12 }, (_, i) => getMonthlyTotal(year, i + 1, kind));
  const grandTotal = monthTotals.reduce((s, a) => s + a, 0);

  const hasAnyData = grandTotal > 0;

  return (
    <div className="summary-wrapper">
      <h2 className="summary-title">{year}年 月別{kindLabel}サマリー</h2>
      {!hasAnyData && (
        <p className="summary-empty">まだ{kindLabel}データがありません。カレンダーから記録を追加してください。</p>
      )}
      <div className="table-scroll">
        <table className="summary-table">
          <thead>
            <tr>
              <th className="col-category">カテゴリ</th>
              {MONTHS.map((m) => (
                <th key={m} className="col-month">{m}</th>
              ))}
              <th className="col-total">合計</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ cat, monthlyAmounts, annualTotal }) => (
              <tr key={cat} className={annualTotal === 0 ? 'row-zero' : ''}>
                <td className="col-category">{cat}</td>
                {monthlyAmounts.map((amt, i) => (
                  <td key={i} className={`col-month${amt > 0 ? ' has-value' : ''}`}>
                    {amt > 0 ? `¥${amt.toLocaleString()}` : '–'}
                  </td>
                ))}
                <td className="col-total">
                  {annualTotal > 0 ? `¥${annualTotal.toLocaleString()}` : '–'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="row-total">
              <td className="col-category">合計</td>
              {monthTotals.map((total, i) => (
                <td key={i} className={`col-month${total > 0 ? ' has-value' : ''}`}>
                  {total > 0 ? `¥${total.toLocaleString()}` : '–'}
                </td>
              ))}
              <td className="col-total grand-total">
                {grandTotal > 0 ? `¥${grandTotal.toLocaleString()}` : '–'}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
