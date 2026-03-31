import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, qty = 1) => {
        const items = get().items
        const existing = items.find((i) => i.id === product.id)
        if (existing) {
          const newQty = Math.min(existing.qty + qty, product.quantity)
          set({
            items: items.map((i) =>
              i.id === product.id ? { ...i, qty: newQty } : i
            ),
          })
        } else {
          set({
            items: [
              ...items,
              {
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.images?.[0] ?? null,
                stock: product.quantity,
                qty: Math.min(qty, product.quantity),
              },
            ],
          })
        }
      },

      removeItem: (id) =>
        set({ items: get().items.filter((i) => i.id !== id) }),

      updateQty: (id, qty) => {
        if (qty < 1) {
          set({ items: get().items.filter((i) => i.id !== id) })
          return
        }
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, qty: Math.min(qty, i.stock) } : i
          ),
        })
      },

      clearCart: () => set({ items: [] }),

      getTotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.qty, 0),

      getCount: () => get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    {
      name: 'shopco-cart',
    }
  )
)
