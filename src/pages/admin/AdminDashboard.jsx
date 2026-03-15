import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { TrendingUp, ShoppingBag, TableProperties, Star } from 'lucide-react'
import clsx from 'clsx'

function StatCard({ label, value, icon: Icon, color, delay }) {
  return (
    <div className={clsx('stat-card animate-slide-up opacity-0', delay)} style={{ animationFillMode: 'forwards' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-surface-400 uppercase tracking-wide">{label}</span>
        <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', color)}>
          <Icon size={14} className="text-white" />
        </div>
      </div>
      <p className="text-3xl font-semibold text-surface-900">{value}</p>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/stats').then(({ data }) => {
      setStats(data.data)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div className="skeleton h-7 w-40 mb-2" />
          <div className="skeleton h-4 w-56" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[1,2,3].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  const dailySales = stats?.daily_sales ?? 0
  const todayOrders = stats?.today_orders ?? 0
  const activeTables = stats?.active_tables ?? 0
  const topItems = stats?.top_items ?? []

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Today's overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Sales today"
          value={`IQD ${dailySales.toLocaleString()}`}
          icon={TrendingUp}
          color="bg-brand-500"
          delay="stagger-1"
        />
        <StatCard
          label="Orders today"
          value={todayOrders}
          icon={ShoppingBag}
          color="bg-blue-500"
          delay="stagger-2"
        />
        <StatCard
          label="Active tables"
          value={activeTables}
          icon={TableProperties}
          color="bg-emerald-500"
          delay="stagger-3"
        />
      </div>

      {/* Top items */}
      <div className="card animate-slide-up opacity-0 stagger-4" style={{ animationFillMode: 'forwards' }}>
        <div className="table-header">
          <div>
            <h2 className="text-sm font-semibold text-surface-900">Top selling items</h2>
            <p className="text-xs text-surface-400 mt-0.5">All time</p>
          </div>
          <Star size={16} className="text-brand-400" />
        </div>
        <div className="divide-y divide-surface-50">
          {topItems.length === 0 && (
            <p className="px-6 py-8 text-sm text-surface-400 text-center">No data yet</p>
          )}
          {topItems.map((item, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-surface-50 transition-colors">
              <span className="w-6 h-6 rounded-full bg-surface-100 flex items-center justify-center text-xs font-semibold text-surface-500">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface-900 truncate">
                  {item.menu_item?.name ?? 'Unknown item'}
                </p>
                <p className="text-xs text-surface-400">
                  IQD {(item.menu_item?.price ?? 0).toLocaleString()} each
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-surface-900">×{item.total_sold}</p>
                <p className="text-xs text-surface-400">sold</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
