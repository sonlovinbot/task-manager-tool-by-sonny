import { NavLink, Outlet } from 'react-router-dom'

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
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
