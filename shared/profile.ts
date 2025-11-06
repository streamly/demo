import { UserProfile } from './types/user'

export function getMissingProfileFields(user: any): (keyof Omit<UserProfile, 'website'>)[] {
  if (!user) {
    return ['givenName', 'familyName', 'email', 'phone', 'position', 'company', 'industry']
  }

  const custom = user.customAttributes ?? {}

  const required: Record<string, string | undefined> = {
    givenName: user.givenName,
    familyName: user.familyName,
    email: user.email,
    phone: custom.phone,
    position: custom.position,
    company: custom.company,
    industry: custom.industry,
  }

  return Object.entries(required)
    .filter(([_, value]) => typeof value !== 'string' || value.trim() === '')
    .map(([key]) => key as keyof Omit<UserProfile, 'website'>)
}

export function checkIfUserHasCompleteProfile(user: any): boolean {
  return getMissingProfileFields(user).length === 0
}

export function extractUserProfile(user: any): UserProfile {
  if (!user) {
    return {}
  }

  const custom = user.customAttributes ?? {}

  return {
    givenName: user.givenName,
    familyName: user.familyName,
    email: user.email,
    phone: custom.phone,
    position: custom.position,
    company: custom.company,
    industry: custom.industry,
    website: custom.website,
  }
}