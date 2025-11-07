'use client'
import { UserProfileInput } from '@/shared/types/user'
import { signIn as authSignIn, signOut as authSignOut, signUp as authSignUp, checkAuthState as checkAuth } from '@client/services/authService'
import { isProfileComplete, saveProfile, validateProfileData } from '@client/services/profileService'
import { AuthContextType, AuthUser } from '@client/types/profile'
import { ReactNode, createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfileInput>({})

  const extractUserProfile = (userInfo: AuthUser): UserProfileInput => {
    if (!userInfo) return {}

    const custom = userInfo.customAttributes ?? {}
    return {
      givenName: userInfo.givenName || '',
      familyName: userInfo.familyName || '',
      email: userInfo.email || '',
      phone: custom.phone || '',
      position: custom.position || '',
      company: custom.company || '',
      industry: custom.industry || '',
      website: custom.url || ''
    }
  }

  const checkAuthState = async () => {
    try {
      const { isAuthenticated: authStatus, user: userInfo } = await checkAuth()

      setIsAuthenticated(authStatus)
      setUser(userInfo)

      if (authStatus && userInfo) {
        setUserProfile(extractUserProfile(userInfo))
      } else {
        setUserProfile({})
      }
    } catch (error) {
      console.error('Failed to check auth state:', error)
      setIsAuthenticated(false)
      setUser(null)
      setUserProfile({})
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true)
        await checkAuthState()
      } catch (error) {
        console.error('Failed to initialize auth:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const signIn = async () => {
    try {
      await authSignIn()
    } catch (error) {
      console.error('Sign in failed:', error)
    }
  }

  const signUp = async () => {
    try {
      await authSignUp()
    } catch (error) {
      console.error('Sign up failed:', error)
    }
  }

  const signOut = async () => {
    try {
      setIsLoading(true)
      await authSignOut()
      setIsAuthenticated(false)
      setUser(null)
      setUserProfile({})
    } catch (error) {
      console.error('Sign out failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshAuth = async () => {
    await checkAuthState()
  }

  const getMissingProfileFields = (): string[] => {
    return validateProfileData(userProfile)
  }

  const checkIfUserHasCompleteProfile = (): boolean => {
    return isProfileComplete(userProfile)
  }

  const updateUserProfile = async (profile: UserProfileInput): Promise<boolean> => {
    try {
      await saveProfile(profile)
      setUserProfile(profile)
      return true
    } catch (error) {
      console.error('Failed to update profile:', error)
      return false
    }
  }

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    userProfile,
    signIn,
    signUp,
    signOut,
    refreshAuth,
    getMissingProfileFields,
    checkIfUserHasCompleteProfile,
    updateUserProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
