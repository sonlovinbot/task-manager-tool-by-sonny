import { CalendarBlank, HourglassMedium, WarningCircle } from '@phosphor-icons/react'
import { daysBetween } from '../../domain/report'
import type { Task } from '../../domain/task'
import { PRIORITY_LABEL } from '../tasks/labels'

interface Props {
  overdue: Task[]
  dueSoon: Task[]
  today: string
}

export function UrgentList({ overdue, dueSoon, today }: Props) {
  const cards = [
    ...overdue.map((t) => ({ t, tone: 'coral' as const, diff: daysBetween(t.dueDate!, today), late: true })),
    ...dueSoon.map((t) => {
      const diff = daysBetween(today, t.dueDate!)
      return { t, tone: diff <= 2 ? ('violet' as const) : ('blue' as const), diff, late: false }
    }),
  ]
  const featureId = dueSoon[0]?.id
  return (
    <section aria-label="Cần xử lý gấp">
      <h2 className="t-section" style={{ marginBottom: 6 }}>
        Cần xử lý gấp
      </h2>
      {cards.length === 0 ? (
        <p className="empty-line">Không có việc gấp.</p>
      ) : (
        <div className="gcards">
          {cards.map(({ t, tone, diff, late }) => {
            const Icon = late ? WarningCircle : tone === 'violet' ? HourglassMedium : CalendarBlank
            return (
              <article key={t.id} className={`gcard ${tone}${t.id === featureId ? ' feature' : ''}`}>
                <span className="gicon">
                  <Icon size={20} aria-hidden />
                </span>
                <div>
                  <div className="gl">{late ? 'Quá hạn' : 'Hạn trong'}</div>
                  <div className="gbig num">{diff === 0 ? 'Hôm nay' : `${diff} ngày`}</div>
                </div>
                <div>
                  <div className="gt">{t.title}</div>
                  <div className="gs">
                    {t.dueDate} · Ưu tiên {PRIORITY_LABEL[t.priority].toLowerCase()}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
