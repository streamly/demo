export interface UserProfile {
  givenName?: string
  familyName?: string
  email?: string
  phone?: string
  position?: string
  company?: string
  industry?: string
  website?: string
}

export interface AuthUser {
  sub: string
  email?: string
  givenName?: string
  familyName?: string
  customAttributes?: {
    phone?: string
    position?: string
    company?: string
    industry?: string
    url?: string
  }
}

export interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: AuthUser | null
  userProfile: UserProfile
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  refreshAuth: () => Promise<void>
  getMissingProfileFields: () => string[]
  checkIfUserHasCompleteProfile: () => boolean
  updateUserProfile: (profile: UserProfile) => Promise<boolean>
}
