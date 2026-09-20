export default function EmptyState({ title, body, icon, children }) {
  return (
    <div className="empty-wrap">
      {icon && (
        <span className="grid place-items-center w-14 h-14 rounded-2xl bg-[rgba(255,255,255,.04)] border border-[var(--color-line)] mx-auto mb-4 text-[var(--color-muted)]">
          {icon}
        </span>
      )}
      <h3>{title}</h3>
      <p className="text-[13.5px] max-w-md">{body}</p>
      {children && <div className="mt-5">{children}</div>}
    </div>
  )
}
