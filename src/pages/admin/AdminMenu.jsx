import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Plus, Pencil, Trash2, Loader2, X, Check, Image } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const EMPTY = {
  category_id: '',
  name: '',
  description: '',
  price: '',
  image_url: '',
  is_available: true,
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <h3 className="text-sm font-semibold text-surface-900">{title}</h3>
          <button onClick={onClose} className="btn-ghost p-1.5"><X size={16} /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

export default function AdminMenu() {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // 'add' | 'edit'
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState(null)

  const load = async () => {
    const [menuRes, catRes] = await Promise.all([
      api.get('/api/menu'),
      api.get('/api/categories'),
    ])
    setItems(menuRes.data.data.menuItems)
    setCategories(catRes.data.data.categories)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setForm({ ...EMPTY, category_id: categories[0]?.id || '' })
    setEditId(null)
    setModal('form')
  }

  const openEdit = (item) => {
    setForm({
      category_id: item.category_id,
      name: item.name,
      description: item.description,
      price: item.price,
      image_url: item.image_url,
      is_available: item.is_available,
    })
    setEditId(item.id)
    setModal('form')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, category_id: Number(form.category_id), price: Number(form.price) }
      if (editId) {
        await api.put(`/api/menu/${editId}`, payload)
        toast.success('Item updated')
      } else {
        await api.post('/api/menu', payload)
        toast.success('Item added')
      }
      setModal(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item) => {
    if (!confirm(`Delete "${item.name}"?`)) return
    try {
      await api.delete(`/api/menu/${item.id}`)
      toast.success('Item deleted')
      load()
    } catch {
      toast.error('Could not delete item')
    }
  }

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Menu items</h1>
          <p className="page-subtitle">{items.length} items across {categories.length} categories</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={15} /> Add item
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {items.map(item => (
            <div key={item.id} className="card overflow-hidden group">
              {/* Image */}
              <div className="h-36 bg-surface-100 relative overflow-hidden">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={e => { e.target.style.display = 'none' }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-surface-300">
                    <Image size={32} />
                  </div>
                )}
                <div className={clsx(
                  'absolute top-2 right-2 badge',
                  item.is_available ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                )}>
                  {item.is_available ? 'Available' : 'Unavailable'}
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-surface-900 leading-snug">{item.name}</h3>
                  <span className="text-sm font-semibold text-brand-600 whitespace-nowrap">
                    IQD {item.price.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-surface-400 mb-1 truncate">{item.category?.name}</p>
                <p className="text-xs text-surface-500 line-clamp-2 mb-3">{item.description}</p>

                <div className="flex gap-2">
                  <button onClick={() => openEdit(item)} className="btn-secondary flex-1 text-xs py-1.5">
                    <Pencil size={12} /> Edit
                  </button>
                  <button onClick={() => handleDelete(item)} className="btn-secondary text-xs py-1.5 text-red-500 hover:text-red-600 hover:border-red-200 px-3">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal === 'form' && (
        <Modal title={editId ? 'Edit menu item' : 'Add menu item'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="label">Category</label>
              <select
                value={form.category_id}
                onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                className="input"
                required
              >
                <option value="">Select…</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Name</label>
              <input
                className="input"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
                placeholder="Dish name"
              />
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                className="input resize-none"
                rows={2}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                required
                placeholder="Short description…"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Price (IQD)</label>
                <input
                  type="number"
                  className="input"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  required
                  min="0"
                  placeholder="5000"
                />
              </div>
              <div>
                <label className="label">Available</label>
                <select
                  className="input"
                  value={form.is_available ? 'true' : 'false'}
                  onChange={e => setForm(f => ({ ...f, is_available: e.target.value === 'true' }))}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Image URL</label>
              <input
                className="input"
                type="url"
                value={form.image_url}
                onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                placeholder="https://…"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? 'Saving…' : editId ? 'Update' : 'Add item'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
