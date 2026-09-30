import { create } from 'zustand'
import API from '../api/axios'
import { useAuthStore } from './useAuthStore'

// Account settings (GET/PUT /api/settings), shared by the Settings page and the archive prompt.
// Loaded once per logged-in user: logging in as someone else loads theirs.
export const useSettingsStore = create((set, get) => ({

    // State
    settings: null,
    loadedForUserId: null,

    // Actions
    loadSettings: async () => {
        const userId = useAuthStore.getState().user?.id
        if (get().settings && get().loadedForUserId === userId) {
            return get().settings
        }
        const res = await API.get('/settings')
        set({ settings: res.data.data, loadedForUserId: userId })
        return res.data.data
    },

    // Throws on failure so the caller can revert and show an error
    updateSettings: async (changes) => {
        const res = await API.put('/settings', changes)
        set({ settings: res.data.data })
        return res.data.data
    },
}))
