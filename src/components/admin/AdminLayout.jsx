import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Boxes,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Package,
  Tags,
  Users,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import './AdminLayout.css'

const AdminLayout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const navigation = [
    {
      label: 'Dashboard',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Categories',
      path: '/admin/categories',
      icon: Tags,
    },
    {
      label: 'Products',
      path: '/admin/products',
      icon: Package,
    },
    {
      label: 'Inventory',
      path: '/admin/inventory',
      icon: Boxes,
    },
    {
      label: 'Orders',
      path: '/admin/orders',
      icon: ClipboardList,
    },
    {
      label: 'Customers',
      path: '/admin/customers',
      icon: Users,
    },
  ]

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <NavLink to="/admin/dashboard">FITKART</NavLink>
          <span>ADMIN</span>
        </div>

        <nav
          className="admin-navigation"
          aria-label="Admin navigation"
        >
          {navigation.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                  `admin-navigation__item${
                    isActive
                      ? ' admin-navigation__item--active'
                      : ''
                  }`
                }
              >
                <Icon
                  size={18}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="admin-sidebar__bottom">
          <div className="admin-user">
            <span className="admin-user__label">
              SIGNED IN AS
            </span>

            <strong>
              {user?.fullName || 'Administrator'}
            </strong>

            <span>
              {user?.email || ''}
            </span>
          </div>

          <button
            type="button"
            className="admin-logout"
            onClick={handleLogout}
          >
            <LogOut
              size={18}
              strokeWidth={1.8}
              aria-hidden="true"
            />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <div>
            <p className="admin-header__eyebrow">
              FITKART MANAGEMENT
            </p>

            <h1>Administration</h1>
          </div>

          <div className="admin-header__role">
            ADMIN
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
