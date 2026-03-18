import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import { api } from '@/lib/api'
import { ArrowLeft, Trash2, Plus, Minus, Loader2, ShoppingCart, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CustomerCart() {
  const navigate = useNavigate()
  const {
    items, sessionId, tableId,
    updateQty, removeItem, updateNotes, clearCart,
    totalItems, totalPrice,
  } = useCartStore()

  const [placing, setPlacing] = useState(false)
  const [editingNote, setEditingNote] = useState(null)

  const handlePlaceOrder = async () => {
    if (!sessionId) {
      toast.error('No active session — please scan your table QR again')
      return
    }
    if (items.length === 0) return

    setPlacing(true)
    try {
      await api.post('/api/orders', {
        session_id: sessionId,
        items: items.map(i => ({
          menu_item_id: i.menu_item_id,
          quantity: i.quantity,
          notes: i.notes || undefined,
        })),
      })
      clearCart()
      toast.success('Order placed! We\'ll start preparing it shortly 🍽️', { duration: 4000 })
      navigate(`/bill/${sessionId}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not place order')
    } finally {
      setPlacing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-xs">
          <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingCart size={24} className="text-surface-400" />
          </div>
          <h2 className="font-display text-xl text-surface-900 mb-2">Your cart is empty</h2>
          <p className="text-sm text-surface-500 mb-6">Browse the menu and add some dishes</p>
          <button
            onClick={() => navigate(tableId ? `/menu?table=${tableId}` : '/menu')}
            className="btn-primary"
          >
            Browse menu
          </button>
        </div>
      </div>
    )
  }

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
            <h1 className="text-base font-semibold text-surface-900">Your order</h1>
            <p className="text-xs text-surface-400">Table {tableId} · {totalItems()} items</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 pb-36">
        {/* Items */}
        <div className="space-y-3 mb-6">
          {items.map(item => (
            <div key={item.menu_item_id} className="card p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-surface-900">{item.name}</p>
                  <p className="text-xs text-brand-600 font-medium mt-0.5">
                    IQD {(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => updateQty(item.menu_item_id, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-surface-100 hover:bg-surface-200 flex items-center justify-center text-surface-600 transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(item.menu_item_id, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-brand-500 hover:bg-brand-600 flex items-center justify-center text-white transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                  <button
                    onClick={() => removeItem(item.menu_item_id)}
                    className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-surface-300 hover:text-red-500 transition-colors ml-1"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Notes */}
              {editingNote === item.menu_item_id ? (
                <div className="mt-3">
                  <input
                    autoFocus
                    className="input text-xs py-2"
                    placeholder="Any special requests? (optional)"
                    value={item.notes}
                    onChange={e => updateNotes(item.menu_item_id, e.target.value)}
                    onBlur={() => setEditingNote(null)}
                  />
                </div>
              ) : (
                <button
                  onClick={() => setEditingNote(item.menu_item_id)}
                  className="mt-2 flex items-center gap-1.5 text-xs text-surface-400 hover:text-surface-600 transition-colors"
                >
                  <MessageSquare size={11} />
                  {item.notes ? item.notes : 'Add note'}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="card p-5 mb-4">
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.menu_item_id} className="flex justify-between text-xs text-surface-500">
                <span>{item.name} × {item.quantity}</span>
                <span>IQD {(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div className="border-t border-surface-100 pt-3 mt-3 flex justify-between">
              <span className="text-sm font-semibold text-surface-900">Total</span>
              <span className="text-base font-bold text-surface-900">
                IQD {totalPrice().toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-surface-400 text-center">
          You can place multiple orders throughout your meal
        </p>
      </div>

      {/* Place order button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-sm px-4">
        <button
          onClick={handlePlaceOrder}
          disabled={placing}
          className="w-full py-4 bg-brand-500 hover:bg-brand-600 active:bg-brand-700
                     text-white font-semibold text-sm rounded-2xl
                     shadow-warm-lg hover:shadow-warm
                     transition-all duration-200
                     disabled:opacity-60 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
        >
          {placing && <Loader2 size={16} className="animate-spin" />}
          {placing ? 'Placing order…' : `Place order · IQD ${totalPrice().toLocaleString()}`}
        </button>
      </div>
    </div>
  )
}
