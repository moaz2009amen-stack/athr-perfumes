import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartState, Product, CartItem, Discount } from '@/types'

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      discount: null,
      discountAmount: 0,
      subtotal: 0,
      total: 0,

      addItem: (product: Product, quantity: number = 1) => {
        const items = get().items
        const existingItem = items.find((item) => item.product_id === product.id)

        let newItems: CartItem[]
        if (existingItem) {
          newItems = items.map((item) =>
            item.product_id === product.id
              ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
              : item
          )
        } else {
          newItems = [...items, { 
            id: Date.now(), 
            product_id: product.id, 
            product, 
            quantity: Math.min(quantity, product.stock) 
          }]
        }

        set({ items: newItems })
        get().applyDiscount(get().discount!)
      },

      removeItem: (productId: number) => {
        const newItems = get().items.filter((item) => item.product_id !== productId)
        set({ items: newItems })
        get().applyDiscount(get().discount!)
      },

      updateQuantity: (productId: number, quantity: number) => {
        const items = get().items
        const product = items.find((item) => item.product_id === productId)?.product
        
        if (!product) return

        const newQuantity = Math.max(1, Math.min(quantity, product.stock))
        const newItems = items.map((item) =>
          item.product_id === productId ? { ...item, quantity: newQuantity } : item
        )

        set({ items: newItems })
        get().applyDiscount(get().discount!)
      },

      clearCart: () => {
        set({ items: [], discount: null, discountAmount: 0, subtotal: 0, total: 0 })
      },

      applyDiscount: (discount: Discount | null) => {
        const items = get().items
        const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
        
        let discountAmount = 0
        
        if (discount) {
          // التحقق من صلاحية الخصم
          const now = new Date()
          const validFrom = new Date(discount.valid_from)
          const validUntil = discount.valid_until ? new Date(discount.valid_until) : null
          
          const isValid = 
            discount.is_active &&
            now >= validFrom &&
            (!validUntil || now <= validUntil) &&
            (!discount.usage_limit || discount.used_count < discount.usage_limit) &&
            (!discount.min_order_amount || subtotal >= discount.min_order_amount)

          if (isValid) {
            if (discount.discount_type === 'percentage') {
              discountAmount = subtotal * (discount.discount_value / 100)
              if (discount.max_discount_amount) {
                discountAmount = Math.min(discountAmount, discount.max_discount_amount)
              }
            } else {
              discountAmount = Math.min(discount.discount_value, subtotal)
            }
          }
        }

        set({
          subtotal,
          discount,
          discountAmount,
          total: Math.max(0, subtotal - discountAmount),
        })
      },

      removeDiscount: () => {
        const subtotal = get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
        set({
          discount: null,
          discountAmount: 0,
          subtotal,
          total: subtotal,
        })
      },
    }),
    {
      name: 'athr-cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
)
