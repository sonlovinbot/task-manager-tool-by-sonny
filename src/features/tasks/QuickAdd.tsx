import { Plus } from '@phosphor-icons/react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { QUICK_ADD_ID } from '../../app/AddTaskButton'

interface Props {
  onAdd(title: string): void
  voiceSlot?: (setText: (text: string) => void) => ReactNode
}

export function QuickAdd({ onAdd, voiceSlot }: Props) {
  const [value, setValue] = useState('')
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!value.trim()) return
    onAdd(value)
    setValue('')
  }
  return (
    <form className="search" style={{ height: 54, padding: '0 8px 0 20px' }} onSubmit={submit}>
      <Plus size={18} aria-hidden />
      <input
        id={QUICK_ADD_ID}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Thêm việc mới…"
        aria-label="Tiêu đề việc mới"
      />
      {voiceSlot?.(setValue)}
      <button className="btn accent" type="submit">
        Thêm
      </button>
    </form>
  )
}
