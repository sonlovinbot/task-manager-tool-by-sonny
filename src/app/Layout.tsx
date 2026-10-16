import { NavLink, Outlet } from 'react-router-dom'
import { ErrorBanner } from './ErrorBanner'
import { DataMenu } from '../features/io/DataMenu'

export function Layout() {
  return (
    <div className="app">
      <header className="app-header">
        <strong>Quản lý công việc</strong>
        <nav>
          <NavLink to="/" end>
            Công việc
          </NavLink>
          <NavLink to="/report">Báo cáo</NavLink>
        </nav>
        <DataMenu />
      </header>
      <ErrorBanner />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
