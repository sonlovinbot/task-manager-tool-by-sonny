import { Route, Routes } from 'react-router-dom'
import { ReportPage } from '../features/report/ReportPage'
import { TasksPage } from '../features/tasks/TasksPage'
import { Layout } from './Layout'

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<TasksPage />} />
        <Route path="report" element={<ReportPage />} />
      </Route>
    </Routes>
  )
}
