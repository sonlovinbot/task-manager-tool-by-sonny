import { Plus, X } from '@phosphor-icons/react'
import { useState } from 'react'
import type { Subtask } from '../../domain/task'

interface Props {
  subtasks: Subtask[]
  onChange(next: Subtask[]): void
}

export function SubtaskList({ subtasks, onChange }: Props) {
  const [text, setText] = useState('')
  const add = () => {
    const title = text.trim()
    if (!title) return
    onChange([...subtasks, { id: crypto.randomUUID(), title, done: false }])
    setText('')
  }
  return (
    <div className="subtasks">
      <ul>
        {subtasks.map((s) => (
          <li key={s.id}>
            <label className="check">
              <input
                type="checkbox"
                checked={s.done}
                aria-label={s.title}
                onChange={() =>
                  onChange(subtasks.map((x) => (x.id === s.id ? { ...x, done: !x.done } : x)))
                }
              />
              <span>{s.title}</span>
            </label>
            <button
              className="btn icon ghost sm"
              aria-label={`Xoá việc con: ${s.title}`}
              onClick={() => onChange(subtasks.filter((x) => x.id !== s.id))}
            >
              <X size={14} aria-hidden />
            </button>
          </li>
        ))}
      </ul>
      <div className="search" style={{ height: 42, marginTop: 8 }}>
        <Plus size={16} aria-hidden />
        <input
          aria-label="Thêm việc con"
          placeholder="Thêm việc con…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
        />
      </div>
    </div>
  )
}
