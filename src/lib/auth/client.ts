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
    const response = await axiosInstance.post('/api/v1/auth/login', {
      email: data.email,
      password: data.password,
    })
    
    const tokens: AuthTokens = {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      token_type: response.data.token_type || 'bearer',
    }
    
    // Set tokens in axios instance for the next request
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${tokens.access_token}`
    
    // Get user info with the new token
    const user = await this.getCurrentUser()
    
    return {
      user,
      tokens,
    }
  }
  
  static async register(data: RegisterInput): Promise<AuthResponse> {
    // Register the user
    await axiosInstance.post('/api/v1/auth/register', {
      email: data.email,
      name: data.name,
      password: data.password,
    })
    
    // After successful registration, automatically login
    return this.login({
      email: data.email,
      password: data.password,
    })
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