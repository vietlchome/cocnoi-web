'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string // This is product.id
  sku?: string | null
  name: string
  slug: string
  price: number
  image: string
  colorName?: string | null
  colorHex?: string | null
  sizeName?: string | null
  quantity: number
  stockQuantity: number
  isPreOrder: boolean
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  addItem: (product: any, quantity?: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  setIsOpen: (isOpen: boolean) => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      addItem: (product, quantity = 1) =>
        set((state) => {
          const existingItemIndex = state.items.findIndex((item) => item.id === product.id)
          const isPreOrder = product.stockQuantity <= 0
          
          let imgUrl = ''
          try {
            const parsed = JSON.parse(product.images)
            if (Array.isArray(parsed) && parsed.length > 0) {
              imgUrl = parsed[0]
            }
          } catch (e) {
            imgUrl = typeof product.images === 'string' && !product.images.startsWith('[') 
              ? product.images 
              : 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&q=80'
          }

          if (existingItemIndex > -1) {
            const updatedItems = [...state.items]
            updatedItems[existingItemIndex].quantity += quantity
            return { items: updatedItems, isOpen: true }
          }

          const newItem: CartItem = {
            id: product.id,
            sku: product.sku,
            name: product.name,
            slug: product.slug,
            price: product.price,
            image: imgUrl,
            colorName: product.colorName,
            colorHex: product.colorHex,
            sizeName: product.size ? (typeof product.size === 'string' ? product.size : product.size.name) : null,
            quantity,
            stockQuantity: product.stockQuantity,
            isPreOrder,
          }

          return { items: [...state.items, newItem], isOpen: true }
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
        })),
      clearCart: () => set({ items: [] }),
      setIsOpen: (isOpen) => set({ isOpen }),
    }),
    {
      name: 'cocnoi-cart-storage',
    }
  )
)
