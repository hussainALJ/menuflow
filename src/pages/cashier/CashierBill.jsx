import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { ArrowLeft, Receipt, CheckCircle2, Loader2, Printer } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const STATUS_BADGE = {
  Pending:   'badge-pending',
  Preparing: 'badge-preparing',
  Ready:     'badge-ready',
  Served:    'badge-served',
  Paid:      'badge-paid',
  Canceled:  'badge-canceled',
}

export default function CashierBill() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)

  const load = () => {
    setLoading(true)
    api.get(`/api/sessions/${sessionId}/bill`)
      .then(({ data }) => setSession(data.data.session))
      .catch(() => toast.error('Could not load bill'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [sessionId])

  const handleCheckout = async () => {
    if (!confirm('Mark session as paid and release the table?')) return
    setChecking(true)
    try {
      await api.put(`/api/sessions/${sessionId}/checkout`)
      toast.success('Checkout complete — table is now available')
      navigate('/cashier')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed')
    } finally {
      setChecking(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="skeleton h-8 w-32 mb-8" />
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="max-w-lg mx-auto">
        <button onClick={() => navigate('/cashier')} className="btn-ghost mb-6">
          <ArrowLeft size={15} /> Back
        </button>
        <div className="card p-12 text-center text-sm text-surface-400">Session not found</div>
      </div>
    )
  }

  const isClosed = session.status === 'Closed'

  return (
    <div className="max-w-lg mx-auto animate-slide-up">
      <button onClick={() => navigate('/cashier')} className="btn-ghost mb-6">
        <ArrowLeft size={15} /> Tables
      </button>

      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <Receipt size={20} className="text-brand-500" />
          Session #{session.id}
        </h1>
        <p className="page-subtitle">
          Table {session.table?.id} ·{' '}
          {new Date(session.created_at).toLocaleString()}
        </p>
      </div>

      <div className="card overflow-hidden mb-4">
        {/* Orders */}
        {session.orders?.length === 0 ? (
          <div className="p-8 text-center text-sm text-surface-400">No orders yet</div>
        ) : (
          <div className="divide-y divide-surface-50">
            {session.orders?.map(order => (
              <div key={order.id} className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-surface-700">Order #{order.id}</span>
                  <span className={clsx('badge text-[10px]', STATUS_BADGE[order.status])}>
                    {order.status}
                  </span>
                  <span className="text-xs text-surface-400 ml-auto">
                    {new Date(order.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {order.order_items?.map(oi => (
                    <div key={oi.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-surface-100 rounded-md text-xs flex items-center justify-center font-semibold text-surface-600">
                          {oi.quantity}
                        </span>
                        <span className="text-sm text-surface-700">{oi.item?.name}</span>
                      </div>
                      <span className="text-sm text-surface-500">
                        IQD {(oi.price_at_time * oi.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Total */}
        <div className="px-5 py-4 bg-surface-50 border-t border-surface-100 flex items-center justify-between">
          <span className="text-sm font-semibold text-surface-700">Total</span>
          <span className="text-xl font-bold text-surface-900">
            IQD {(session.total ?? 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => window.print()}
          className="btn-secondary flex-1"
        >
          <Printer size={15} /> Print receipt
        </button>

        {!isClosed ? (
          <button
            onClick={handleCheckout}
            disabled={checking}
            className="btn-primary flex-1"
          >
            {checking
              ? <Loader2 size={15} className="animate-spin" />
              : <CheckCircle2 size={15} />}
            {checking ? 'Processing…' : 'Checkout'}
          </button>
        ) : (
          <div className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium border border-emerald-200">
            <CheckCircle2 size={15} />
            Paid & closed
          </div>
        )}
      </div>
    </div>
  )
}
