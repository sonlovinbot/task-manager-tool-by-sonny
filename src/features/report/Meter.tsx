interface Props {
  label: string
  n: number
  total: number
  tone: 'todo' | 'doing' | 'done' | 'rose'
}

export function Meter({ label, n, total, tone }: Props) {
  const pct = total > 0 ? Math.round((n / total) * 100) : 0
  return (
    <div className="meter">
      <span>{label}</span>
      <span className="rail">
        <span className={`fill ${tone}`} style={{ width: `${pct}%`, minWidth: n > 0 ? 14 : 0 }} />
      </span>
      <span className="n num">{n}</span>
    </div>
  )
}
