import axios from 'axios'
import { useAuthStore } from '../stores/useAuthStore'

const API = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Session expired: forget the user, ProtectedRoute then redirects to /login. A save after the session
    // expired fails the CSRF check first (419), so that means the same.
    if ([401, 419].includes(error.response?.status)) {
      useAuthStore.getState().clearSession()
    }
    return Promise.reject(error)
  }
)

export default API
