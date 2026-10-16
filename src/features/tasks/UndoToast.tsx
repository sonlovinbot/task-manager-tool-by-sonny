import { useTaskStore } from './store'

export function UndoToast() {
  const lastDeletedId = useTaskStore((s) => s.lastDeletedId)
  const undoRemove = useTaskStore((s) => s.undoRemove)
  if (!lastDeletedId) return null
  return (
    <div className="toast-wrap">
      <div className="toast" role="status">
        Đã xoá việc
        <button className="btn sm" onClick={() => void undoRemove()}>
          Hoàn tác
        </button>
      </div>
    </div>
  )
}
