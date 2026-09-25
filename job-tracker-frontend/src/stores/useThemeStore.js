import { create } from 'zustand'

// The initial class is applied by the public/theme.js script to avoid a flash on load
export const useThemeStore = create((set, get) => ({

    // State
    darkMode: localStorage.getItem('theme') === 'dark',

    // Actions
    toggleDarkMode: () => {
        const next = !get().darkMode
        localStorage.setItem('theme', next ? 'dark' : 'light')
        document.documentElement.classList.toggle('dark', next)
        set({ darkMode: next })
    },
}))
