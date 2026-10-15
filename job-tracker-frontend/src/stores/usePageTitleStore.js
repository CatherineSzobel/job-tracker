import { create } from 'zustand'

// A detail page's own title for the top bar and phone bar ("Frontend Developer" instead of "Application").
// Stored with its pathname, so it only shows while that page is open and needs no clean-up.
export const usePageTitleStore = create((set) => ({

    // State
    pathname: null,
    title: null,

    // Actions
    setPageTitle: (pathname, title) => set({ pathname, title }),
}))

// The title set for this pathname, or null
export const usePageTitle = (pathname) => usePageTitleStore((state) => (state.pathname === pathname ? state.title : null))
