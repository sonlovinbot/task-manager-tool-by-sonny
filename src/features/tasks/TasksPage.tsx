import { useMemo, useState } from 'react'
import { filterTasks } from '../../domain/task'
import { MicButton } from '../voice/MicButton'
import { EmptyState } from './EmptyState'
import { FilterBar } from './FilterBar'
import { QuickAdd } from './QuickAdd'
import { TaskDrawer } from './TaskDrawer'
import { TaskRow } from './TaskRow'
import { UndoToast } from './UndoToast'
import { useTaskStore } from './store'
import { useTaskFilter } from './useTaskFilter'

export function TasksPage() {
  const { tasks, loaded, add, cycleStatus } = useTaskStore()
  const [filter, setFilter] = useTaskFilter()
  const [openId, setOpenId] = useState<string | null>(null)
  const visible = useMemo(() => filterTasks(tasks, filter), [tasks, filter])
  const drawerOpen = openId !== null && tasks.some((t) => t.id === openId)
  const open = tasks.filter((t) => t.status !== 'done').length
  const hasFilter = !!(filter.status || filter.priority || filter.label || filter.q)

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <h1 className="t-display">Công việc</h1>
        <p className="t-small" style={{ marginTop: 6 }}>
          {tasks.length} việc, {open} chưa xong.
        </p>
      </div>
      <QuickAdd
        onAdd={(title) => void add({ title })}
        voiceSlot={(setText) => <MicButton onText={setText} />}
      />
      <FilterBar tasks={tasks} filter={filter} onChange={setFilter} />
      <div className={`tasks-layout${drawerOpen ? ' has-drawer' : ''}`}>
        <div>
          {!loaded ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} aria-busy="true">
              <div className="skeleton" />
              <div className="skeleton" />
              <div className="skeleton" />
            </div>
          ) : visible.length === 0 ? (
            <EmptyState
              filtered={hasFilter && tasks.length > 0}
              onClear={() => setFilter({ status: undefined, priority: undefined, label: undefined, q: undefined })}
            />
          ) : (
            <ul className="task-list">
              {visible.map((t) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  open={t.id === openId}
                  onToggle={() => void cycleStatus(t.id)}
                  onOpen={() => setOpenId(t.id)}
                />
              ))}
            </ul>
          )}
        </div>
        {drawerOpen && (
          <div className="drawer-col">
            <TaskDrawer taskId={openId} onClose={() => setOpenId(null)} />
          </div>
        )}
      </div>
      <UndoToast />
    </section>
  )
}
