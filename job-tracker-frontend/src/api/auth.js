import API from './API'

// Must be called before login or register
// Gets the CSRF token from Sanctum and sets it as a cookie
const getCsrfCookie = async () => {
  await API.get('/sanctum/csrf-cookie', { baseURL: '' })
}

export const login = async (email, password) => {
  await getCsrfCookie()
  await API.post('/login', { email, password })
}

export const register = async (name, email, password) => {
  await getCsrfCookie()
  await API.post('/register', { name, email, password })
}

export const logout = async () => {
  await API.post('/logout')
}

export const getUser = async () => {
  const response = await API.get('/user')
  return response.data
}