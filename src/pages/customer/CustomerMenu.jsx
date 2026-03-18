import { useEffect, useState, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { useCartStore } from '@/store/cartStore'
import { ShoppingCart, Search, ChevronRight, Image, Plus, Minus, UtensilsCrossed } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

function MenuItemCard({ item, onAdd, onRemove, qty }) {
  return (
    <div className="card overflow-hidden group">
      {/* Image */}
      <div className="h-40 bg-surface-100 relative overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={e => { e.currentTarget.style.display = 'none' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-surface-300">
            <Image size={28} />
          </div>
        )}
        {!item.is_available && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="badge bg-surface-200 text-surface-500 text-xs">Unavailable</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-sm font-semibold text-surface-900 mb-0.5 leading-snug">{item.name}</h3>
        <p className="text-xs text-surface-400 line-clamp-2 mb-3 leading-relaxed">{item.description}</p>

        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-brand-600">
            IQD {item.price.toLocaleString()}
          </span>

          {item.is_available && (
            qty > 0 ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onRemove(item)}
                  className="w-7 h-7 rounded-lg bg-surface-100 hover:bg-surface-200 flex items-center justify-center text-surface-600 transition-colors"
                >
                  <Minus size={12} />
                </button>
                <span className="text-sm font-semibold w-4 text-center">{qty}</span>
                <button
                  onClick={() => onAdd(item)}
                  className="w-7 h-7 rounded-lg bg-brand-500 hover:bg-brand-600 flex items-center justify-center text-white transition-colors"
                >
                  <Plus size={12} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onAdd(item)}
                className="w-7 h-7 rounded-lg bg-brand-500 hover:bg-brand-600 flex items-center justify-center text-white transition-all shadow-warm hover:shadow-warm-lg"
              >
                <Plus size={13} />
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default function CustomerMenu() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const tableId = searchParams.get('table')

  const { addItem, removeItem, updateQty, items, sessionId, setSession, totalItems, totalPrice } = useCartStore()

  const [menuItems, setMenuItems] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [sessionLoading, setSessionLoading] = useState(false)

  // Start / rejoin session
  useEffect(() => {
    if (!tableId) return
    const startSession = async () => {
      setSessionLoading(true)
      try {
        const { data } = await api.post('/api/sessions/start', { table_id: tableId })
        setSession(data.data.session.id, Number(tableId))
      } catch (err) {
        toast.error('Could not start session. Check the table number.')
      } finally {
        setSessionLoading(false)
      }
    }
    startSession()
  }, [tableId])

  // Load menu
  useEffect(() => {
    Promise.all([api.get('/api/menu'), api.get('/api/categories')]).then(([m, c]) => {
      setMenuItems(m.data.data.menuItems)
      setCategories(c.data.data.categories)
    }).finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let list = menuItems
    if (activeCategory !== 'all') list = list.filter(i => i.category_id === Number(activeCategory))
    if (search.trim()) list = list.filter(i =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase())
    )
    return list
  }, [menuItems, activeCategory, search])

  const getQty = (id) => items.find(i => i.menu_item_id === id)?.quantity || 0

  const handleAdd = (item) => {
    addItem({ menu_item_id: item.id, name: item.name, price: item.price })
    toast.success(`${item.name} added`, { duration: 1500 })
  }

  const handleRemove = (item) => {
    const qty = getQty(item.id)
    if (qty <= 1) removeItem(item.id)
    else updateQty(item.id, qty - 1)
  }

  if (!tableId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-surface-50">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed size={28} className="text-brand-500" />
          </div>
          <h1 className="font-display text-2xl text-surface-900 mb-2">No table found</h1>
          <p className="text-sm text-surface-500">Please scan the QR code on your table to start ordering.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-surface-100">
        <div className="max-w-2xl mx-auto px-4">
          {/* Top bar */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                <UtensilsCrossed size={14} className="text-white" />
              </div>
              <div>
                <span className="font-display text-lg text-surface-900">Sufra</span>
                <span className="ml-2 badge bg-surface-100 text-surface-500 text-[10px]">Table {tableId}</span>
              </div>
            </div>
            {sessionId && (
              <button
                onClick={() => navigate(`/bill/${sessionId}`)}
                className="btn-ghost text-xs gap-1.5"
              >
                My orders <ChevronRight size={12} />
              </button>
            )}
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Search dishes…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-9 text-sm"
            />
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 pb-3 overflow-x-auto scrollbar-none -mx-4 px-4">
            <button
              onClick={() => setActiveCategory('all')}
              className={clsx(
                'px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0',
                activeCategory === 'all'
                  ? 'bg-surface-900 text-white'
                  : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
              )}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(String(cat.id))}
                className={clsx(
                  'px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0',
                  activeCategory === String(cat.id)
                    ? 'bg-surface-900 text-white'
                    : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Items grid */}
      <div className="max-w-2xl mx-auto px-4 pt-5">
        {loading || sessionLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-56 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-surface-400 text-sm">No items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 animate-fade-in">
            {filtered.map(item => (
              <MenuItemCard
                key={item.id}
                item={item}
                qty={getQty(item.id)}
                onAdd={handleAdd}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}
      </div>

      {/* Cart bar */}
      {totalItems() > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-sm px-4 animate-slide-up">
          <button
            onClick={() => navigate('/cart')}
            className="w-full flex items-center justify-between px-5 py-3.5
                       bg-surface-900 hover:bg-surface-800 active:bg-surface-950
                       text-white rounded-2xl shadow-2xl transition-all duration-200"
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <ShoppingCart size={18} />
                <span className="notification-dot">{totalItems()}</span>
              </div>
              <span className="text-sm font-medium">View cart</span>
            </div>
            <span className="text-sm font-semibold text-brand-400">
              IQD {totalPrice().toLocaleString()}
            </span>
          </button>
        </div>
      )}
    </div>
  )
}
