import { useEffect, useState } from 'react'
import { AuthContext } from './AuthContext.js'
import { loginUser, registerUser } from '../services/authService'
import { getProfile } from '../services/userService'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() =>
    localStorage.getItem('fitkart_token')
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const restoreSession = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const profile = await getProfile()
        setUser(profile)
      } catch {
        localStorage.removeItem('fitkart_token')
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [token])

  const login = async (data) => {
    const response = await loginUser(data)

    localStorage.setItem('fitkart_token', response.token)
    setToken(response.token)

    const profile = await getProfile()
    setUser(profile)

    return profile
  }

  const register = async (data) => {
    return registerUser(data)
  }

  const logout = () => {
    localStorage.removeItem('fitkart_token')
    setToken(null)
    setUser(null)
  }

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
