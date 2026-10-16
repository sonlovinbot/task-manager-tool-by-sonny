import { createTask } from '../../domain/task'
import { exportCsv, exportIcs, exportJson } from './export'

const NOW = new Date('2026-10-16T03:00:00.000Z')

describe('exportCsv', () => {
  it('quotes commas, quotes and newlines', () => {
    const t = createTask({ title: 'a, "b"', description: 'dòng 1\ndòng 2' }, NOW)
    const csv = exportCsv([t])
    expect(csv).toContain('"a, ""b"""')
    expect(csv).toContain('"dòng 1\ndòng 2"')
  })
  it('starts with BOM, has the header and preserves "Bán hàng"', () => {
    const csv = exportCsv([createTask({ title: 'Bán hàng' }, NOW)])
    expect(csv.startsWith('﻿')).toBe(true)
    expect(csv.split('\n')[0].replace('﻿', '')).toBe(
      'id,title,status,priority,dueDate,label,description,subtasks,createdAt,completedAt',
    )
    expect(csv).toContain('Bán hàng')
  })
  it('neutralizes a title starting with "="', () => {
    const csv = exportCsv([createTask({ title: '=HYPERLINK("x")' }, NOW)])
    expect(csv).toContain(`"'=HYPERLINK(""x"")"`)
  })
})

describe('exportIcs', () => {
  const withDue = createTask({ title: 'Nộp; báo cáo, gấp', description: 'a\nb', dueDate: '2026-12-31' }, NOW)
  const noDue = createTask({ title: 'Không hạn' }, NOW)
  const deleted = { ...createTask({ title: 'Đã xoá', dueDate: '2026-12-01' }, NOW), deletedAt: NOW.toISOString() }

  it('has one VEVENT only for tasks with dueDate and not deleted', () => {
    const ics = exportIcs([withDue, noDue, deleted], NOW)
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1)
    expect(ics).toContain(`UID:${withDue.id}@task-manager`)
  })
  it('escapes comma/semicolon/newline and uses CRLF', () => {
    const ics = exportIcs([withDue], NOW)
    expect(ics).toContain('SUMMARY:Nộp\; báo cáo\\, gấp')
    expect(ics).toContain('DESCRIPTION:a\\nb')
    expect(ics).toContain('\r\n')
    expect(ics.replace(/\r\n/g, '')).not.toContain('\n')
  })
  it('DTSTART;VALUE=DATE equals dueDate without dashes', () => {
    expect(exportIcs([withDue], NOW)).toContain('DTSTART;VALUE=DATE:20261231')
  })
  it('folds long lines at 75 octets', () => {
    const long = createTask({ title: 'x'.repeat(200), dueDate: '2026-12-31' }, NOW)
    const lines = exportIcs([long], NOW).split('\r\n')
    const enc = new TextEncoder()
    expect(lines.every((l) => enc.encode(l).length <= 75)).toBe(true)
  })
})

describe('exportJson', () => {
  it('round-trips version and tasks', () => {
    const t = createTask({ title: 'a' }, NOW)
    const parsed = JSON.parse(exportJson([t], NOW))
    expect(parsed.version).toBe(1)
    expect(parsed.exportedAt).toBe(NOW.toISOString())
    expect(parsed.tasks).toEqual([t])
  })
})
