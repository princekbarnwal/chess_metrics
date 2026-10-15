
import { useState } from 'react'
import RatingChart from './components/RatingChart'
import {
  getPlayer,
  getPlayerStats,
  getPlayerGames,
  getRatingHistory,
} from './services/chessApi'
import './App.css'

const formatDate = (timestamp) => {
  if (!timestamp) return 'Not available'

  return new Date(timestamp * 1000).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

const ratingTypes = [
  ['chess_bullet', 'Bullet'],
  ['chess_blitz', 'Blitz'],
  ['chess_rapid', 'Rapid'],
  ['chess_daily', 'Daily'],
]

function RatingCard({ label, data }) {
  const rating = data?.last?.rating
  const best = data?.best?.rating
  const record = data?.record

  return (
    <article className="rating-card">
      <span className="muted">{label}</span>

      <strong className="rating-number">
        {rating ?? '—'}
      </strong>

      <div className="rating-details">
        <span>Peak: {best ?? '—'}</span>

        {record && (
          <span>
            {record.win ?? 0}W / {record.draw ?? 0}D /{' '}
            {record.loss ?? 0}L
          </span>
        )}
      </div>
    </article>
  )
}

function App() {
  const [username, setUsername] = useState('')
  const [player, setPlayer] = useState(null)
  const [stats, setStats] = useState(null)
  const [games, setGames] = useState([])
  const [gameFilter, setGameFilter] = useState('all')

  
const filteredGames =
  gameFilter === 'all'
    ? games
    : games.filter(
        (game) =>
          game.time_class?.toLowerCase() ===
          gameFilter.replace('chess_', '').toLowerCase()
      )


const performance = filteredGames.reduce(
    (summary, game) => {
      const playerName = player?.username?.toLowerCase()

      const isWhite =
        game.white?.username?.toLowerCase() === playerName
      const isBlack =
        game.black?.username?.toLowerCase() === playerName

      if (!isWhite && !isBlack) return summary

      const result = (isWhite ? game.white : game.black)?.result

      if (result === 'win') {
        summary.wins += 1
      } else if (result === 'checkmated' ||
                result === 'timeout' ||
                result === 'resigned' ||
                result === 'lose' ||
                result === 'abandoned') {
        summary.losses += 1
      } else if (
        ['agreed', 'stalemate', 'repetition', 'insufficient',
        '50move', 'timevsinsufficient'].includes(result)
      ) {
        summary.draws += 1
      } else {
        summary.other += 1
      }

      return summary
    },
    { wins: 0, losses: 0, draws: 0, other: 0 }
  )
  const decidedGames =
    performance.wins + performance.losses + performance.draws

  const winRate = decidedGames
    ? Math.round((performance.wins / decidedGames) * 100)
    : 0
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [ratingHistory, setRatingHistory] = useState([])
  const [timeClass, setTimeClass] = useState('chess_rapid')
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')


async function loadHistory(playerName, selectedTimeClass) {
  setHistoryLoading(true)
  setHistoryError('')

  try {
    console.log('Loading history for:', playerName)
    console.log('Selected time control:', selectedTimeClass)

    const history = await getRatingHistory(
      playerName,
      selectedTimeClass
    )

    console.log('History returned from API:', history)
    console.log('Number of history entries:', history.length)

    setRatingHistory(history)
  } catch (err) {
    console.error('Rating history error:', err)

    setRatingHistory([])
    setHistoryError(
      err.message || 'Could not load rating history.'
    )
  } finally {
    setHistoryLoading(false)
  }
}


  async function handleSearch(event) {
    event.preventDefault()

    const name = username.trim()

    if (!name) {
      setError('Enter a Chess.com username first.')
      return
    }

    setLoading(true)
    setError('')
    setPlayer(null)
    setStats(null)
    setGames([])
    setRatingHistory([])
    setHistoryError('')

    try {
      const profile = await getPlayer(name)
      const playerName = profile.username || name

      setPlayer(profile)
      setUsername(playerName)

      const [statsResult, gamesResult] = await Promise.allSettled([
        getPlayerStats(playerName),
        getPlayerGames(playerName),
      ])

      if (statsResult.status === 'fulfilled') {
        setStats(statsResult.value)
      }

      if (gamesResult.status === 'fulfilled') {
        setGames(gamesResult.value)
      }

      await loadHistory(playerName, timeClass)
    } catch (err) {
      setError(err.message || 'Unable to load this player.')
    } finally {
      setLoading(false)
    }
  }

  async function handleTimeClassChange(nextTimeClass) {
    setTimeClass(nextTimeClass)

    if (player?.username) {
      await loadHistory(player.username, nextTimeClass)
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/">
          <span className="brand-icon">♞</span>
          <span>
            Chess<span className="brand-accent">See</span>
          </span>
        </a>

        <span className="topbar-label">PLAYER EXPLORER</span>
      </header>

      <main className="main-content">
        <section className="hero">
          <div className="eyebrow">
            <span className="live-dot" />
            CHESS.COM PLAYER LOOKUP
          </div>

          <h1>
            Every move tells
            <br />
            <span>a story.</span>
          </h1>

          <p className="hero-description">
            Explore player profiles, ratings, personal records,
            and recent games in one place.
          </p>

          <form className="search-form" onSubmit={handleSearch}>
            <span className="search-icon">⌕</span>

            <input
              aria-label="Chess.com username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter a Chess.com username..."
              autoComplete="off"
            />

            <button type="submit" disabled={loading}>
              {loading ? 'Searching…' : 'Explore player ↗'}
            </button>
          </form>

          <p className="search-hint">
            Try a public username, for example: thevish , hikaru , magnuscarlsen 
          </p>
        </section>

        {error && (
          <div className="error-message" role="alert">
            <strong>Couldn't load player</strong>
            <span>{error}</span>
          </div>
        )}

        {loading && (
          <div className="loading-state">
            <div className="spinner" />
            <span>Fetching player data from Chess.com…</span>
          </div>
        )}

        {player && !loading && (
          <div className="results">
            <section className="profile-panel">
              <div className="profile-main">
                {player.avatar ? (
                  <img
                    className="avatar"
                    src={player.avatar}
                    alt="Player avatar"
                  />
                ) : (
                  <div className="avatar avatar-placeholder">
                    ♞
                  </div>
                )}

                <div className="profile-info">
                  <div className="profile-label">
                    PLAYER PROFILE
                  </div>

                  <h2>
                    {player.title && (
                      <span className="player-title">
                        {player.title}{' '}
                      </span>
                    )}
                    {player.username}
                  </h2>

                  <p>
                    Chess.com member since{' '}
                    {formatDate(player.joined)}
                  </p>

                  {player.country && (
                    <a
                      className="country-link"
                      href={player.country}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View country details ↗
                    </a>
                  )}
                </div>
              </div>

              <a
                className="external-link"
                href={player.url}
                target="_blank"
                rel="noreferrer"
              >
                View Chess.com profile ↗
              </a>
            </section>

            <section className="section">
              <div className="section-heading">
                <div>
                  <p className="section-kicker">PERFORMANCE</p>
                  <h2>Rating overview</h2>
                </div>

                <span className="section-note">
                  Current &amp; peak ratings
                </span>
              </div>

              <div className="rating-grid">
                {ratingTypes.map(([key, label]) => (
                  <RatingCard
                    key={key}
                    label={label}
                    data={stats?.[key]}
                  />
                ))}
              </div>

              {!stats && (
                <p className="muted small-note">
                  Rating statistics aren't available for this player.
                </p>
              )}
            </section>

            <section className="section">
              {historyLoading ? (
                <div className="loading-state">
                  <div className="spinner" />
                  <span>Loading rating history…</span>
                </div>
              ) : historyError ? (
                <div className="error-message" role="alert">
                  {historyError}
                </div>
              ) : (
                <RatingChart
                  history={ratingHistory}
                  timeClass={timeClass}
                  onTimeClassChange={handleTimeClassChange}
                />
              )}
            </section>

            <section className="section games-section">
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
              <div className="section-heading">
                <div>
                  <p className="section-kicker">ON THE BOARD</p>
                  <h2>Recent games</h2>
                </div>

                <span className="section-note">
                  Latest archive
                </span>
              </div>
              
              <div className="game-filters">
                {[
                  { label: 'All', value: 'all' },
                  { label: 'Bullet', value: 'chess_bullet' },
                  { label: 'Blitz', value: 'chess_blitz' },
                  { label: 'Rapid', value: 'chess_rapid' },
                  { label: 'Daily', value: 'chess_daily' },
                ].map((filter) => {
                  const count =
                    filter.value === 'all'
                      ? games.length
                      : games.filter(
                          (game) =>
                            game.time_class?.toLowerCase() ===
                            filter.value.replace('chess_', '')
                        ).length

                  return (
                    <button
                      key={filter.value}
                      type="button"
                      className={`game-filter ${
                        gameFilter === filter.value ? 'active' : ''
                      }`}
                      onClick={() => setGameFilter(filter.value)}
                    >
                      {filter.label} ({count})
                    </button>
                  )
                })}
              </div>

              {filteredGames.length === 0 ? (
                <p className="empty-state">
                  No public games were found in the latest archive.
                </p>
              ) : (
                <div className="games-list">
                  {filteredGames.map((game, index) => {
                    const playerName =
                      player.username.toLowerCase()

                    const color =
                      game.white.username?.toLowerCase() === playerName
                        ? 'white'
                        : game.black.username?.toLowerCase() === playerName
                          ? 'black'
                          : null

                    const userResult = color
                      ? game[color]?.result || 'unknown'
                      : 'unknown'

                    let resultLabel = userResult

                    if (userResult === 'win') {
                      resultLabel = 'Win'
                    } else if (
                      [
                        'checkmated',
                        'timeout',
                        'resigned',
                        'lose',
                        'abandoned',
                      ].includes(userResult)
                    ) {
                      resultLabel = 'Loss'
                    } else if (
                      [
                        'agreed',
                        'stalemate',
                        'repetition',
                        'insufficient',
                        '50move',
                        'timevsinsufficient',
                      ].includes(userResult)
                    ) {
                      resultLabel = 'Draw'
                    }

                  return (
                    <a
                      className="game-row"
                      href={game.url}
                      target="_blank"
                      rel="noreferrer"
                      key={game.uuid || game.url || index}
                    >
                      <div className="game-date">
                        {formatDate(game.end_time)}
                      </div>

                      <div className="game-players">
                        <span>
                          <i className="piece white-piece">♔</i>
                          {game.white?.username}
                          {color === 'white' && ' (You)'}
                        </span>

                        <span>
                          <i className="piece black-piece">♚</i>
                          {game.black?.username}
                          {color === 'black' && ' (You)'}
                        </span>
                      </div>

                      <div className="game-meta">
                        <span className="game-time">
                          {game.time_class || 'Chess'}
                        </span>

                        <span
                          className={`result result-${resultLabel.toLowerCase()}`}
                        >
                          {resultLabel}
                        </span>

                        <span className="game-rating-change">
                          Rating change:{' '}
                          {game.ratingChange === null
                            ? '—'
                            : `${game.ratingChange > 0 ? '+' : ''}${game.ratingChange}`}
                        </span>
                      </div>

                      <span className="game-arrow">↗</span>
                    </a>
                  )
                  })}
                </div>
              )}

              <p className="disclaimer">
                Game results are based on public records returned by
                Chess.com.
              </p>
            </section>
          </div>
        )}

        {!player && !loading && !error && (
          <section className="welcome-grid">
            <article className="welcome-card">
              <span className="welcome-icon">♟</span>
              <h3>Player profiles</h3>
              <p>Find public account details and join dates.</p>
            </article>

            <article className="welcome-card">
              <span className="welcome-icon">↗</span>
              <h3>Rating history</h3>
              <p>Explore ratings recorded in archived games.</p>
            </article>

            <article className="welcome-card">
              <span className="welcome-icon">♜</span>
              <h3>Game explorer</h3>
              <p>Browse recent public games and results.</p>
            </article>
          </section>
        )}

        <footer className="footer">
          <span>
            ChessSee · An independent chess stats project
          </span>
          <span>Data provided by the Chess.com public API</span>
        </footer>
      </main>
    </div>
  )
}

export default App
