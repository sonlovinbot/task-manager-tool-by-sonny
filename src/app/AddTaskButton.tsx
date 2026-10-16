import { Plus } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'

export const QUICK_ADD_ID = 'quick-add-input'

export function AddTaskButton() {
  const navigate = useNavigate()
  const go = () => {
    navigate('/')
    requestAnimationFrame(() => document.getElementById(QUICK_ADD_ID)?.focus())
  }
  return (
    <button className="btn-add" type="button" onClick={go}>
      <span className="tile">
        <Plus size={18} aria-hidden />
      </span>
      <b>Thêm việc</b>
    </button>
  )
}
