import {
  PRIORITIES,
  STATUSES,
  filterTasks,
  type Task,
  type TaskFilter,
} from '../../domain/task'
import { PRIORITY_LABEL, STATUS_LABEL } from './labels'

interface Props {
  tasks: Task[]
  filter: TaskFilter
  onChange(patch: Partial<TaskFilter>): void
}

export function FilterBar({ tasks, filter, onChange }: Props) {
  const scoped = filterTasks(tasks, { ...filter, status: undefined })
  const labels = [...new Set(tasks.map((t) => t.label).filter((l): l is string => !!l))]
  return (
    <div className="filter-bar">
      <div role="tablist" className="tabs">
        <button
          role="tab"
          aria-selected={!filter.status}
          onClick={() => onChange({ status: undefined })}
        >
          Tất cả {scoped.length}
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            role="tab"
            aria-selected={filter.status === s}
            onClick={() => onChange({ status: s })}
          >
            {STATUS_LABEL[s]} {scoped.filter((t) => t.status === s).length}
          </button>
        ))}
      </div>
      <div className="filters">
        <select
          aria-label="Lọc theo ưu tiên"
          value={filter.priority ?? ''}
          onChange={(e) => onChange({ priority: (e.target.value || undefined) as TaskFilter['priority'] })}
        >
          <option value="">Mọi ưu tiên</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABEL[p]}
            </option>
          ))}
        </select>
        <select
          aria-label="Lọc theo nhãn"
          value={filter.label ?? ''}
          onChange={(e) => onChange({ label: e.target.value || undefined })}
        >
          <option value="">Mọi nhãn</option>
          {labels.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <input
          type="search"
          placeholder="Tìm kiếm…"
          aria-label="Tìm kiếm"
          value={filter.q ?? ''}
          onChange={(e) => onChange({ q: e.target.value || undefined })}
        />
      </div>
    </div>
  )
}
