import { useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api'
import { useSocket } from '@/hooks/useSocket'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Bell, UserRound, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function CashierDashboard() {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [billRequests, setBillRequests] = useState([])
  const [waiterCalls, setWaiterCalls] = useState([])
  const navigate = useNavigate()

  const load = useCallback(() => {
    api.get('/api/tables').then(({ data }) => {
      setTables(data.data.tables)
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  useSocket({
    requestBill: (data) => {
      setBillRequests(prev => {
        if (prev.find(r => r.session_id === data.session_id)) return prev
        return [...prev, data]
      })
      toast(`💳 ${data.message}`, { duration: 8000 })
    },
    callWaiter: (data) => {
      setWaiterCalls(prev => {
        if (prev.find(r => r.session_id === data.session_id)) return prev
        return [...prev, data]
      })
      toast(`🔔 ${data.message}`, { duration: 8000 })
    },
    statusUpdate: () => load(),
  })

  const handleTableClick = (table) => {
    const session = table.sessions?.[0]
    if (session) {
      navigate(`/cashier/bill/${session.id}`)
    } else {
      toast('No active session on this table', { icon: 'ℹ️' })
    }
  }

  const handleBillNav = (req) => {
    setBillRequests(prev => prev.filter(r => r.session_id !== req.session_id))
    navigate(`/cashier/bill/${req.session_id}`)
  }

  const dismissWaiter = (req) => {
    setWaiterCalls(prev => prev.filter(r => r.session_id !== req.session_id))
  }

  const occupied = tables.filter(t => t.status === 'Occupied')
  const available = tables.filter(t => t.status === 'Available')

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Tables & billing</h1>
          <p className="page-subtitle">
            {occupied.length} occupied · {available.length} available
          </p>
        </div>
        <button onClick={load} className="btn-secondary">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Live notifications */}
      {(billRequests.length > 0 || waiterCalls.length > 0) && (
        <div className="space-y-2 mb-6 animate-slide-in-right">
          {billRequests.map(req => (
            <div key={req.session_id} className="card p-4 border-l-4 border-brand-400 flex items-center gap-4">
              <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <CreditCard size={16} className="text-brand-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface-900">{req.message}</p>
                <p className="text-xs text-surface-400 mt-0.5">Bill request</p>
              </div>
              <button onClick={() => handleBillNav(req)} className="btn-primary text-xs py-1.5 px-4">
                Open bill
              </button>
            </div>
          ))}

          {waiterCalls.map(req => (
            <div key={req.session_id} className="card p-4 border-l-4 border-amber-400 flex items-center gap-4">
              <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <UserRound size={16} className="text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface-900">{req.message}</p>
                <p className="text-xs text-surface-400 mt-0.5">Waiter call</p>
              </div>
              <button onClick={() => dismissWaiter(req)} className="btn-secondary text-xs py-1.5 px-4">
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Table map */}
      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      ) : tables.length === 0 ? (
        <div className="card p-16 text-center text-sm text-surface-400">No tables configured</div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4 animate-fade-in">
          {tables.map(table => {
            const active = table.status === 'Occupied'
            const hasBillReq = billRequests.some(r => r.table_id === table.id)
            const hasWaiterCall = waiterCalls.some(r => r.table_id === table.id)

            return (
              <button
                key={table.id}
                onClick={() => handleTableClick(table)}
                className={clsx(
                  'relative card p-4 flex flex-col items-center gap-2 transition-all duration-200 cursor-pointer',
                  'hover:shadow-card-hover hover:-translate-y-0.5',
                  active ? 'border-amber-200 bg-amber-50' : 'hover:border-surface-300'
                )}
              >
                {/* Notification indicators */}
                {hasBillReq && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-brand-500 rounded-full animate-pulse-warm" />
                )}
                {hasWaiterCall && !hasBillReq && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
                )}

                <div className={clsx(
                  'w-12 h-12 rounded-xl flex items-center justify-center text-xl font-semibold',
                  active ? 'bg-amber-200 text-amber-800' : 'bg-surface-100 text-surface-500'
                )}>
                  {table.id}
                </div>

                <span className={clsx(
                  'text-xs font-medium',
                  active ? 'text-amber-700' : 'text-surface-400'
                )}>
                  {active ? 'Occupied' : 'Free'}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
