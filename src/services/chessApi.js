
const BASE_URL = 'https://api.chess.com/pub'

async function fetchJSON(url) {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  })

  if (response.status === 404) {
    throw new Error('Player or data not found.')
  }

  if (!response.ok) {
    throw new Error(`Chess.com API error (${response.status}).`)
  }

  return response.json()
}

// Fetch a public player profile
export async function getPlayer(username) {
  const name = username.trim()

  if (!name) {
    throw new Error('Enter a Chess.com username.')
  }

  return fetchJSON(
    `${BASE_URL}/player/${encodeURIComponent(name)}`
  )
}

// Fetch player ratings and records
export async function getPlayerStats(username) {
  return fetchJSON(
    `${BASE_URL}/player/${encodeURIComponent(username)}/stats`
  )
}

// Fetch games from the latest monthly archive
export async function getPlayerGames(username) {
  const archives = await fetchJSON(
    `${BASE_URL}/player/${encodeURIComponent(username)}/games/archives`
  )

  if (!archives.archives?.length) {
    return []
  }

  const latestArchive = archives.archives.at(-1)
  const data = await fetchJSON(latestArchive)

  return (data.games || []).slice(-10).reverse()
}

// Build a rating series from ratings recorded in archived games
export async function getRatingHistory(username, timeClass = 'chess_rapid') {
  const name = username.trim().toLowerCase()

  const archiveData = await fetchJSON(
    `${BASE_URL}/player/${encodeURIComponent(name)}/games/archives`
  )

  const archives = (archiveData.archives || []).slice(-12)

  const results = await Promise.all(
    archives.map(async (url) => {
      try {
        const data = await fetchJSON(url)
        return data.games || []
      } catch (error) {
        console.error('Could not load archive:', url, error)
        return []
      }
    })
  )

  const history = []

  for (const games of results) {
    for (const game of games) {
      if (game.time_class !== timeClass) continue

      let color

      if (game.white?.username?.toLowerCase() === name) {
        color = 'white'
      } else if (game.black?.username?.toLowerCase() === name) {
        color = 'black'
      } else {
        continue
      }

      const rating = game[color]?.rating
      if (typeof rating !== 'number') continue

      history.push({
        timestamp: game.end_time,
        date: new Date(game.end_time * 1000).toISOString().slice(0, 10),
        rating,
        opponent:
          color === 'white'
            ? game.black?.username
            : game.white?.username,
      })
    }
  }

  return history.sort((a, b) => a.timestamp - b.timestamp)
}