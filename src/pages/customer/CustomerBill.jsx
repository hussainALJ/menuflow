import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { useCartStore } from '@/store/cartStore'
import { getSocket } from '@/hooks/useSocket'
import { ArrowLeft, Bell, CreditCard, CheckCircle2, Clock, RefreshCw, UtensilsCrossed } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const STATUS_CONFIG = {
  Pending:   { label: 'Received',  icon: Clock,         color: 'text-amber-500',  bg: 'bg-amber-50'   },
  Preparing: { label: 'Preparing', icon: UtensilsCrossed, color: 'text-blue-500', bg: 'bg-blue-50'    },
  Ready:     { label: 'Ready',     icon: CheckCircle2,   color: 'text-emerald-500', bg: 'bg-emerald-50' },
  Served:    { label: 'Served',    icon: CheckCircle2,   color: 'text-surface-500', bg: 'bg-surface-100' },
  Paid:      { label: 'Paid',      icon: CreditCard,     color: 'text-brand-500',  bg: 'bg-brand-50'   },
  Canceled:  { label: 'Canceled',  icon: Clock,          color: 'text-red-400',    bg: 'bg-red-50'     },
}

export default function CustomerBill() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { tableId, clearCart } = useCartStore()

  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [callingWaiter, setCallingWaiter] = useState(false)
  const [requestingBill, setRequestingBill] = useState(false)
  const [billRequested, setBillRequested] = useState(false)

  const load = useCallback(() => {
    api.get(`/api/sessions/${sessionId}/bill`)
      .then(({ data }) => setSession(data.data.session))
      .catch(() => toast.error('Could not load orders'))
      .finally(() => setLoading(false))
  }, [sessionId])

  useEffect(() => { load() }, [load])

  // Listen for status updates via socket
  useEffect(() => {
    const socket = getSocket()
    if (!socket.connected) {
      socket.connect()
      socket.on('connect', () => {
        if (tableId) socket.emit('join', { table_id: tableId })
      })
    } else if (tableId) {
      socket.emit('join', { table_id: tableId })
    }

    socket.on('statusUpdate', () => load())
    return () => socket.off('statusUpdate')
  }, [tableId, load])

  const handleCallWaiter = () => {
    setCallingWaiter(true)
    const socket = getSocket()
    socket.emit('callWaiter', { table_id: tableId, session_id: Number(sessionId) })
    toast.success('Waiter is on the way!')
    setTimeout(() => setCallingWaiter(false), 3000)
  }

  const handleRequestBill = () => {
    setRequestingBill(true)
    const socket = getSocket()
    socket.emit('requestBill', { table_id: tableId, session_id: Number(sessionId) })
    setBillRequested(true)
    toast.success('Bill requested — cashier has been notified')
    setTimeout(() => setRequestingBill(false), 3000)
  }

  const activeOrders = session?.orders?.filter(o => o.status !== 'Canceled') ?? []
  const total = session?.total ?? 0
  const isClosed = session?.status === 'Closed'

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-surface-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(tableId ? `/menu?table=${tableId}` : '/menu')}
            className="btn-ghost p-2"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-semibold text-surface-900">My orders</h1>
            <p className="text-xs text-surface-400">Table {tableId || '—'}</p>
          </div>
          <button onClick={load} className="btn-ghost p-2">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 pb-36">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <div key={i} className="skeleton h-40 rounded-2xl" />)}
          </div>
        ) : activeOrders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-surface-400 text-sm mb-4">No orders yet</p>
            <button
              onClick={() => navigate(tableId ? `/menu?table=${tableId}` : '/menu')}
              className="btn-primary"
            >
              Browse menu
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {activeOrders.map((order, idx) => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending
              const Icon = cfg.icon
              return (
                <div key={order.id} className="card overflow-hidden">
                  {/* Order header */}
                  <div className={clsx('flex items-center gap-3 px-4 py-3', cfg.bg)}>
                    <Icon size={16} className={cfg.color} />
                    <div className="flex-1">
                      <span className={clsx('text-sm font-semibold', cfg.color)}>{cfg.label}</span>
                      <span className="text-xs text-surface-400 ml-2">
                        Order {idx + 1} · {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="px-4 py-3 space-y-2">
                    {order.order_items?.map(oi => (
                      <div key={oi.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 bg-surface-100 rounded-md text-xs flex items-center justify-center font-semibold text-surface-500">
                            {oi.quantity}
                          </span>
                          <div>
                            <span className="text-sm text-surface-800">{oi.item?.name}</span>
                            {oi.notes && (
                              <p className="text-xs text-surface-400 italic">{oi.notes}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-surface-500">
                          IQD {(oi.price_at_time * oi.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            {/* Total */}
            <div className="card p-5 flex items-center justify-between">
              <span className="text-sm font-semibold text-surface-700">Total</span>
              <span className="text-2xl font-bold text-surface-900">
                IQD {total.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {!isClosed && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-sm px-4">
          <div className="flex gap-3">
            <button
              onClick={handleCallWaiter}
              disabled={callingWaiter}
              className="flex-1 flex items-center justify-center gap-2 py-3.5
                         bg-white border-2 border-surface-200 hover:border-amber-300
                         text-surface-700 hover:text-amber-700
                         font-semibold text-sm rounded-2xl shadow-card
                         transition-all duration-200 disabled:opacity-60"
            >
              <Bell size={16} className={callingWaiter ? 'animate-bounce-soft' : ''} />
              {callingWaiter ? 'Called!' : 'Call waiter'}
            </button>

            <button
              onClick={handleRequestBill}
              disabled={requestingBill || billRequested}
              className="flex-1 flex items-center justify-center gap-2 py-3.5
                         bg-brand-500 hover:bg-brand-600 active:bg-brand-700
                         text-white font-semibold text-sm rounded-2xl
                         shadow-warm hover:shadow-warm-lg
                         transition-all duration-200 disabled:opacity-60"
            >
              <CreditCard size={16} />
              {billRequested ? 'Bill sent ✓' : 'Request bill'}
            </button>
          </div>
        </div>
      )}

      {isClosed && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-sm px-4">
          <div className="w-full flex items-center justify-center gap-2 py-3.5
                          bg-emerald-50 border-2 border-emerald-200
                          text-emerald-700 font-semibold text-sm rounded-2xl">
            <CheckCircle2 size={16} />
            Paid — Thank you!
          </div>
        </div>
      )}
    </div>
  )
}
