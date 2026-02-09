// API Client for Flask backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://95.217.122.131:20197'

export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  createdAt: string
  updatedAt: string
}

export interface LoginResponse {
  message: string
  user: User
  accessToken: string
}

export interface RegisterResponse {
  message: string
  user: User
  accessToken: string
}

export interface BalanceResponse {
  accountBalance: string
  currency: string
}

export interface ApiError {
  error: string
  message?: string
}

// Convert snake_case to camelCase
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

// Convert camelCase to snake_case
function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

// Deep convert object keys from snake_case to camelCase
function convertKeysToCamel<T>(obj: unknown): T {
  if (Array.isArray(obj)) {
    return obj.map((item) => convertKeysToCamel(item)) as T
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = snakeToCamel(key)
      ;(result as Record<string, unknown>)[camelKey] = convertKeysToCamel(
        (obj as Record<string, unknown>)[key]
      )
      return result
    }, {} as Record<string, unknown>) as T
  }
  return obj as T
}

// Deep convert object keys from camelCase to snake_case
function convertKeysToSnake<T>(obj: unknown): T {
  if (Array.isArray(obj)) {
    return obj.map((item) => convertKeysToSnake(item)) as T
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const snakeKey = camelToSnake(key)
      ;(result as Record<string, unknown>)[snakeKey] = convertKeysToSnake(
        (obj as Record<string, unknown>)[key]
      )
      return result
    }, {} as Record<string, unknown>) as T
  }
  return obj as T
}

// Get token from localStorage
function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

// Generic fetch wrapper with JWT and case conversion
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    ;(headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }

  // Convert body keys to snake_case if present
  let body = options.body
  if (body && typeof body === 'string') {
    try {
      const parsed = JSON.parse(body)
      body = JSON.stringify(convertKeysToSnake(parsed))
    } catch {
      // Keep original body if not valid JSON
    }
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers,
    body,
  })

  const data = await response.json()

  if (!response.ok) {
    const error = convertKeysToCamel<ApiError>(data)
    throw new Error(error.message || error.error || 'API request failed')
  }

  return convertKeysToCamel<T>(data)
}

// Auth API functions
export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  return fetchApi<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function register(data: {
  firstName: string
  lastName: string
  email: string
  password: string
}): Promise<RegisterResponse> {
  return fetchApi<RegisterResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// User API functions
export async function getProfile(): Promise<User> {
  return fetchApi<User>('/api/users/me')
}

export async function updateProfile(data: {
  firstName?: string
  lastName?: string
  email?: string
}): Promise<User> {
  return fetchApi<User>('/api/users/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function getBalance(): Promise<BalanceResponse> {
  return fetchApi<BalanceResponse>('/api/users/me/balance')
}
