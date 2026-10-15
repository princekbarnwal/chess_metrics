
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { useMemo } from 'react'

export default function RatingChart({ history, timeClass, onTimeClassChange }) {
  const chartData = useMemo(
    () =>
      history.map((item, index) => ({
        ...item,
        index,
        label: new Date(item.timestamp * 1000).toLocaleDateString(
          undefined,
          { month: 'short', day: 'numeric' }
        ),
      })),
    [history]
  )

  const change =
    chartData.length >= 2
      ? chartData[chartData.length - 1].rating - chartData[0].rating
      : null

  return (
    <section className="section chart-section">
      <div className="section-heading">
        <div>
          <p className="section-kicker">RATING JOURNEY</p>
          <h2>Rating progression</h2>
        </div>

        <select
          className="chart-select"
          value={timeClass}
          onChange={(event) => onTimeClassChange(event.target.value)}
          aria-label="Choose rating type"
        >
          <option value="chess_rapid">Rapid</option>
          <option value="chess_blitz">Blitz</option>
          <option value="chess_bullet">Bullet</option>
          <option value="chess_daily">Daily</option>
        </select>
      </div>

      <div className="chart-summary">
        <div>
          <span className="muted">Recorded games</span>
          <strong>{chartData.length}</strong>
        </div>
        <div>
          <span className="muted">Change across shown games</span>
          <strong className={change > 0 ? 'positive' : change < 0 ? 'negative' : ''}>
            {change === null ? '—' : `${change > 0 ? '+' : ''}${change}`}
          </strong>
        </div>
      </div>

      {chartData.length < 2 ? (
        <p className="empty-state">
          Not enough archived games in this time control to draw a chart.
        </p>
      ) : (
        <div className="rating-chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 12, right: 14, left: 0, bottom: 5 }}
            >
              <CartesianGrid stroke="#ffffff12" vertical={false} />
              <XAxis
                dataKey="index"
                tickFormatter={(index) => chartData[index]?.label ?? ''}
                tick={{ fill: '#8c9788', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                minTickGap={28}
              />
              <YAxis
                domain={['dataMin - 50', 'dataMax + 50']}
                tick={{ fill: '#8c9788', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={48}
              />
              <Tooltip
                contentStyle={{
                  background: '#1b211a',
                  border: '1px solid #394436',
                  borderRadius: 10,
                  color: '#e9eee9',
                }}
                labelStyle={{ color: '#b4f36c' }}
                formatter={(value) => [value, 'Game rating']}
              />
              <Line
                type="monotone"
                dataKey="rating"
                stroke="#b4f36c"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#b4f36c' }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <p className="disclaimer">
        Ratings are taken from archived games, not official daily rating
        snapshots. Only the latest 12 available archive months are included.
      </p>
    </section>
  )
}
