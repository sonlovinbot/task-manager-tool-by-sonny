import type { Task } from '../../domain/task'

export function exportJson(tasks: Task[], now: Date = new Date()): string {
  return JSON.stringify({ version: 1, exportedAt: now.toISOString(), tasks }, null, 2)
}

const CSV_HEADER = [
  'id',
  'title',
  'status',
  'priority',
  'dueDate',
  'label',
  'description',
  'subtasks',
  'createdAt',
  'completedAt',
]

function csvCell(value: string | undefined): string {
  let v = value ?? ''
  if (/^[=+\-@]/.test(v)) v = `'${v}`
  return /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
}

export function exportCsv(tasks: Task[]): string {
  const rows = tasks.map((t) =>
    [
      t.id,
      t.title,
      t.status,
      t.priority,
      t.dueDate,
      t.label,
      t.description,
      t.subtasks.map((s) => `[${s.done ? 'x' : ' '}] ${s.title}`).join('; '),
      t.createdAt,
      t.completedAt,
    ]
      .map(csvCell)
      .join(','),
  )
  return '\uFEFF' + [CSV_HEADER.join(','), ...rows].join('\n')
}

const icsEscape = (s: string) =>
  s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n|\r/g, '\\n')

// RFC 5545 §3.1: lines are at most 75 octets; continuation lines start with one space.
function fold(line: string): string[] {
  const enc = new TextEncoder()
  const out: string[] = []
  let cur = ''
  let curBytes = 0
  for (const ch of line) {
    const b = enc.encode(ch).length
    const limit = out.length === 0 ? 75 : 74
    if (curBytes + b > limit) {
      out.push(out.length === 0 ? cur : ' ' + cur)
      cur = ''
      curBytes = 0
    }
    cur += ch
    curBytes += b
  }
  out.push(out.length === 0 ? cur : ' ' + cur)
  return out
}

function nextDay(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10)
}

const compact = (date: string) => date.replace(/-/g, '')
const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

export function exportIcs(tasks: Task[], now: Date = new Date()): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//task-manager//VI',
    'CALSCALE:GREGORIAN',
  ]
  for (const t of tasks) {
    if (!t.dueDate || t.deletedAt) continue
    lines.push(
      'BEGIN:VEVENT',
      `UID:${t.id}@task-manager`,
      `DTSTAMP:${stamp(now)}`,
      `DTSTART;VALUE=DATE:${compact(t.dueDate)}`,
      `DTEND;VALUE=DATE:${compact(nextDay(t.dueDate))}`,
      `SUMMARY:${icsEscape(t.title)}`,
    )
    if (t.description) lines.push(`DESCRIPTION:${icsEscape(t.description)}`)
    lines.push('END:VEVENT')
  }
  lines.push('END:VCALENDAR')
  return lines.flatMap(fold).join('\r\n') + '\r\n'
}

export function downloadText(filename: string, mime: string, content: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: `${mime};charset=utf-8` }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
