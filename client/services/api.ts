// Simple API functions - no classes, no complexity

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL

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
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
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
export async function updateProfile(profileData: any) {
  return apiCall('/api/users/me', {
    method: 'POST',
    body: JSON.stringify(profileData),
  })
}

export async function getProfile() {
  try {
    return await apiCall('/api/users/me')
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

export function getRequiredFields(profile: any): string[] {
  const required = ['givenName', 'familyName', 'email', 'phone', 'position', 'company', 'industry']
  return required.filter(field => !profile[field]?.trim())
}
