import { CalendarBlank, CaretDown, Database, DownloadSimple, UploadSimple } from '@phosphor-icons/react'
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
      <button className="btn" aria-expanded={open} onClick={() => setOpen(!open)}>
        <Database size={18} aria-hidden />
        Dữ liệu
        <CaretDown size={14} aria-hidden />
      </button>
      {open && (
        <div className="menu">
          <button
            onClick={() => {
              downloadText(`cong-viec-${stamp}.json`, 'application/json', exportJson(tasks))
              setOpen(false)
            }}
          >
            <DownloadSimple size={18} aria-hidden />
            Xuất JSON
          </button>
          <button
            onClick={() => {
              downloadText(`cong-viec-${stamp}.csv`, 'text/csv', exportCsv(tasks))
              setOpen(false)
            }}
          >
            <DownloadSimple size={18} aria-hidden />
            Xuất CSV
          </button>
          <button
            onClick={() => {
              downloadText(`cong-viec-${stamp}.ics`, 'text/calendar', exportIcs(tasks))
              setOpen(false)
            }}
          >
            <CalendarBlank size={18} aria-hidden />
            Xuất lịch (.ics)
          </button>
          <hr />
          <button onClick={() => fileRef.current?.click()}>
            <UploadSimple size={18} aria-hidden />
            Nhập JSON
          </button>
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        aria-label="Chọn tệp JSON"
        hidden
        onChange={(e) => void onFile(e.target.files?.[0])}
      />
      {error && (
        <p role="alert" className="banner" style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', zIndex: 20, width: 320 }}>
          {error}
        </p>
      )}
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
