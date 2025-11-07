import { UserProfileInput } from '@/shared/types/user'
import { getProfile, getRequiredFields, updateProfile } from './api'

// Simple profile functions - no classes needed!

export async function saveProfile(profileData: UserProfileInput) {
  // Basic validation
  const missingFields = getRequiredFields(profileData)
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
  }

  return updateProfile(profileData)
}

export async function fetchProfile(): Promise<UserProfileInput | null> {
  return getProfile() as Promise<UserProfileInput | null>
}

export function validateProfileData(data: UserProfileInput): string[] {
  const errors: string[] = []

  // Required fields with length validation (matching backend schema)
  const requiredFields = {
    givenName: { label: 'First Name', maxLength: 100 },
    familyName: { label: 'Last Name', maxLength: 100 },
    position: { label: 'Title / Position', maxLength: 100 },
    company: { label: 'Company / Organization', maxLength: 100 },
    industry: { label: 'Industry', maxLength: 100 },
    phone: { label: 'Phone', maxLength: null },
    email: { label: 'Email', maxLength: null }
  }

  for (const [field, config] of Object.entries(requiredFields)) {
    const value = data[field as keyof UserProfileInput]
    const trimmedValue = typeof value === 'string' ? value.trim() : ''

    if (!trimmedValue) {
      errors.push(field)
    } else if (config.maxLength && trimmedValue.length > config.maxLength) {
      errors.push(`${field}_too_long`)
    }
  }

  // Website validation (optional but must be valid URL if provided)
  if (data.website && data.website.trim()) {
    const website = data.website.trim()
    if (website.length > 255) {
      errors.push('website_too_long')
    }
    try {
      new URL(website)
    } catch {
      errors.push('website_invalid')
    }
  }

  return errors
}

export function isProfileComplete(profile: UserProfileInput): boolean {
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

