export default function KpiCard({ label, value, hint, tone = 'green', icon }) {
  return (
    <article className={`card kpi ${tone}`}>
      <div className="kpi-label">
        {label}
        <span className="icon-pill">{icon}</span>
      </div>
      <div className="kpi-value">{value}</div>
      <small className="neutral">{hint}</small>
    </article>
  )
}
