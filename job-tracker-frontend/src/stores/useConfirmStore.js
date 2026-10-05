import { create } from 'zustand'

// The app's own "Are you sure?" dialog, shown by <ConfirmDialog /> (in Layout), instead of window.confirm().
// Call from anywhere: if (!(await confirmAction({ message: 'Delete this?', confirmLabel: 'Delete', danger: true }))) return
export const useConfirmStore = create((set, get) => ({

    // State
    // The open question { message, confirmLabel, danger, resolve }, or null
    request: null,

    // Actions
    // Resolves to true (confirmed) or false (cancelled, Escape, clicked outside)
    confirm: ({ message, confirmLabel = 'OK', danger = false }) =>
        new Promise((resolve) => {
            // A new question answers one that's still open with "no"
            get().request?.resolve(false)
            set({ request: { message, confirmLabel, danger, resolve } })
        }),

    answer: (confirmed) => {
        get().request?.resolve(confirmed)
        set({ request: null })
    },
}))

export const confirmAction = (options) => useConfirmStore.getState().confirm(options)
