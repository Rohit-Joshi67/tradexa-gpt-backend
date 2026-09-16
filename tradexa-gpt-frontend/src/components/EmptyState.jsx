export default function EmptyState({ title, body, icon }) {
  return (
    <div className="empty">
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  )
}
