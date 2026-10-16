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

export default RatingCard
