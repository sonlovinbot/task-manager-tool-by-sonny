import { useState, type FormEvent, type ReactNode } from 'react'

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
    <form className="quick-add" onSubmit={submit}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Thêm việc mới…"
        aria-label="Tiêu đề việc mới"
      />
      {voiceSlot?.(setValue)}
      <button type="submit">Thêm</button>
    </form>
  )
}
