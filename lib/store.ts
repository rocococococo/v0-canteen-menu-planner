import { create } from "zustand"
import type { MenuSession, Dish } from "@/types/menu"

export type AppMode = "planning" | "procurement"

interface MenuState {
  // App-wide mode
  appMode: AppMode
  setAppMode: (mode: AppMode) => void

  // Menu sessions
  sessions: MenuSession[]
  setSessions: (sessions: MenuSession[]) => void
  addSession: (session: MenuSession) => void
  updateSession: (sessionId: string, updates: Partial<MenuSession>) => void
  removeSession: (sessionId: string) => void
  addDish: (sessionId: string, dish: Dish) => void
  updateDish: (sessionId: string, dishId: string, updates: Partial<Dish>) => void
  removeDish: (sessionId: string, dishId: string) => void
  getSession: (date: string, canteenId: string, mealId: string) => MenuSession | undefined
  getSessionsByDate: (date: string) => MenuSession[]
}

// Simple mock store for prototype
export const useMenuStore = create<MenuState>((set, get) => ({
  // App mode state
  appMode: "planning",
  setAppMode: (mode) => set({ appMode: mode }),

  // Menu sessions
  sessions: [],
  setSessions: (sessions) => set({ sessions }),
  addSession: (session) => set((state) => ({ sessions: [...state.sessions, session] })),
  updateSession: (id, updates) =>
    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),
  removeSession: (id) =>
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== id),
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
