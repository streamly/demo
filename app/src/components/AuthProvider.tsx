'use client'
import { ReactNode, createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../services/authService'
import { profileService } from '../services/profileService'
import { UserProfile, AuthContextType, AuthUser } from '../types/profile'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile>({})

  const extractUserProfile = (userInfo: AuthUser): UserProfile => {
    if (!userInfo) return {}

    const custom = userInfo.customAttributes ?? {}
    return {
      firstname: userInfo.givenName || '',
      lastname: userInfo.familyName || '',
      email: userInfo.email || '',
      phone: custom.phone || '',
      position: custom.position || '',
      company: custom.company || '',
      industry: custom.industry || '',
      url: custom.url || ''
    }
  }

  const checkAuthState = async () => {
    try {
      const { isAuthenticated: authStatus, user: userInfo } = await authService.checkAuthState()
      
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
      await authService.signIn()
    } catch (error) {
      console.error('Sign in failed:', error)
    }
  }

  const signOut = async () => {
    try {
      setIsLoading(true)
      await authService.signOut()
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
    return profileService.validateProfileData(userProfile)
  }

  const checkIfUserHasCompleteProfile = (): boolean => {
    return profileService.isProfileComplete(userProfile)
  }

  const updateUserProfile = async (profile: UserProfile): Promise<boolean> => {
    try {
      const response = await profileService.updateProfile(profile)
      if (response.success) {
        setUserProfile(profile)
        return true
      }
      return false
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
