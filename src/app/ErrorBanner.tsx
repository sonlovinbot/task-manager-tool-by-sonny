import { WarningCircle } from '@phosphor-icons/react'
import { downloadText, exportJson } from '../features/io/export'
import { useTaskStore } from '../features/tasks/store'

export function ErrorBanner() {
  const error = useTaskStore((s) => s.error)
  const tasks = useTaskStore((s) => s.tasks)
  if (!error) return null
  return (
    <div className="banner" role="alert">
      <WarningCircle size={22} aria-hidden />
      {error}
      {tasks.length > 0 && (
        <button
          className="btn sm"
          onClick={() => downloadText('cong-viec-backup.json', 'application/json', exportJson(tasks))}
        >
          Xuất backup
        </button>
      )}
    </div>
  )
}
