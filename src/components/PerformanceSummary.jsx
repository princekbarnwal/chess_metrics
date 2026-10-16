function PerformanceSummary({
  performance,
  winRate,
  decidedGames,
}) {
  return (
    <div className="performance-summary">
      <div className="performance-card">
        <span className="performance-label">Wins</span>
        <strong className="performance-value performance-wins">
          {performance.wins}
        </strong>
      </div>

      <div className="performance-card">
        <span className="performance-label">Losses</span>
        <strong className="performance-value performance-losses">
          {performance.losses}
        </strong>
      </div>

      <div className="performance-card">
        <span className="performance-label">Draws</span>
        <strong className="performance-value">
          {performance.draws}
        </strong>
      </div>

      <div className="performance-card">
        <span className="performance-label">Win rate</span>
        <strong className="performance-value">
          {winRate}%
        </strong>
        <span className="performance-note">
          {decidedGames} decided games
        </span>
      </div>
    </div>
  )
}

export default PerformanceSummary
