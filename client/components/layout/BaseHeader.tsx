'use client'
import { ReactNode } from 'react'
import Logo from './Logo'
import SearchBox from './SearchBox'
import UserMenu from './UserMenu'

interface BaseHeaderProps {
  onSearchFocus?: (focused: boolean) => void
  onProfileModalOpen?: () => void
  onAboutModalOpen?: () => void
  banner?: ReactNode
  showSearch?: boolean
  title?: string
}

export default function BaseHeader({ 
  onSearchFocus, 
  onProfileModalOpen,
  onAboutModalOpen, 
  banner,
  showSearch = true,
  title
}: BaseHeaderProps) {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Logo title={title} />
          </div>
          
          {/* Search Box */}
          {showSearch && (
            <SearchBox onSearchFocus={onSearchFocus} />
          )}
          
          {/* User Menu */}
          <div className="flex items-center gap-3">
            <UserMenu 
              onProfileModalOpen={onProfileModalOpen}
              onAboutModalOpen={onAboutModalOpen}
            />
          </div>
        </div>
      </header>

      {/* Banner (optional) */}
      {banner}

      {/* Spacer for fixed header */}
      <div className={`${banner ? 'h-32' : 'h-20'}`}></div>
    </>
  )
}
