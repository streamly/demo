import { apiClient } from './apiClient'
import { UserProfile } from '../types/profile'

export interface ProfileUpdateResponse {
  success: boolean
  message?: string
}

export interface ProfileValidationError {
  error: string
  details?: any
}

class ProfileService {
  async updateProfile(profileData: UserProfile): Promise<ProfileUpdateResponse> {
    try {
      const response = await apiClient.post<ProfileUpdateResponse>('/api/profile', profileData)
      return response
    } catch (error) {
      console.error('Failed to update profile:', error)
      throw error
    }
  }

  async getProfile(): Promise<UserProfile | null> {
    try {
      const response = await apiClient.get<UserProfile>('/api/profile')
      return response
    } catch (error) {
      console.error('Failed to get profile:', error)
      return null
    }
  }

  validateProfileData(data: UserProfile): string[] {
    const requiredFields: (keyof UserProfile)[] = [
      'firstname',
      'lastname',
      'email',
      'phone',
      'position',
      'company',
      'industry'
    ]

    return requiredFields.filter(field => {
      const value = data[field]
      return !value || (typeof value === 'string' && value.trim() === '')
    })
  }

  isProfileComplete(profile: UserProfile): boolean {
    return this.validateProfileData(profile).length === 0
  }

  getMissingFieldLabels(missingFields: string[]): string[] {
    const fieldLabels: { [key: string]: string } = {
      firstname: 'First Name',
      lastname: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      position: 'Title / Position',
      company: 'Company / Organization',
      industry: 'Industry'
    }

    return missingFields.map(field => fieldLabels[field] || field)
  }
}

export const profileService = new ProfileService()
