import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import API from '../api/axios'

// The seeded demo account offered on the landing and login pages (see database/seeders/DatabaseSeeder.php)
export const DEMO_EMAIL = 'test@example.com'
const DEMO_PASSWORD = 'secret123'

// After logging in or registering: load the user, and fail if that didn't work (fetchUser swallows its
// error because it also checks remembered sessions), e.g. a session cookie the browser didn't keep
const loadUserAfterAuth = async (get) => {
    await get().fetchUser()
    if (!get().user) {
        throw new Error('Could not load your account after logging in')
    }
}

export const useAuthStore = create(
    persist(
        (set, get) => ({

            // State
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            // False until the server has confirmed (or rejected) the persisted session
            sessionChecked: false,

            // Actions
            loginAction: async (email, password) => {
                set({ isLoading: true, error: null })
                try {
                    // Get CSRF token cookie first, then attempt login
                    await API.get('/sanctum/csrf-cookie', { baseURL: '' })
                    await API.post('/login', { email, password })

                    // fetch the full user after login
                    await loadUserAfterAuth(get)
                } catch (err) {
                    set({
                        error: err.response?.data?.message || 'Login failed',
                        isLoading: false,
                    })
                    throw err
                }
            },

            // Logs in with the shared demo account; throws like loginAction when it fails
            demoLoginAction: () => get().loginAction(DEMO_EMAIL, DEMO_PASSWORD),

            // Safely registers a new user and logs them in immediately
            registerAction: async (name, email, password, passwordConfirmation) => {
                set({ isLoading: true, error: null })
                try {
                    await API.get('/sanctum/csrf-cookie', { baseURL: '' })
                    await API.post('/register', {
                        name,
                        email,
                        password,
                        password_confirmation: passwordConfirmation,
                    })

                    await loadUserAfterAuth(get)
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
                    get().clearSession()
                }
            },

            // Forget the user locally, e.g. when the server says the session has expired
            clearSession: () => set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
                sessionChecked: true,
            }),

            // Called on app load: only ask the server if we think we're logged in
            // (avoids an unnecessary 401 on the login page)
            checkSession: async () => {
                if (get().isAuthenticated) {
                    await get().fetchUser()
                } else {
                    set({ sessionChecked: true })
                }
            },

            fetchUser: async () => {
                set({ isLoading: true })
                try {
                    const res = await API.get('/user')
                    set({
                        user: res.data.data,
                        isAuthenticated: true,
                        isLoading: false,
                        sessionChecked: true,
                    })
                } catch {
                    get().clearSession()
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