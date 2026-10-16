import type { Status } from '../../domain/task'
import { STATUS_LABEL } from '../tasks/labels'
import { Meter } from './Meter'

export function StatusChart({ counts }: { counts: Record<Status, number> }) {
  const total = counts.todo + counts.doing + counts.done
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {(Object.keys(counts) as Status[]).map((s) => (
        <Meter key={s} label={STATUS_LABEL[s]} n={counts[s]} total={total} tone={s} />
      ))}
    </div>
  )
}
