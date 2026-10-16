import { Route, Routes } from 'react-router-dom'
import { AuthPage } from '../auth/AuthPage'
import { ReportPage } from '../features/report/ReportPage'
import { TasksPage } from '../features/tasks/TasksPage'
import { Layout } from './Layout'

export function App() {
  return (
    <Routes>
      <Route path="auth" element={<AuthPage />} />
      <Route element={<Layout />}>
        <Route index element={<TasksPage />} />
        <Route path="report" element={<ReportPage />} />
      </Route>
    </Routes>
  )
}
