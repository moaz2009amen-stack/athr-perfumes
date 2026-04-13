import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UIState } from '@/types'

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isCartOpen: false,
      isMenuOpen: false,
      isSearchOpen: false,
      theme: 'dark',
      language: 'ar',

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
      toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'athr-ui-storage',
      partialize: (state) => ({ theme: state.theme, language: state.language }),
    }
  )
)
