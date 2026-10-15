
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
  const name = username.trim()

  const archiveData = await fetchJSON(
    `${BASE_URL}/player/${encodeURIComponent(name)}/games/archives`
  )

  const archives = (archiveData.archives || []).slice(-3)

  const results = await Promise.all(
    archives.map(async (url) => {
      const data = await fetchJSON(url)
      return data.games || []
    })
  )

  const allGames = results
    .flat()
    .sort((a, b) => a.end_time - b.end_time)

  const playerName = name.toLowerCase()

  const gamesWithChanges = allGames.map((game, index) => {
    const isWhite =
      game.white?.username?.toLowerCase() === playerName

    const playerColor = isWhite ? 'white' : 'black'
    const currentRating = game[playerColor]?.rating

    const previousGame = allGames
      .slice(0, index)
      .reverse()
      .find((previous) => {
        const sameTimeClass =
          previous.time_class === game.time_class

        const previousColor =
          previous.white?.username?.toLowerCase() === playerName
            ? 'white'
            : 'black'

        return (
          sameTimeClass &&
          typeof previous[previousColor]?.rating === 'number'
        )
      })

    let ratingChange = null

    if (previousGame && typeof currentRating === 'number') {
      const previousColor =
        previousGame.white?.username?.toLowerCase() === playerName
          ? 'white'
          : 'black'

      const previousRating = previousGame[previousColor]?.rating

      if (typeof previousRating === 'number') {
        ratingChange = currentRating - previousRating
      }
    }

    return {
      ...game,
      ratingChange,
    }
  })

  return gamesWithChanges
    .sort((a, b) => b.end_time - a.end_time)
    .slice(0, 10)
}

// Build a rating series from ratings recorded in archived games
export async function getRatingHistory(
  username,
  timeClass = 'chess_rapid'
) {
  const name = username.trim()

  const archiveData = await fetchJSON(
    `${BASE_URL}/player/${encodeURIComponent(name)}/games/archives`
  )

  const archives = (archiveData.archives || []).slice(-12)

  console.log('Archive months found:', archives.length)

  const results = await Promise.all(
    archives.map(async (url) => {
      const data = await fetchJSON(url)
      return data.games || []
    })
  )

  const history = []
console.log('First archived game:', results.flat()[0])
console.log(
  'Available time controls:',
  [...new Set(results.flat().map((game) => game.time_class))]
)
console.log(
  'Archive game count:',
  results.reduce((total, games) => total + games.length, 0)
)
  for (const games of results) {
    for (const game of games) {
      const selectedClass = timeClass.replace('chess_', '')

      if (game.time_class !== selectedClass) continue

      const whiteName = game.white?.username?.toLowerCase()
      const blackName = game.black?.username?.toLowerCase()
      const playerName = name.toLowerCase()

      let playerColor

      if (whiteName === playerName) {
        playerColor = 'white'
      } else if (blackName === playerName) {
        playerColor = 'black'
      } else {
        continue
      }

      const rating = game[playerColor]?.rating

      if (typeof rating !== 'number') continue

      history.push({
        timestamp: game.end_time,
        date: new Date(game.end_time * 1000).toLocaleDateString(),
        rating,
        opponent:
          playerColor === 'white'
            ? game.black?.username
            : game.white?.username,
      })
    }
  }

  history.sort((a, b) => a.timestamp - b.timestamp)

  console.log('Selected time control:', timeClass)
  console.log('Games with ratings:', history.length)

  return history
}
