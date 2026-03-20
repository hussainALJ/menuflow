import { useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api'
import { useSocket } from '@/hooks/useSocket'
import { ClipboardList, RefreshCw, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const WAITER_STATUSES = ['Ready', 'Served']

const STATUS_STYLES = {
  Ready:  { border: 'border-emerald-200', bg: 'bg-emerald-50', badge: 'badge-ready',  dot: 'bg-emerald-400' },
  Served: { border: 'border-surface-200', bg: 'bg-surface-50', badge: 'badge-served', dot: 'bg-surface-400' },
}

function OrderTicket({ order, onServe }) {
  const style = STATUS_STYLES[order.status] || STATUS_STYLES.Ready

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
        <span className="text-xs text-surface-400">
          Order #{order.id}
        </span>
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

      <p className="text-xs text-surface-400">
        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </p>

      {/* Action */}
      {order.status === 'Ready' && (
        <button
          onClick={() => onServe(order)}
          className="w-full py-2 rounded-xl text-xs font-semibold
                     bg-emerald-500 hover:bg-emerald-600 text-white
                     transition-all duration-200"
        >
          ✓ Mark as served
        </button>
      )}

      {order.status === 'Served' && (
        <div className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-surface-400">
          <CheckCircle2 size={13} />
          Served
        </div>
      )}
    </div>
  )
}

export default function WaiterOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('Ready')

  const load = useCallback(() => {
    api.get('/api/orders').then(({ data }) => {
      const relevant = data.data.orders.filter(o => WAITER_STATUSES.includes(o.status))
      setOrders(relevant)
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  useSocket({
    newOrder: () => load(),
    statusUpdate: () => load(),
  })

  const handleServe = async (order) => {
    try {
      await api.put(`/api/orders/${order.id}/status`, { status: 'Served' })
      toast.success(`Order #${order.id} marked as served`)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update order')
    }
  }

  const filtered = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter)

  const readyCount = orders.filter(o => o.status === 'Ready').length

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <ClipboardList size={22} className="text-brand-500" />
            Orders
          </h1>
          <p className="page-subtitle">
            {readyCount > 0
              ? `${readyCount} order${readyCount > 1 ? 's' : ''} ready to serve`
              : 'No orders ready right now'}
          </p>
        </div>
        <button onClick={load} className="btn-secondary">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {['Ready', 'Served', 'all'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              filter === s
                ? 'bg-surface-900 text-white'
                : 'bg-white border border-surface-200 text-surface-600 hover:border-surface-300'
            )}
          >
            {s === 'all' ? 'All' : s}
            {s === 'Ready' && readyCount > 0 && (
              <span className="ml-1.5 bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {readyCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center animate-fade-in">
          <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-surface-900">
            {filter === 'Ready' ? 'Nothing to serve right now' : 'No orders found'}
          </p>
          <p className="text-xs text-surface-400 mt-1">
            Orders marked as ready by the kitchen will appear here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {filtered.map(order => (
            <OrderTicket key={order.id} order={order} onServe={handleServe} />
          ))}
        </div>
      )}
    </div>
  )
}