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
    // Rate limited (60 requests a minute): replace Laravel's "Too Many Attempts." for every caller's toast
    if (error.response?.status === 429 && error.response.data) {
      error.response.data.message = 'Too many requests — wait a minute and try again.'
    }
    return Promise.reject(error)
  }
)

export default API
