import type { Priority } from '../../domain/task'
import { PRIORITY_LABEL } from '../tasks/labels'

interface Props {
  byPriority: Record<Priority, number>
  byLabel: { label: string; count: number }[]
}

export function Breakdown({ byPriority, byLabel }: Props) {
  return (
    <div className="breakdown">
      <section className="card" aria-label="Theo ưu tiên">
        <h2>Theo ưu tiên</h2>
        <ul>
          {(Object.keys(byPriority) as Priority[]).map((p) => (
            <li key={p}>
              {PRIORITY_LABEL[p]}: <strong>{byPriority[p]}</strong>
            </li>
          ))}
        </ul>
      </section>
      <section className="card" aria-label="Theo nhãn">
        <h2>Theo nhãn</h2>
        <ul>
          {byLabel.map((l) => (
            <li key={l.label}>
              {l.label}: <strong>{l.count}</strong>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
