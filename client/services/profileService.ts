import { UserProfile } from '@client/types/profile'
import { updateProfile, getProfile, getRequiredFields } from './api'

// Simple profile functions - no classes needed!

export async function saveProfile(profileData: UserProfile) {
  // Basic validation
  const missingFields = getRequiredFields(profileData)
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
  }

  return updateProfile(profileData)
}

export async function fetchProfile(): Promise<UserProfile | null> {
  return getProfile() as Promise<UserProfile | null>
}

export function validateProfileData(data: UserProfile): string[] {
  const required: (keyof UserProfile)[] = ['givenName', 'familyName', 'email', 'phone', 'position', 'company', 'industry']
  return required.filter(field => {
    const value = data[field]
    return !value || (typeof value === 'string' && value.trim() === '')
  })
}

export function isProfileComplete(profile: UserProfile): boolean {
  return validateProfileData(profile).length === 0
}

export function getMissingFieldLabels(missingFields: string[]): string[] {
  const labels: { [key: string]: string } = {
    givenName: 'First Name',
    familyName: 'Last Name',
    email: 'Email',
    phone: 'Phone',
    position: 'Title / Position',
    company: 'Company / Organization',
    industry: 'Industry',
    website: 'Website URL'
  }
  return missingFields.map(field => labels[field] || field)
}

