'use client'
import { useState } from 'react'
import { useSearchBox } from 'react-instantsearch'
import { useAuth } from '@client/components/auth/AuthProvider'
import Image from 'next/image'
import AboutModal from '@client/components/modals/AboutModal'
import Button from '@client/components/ui/Button'
import Dropdown, { DropdownItem, DropdownSeparator } from '@client/components/ui/Dropdown'

// #TODO: fix that when clicking on search bar first batch of results just disappears
interface SearchHeaderProps {
  onSearchFocus?: (focused: boolean) => void
  onProfileModalOpen?: () => void
}

export default function SearchHeader({ onSearchFocus, onProfileModalOpen }: SearchHeaderProps) {
  const { isAuthenticated, user, signIn, signOut } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false)
  
  // For now, set channel as constant = 1
  const channel = 1

  const handleSignUp = () => {
    window.location.href = '/auth/signup'
  }

  const handleCreateChannel = () => {
    window.location.href = '#test'
  }

  const handleSettings = () => {
    // Redirect to Authgear settings - customize this URL
    window.location.href = '/auth/settings'
  }

  const handleSignOut = async () => {
    await signOut()
    setIsDropdownOpen(false)
    window.location.href = '/'
  }


  const userName = user ? `${user.givenName || ''} ${user.familyName || ''}`.trim() : ''

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-6 py-4 z-40">
        <div className="max-w-7xl mx-auto flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Bizilla Videos"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <h1 className="text-2xl font-semibold text-gray-900">
              Bizilla Videos
            </h1>
          </div>
          
          {/* Search Box */}
          <div className="flex-1 max-w-md">
            <CustomSearchBox onSearchFocus={onSearchFocus} />
          </div>
          
          {/* Auth Actions */}
          <div className="flex items-center gap-3 ml-auto">
            {isAuthenticated ? (
              <Dropdown
                isOpen={isDropdownOpen}
                onClose={() => setIsDropdownOpen(false)}
                trigger={
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 px-3 py-2 rounded border border-gray-300 hover:border-gray-400 transition-colors"
                  >
                    <span>{userName || user?.email || 'User'}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                }
              >
                <DropdownItem onClick={() => {
                  handleCreateChannel()
                  setIsDropdownOpen(false)
                }}>
                  {channel === 1 ? 'My Channel' : 'Create a Channel'}
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
                  setIsAboutModalOpen(true)
                  setIsDropdownOpen(false)
                }}>
                  About
                </DropdownItem>
                <DropdownSeparator />
                <DropdownItem onClick={handleSignOut}>
                  Sign Out
                </DropdownItem>
              </Dropdown>
            ) : (
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={handleSignUp}>
                  Sign Up
                </Button>
                <Button size="sm" onClick={signIn}>
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-20"></div>

      {/* About Modal */}
      <AboutModal 
        isOpen={isAboutModalOpen} 
        onClose={() => setIsAboutModalOpen(false)} 
      />
    </>
  )
}

function CustomSearchBox({ onSearchFocus }: { onSearchFocus?: (focused: boolean) => void }) {
  const { query, refine } = useSearchBox()

  return (
    <form className="relative">
      <input
        type="search"
        value={query}
        onChange={(e) => refine(e.target.value)}
        onFocus={() => onSearchFocus?.(true)}
        onBlur={() => onSearchFocus?.(false)}
        placeholder="Search videos..."
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {query && (
        <button
          type="button"
          onClick={() => refine('')}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      )}
    </form>
  )
}
