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
    // Session expired: forget the user, ProtectedRoute then redirects to /login
    if (error.response?.status === 401) {
      useAuthStore.getState().clearSession()
    }
    return Promise.reject(error)
  }
)

export default API
