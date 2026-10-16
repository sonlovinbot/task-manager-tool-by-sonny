import { useRef, useState } from 'react'
import { toLocalDate } from '../../domain/report'
import type { Task } from '../../domain/task'
import { useTaskStore } from '../tasks/store'
import { downloadText, exportCsv, exportIcs, exportJson } from './export'
import { ImportDialog } from './ImportDialog'
import { parseImport } from './import'

export function DataMenu() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string>()
  const [pending, setPending] = useState<{ tasks: Task[]; skipped: number }>()
  const fileRef = useRef<HTMLInputElement>(null)
  const { tasks, mergeAll, replaceAll } = useTaskStore()
  const stamp = toLocalDate(new Date())

  const onFile = async (file: File | undefined) => {
    if (!file) return
    setError(undefined)
    const res = parseImport(await readText(file))
    if (res.ok) setPending({ tasks: res.tasks, skipped: res.skipped })
    else setError(res.error)
    if (fileRef.current) fileRef.current.value = ''
  }

  const finish = () => {
    setPending(undefined)
    setOpen(false)
  }

  return (
    <div className="data-menu">
      <button aria-expanded={open} onClick={() => setOpen(!open)}>
        Dữ liệu
      </button>
      {open && (
        <ul className="menu">
          <li>
            <button onClick={() => downloadText(`cong-viec-${stamp}.json`, 'application/json', exportJson(tasks))}>
              Xuất JSON
            </button>
          </li>
          <li>
            <button onClick={() => downloadText(`cong-viec-${stamp}.csv`, 'text/csv', exportCsv(tasks))}>
              Xuất CSV
            </button>
          </li>
          <li>
            <button onClick={() => downloadText(`cong-viec-${stamp}.ics`, 'text/calendar', exportIcs(tasks))}>
              Xuất lịch (.ics)
            </button>
          </li>
          <li>
            <button onClick={() => fileRef.current?.click()}>Nhập JSON</button>
          </li>
        </ul>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        aria-label="Chọn tệp JSON"
        hidden
        onChange={(e) => void onFile(e.target.files?.[0])}
      />
      {error && <p role="alert">{error}</p>}
      {pending && (
        <ImportDialog
          count={pending.tasks.length}
          skipped={pending.skipped}
          onMerge={() => void mergeAll(pending.tasks).then(finish)}
          onReplace={() => void replaceAll(pending.tasks).then(finish)}
          onCancel={() => setPending(undefined)}
        />
      )}
    </div>
  )
}

function readText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = () => reject(r.error)
    r.readAsText(file)
  })
}
