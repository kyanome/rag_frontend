export interface User {
  id: string
  email: string
  name: string
  role: 'viewer' | 'editor' | 'admin'
  created_at: string
  updated_at: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  email: string
  name: string
  password: string
  password_confirmation: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
}

export interface AuthError {
  detail: string
  code?: string
}