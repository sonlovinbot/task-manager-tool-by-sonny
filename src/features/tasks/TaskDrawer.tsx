import { Trash, X } from '@phosphor-icons/react'
import { useState } from 'react'
import { PRIORITIES, type Priority } from '../../domain/task'
import { PRIORITY_LABEL } from './labels'
import { SubtaskList } from './SubtaskList'
import { useTaskStore } from './store'

interface Props {
  taskId: string | null
  onClose(): void
}

export function TaskDrawer({ taskId, onClose }: Props) {
  const task = useTaskStore((s) => s.tasks.find((t) => t.id === taskId))
  const update = useTaskStore((s) => s.update)
  const remove = useTaskStore((s) => s.remove)
  if (!task) return null
  // key resets local text state when switching tasks
  return (
    <DrawerBody
      key={task.id}
      task={task}
      update={update}
      onDelete={async () => {
        await remove(task.id)
        onClose()
      }}
      onClose={onClose}
    />
  )
}

type BodyProps = {
  task: NonNullable<ReturnType<typeof useTaskStore.getState>['tasks'][number]>
  update: ReturnType<typeof useTaskStore.getState>['update']
  onDelete(): void
  onClose(): void
}

function DrawerBody({ task, update, onDelete, onClose }: BodyProps) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description)
  const [label, setLabel] = useState(task.label ?? '')

  const saveTitle = async () => {
    const ok = await update(task.id, { title })
    if (!ok) setTitle(task.title)
  }

  return (
    <aside className="drawer" role="dialog" aria-label="Chi tiết công việc">
      <div className="drawer-close-row">
        <h2 className="t-title" style={{ fontSize: 20 }}>
          Chi tiết việc
        </h2>
        <button className="btn icon ghost sm" onClick={onClose} aria-label="Đóng">
          <X size={16} aria-hidden />
        </button>
      </div>
      <label className="field">
        Tiêu đề
        <input value={title} onChange={(e) => setTitle(e.target.value)} onBlur={saveTitle} />
      </label>
      <label className="field">
        Mô tả
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => void update(task.id, { description })}
        />
      </label>
      <label className="field">
        Hạn
        <input
          type="date"
          value={task.dueDate ?? ''}
          onChange={(e) => void update(task.id, { dueDate: e.target.value || undefined })}
        />
      </label>
      <label className="field">
        Ưu tiên
        <select
          value={task.priority}
          onChange={(e) => void update(task.id, { priority: e.target.value as Priority })}
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABEL[p]}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        Nhãn
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={() => void update(task.id, { label: label.trim() || undefined })}
        />
      </label>
      <h3 className="t-section">
        Việc con{' '}
        <span className="num">
          {task.subtasks.filter((x) => x.done).length} trên {task.subtasks.length} xong
        </span>
      </h3>
      <SubtaskList
        subtasks={task.subtasks}
        onChange={(subtasks) => void update(task.id, { subtasks })}
      />
      <button className="btn danger" onClick={onDelete} style={{ alignSelf: 'flex-start' }}>
        <Trash size={16} aria-hidden />
        Xoá việc
      </button>
    </aside>
  )
}
