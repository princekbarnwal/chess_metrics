function PlayerProfile({ player, formatDate }) {
  return (
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
  )
}

export default PlayerProfile
