import { create } from "zustand"
import type { MenuSession, Dish } from "@/types/menu"

interface MenuState {
  sessions: MenuSession[]
  addSession: (session: MenuSession) => void
  updateSession: (sessionId: string, updates: Partial<MenuSession>) => void
  addDish: (sessionId: string, dish: Dish) => void
  updateDish: (sessionId: string, dishId: string, updates: Partial<Dish>) => void
  removeDish: (sessionId: string, dishId: string) => void
  getSession: (date: string, canteenId: string, mealId: string) => MenuSession | undefined
  getSessionsByDate: (date: string) => MenuSession[]
}

// Simple mock store for prototype
export const useMenuStore = create<MenuState>((set, get) => ({
  sessions: [],
  addSession: (session) => set((state) => ({ sessions: [...state.sessions, session] })),
  updateSession: (id, updates) =>
    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),
  addDish: (sessionId, dish) =>
    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === sessionId ? { ...s, dishes: [...s.dishes, dish] } : s)),
    })),
  updateDish: (sessionId, dishId, updates) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              dishes: s.dishes.map((d) => (d.id === dishId ? { ...d, ...updates } : d)),
            }
          : s,
      ),
    })),
  removeDish: (sessionId, dishId) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              dishes: s.dishes.filter((d) => d.id !== dishId),
            }
          : s,
      ),
    })),
  getSession: (date, canteenId, mealId) => {
    return get().sessions.find((s) => s.date === date && s.canteenId === canteenId && s.mealId === mealId)
  },
  getSessionsByDate: (date) => {
    return get().sessions.filter((s) => s.date === date)
  },
}))
