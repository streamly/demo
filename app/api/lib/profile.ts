export interface UserProfile {
  firstname?: string
  lastname?: string
  email?: string
  phone?: string
  position?: string
  company?: string
  industry?: string
  url?: string
}

export function getMissingProfileFields(user: any): string[] {
  if (!user) {
    return ['firstname', 'lastname', 'email', 'phone', 'position', 'company', 'industry']
  }

  const custom = user.customAttributes ?? {}
  const required = {
    firstname: user.givenName,
    lastname: user.familyName,
    email: user.email,
    phone: custom.phone,
    position: custom.position,
    company: custom.company,
    industry: custom.industry,
  }

  return Object.entries(required)
    .filter(([_, value]) => typeof value !== "string" || value.trim() === "")
    .map(([key]) => key)
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
    firstname: user.givenName || '',
    lastname: user.familyName || '',
    email: user.email || '',
    phone: custom.phone || '',
    position: custom.position || '',
    company: custom.company || '',
    industry: custom.industry || '',
    url: custom.url || ''
  }
}
