import { create } from 'zustand'

const TOAST_DURATION_MS = 4000

let nextId = 1

// Short messages shown by <Toaster /> (in Layout), instead of alert().
// Call from anywhere: useToastStore.getState().showToast('Failed to save')
export const useToastStore = create((set, get) => ({

    // State
    toasts: [],

    // Actions
    // type: 'error' | 'success'. Each toast removes itself after a few seconds.
    showToast: (message, type = 'error') => {
        const id = nextId++
        set({ toasts: [...get().toasts, { id, message, type }] })
        setTimeout(() => get().dismissToast(id), TOAST_DURATION_MS)
    },

    dismissToast: (id) => {
        set({ toasts: get().toasts.filter((toast) => toast.id !== id) })
    },
}))

// Shortcut for code outside components: showToast('Saved', 'success')
export const showToast = (message, type) => useToastStore.getState().showToast(message, type)
