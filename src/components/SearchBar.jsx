function SearchBar({ username, setUsername, handleSearch, loading }) {
  return (
    <>
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
        Try a public username, for example: thevish, hikaru, magnuscarlsen
      </p>
    </>
  )
}

export default SearchBar
