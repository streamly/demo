'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@client/components/auth/AuthProvider'
import Button from '@client/components/ui/Button'
import Dropdown, { DropdownItem, DropdownSeparator } from '@client/components/ui/Dropdown'

interface UserMenuProps {
  onProfileModalOpen?: () => void
  onAboutModalOpen?: () => void
}

export default function UserMenu({ onProfileModalOpen, onAboutModalOpen }: UserMenuProps) {
  const { isAuthenticated, user, signIn, signUp, signOut, isLoading } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const pathname = usePathname()
  
  // For now, set hasChannel as constant
  const hasChannel = true
  
  // Check if we're on the dashboard
  const isOnDashboard = pathname?.startsWith('/dashboard') || false

  const handleSignUp = async () => {
    try {
      await signUp()
    } catch (error) {
      console.error('Sign up failed:', error)
    }
  }

  const handleChannelAction = () => {
    if (isOnDashboard) {
      // If on dashboard, exit to landing page
      window.location.href = '/'
    } else if (hasChannel) {
      // If not on dashboard, go to dashboard
      window.location.href = '/dashboard'
    } else {
      window.location.href = '#create-channel'
    }
  }

  const handleSettings = () => {
    window.location.href = '/auth/settings'
  }

  const handleSignOut = async () => {
    await signOut()
    setIsDropdownOpen(false)
    window.location.href = '/'
  }

  const userName = user ? `${user.givenName || ''} ${user.familyName || ''}`.trim() : ''

  // Show skeleton while loading
  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        {/* User name skeleton - Hidden on small screens */}
        <div className="hidden lg:block">
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        {/* Menu button skeleton */}
        <div className="flex items-center gap-2 px-3 py-2 rounded border border-gray-200">
          <div className="hidden md:block h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={handleSignUp}>
          Sign Up
        </Button>
        <Button size="sm" onClick={signIn}>
          Sign In
        </Button>
      </div>
    )
  }

  return (
    <>
      {/* User Name - Hidden on small screens */}
      <span className="hidden lg:block text-sm text-gray-700 font-medium">
        {userName || user?.email || 'User'}
      </span>
      
      <Dropdown
        isOpen={isDropdownOpen}
        onClose={() => setIsDropdownOpen(false)}
        trigger={
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 px-3 py-2 rounded border border-gray-300 hover:border-gray-400 transition-colors"
          >
            {/* Menu text for larger screens */}
            <span className="hidden md:block">Menu</span>
            
            {/* Menu icon for all screen sizes */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        }
      >
        <DropdownItem onClick={() => {
          handleChannelAction()
          setIsDropdownOpen(false)
        }}>
          {isOnDashboard ? 'Exit Dashboard' : (hasChannel ? 'My Channel' : 'Create Channel')}
        </DropdownItem>
        <DropdownItem onClick={() => {
          onProfileModalOpen?.()
          setIsDropdownOpen(false)
        }}>
          Profile
        </DropdownItem>
        <DropdownItem onClick={() => {
          handleSettings()
          setIsDropdownOpen(false)
        }}>
          Settings
        </DropdownItem>
        <DropdownItem onClick={() => {
          onAboutModalOpen?.()
          setIsDropdownOpen(false)
        }}>
          About
        </DropdownItem>
        <DropdownSeparator />
        <DropdownItem onClick={handleSignOut}>
          Sign Out
        </DropdownItem>
      </Dropdown>
    </>
  )
}
