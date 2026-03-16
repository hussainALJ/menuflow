import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const STATUSES = ['Pending', 'Preparing', 'Ready', 'Served', 'Paid', 'Canceled']

const STATUS_BADGE = {
  Pending:   'badge-pending',
  Preparing: 'badge-preparing',
  Ready:     'badge-ready',
  Served:    'badge-served',
  Paid:      'badge-paid',
  Canceled:  'badge-canceled',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const load = () => {
    setLoading(true)
    api.get('/api/orders').then(({ data }) => {
      setOrders(data.data.orders)
    }).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleStatus = async (order, status) => {
    try {
      await api.put(`/api/orders/${order.id}/status`, { status })
      toast.success(`Order #${order.id} → ${status}`)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot update status')
    }
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">{orders.length} total orders</p>
        </div>
        <button onClick={load} className="btn-secondary">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', ...STATUSES].map(s => (
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
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center text-sm text-surface-400">No orders found</div>
      ) : (
        <div className="space-y-3 animate-fade-in">
          {filtered.map(order => (
            <div key={order.id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-surface-900">Order #{order.id}</span>
                  <span className={STATUS_BADGE[order.status] || 'badge bg-surface-100 text-surface-500'}>
                    {order.status}
                  </span>
                  <span className="text-xs text-surface-400">
                    Table {order.session?.table?.id}
                  </span>
                </div>
                <span className="text-xs text-surface-400">
                  {new Date(order.created_at).toLocaleTimeString()}
                </span>
              </div>

              <div className="space-y-1 mb-4">
                {order.order_items?.map(oi => (
                  <div key={oi.id} className="flex justify-between text-xs text-surface-600">
                    <span>× {oi.quantity} {oi.item?.name}</span>
                    <span className="text-surface-400">IQD {(oi.price_at_time * oi.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 flex-wrap">
                {STATUSES.filter(s => s !== order.status && s !== 'Pending').map(s => (
                  <button
                    key={s}
                    onClick={() => handleStatus(order, s)}
                    className="btn-secondary text-xs py-1 px-3"
                  >
                    → {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
