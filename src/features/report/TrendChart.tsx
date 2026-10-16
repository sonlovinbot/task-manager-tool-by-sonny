import { useState } from 'react'

interface Props {
  data: { date: string; count: number }[]
}

const WEEKDAY = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

function label(date: string, index: number, total: number): string {
  const [y, m, d] = date.split('-').map(Number)
  if (total <= 7) return WEEKDAY[new Date(y, m - 1, d).getDay()]
  return index % 5 === 0 || index === total - 1 ? String(d) : ''
}

export function TrendChart({ data }: Props) {
  const [picked, setPicked] = useState<string>()
  const max = Math.max(1, ...data.map((d) => d.count))
  const compact = data.length > 7
  return (
    <div data-testid="trend" data-days={data.length}>
      <div
        className="caps"
        style={{ gridTemplateColumns: `repeat(${data.length}, 1fr)`, gap: compact ? 4 : 10 }}
      >
        {data.map((d, i) => (
          <button
            key={d.date}
            type="button"
            className="cap"
            aria-label={`${d.date}: ${d.count} việc`}
            aria-pressed={picked === d.date}
            onClick={() => setPicked(picked === d.date ? undefined : d.date)}
          >
            <span className="tip num">{d.count} việc</span>
            <span className="rail" style={compact ? { width: 8 } : undefined}>
              <span
                className={d.count === 0 ? 'fill zero' : 'fill'}
                style={{ height: `${Math.max(12, Math.round((d.count / max) * 100))}%` }}
              />
            </span>
            <span style={{ minHeight: 18 }}>{label(d.date, i, data.length)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
