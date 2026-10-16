import { useSearchParams } from 'react-router-dom'
import {
  PRIORITIES,
  STATUSES,
  type Priority,
  type Status,
  type TaskFilter,
} from '../../domain/task'

export function useTaskFilter(): [TaskFilter, (patch: Partial<TaskFilter>) => void] {
  const [params, setParams] = useSearchParams()
  const status = params.get('status') as Status | null
  const priority = params.get('priority') as Priority | null
  const filter: TaskFilter = {
    status: status && STATUSES.includes(status) ? status : undefined,
    priority: priority && PRIORITIES.includes(priority) ? priority : undefined,
    label: params.get('label') || undefined,
    q: params.get('q') || undefined,
  }
  const update = (patch: Partial<TaskFilter>) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v)
      else next.delete(k)
    }
    setParams(next, { replace: true })
  }
  return [filter, update]
}
