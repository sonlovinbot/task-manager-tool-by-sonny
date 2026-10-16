import { isOverdue, toLocalDate } from '../../domain/report'
import type { Task } from '../../domain/task'
import { PRIORITY_LABEL, STATUS_LABEL } from './labels'

interface Props {
  task: Task
  onToggle(): void
  onOpen(): void
}

export function TaskRow({ task, onToggle, onOpen }: Props) {
  const overdue = isOverdue(task, toLocalDate(new Date()))
  const done = task.subtasks.filter((s) => s.done).length
  return (
    <li className={`task-row status-${task.status}`}>
      <button
        className="status-btn"
        aria-label={`Đổi trạng thái: ${task.title}`}
        onClick={onToggle}
      >
        {STATUS_LABEL[task.status]}
      </button>
      <button className="title-btn" onClick={onOpen}>
        {task.title}
      </button>
      <span className={`chip priority-${task.priority}`}>{PRIORITY_LABEL[task.priority]}</span>
      {task.label && <span className="chip label">{task.label}</span>}
      {task.dueDate && <span className={overdue ? 'due overdue' : 'due'}>{task.dueDate}</span>}
      {task.subtasks.length > 0 && (
        <span className="progress">
          {done}/{task.subtasks.length}
        </span>
      )}
    </li>
  )
}
