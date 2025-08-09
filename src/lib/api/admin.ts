import axiosInstance from '@/lib/axios'
import type { User } from '@/types/auth'

export interface UsersListResponse {
  users: User[]
  total: number
  skip: number
  limit: number
}

export interface UpdateUserRoleInput {
  role: 'viewer' | 'editor' | 'admin'
}

export class AdminClient {
  static async getUsersList(skip = 0, limit = 100): Promise<UsersListResponse> {
    const response = await axiosInstance.get('/api/v1/admin/users', {
      params: { skip, limit }
    })
    return response.data
  }
  
  static async updateUserRole(userId: string, role: UpdateUserRoleInput['role']): Promise<void> {
    await axiosInstance.put(`/api/v1/admin/users/${userId}/role`, { role })
  }
  
  static async deleteUser(userId: string): Promise<void> {
    await axiosInstance.delete(`/api/v1/admin/users/${userId}`)
  }
}