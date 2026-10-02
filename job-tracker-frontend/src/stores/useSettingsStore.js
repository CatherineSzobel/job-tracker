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

    // Optimistic: shows the new values at once; on failure puts the old ones back and rethrows,
    // so the caller can show an error. Only the changed keys are written back either way, so a slow
    // or failed save can't undo another setting changed in the meantime.
    updateSettings: async (changes) => {
        const changedKeys = Object.keys(changes)
        const previousValues = Object.fromEntries(changedKeys.map((key) => [key, get().settings?.[key]]))
        const applyValues = (values) => set({ settings: { ...get().settings, ...values } })

        applyValues(changes)
        try {
            const res = await API.put('/settings', changes)
            applyValues(Object.fromEntries(changedKeys.map((key) => [key, res.data.data[key]])))
            return get().settings
        } catch (err) {
            applyValues(previousValues)
            throw err
        }
    },
}))
