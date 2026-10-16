import { ArrowDownRight, ArrowUpRight, CheckFat, Tag } from '@phosphor-icons/react'
import { Link, useSearchParams } from 'react-router-dom'
import { completedPerDay, toLocalDate, urgentTasks } from '../domain/report'
import { AccountBox } from '../auth/AccountBox'
import { useTaskStore } from '../features/tasks/store'
import { ThemeToggle } from './ThemeToggle'

export function Sidebar() {
  const tasks = useTaskStore((s) => s.tasks)
  const [params] = useSearchParams()
  const activeLabel = params.get('label')
  const today = toLocalDate(new Date())

  const doneThisWeek = completedPerDay(tasks, today, 7).reduce((n, d) => n + d.count, 0)
  const overdue = urgentTasks(tasks, today).overdue.length

  const counts = new Map<string, number>()
  for (const t of tasks) if (t.label) counts.set(t.label, (counts.get(t.label) ?? 0) + 1)
  const labels = [...counts].sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <aside className="side">
      <div className="brand">
        <div className="brand-mark">
          <i>
            <CheckFat size={18} weight="fill" aria-hidden />
          </i>
          Quản lý công việc
        </div>
        <ThemeToggle />
      </div>

      <div className="block-summary" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="summary-row">
          <span className="lead">
            <span className="arrow up">
              <ArrowUpRight size={16} aria-hidden />
            </span>
            Xong tuần này
          </span>
          <strong className="num" data-testid="done-week">
            +{doneThisWeek}
          </strong>
        </div>
        <div className="summary-row">
          <span className="lead">
            <span className="arrow down">
              <ArrowDownRight size={16} aria-hidden />
            </span>
            Quá hạn
          </span>
          <strong className="num" data-testid="overdue-count">
            {overdue}
          </strong>
        </div>
      </div>

      <div className="block-tiles">
        <div className="t-section" style={{ marginBottom: 14 }}>
          Nhãn nhanh
        </div>
        {labels.length === 0 ? (
          <p className="t-small">Gắn nhãn cho việc để lọc nhanh tại đây.</p>
        ) : (
          <div className="tiles">
            {labels.map(([label, n], i) => {
              const active = activeLabel === label
              return (
                <Link
                  key={label}
                  className={`tile${i === 0 ? ' feature' : ''}${active ? ' on' : ''}`}
                  to={active ? '/' : `/?label=${encodeURIComponent(label)}`}
                  aria-current={active ? 'true' : undefined}
                >
                  <Tag size={i === 0 ? 30 : 22} aria-hidden />
                  <span>{label}</span>
                  <span className="t-small num">{n} việc</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
      <AccountBox />
    </aside>
  )
}
