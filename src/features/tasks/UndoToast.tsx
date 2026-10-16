import { useTaskStore } from './store'

export function UndoToast() {
  const lastDeletedId = useTaskStore((s) => s.lastDeletedId)
  const undoRemove = useTaskStore((s) => s.undoRemove)
  if (!lastDeletedId) return null
  return (
    <div className="toast" role="status">
      Đã xoá việc
      <button onClick={() => void undoRemove()}>Hoàn tác</button>
    </div>
  )
}
