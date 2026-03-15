import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Plus, Trash2, Tag, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminCategories() {
  const [cats, setCats] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => api.get('/api/categories').then(({ data }) => {
    setCats(data.data.categories)
    setLoading(false)
  })

  useEffect(() => { load() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      await api.post('/api/categories', { name: name.trim() })
      toast.success('Category added')
      setName('')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (cat) => {
    if (!confirm(`Delete "${cat.name}"? Menu items in this category will lose their link.`)) return
    try {
      await api.delete(`/api/categories/${cat.id}`)
      toast.success('Category deleted')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete — items may still be linked')
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Categories</h1>
        <p className="page-subtitle">Organise your menu sections</p>
      </div>

      {/* Add form */}
      <div className="card p-5 mb-6 animate-slide-up">
        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            className="input flex-1"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="New category name…"
          />
          <button type="submit" disabled={saving || !name.trim()} className="btn-primary">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Add
          </button>
        </form>
      </div>

      {/* List */}
      <div className="card overflow-hidden animate-slide-up stagger-2" style={{ animationFillMode: 'forwards' }}>
        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3].map(i => <div key={i} className="skeleton h-10 rounded-xl" />)}
          </div>
        ) : cats.length === 0 ? (
          <div className="p-12 text-center">
            <Tag size={32} className="text-surface-300 mx-auto mb-3" />
            <p className="text-sm text-surface-400">No categories yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-surface-50">
            {cats.map(cat => (
              <li key={cat.id} className="flex items-center justify-between px-6 py-4 hover:bg-surface-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center">
                    <Tag size={14} className="text-brand-500" />
                  </div>
                  <span className="text-sm font-medium text-surface-900">{cat.name}</span>
                </div>
                <button
                  onClick={() => handleDelete(cat)}
                  className="text-surface-300 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
