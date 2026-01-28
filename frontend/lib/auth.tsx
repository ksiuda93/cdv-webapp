'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import {
  login as apiLogin,
  register as apiRegister,
  getProfile,
  type User,
  type LoginResponse,
  type RegisterResponse,
} from './api'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<LoginResponse>
  register: (data: {
    firstName: string
    lastName: string
    email: string
    password: string
  }) => Promise<RegisterResponse>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
      // Fetch user profile
      getProfile()
        .then((userData) => {
          setUser(userData)
        })
        .catch(() => {
          // Token invalid, clear it
          localStorage.removeItem('token')
          setToken(null)
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(
    async (email: string, password: string): Promise<LoginResponse> => {
      const response = await apiLogin(email, password)
      localStorage.setItem('token', response.accessToken)
      setToken(response.accessToken)
      setUser(response.user)
      return response
    },
    []
  )

  const register = useCallback(
    async (data: {
      firstName: string
      lastName: string
      email: string
      password: string
    }): Promise<RegisterResponse> => {
      const response = await apiRegister(data)
      localStorage.setItem('token', response.accessToken)
      setToken(response.accessToken)
      setUser(response.user)
      return response
    },
    []
  )

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
