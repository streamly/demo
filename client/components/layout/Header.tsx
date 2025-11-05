'use client'
import { useState } from 'react'
import BaseHeader from './BaseHeader'
import AboutModal from '@client/components/modals/AboutModal'

// #TODO: fix that when clicking on search bar first batch of results just disappears
interface SearchHeaderProps {
  onSearchFocus?: (focused: boolean) => void
  onProfileModalOpen?: () => void
}

export default function SearchHeader({ onSearchFocus, onProfileModalOpen }: SearchHeaderProps) {
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false)

  return (
    <>
      <BaseHeader 
        onSearchFocus={onSearchFocus}
        onProfileModalOpen={onProfileModalOpen}
        onAboutModalOpen={() => setIsAboutModalOpen(true)}
      />

      {/* About Modal */}
      <AboutModal 
        isOpen={isAboutModalOpen} 
        onClose={() => setIsAboutModalOpen(false)} 
      />
    </>
  )
}
