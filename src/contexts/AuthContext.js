'use client'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext({})

// Token management utilities
const TOKEN_KEY = 'zero_waste_token'
const USER_KEY = 'zero_waste_user'

class TokenManager {
  static getToken() {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(TOKEN_KEY)
  }

  static setToken(token) {
    if (typeof window === 'undefined') return
    localStorage.setItem(TOKEN_KEY, token)
  }

  static removeToken() {
    if (typeof window === 'undefined') return
    localStorage.removeItem(TOKEN_KEY)
  }

  static getStoredUser() {
    if (typeof window === 'undefined') return null
    try {
      const stored = localStorage.getItem(USER_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }

  static setStoredUser(user) {
    if (typeof window === 'undefined') return
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }

  static removeStoredUser() {
    if (typeof window === 'undefined') return
    localStorage.removeItem(USER_KEY)
  }

  static decodeToken(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload
    } catch (error) {
      console.error('Token decode error:', error)
      return null
    }
  }

  static isTokenExpired(token) {
    const payload = this.decodeToken(token)
    if (!payload) return true
    return payload.exp * 1000 < Date.now()
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const clearAuth = useCallback(() => {
    TokenManager.removeToken()
    TokenManager.removeStoredUser()
    setUser(null)
    setError(null)
  }, [])

  const refreshUserData = useCallback(async () => {
    const token = TokenManager.getToken()
    if (!token || TokenManager.isTokenExpired(token)) {
      clearAuth()
      return null
    }

    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        TokenManager.setStoredUser(userData)
        return userData
      } else if (response.status === 401) {
        clearAuth()
        setError('Session expired. Please login again.')
      } else {
        throw new Error('Failed to fetch user data')
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error)
      setError('Failed to refresh user information')
    }
    return null
  }, [clearAuth])

  const checkAuthStatus = useCallback(async () => {
    setLoading(true)
    try {
      const token = TokenManager.getToken()
      
      if (!token) {
        setLoading(false)
        return
      }

      if (TokenManager.isTokenExpired(token)) {
        clearAuth()
        setError('Your session has expired. Please login again.')
        setLoading(false)
        return
      }

      // Try to get user from localStorage first
      const storedUser = TokenManager.getStoredUser()
      if (storedUser) {
        setUser(storedUser)
        setLoading(false)
        // Refresh user data in background
        refreshUserData()
        return
      }

      // If no stored user, fetch from API
      const userData = await refreshUserData()
      if (!userData) {
        const payload = TokenManager.decodeToken(token)
        if (payload) {
          setUser({
            id: payload.id,
            email: payload.email
          })
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      clearAuth()
      setError('Authentication check failed')
    } finally {
      setLoading(false)
    }
  }, [clearAuth, refreshUserData])

  useEffect(() => {
    checkAuthStatus()
  }, [checkAuthStatus])

  const login = useCallback(async (token, userData = null) => {
    try {
      if (TokenManager.isTokenExpired(token)) {
        throw new Error('Received expired token')
      }

      TokenManager.setToken(token)
      
      if (userData) {
        setUser(userData)
        TokenManager.setStoredUser(userData)
      } else {
        // Fetch user data
        await refreshUserData()
      }
      
      setError(null)
      return true
    } catch (error) {
      console.error('Login failed:', error)
      setError('Login failed: ' + error.message)
      clearAuth()
      return false
    }
  }, [refreshUserData, clearAuth])

  const logout = useCallback(async () => {
    try {
      // Optional: Call logout API endpoint
      const token = TokenManager.getToken()
      if (token) {
        fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).catch(() => {}) // Ignore errors for logout API
      }
    } finally {
      clearAuth()
    }
  }, [clearAuth])

  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates }
      TokenManager.setStoredUser(updated)
      return updated
    })
  }, [])

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    updateUser,
    refreshUserData,
    isAuthenticated: !!user,
    clearError: () => setError(null)
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}