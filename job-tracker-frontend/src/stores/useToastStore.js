import { create } from 'zustand'

let nextId = 1

// Short messages shown by <Toaster /> (in Layout), instead of alert().
// Call from anywhere: useToastStore.getState().showToast('Failed to save')
export const useToastStore = create((set, get) => ({

    // State
    toasts: [],

    // Actions
    // type: 'error' | 'success'. action: an optional button { label, onClick }; clicking it also dismisses
    // the toast. Each toast removes itself after a few seconds (Toaster runs the timer).
    showToast: (message, type = 'error', action = null) => {
        const id = nextId++
        set({ toasts: [...get().toasts, { id, message, type, action }] })
    },

    dismissToast: (id) => {
        set({ toasts: get().toasts.filter((toast) => toast.id !== id) })
    },
}))

// Shortcut for code outside components: showToast('Saved', 'success')
export const showToast = (message, type, action) => useToastStore.getState().showToast(message, type, action)

// A success message with an Undo button, for actions that are easy to reverse (archive, restore)
// instead of asking first. undo() does the reverse request and handles its own failure.
export const showUndoToast = (message, undo) => showToast(message, 'success', { label: 'Undo', onClick: undo })
