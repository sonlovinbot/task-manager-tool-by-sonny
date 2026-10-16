import type { Priority } from '../../domain/task'
import { PRIORITY_LABEL } from '../tasks/labels'
import { Meter } from './Meter'

interface Props {
  byPriority: Record<Priority, number>
  byLabel: { label: string; count: number }[]
}

export function Breakdown({ byPriority, byLabel }: Props) {
  const total = byPriority.high + byPriority.medium + byPriority.low
  return (
    <div className="pv-grid grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <section className="card" aria-label="Theo ưu tiên">
        <h2 className="t-section" style={{ marginBottom: 16 }}>
          Theo ưu tiên
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {(Object.keys(byPriority) as Priority[]).map((p) => (
            <Meter key={p} label={PRIORITY_LABEL[p]} n={byPriority[p]} total={total} tone="rose" />
          ))}
        </div>
      </section>
      <section className="card" aria-label="Theo nhãn">
        <h2 className="t-section" style={{ marginBottom: 16 }}>
          Theo nhãn
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {byLabel.length === 0 && <p className="empty-line">Chưa có nhãn nào.</p>}
          {byLabel.map((l) => (
            <Meter key={l.label} label={l.label} n={l.count} total={total} tone="rose" />
          ))}
        </div>
      </section>
    </div>
  )
}
