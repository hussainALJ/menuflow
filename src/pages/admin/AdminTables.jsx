import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Plus, Trash2, TableProperties, QrCode, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function AdminTables() {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [qrModal, setQrModal] = useState(null)

  const load = () => api.get('/api/tables').then(({ data }) => {
    setTables(data.data.tables)
    setLoading(false)
  })

  useEffect(() => { load() }, [])

  const handleAdd = async () => {
    setAdding(true)
    try {
      await api.post('/api/tables')
      toast.success('Table added')
      load()
    } catch {
      toast.error('Could not add table')
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (table) => {
    if (!confirm(`Delete table ${table.id}?`)) return
    try {
      await api.delete(`/api/tables/${table.id}`)
      toast.success(`Table ${table.id} deleted`)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete — active session may exist')
    }
  }

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Tables</h1>
          <p className="page-subtitle">{tables.length} tables · scan QR to open menu</p>
        </div>
        <button onClick={handleAdd} disabled={adding} className="btn-primary">
          {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Add table
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-40 rounded-2xl" />)}
        </div>
      ) : tables.length === 0 ? (
        <div className="card p-16 text-center animate-fade-in">
          <TableProperties size={40} className="text-surface-300 mx-auto mb-3" />
          <p className="text-sm text-surface-500">No tables yet. Add your first table.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
          {tables.map(table => {
            const active = table.sessions?.length > 0
            return (
              <div key={table.id} className="card p-5 flex flex-col items-center gap-3">
                <div className={clsx(
                  'w-12 h-12 rounded-xl flex items-center justify-center text-lg font-semibold',
                  active ? 'bg-amber-100 text-amber-700' : 'bg-surface-100 text-surface-500'
                )}>
                  {table.id}
                </div>

                <span className={clsx(
                  'badge',
                  active ? 'badge-pending' : 'bg-emerald-100 text-emerald-700'
                )}>
                  {active ? 'Occupied' : 'Available'}
                </span>

                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => setQrModal(table)}
                    className="btn-secondary flex-1 text-xs py-1.5"
                  >
                    <QrCode size={12} /> QR
                  </button>
                  <button
                    onClick={() => handleDelete(table)}
                    className="btn-secondary text-xs py-1.5 px-3 text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* QR Modal */}
      {qrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setQrModal(null)} />
          <div className="relative bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 animate-slide-up">
            <h3 className="text-sm font-semibold text-surface-900">Table {qrModal.id} — QR Code</h3>
            {qrModal.qr_code_url ? (
              <img src={qrModal.qr_code_url} alt="QR" className="w-56 h-56 rounded-xl" />
            ) : (
              <div className="w-56 h-56 bg-surface-100 rounded-xl flex items-center justify-center text-surface-400">
                <QrCode size={48} />
              </div>
            )}
            <p className="text-xs text-surface-400 text-center max-w-[200px]">
              Customers scan this to open the menu and start ordering
            </p>
            <button onClick={() => setQrModal(null)} className="btn-secondary w-full">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
