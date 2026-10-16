import { useMemo } from 'react'
import { filterTasks } from '../../domain/task'
import { FilterBar } from './FilterBar'
import { QuickAdd } from './QuickAdd'
import { TaskRow } from './TaskRow'
import { useTaskStore } from './store'
import { useTaskFilter } from './useTaskFilter'

export function TasksPage() {
  const { tasks, add, cycleStatus } = useTaskStore()
  const [filter, setFilter] = useTaskFilter()
  const visible = useMemo(() => filterTasks(tasks, filter), [tasks, filter])

  return (
    <section>
      <h1>Công việc</h1>
      <QuickAdd onAdd={(title) => void add({ title })} />
      <FilterBar tasks={tasks} filter={filter} onChange={setFilter} />
      {visible.length === 0 ? (
        <p className="empty">Chưa có việc nào.</p>
      ) : (
        <ul className="task-list">
          {visible.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              onToggle={() => void cycleStatus(t.id)}
              onOpen={() => {}}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
