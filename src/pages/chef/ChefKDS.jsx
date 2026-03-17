import { useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api'
import { useSocket } from '@/hooks/useSocket'
import { ChefHat, Clock, RefreshCw, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const CHEF_STATUSES = ['Pending', 'Preparing', 'Ready']

const TICKET_STYLES = {
  Pending:   { border: 'border-amber-200', bg: 'bg-amber-50',    badge: 'badge-pending',   dot: 'bg-amber-400' },
  Preparing: { border: 'border-blue-200',  bg: 'bg-blue-50',     badge: 'badge-preparing', dot: 'bg-blue-400 animate-pulse' },
  Ready:     { border: 'border-emerald-200', bg: 'bg-emerald-50', badge: 'badge-ready',    dot: 'bg-emerald-400' },
}

function elapsed(created_at) {
  const diff = Math.floor((Date.now() - new Date(created_at)) / 1000)
  if (diff < 60) return `${diff}s`
  return `${Math.floor(diff / 60)}m ${diff % 60}s`
}

function Ticket({ order, onStatus }) {
  const [, setTick] = useState(0)
  const style = TICKET_STYLES[order.status] || TICKET_STYLES.Pending

  // Re-render every second for elapsed timer
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const nextStatus = order.status === 'Pending' ? 'Preparing' : order.status === 'Preparing' ? 'Ready' : null

  return (
    <div className={clsx(
      'rounded-2xl border-2 p-4 flex flex-col gap-3 transition-all duration-300',
      style.border, style.bg
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={clsx('w-2 h-2 rounded-full', style.dot)} />
          <span className="text-sm font-semibold text-surface-900">
            Table {order.session?.table?.id}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-surface-500">
          <Clock size={11} />
          {elapsed(order.created_at)}
        </div>
      </div>

      <span className={clsx('self-start', style.badge)}>{order.status}</span>

      {/* Items */}
      <ul className="space-y-1.5">
        {order.order_items?.map(oi => (
          <li key={oi.id} className="flex items-start gap-2 text-sm">
            <span className="w-5 h-5 bg-white rounded-md flex items-center justify-center text-xs font-bold text-surface-600 flex-shrink-0 mt-0.5 shadow-sm">
              {oi.quantity}
            </span>
            <div>
              <span className="text-surface-900 font-medium">{oi.item?.name}</span>
              {oi.notes && (
                <p className="text-xs text-surface-400 mt-0.5 italic">Note: {oi.notes}</p>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        {nextStatus && (
          <button
            onClick={() => onStatus(order, nextStatus)}
            className={clsx(
              'flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-200',
              nextStatus === 'Preparing'
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            )}
          >
            {nextStatus === 'Preparing' ? 'Start cooking' : '✓ Mark ready'}
          </button>
        )}
        {order.status !== 'Canceled' && (
          <button
            onClick={() => onStatus(order, 'Canceled')}
            className="px-3 py-2 rounded-xl text-xs font-medium bg-white hover:bg-red-50 text-red-500 hover:text-red-600 border border-red-100 transition-all"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}

export default function ChefKDS() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    api.get('/api/orders').then(({ data }) => {
      const active = data.data.orders.filter(o => CHEF_STATUSES.includes(o.status))
      setOrders(active)
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  useSocket({
    newOrder: (data) => {
      toast(`New order — Table ${data.table_number}`, {
        icon: '🍽️',
        duration: 5000,
      })
      load()
    },
    statusUpdate: () => load(),
  })

  const handleStatus = async (order, status) => {
    try {
      await api.put(`/api/orders/${order.id}/status`, { status })
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot update')
    }
  }

  const pending   = orders.filter(o => o.status === 'Pending')
  const preparing = orders.filter(o => o.status === 'Preparing')
  const ready     = orders.filter(o => o.status === 'Ready')

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <ChefHat size={22} className="text-brand-500" />
            Kitchen display
          </h1>
          <p className="page-subtitle">Live orders · updates in real-time</p>
        </div>
        <button onClick={load} className="btn-secondary">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="card p-16 text-center animate-fade-in">
          <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-surface-900">All caught up!</p>
          <p className="text-xs text-surface-400 mt-1">No active orders right now</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          {/* Column: Pending */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <h2 className="text-xs font-semibold text-surface-500 uppercase tracking-wide">Pending</h2>
              <span className="ml-auto badge bg-amber-100 text-amber-700">{pending.length}</span>
            </div>
            <div className="space-y-3">
              {pending.map(o => <Ticket key={o.id} order={o} onStatus={handleStatus} />)}
              {pending.length === 0 && <p className="text-xs text-surface-400 text-center py-6">Empty</p>}
            </div>
          </div>

          {/* Column: Preparing */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <h2 className="text-xs font-semibold text-surface-500 uppercase tracking-wide">Preparing</h2>
              <span className="ml-auto badge bg-blue-100 text-blue-700">{preparing.length}</span>
            </div>
            <div className="space-y-3">
              {preparing.map(o => <Ticket key={o.id} order={o} onStatus={handleStatus} />)}
              {preparing.length === 0 && <p className="text-xs text-surface-400 text-center py-6">Empty</p>}
            </div>
          </div>

          {/* Column: Ready */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <h2 className="text-xs font-semibold text-surface-500 uppercase tracking-wide">Ready to serve</h2>
              <span className="ml-auto badge bg-emerald-100 text-emerald-700">{ready.length}</span>
            </div>
            <div className="space-y-3">
              {ready.map(o => <Ticket key={o.id} order={o} onStatus={handleStatus} />)}
              {ready.length === 0 && <p className="text-xs text-surface-400 text-center py-6">Empty</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
