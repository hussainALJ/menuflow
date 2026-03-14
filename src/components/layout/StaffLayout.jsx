import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import {
  LayoutDashboard, UtensilsCrossed, Tag, TableProperties,
  ClipboardList, Users, ChefHat, CreditCard, LogOut,
  Bell, Menu as MenuIcon, X
} from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const NAV = {
  Admin: [
    { to: '/admin',            label: 'Dashboard',   icon: LayoutDashboard, end: true },
    { to: '/admin/menu',       label: 'Menu items',  icon: UtensilsCrossed },
    { to: '/admin/categories', label: 'Categories',  icon: Tag },
    { to: '/admin/tables',     label: 'Tables',      icon: TableProperties },
    { to: '/admin/orders',     label: 'Orders',      icon: ClipboardList },
    { to: '/admin/staff',      label: 'Staff',       icon: Users },
  ],
  Chef: [
    { to: '/chef', label: 'Kitchen display', icon: ChefHat, end: true },
  ],
  Cashier: [
    { to: '/cashier', label: 'Tables & billing', icon: CreditCard, end: true },
  ],
  Waiter: [
    { to: '/cashier', label: 'Tables & billing', icon: CreditCard, end: true },
  ],
}

const ROLE_COLORS = {
  Admin:   'bg-brand-500',
  Chef:    'bg-amber-500',
  Cashier: 'bg-blue-500',
  Waiter:  'bg-emerald-500',
}

export default function StaffLayout({ role }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = NAV[user?.role] || NAV[role] || []

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/login')
  }

  const initials = user?.username?.slice(0, 2).toUpperCase() || 'SU'

  return (
    <div className="flex h-screen bg-surface-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed lg:static inset-y-0 left-0 z-30',
          'w-60 bg-white border-r border-surface-100',
          'flex flex-col',
          'transition-transform duration-300 ease-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-surface-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <UtensilsCrossed size={14} className="text-white" />
            </div>
            <span className="font-display text-xl text-surface-900">Sufra</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                isActive ? 'sidebar-link-active' : 'sidebar-link'
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-surface-100">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-surface-50">
            <div className={clsx(
              'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0',
              ROLE_COLORS[user?.role] || 'bg-surface-400'
            )}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-900 truncate">{user?.username}</p>
              <p className="text-xs text-surface-400">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-surface-400 hover:text-red-500 transition-colors p-1"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-surface-100 flex items-center px-4 gap-3 flex-shrink-0">
          <button
            className="lg:hidden btn-ghost p-2"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon size={18} />
          </button>
          <div className="flex-1" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
