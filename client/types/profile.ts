import { UserProfile } from '@/shared/types/user'

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
  signUp: () => Promise<void>
  signOut: () => Promise<void>
  refreshAuth: () => Promise<void>
  getMissingProfileFields: () => string[]
  checkIfUserHasCompleteProfile: () => boolean
  updateUserProfile: (profile: UserProfile) => Promise<boolean>
}
