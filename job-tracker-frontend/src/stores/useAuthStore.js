import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import API from '../api/axios'

export const useAuthStore = create(
    persist(
        (set, get) => ({

            // State
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            // Actions
            loginAction: async (email, password) => {
                set({ isLoading: true, error: null })
                try {
                    // Get CSRF token cookie first, then attempt login
                    await API.get('/sanctum/csrf-cookie', { baseURL: '' })
                    await API.post('/login', { email, password })

                    // fetch the full user after login
                    await get().fetchUser()
                } catch (err) {
                    set({
                        error: err.response?.data?.message || 'Login failed',
                        isLoading: false,
                    })
                    throw err
                }
            },

            // Safely registers a new user and logs them in immediately
            registerAction: async (name, email, password) => {
                set({ isLoading: true, error: null })
                try {
                    await API.get('/sanctum/csrf-cookie', { baseURL: '' })
                    await API.post('/register', {
                        name,
                        email,
                        password,
                        password_confirmation: password,
                    })

                    await get().fetchUser()
                } catch (err) {
                    set({
                        error: err.response?.data?.message || 'Registration failed',
                        isLoading: false,
                    })
                    throw err
                }
            },

            // Logs the user out and clears state regardless of API call success
            logoutAction: async () => {
                set({ isLoading: true })
                try {
                    await API.post('/logout')
                } catch (err) {
                    console.error(err)
                } finally {
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null,
                    })
                }
            },

            // Called on app load to check if session is still valid
            fetchUser: async () => {
                set({ isLoading: true })
                try {
                    const res = await API.get('/user')
                    set({
                        user: res.data,
                        isAuthenticated: true,
                        isLoading: false,
                    })
                } catch {
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                    })
                }
            },

            clearError: () => set({ error: null }),
        }),
        // Only persist auth state, not loading or error states
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
)