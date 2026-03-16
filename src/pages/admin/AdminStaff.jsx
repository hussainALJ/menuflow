import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Plus, Trash2, Loader2, X, Users, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const ROLES = ['Admin', 'Chef', 'Waiter', 'Cashier']

const ROLE_STYLES = {
  Admin:   'bg-brand-100 text-brand-700',
  Chef:    'bg-amber-100 text-amber-700',
  Waiter:  'bg-emerald-100 text-emerald-700',
  Cashier: 'bg-blue-100 text-blue-700',
}

const ROLE_AVATAR = {
  Admin:   'bg-brand-500',
  Chef:    'bg-amber-500',
  Waiter:  'bg-emerald-500',
  Cashier: 'bg-blue-500',
}

const EMPTY = { username: '', password: '', role: 'Waiter' }

function Modal({ onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <h3 className="text-sm font-semibold text-surface-900">Add staff member</h3>
          <button onClick={onClose} className="btn-ghost p-1.5"><X size={16} /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

export default function AdminStaff() {
  const { user: currentUser } = useAuthStore()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = () => {
    api.get('/api/users').then(({ data }) => {
      setUsers(data.data.users)
    }).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/api/users', form)
      toast.success(`${form.username} added as ${form.role}`)
      setModal(false)
      setForm(EMPTY)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create user')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (user) => {
    if (!confirm(`Delete "${user.username}"? This cannot be undone.`)) return
    try {
      await api.delete(`/api/users/${user.id}`)
      toast.success(`${user.username} deleted`)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete user')
    }
  }

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Staff</h1>
          <p className="page-subtitle">{users.length} staff members</p>
        </div>
        <button onClick={() => { setForm(EMPTY); setModal(true) }} className="btn-primary">
          <Plus size={15} /> Add staff
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-2xl" />)}
        </div>
      ) : users.length === 0 ? (
        <div className="card p-16 text-center animate-fade-in">
          <Users size={36} className="text-surface-300 mx-auto mb-3" />
          <p className="text-sm text-surface-400">No staff members yet</p>
        </div>
      ) : (
        <div className="card overflow-hidden animate-fade-in">
          <ul className="divide-y divide-surface-50">
            {users.map(user => {
              const isMe = user.id === currentUser?.id
              const initials = user.username.slice(0, 2).toUpperCase()
              return (
                <li
                  key={user.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-surface-50 transition-colors"
                >
                  {/* Avatar */}
                  <div className={clsx(
                    'w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0',
                    ROLE_AVATAR[user.role] || 'bg-surface-400'
                  )}>
                    {initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-surface-900">{user.username}</p>
                      {isMe && (
                        <span className="badge bg-surface-100 text-surface-500 text-[10px]">you</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={clsx('badge text-[10px]', ROLE_STYLES[user.role])}>
                        {user.role}
                      </span>
                      {user.role === 'Admin' && (
                        <ShieldCheck size={11} className="text-brand-400" />
                      )}
                    </div>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(user)}
                    disabled={isMe}
                    className={clsx(
                      'p-2 rounded-lg transition-colors',
                      isMe
                        ? 'text-surface-200 cursor-not-allowed'
                        : 'text-surface-300 hover:text-red-500 hover:bg-red-50'
                    )}
                    title={isMe ? "Can't delete your own account" : `Delete ${user.username}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {modal && (
        <Modal onClose={() => setModal(false)}>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="label">Username</label>
              <input
                className="input"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                required
                autoFocus
                placeholder="staff_username"
                autoComplete="off"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                minLength={8}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="label">Role</label>
              <select
                className="input"
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              >
                {ROLES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex-1"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? 'Adding…' : 'Add staff'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}