'use client'
import { useAuth } from '@client/components/auth/AuthProvider'
import BaseHeader from '@client/components/layout/BaseHeader'
import ProfileModal from '@client/components/modals/ProfileModal'
import { InstantSearchWrapper, TypesenseSearchProvider } from '@client/components/search/TypesenseSearchProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'


export default function ChannelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  // Derive redirect state from auth state
  const shouldRedirect = !isLoading && !isAuthenticated

  // Handle redirect in useEffect without setState
  useEffect(() => {
    if (shouldRedirect) {
      router.push('/')
    }
  }, [shouldRedirect, router])

  // Don't render anything if we should redirect, but no global loader
  if (shouldRedirect) {
    return null
  }

  return (
    <TypesenseSearchProvider autoInitialize={false}>
      <InstantSearchWrapper indexName="videos">
        <BaseHeader
          onProfileModalOpen={() => setIsProfileModalOpen(true)}
          onLogoClick={() => router.push('/dashboard')}
          title="Channel Dashboard"
        />

        <main className="min-h-screen bg-gray-50">
          {children}
        </main>

        {/* Profile Modal */}
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />
      </InstantSearchWrapper>
    </TypesenseSearchProvider>
  )
}
