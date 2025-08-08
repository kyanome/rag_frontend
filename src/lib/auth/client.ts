import axiosInstance from '@/lib/axios'
import type { 
  AuthResponse, 
  LoginInput, 
  RegisterInput, 
  User,
  AuthTokens 
} from '@/types/auth'

export class AuthClient {
  static async login(data: LoginInput): Promise<AuthResponse> {
    const formData = new URLSearchParams()
    formData.append('username', data.email)
    formData.append('password', data.password)
    
    const response = await axiosInstance.post('/api/v1/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    
    return response.data
  }
  
  static async register(data: RegisterInput): Promise<AuthResponse> {
    const response = await axiosInstance.post('/api/v1/auth/register', {
      email: data.email,
      name: data.name,
      password: data.password,
      role: 'viewer'
    })
    
    return response.data
  }
  
  static async logout(): Promise<void> {
    await axiosInstance.post('/api/v1/auth/logout')
  }
  
  static async getCurrentUser(): Promise<User> {
    const response = await axiosInstance.get('/api/v1/auth/me')
    return response.data
  }
  
  static async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await axiosInstance.post('/api/v1/auth/refresh', {
      refresh_token: refreshToken
    })
    
    return response.data.tokens
  }
}