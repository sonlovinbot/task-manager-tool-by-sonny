import { NavLink, Outlet } from 'react-router-dom'
import { DataMenu } from '../features/io/DataMenu'
import { AddTaskButton } from './AddTaskButton'
import { ErrorBanner } from './ErrorBanner'
import { Sidebar } from './Sidebar'

export function Layout() {
  return (
    <div className="app">
      <div className="shell">
        <Sidebar />
        <div className="main">
          <ErrorBanner />
          <div className="topbar">
            <nav className="pill-nav" aria-label="Điều hướng chính">
              <NavLink to="/" end>
                Công việc
              </NavLink>
              <NavLink to="/report">Báo cáo</NavLink>
            </nav>
            <div className="pv-row" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <DataMenu />
              <AddTaskButton />
            </div>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
