import type { Task } from '../../domain/task'

interface Props {
  overdue: Task[]
  dueSoon: Task[]
}

export function UrgentList({ overdue, dueSoon }: Props) {
  return (
    <section aria-label="Cần xử lý gấp" className="card">
      <h2>Cần xử lý gấp</h2>
      {overdue.length + dueSoon.length === 0 && <p className="empty">Không có việc gấp.</p>}
      <ul>
        {overdue.map((t) => (
          <li key={t.id}>
            <span>{t.title}</span> <span className="due overdue">{t.dueDate}</span>
          </li>
        ))}
        {dueSoon.map((t) => (
          <li key={t.id}>
            <span>{t.title}</span> <span className="due">{t.dueDate}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
