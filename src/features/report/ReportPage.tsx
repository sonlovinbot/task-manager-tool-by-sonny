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
    <section style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
      <div>
        <h1 className="t-display">Báo cáo</h1>
        {tasks.length === 0 && <p className="empty-line">Chưa có việc nào để báo cáo.</p>}
      </div>
      <div className="cards">
        <div className="card">
          Tổng số việc <strong className="num" data-testid="total">{tasks.length}</strong>
        </div>
        <div className="card">
          Tỷ lệ hoàn thành{' '}
          <strong className="num" data-testid="rate">
            {Math.round(r.rate * 100)}
            <span className="dec">%</span>
          </strong>
        </div>
        <div className="card">
          Quá hạn <strong className="num" data-testid="overdue">{r.urgent.overdue.length}</strong>
        </div>
      </div>
      <UrgentList overdue={r.urgent.overdue} dueSoon={r.urgent.dueSoon} today={today} />
      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: 16 }}>
        <section className="card" aria-label="Xu hướng hoàn thành">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
            <h2 className="t-section">Xu hướng hoàn thành</h2>
            <div className="seg">
              <button type="button" aria-pressed={days === 7} onClick={() => setDays(7)}>
                7 ngày
              </button>
              <button type="button" aria-pressed={days === 30} onClick={() => setDays(30)}>
                30 ngày
              </button>
            </div>
          </div>
          <TrendChart data={r.trend} />
        </section>
        <section className="card" aria-label="Theo trạng thái">
          <h2 className="t-section" style={{ marginBottom: 16 }}>
            Theo trạng thái
          </h2>
          <StatusChart counts={r.status} />
        </section>
      </div>
      <Breakdown byPriority={r.priority} byLabel={r.label} />
    </section>
  )
}
