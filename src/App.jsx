import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

// Layouts
import StaffLayout from '@/components/layout/StaffLayout'

// Auth
import LoginPage from '@/pages/LoginPage'

// Customer
import CustomerMenu from '@/pages/customer/CustomerMenu'
import CustomerCart from '@/pages/customer/CustomerCart'
import CustomerBill from '@/pages/customer/CustomerBill'

// Admin
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminMenu from '@/pages/admin/AdminMenu'
import AdminCategories from '@/pages/admin/AdminCategories'
import AdminTables from '@/pages/admin/AdminTables'
import AdminOrders from '@/pages/admin/AdminOrders'
import AdminStaff from '@/pages/admin/AdminStaff'

// Chef
import ChefKDS from '@/pages/chef/ChefKDS'

// Cashier
import CashierDashboard from '@/pages/cashier/CashierDashboard'
import CashierBill from '@/pages/cashier/CashierBill'

function PrivateRoute({ children, roles }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to={getRoleHome(user.role)} replace />
  return children
}

function getRoleHome(role) {
  switch (role) {
    case 'Admin':   return '/admin'
    case 'Chef':    return '/chef'
    case 'Cashier': return '/cashier'
    case 'Waiter':  return '/cashier'
    default:        return '/login'
  }
}

function RoleRedirect() {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={getRoleHome(user.role)} replace />
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Customer — no auth required */}
      <Route path="/menu" element={<CustomerMenu />} />
      <Route path="/cart" element={<CustomerCart />} />
      <Route path="/bill/:sessionId" element={<CustomerBill />} />

      {/* Staff routes */}
      <Route
        path="/admin"
        element={
          <PrivateRoute roles={['Admin']}>
            <StaffLayout role="Admin" />
          </PrivateRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="menu" element={<AdminMenu />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="tables" element={<AdminTables />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="staff" element={<AdminStaff />} />
      </Route>

      <Route
        path="/chef"
        element={
          <PrivateRoute roles={['Chef', 'Admin']}>
            <StaffLayout role="Chef" />
          </PrivateRoute>
        }
      >
        <Route index element={<ChefKDS />} />
      </Route>

      <Route
        path="/cashier"
        element={
          <PrivateRoute roles={['Cashier', 'Waiter', 'Admin']}>
            <StaffLayout role="Cashier" />
          </PrivateRoute>
        }
      >
        <Route index element={<CashierDashboard />} />
        <Route path="bill/:sessionId" element={<CashierBill />} />
      </Route>

      {/* Fallback */}
      <Route path="/" element={<RoleRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
