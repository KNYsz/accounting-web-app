import MonthlySummaryTable from '../components/MonthlySummaryTable';

export default function SummaryPage({ year, onPrevYear, onNextYear, getMonthlyCategoryTotals, getMonthlyTotal }) {
  return (
    <div className="summary-year-nav">
      <button className="icon-btn" onClick={onPrevYear} aria-label="前年">‹</button>
      <MonthlySummaryTable
        year={year}
        getMonthlyCategoryTotals={getMonthlyCategoryTotals}
        getMonthlyTotal={getMonthlyTotal}
      />
      <button className="icon-btn" onClick={onNextYear} aria-label="翌年">›</button>
    </div>
  );
}
