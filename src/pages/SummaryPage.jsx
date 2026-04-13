import MonthlySummaryTable from '../components/MonthlySummaryTable';

export default function SummaryPage({ year, onPrevYear, onNextYear, getMonthlyCategoryTotals, getMonthlyTotal }) {
  const annualExpenseTotal = Array.from({ length: 12 }, (_, i) => getMonthlyTotal(year, i + 1, 'expense')).reduce(
    (sum, value) => sum + value,
    0
  );
  const annualIncomeTotal = Array.from({ length: 12 }, (_, i) => getMonthlyTotal(year, i + 1, 'income')).reduce(
    (sum, value) => sum + value,
    0
  );
  const annualNetTotal = annualIncomeTotal - annualExpenseTotal;

  return (
    <div className="summary-page">
      <div className="summary-year-nav">
        <button className="icon-btn" onClick={onPrevYear} aria-label="前年">‹</button>
        <div className="summary-board">
          <div className="summary-overview">
            <div className="summary-metric">
              <span className="summary-metric-label">年間収入</span>
              <strong className="summary-metric-value income">¥{annualIncomeTotal.toLocaleString()}</strong>
            </div>
            <div className="summary-metric">
              <span className="summary-metric-label">年間支出</span>
              <strong className="summary-metric-value expense">¥{annualExpenseTotal.toLocaleString()}</strong>
            </div>
            <div className="summary-metric">
              <span className="summary-metric-label">年間収支</span>
              <strong className={`summary-metric-value${annualNetTotal < 0 ? ' negative' : ' positive'}`}>
                {annualNetTotal >= 0 ? '+' : '-'}¥{Math.abs(annualNetTotal).toLocaleString()}
              </strong>
            </div>
          </div>
          <MonthlySummaryTable
            year={year}
            kind="expense"
            getMonthlyCategoryTotals={getMonthlyCategoryTotals}
            getMonthlyTotal={getMonthlyTotal}
          />
          <MonthlySummaryTable
            year={year}
            kind="income"
            getMonthlyCategoryTotals={getMonthlyCategoryTotals}
            getMonthlyTotal={getMonthlyTotal}
          />
        </div>
        <button className="icon-btn" onClick={onNextYear} aria-label="翌年">›</button>
      </div>
    </div>
  );
}
