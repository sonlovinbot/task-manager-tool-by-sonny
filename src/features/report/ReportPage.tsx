import { useMemo, useState } from 'react'
import {
  completedPerDay,
  completionRate,
  countByLabel,
  countByPriority,
  countByStatus,
  toLocalDate,
  urgentTasks,
} from '../../domain/report'
import { useTaskStore } from '../tasks/store'
import { Breakdown } from './Breakdown'
import { StatusChart } from './StatusChart'
import { TrendChart } from './TrendChart'
import { UrgentList } from './UrgentList'

export function ReportPage() {
  const tasks = useTaskStore((s) => s.tasks)
  const [days, setDays] = useState<7 | 30>(7)
  const today = toLocalDate(new Date())
  const r = useMemo(
    () => ({
      status: countByStatus(tasks),
      rate: completionRate(tasks),
      urgent: urgentTasks(tasks, today),
      trend: completedPerDay(tasks, today, days),
      priority: countByPriority(tasks),
      label: countByLabel(tasks),
    }),
    [tasks, today, days],
  )

  return (
    <section>
      <h1>Báo cáo</h1>
      {tasks.length === 0 && <p className="empty">Chưa có việc nào để báo cáo.</p>}
      <div className="cards">
        <div className="card">
          Tổng số việc <strong data-testid="total">{tasks.length}</strong>
        </div>
        <div className="card">
          Tỷ lệ hoàn thành <strong data-testid="rate">{Math.round(r.rate * 100)}%</strong>
        </div>
        <div className="card">
          Quá hạn <strong data-testid="overdue">{r.urgent.overdue.length}</strong>
        </div>
      </div>
      <section className="card" aria-label="Theo trạng thái">
        <h2>Theo trạng thái</h2>
        <StatusChart counts={r.status} />
      </section>
      <UrgentList overdue={r.urgent.overdue} dueSoon={r.urgent.dueSoon} />
      <section className="card" aria-label="Xu hướng hoàn thành">
        <h2>Xu hướng hoàn thành</h2>
        <div className="toggle">
          <button aria-pressed={days === 7} onClick={() => setDays(7)}>
            7 ngày
          </button>
          <button aria-pressed={days === 30} onClick={() => setDays(30)}>
            30 ngày
          </button>
        </div>
        <TrendChart data={r.trend} />
      </section>
      <Breakdown byPriority={r.priority} byLabel={r.label} />
    </section>
  )
}
