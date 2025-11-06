// Simple API functions - no classes, no complexity
import { UserProfile } from '@/shared/types/user'

async function getAuthToken(): Promise<string | null> {
  try {
    const { getAccessToken } = await import('./authService')
    return await getAccessToken()
  } catch {
    return null
  }
}

async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getAuthToken()
  
  const response = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  return response.json()
}

// Profile functions
export async function updateProfile(profileData: UserProfile) {
  try {
    return await apiCall('/api/users/me', {
      method: 'POST',
      body: JSON.stringify(profileData),
    })
  } catch (error) {
    // Generic error for user - don't expose internal details
    throw new Error('Unable to save profile. Please try again.')
  }
}

export async function getProfile(): Promise<UserProfile | null> {
  try {
    return await apiCall<UserProfile>('/api/users/me')
  } catch {
    return null
  }
}

// Analytics functions
export async function trackVideoPlay(videoData: any) {
  return apiCall('/api/analytics/play', {
    method: 'POST',
    body: JSON.stringify(videoData),
  })
}

export async function sendContactForm(formData: any) {
  return apiCall('/api/analytics/contact', {
    method: 'POST',
    body: JSON.stringify(formData),
  })
}

// Validation helpers (simple functions)
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function getRequiredFields(profile: UserProfile): string[] {
  const required: (keyof UserProfile)[] = ['givenName', 'familyName', 'email', 'phone', 'position', 'company', 'industry']
  return required.filter(field => {
    const value = profile[field]
    return !value || (typeof value === 'string' && value.trim() === '')
  })
}
