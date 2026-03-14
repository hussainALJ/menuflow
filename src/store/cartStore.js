import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],       // [{ menu_item_id, name, price, quantity, notes }]
      sessionId: null,
      tableId: null,

      setSession: (sessionId, tableId) => set({ sessionId, tableId }),

      addItem: (item) => {
        const { items } = get()
        const existing = items.find(i => i.menu_item_id === item.menu_item_id)
        if (existing) {
          set({
            items: items.map(i =>
              i.menu_item_id === item.menu_item_id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          })
        } else {
          set({ items: [...items, { ...item, quantity: 1, notes: '' }] })
        }
      },

      removeItem: (menu_item_id) => {
        set({ items: get().items.filter(i => i.menu_item_id !== menu_item_id) })
      },

      updateQty: (menu_item_id, quantity) => {
        if (quantity < 1) {
          get().removeItem(menu_item_id)
          return
        }
        set({
          items: get().items.map(i =>
            i.menu_item_id === menu_item_id ? { ...i, quantity } : i
          ),
        })
      },

      updateNotes: (menu_item_id, notes) => {
        set({
          items: get().items.map(i =>
            i.menu_item_id === menu_item_id ? { ...i, notes } : i
          ),
        })
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),
      totalPrice: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
    }),
    {
      name: 'sufra-cart',
      partialize: (state) => ({
        items: state.items,
        sessionId: state.sessionId,
        tableId: state.tableId,
      }),
    }
  )
)
