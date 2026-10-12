import { create } from 'zustand'

const systemDarkQuery = window.matchMedia('(prefers-color-scheme: dark)')

// "dark", "light", or null when the user hasn't picked one (then the system setting applies)
const readSavedTheme = () => {
    try {
        return localStorage.getItem('theme')
    } catch {
        return null
    }
}

const applyDarkClass = (darkMode) => document.documentElement.classList.toggle('dark', darkMode)

// The initial class is applied by the public/theme.js script to avoid a flash on load
export const useThemeStore = create((set, get) => ({

    // State
    darkMode: document.documentElement.classList.contains('dark'),

    // Actions
    toggleDarkMode: () => {
        const next = !get().darkMode
        try {
            localStorage.setItem('theme', next ? 'dark' : 'light')
        } catch {
            // Storage unavailable: the choice lasts for this visit only
        }
        applyDarkClass(next)
        set({ darkMode: next })
    },
}))

// Until the user picks a theme, follow the system setting when it changes
systemDarkQuery.addEventListener('change', (event) => {
    if (readSavedTheme()) return
    applyDarkClass(event.matches)
    useThemeStore.setState({ darkMode: event.matches })
})
