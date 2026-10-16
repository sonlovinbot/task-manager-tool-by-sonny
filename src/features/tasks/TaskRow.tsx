import { CalendarBlank, CaretRight, Circle, CircleHalf, CheckCircle, Flag, ListChecks, Tag, WarningCircle } from '@phosphor-icons/react'
import { isOverdue, toLocalDate } from '../../domain/report'
import type { Status, Task } from '../../domain/task'
import { PRIORITY_LABEL, STATUS_LABEL } from './labels'

interface Props {
  task: Task
  open?: boolean
  onToggle(): void
  onOpen(): void
}

function StatusIcon({ status }: { status: Status }) {
  if (status === 'done') return <CheckCircle size={18} weight="fill" aria-hidden />
  if (status === 'doing') return <CircleHalf size={18} aria-hidden />
  return <Circle size={18} aria-hidden />
}

export function TaskRow({ task, open, onToggle, onOpen }: Props) {
  const overdue = isOverdue(task, toLocalDate(new Date()))
  const done = task.subtasks.filter((s) => s.done).length
  return (
    <li className={`task reveal${task.status === 'done' ? ' is-done' : ''}${open ? ' open' : ''}`}>
      <button
        className={`status-btn ${task.status}`}
        aria-label={`Đổi trạng thái: ${task.title}`}
        onClick={onToggle}
      >
        <StatusIcon status={task.status} />
        <span>{STATUS_LABEL[task.status]}</span>
      </button>
      <div className="task-main">
        <button className="task-title title-btn" onClick={onOpen}>
          {task.title}
        </button>
        <div className="task-meta">
          <span className={`chip ${task.priority === 'high' ? 'high' : 'neutral'}`}>
            <Flag size={13} aria-hidden />
            {PRIORITY_LABEL[task.priority]}
          </span>
          {task.label && (
            <span className="chip neutral">
              <Tag size={13} aria-hidden />
              {task.label}
            </span>
          )}
          {task.dueDate && (
            <span className={overdue ? 'due overdue' : 'due'}>
              {overdue ? <WarningCircle size={14} aria-hidden /> : <CalendarBlank size={14} aria-hidden />}
              {task.dueDate}
            </span>
          )}
          {task.subtasks.length > 0 && (
            <span className="due">
              <ListChecks size={14} aria-hidden />
              {done}/{task.subtasks.length}
            </span>
          )}
        </div>
      </div>
      <div className="task-side">
        <button className="btn icon ghost sm" aria-label={`Mở chi tiết: ${task.title}`} onClick={onOpen} tabIndex={-1}>
          <CaretRight size={16} aria-hidden />
        </button>
      </div>
    </li>
  )
}
