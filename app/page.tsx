'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Configure } from 'react-instantsearch'

import SearchHeader from '@/client/components/layout/Header'
import { useAuth } from '@client/components/auth/AuthProvider'
import JumbotronBanner from '@client/components/layout/JumbotronBanner'
import ProfileModal from '@client/components/modals/ProfileModal'
import InfiniteScrollHits from '@client/components/search/InifiniteScrollHits'
import { SearchProvider, useSearch } from '@client/components/search/SearchProvider'
import SidebarFilters from '@client/components/search/SidebarFilters'
import SidebarFiltersSkeleton from '@client/components/search/SidebarFiltersSkeleton'
import { InstantSearchWrapper, TypesenseSearchProvider, useTypesenseSearch } from '@client/components/search/TypesenseSearchProvider'
import LoadingOverlay from '@client/components/ui/LoadingOverlay'
import VideoManager from '@client/components/video/VideoManager'
import VideoModal from '@client/components/video/VideoModal'

function SearchLayout() {
  const { isAuthenticated, isLoading: authLoading, checkIfUserHasCompleteProfile } = useAuth()
  const { showSearchMode, setIsSearchFocused } = useSearch()
  const { isReady: searchReady } = useTypesenseSearch()
  const searchParams = useSearchParams()
  const [showProfileModal, setShowProfileModal] = useState(false)


  useEffect(() => {
    const shouldShowProfileModal = searchParams.get('showProfileModal') === 'true'
    if (shouldShowProfileModal && isAuthenticated && !authLoading) {
      const hasCompleteProfile = checkIfUserHasCompleteProfile()
      if (!hasCompleteProfile) {
        setShowProfileModal(true)
        // Clean up URL
        window.history.replaceState({}, '', '/')
      }
    }
  }, [searchParams, isAuthenticated, authLoading, checkIfUserHasCompleteProfile])



  return (
    <VideoManager>
      {({ selectedVideo, isLoadingVideo, handleVideoSelect, handleVideoClose }) => (
        <div className="min-h-screen">
          <SearchHeader
            onSearchFocus={setIsSearchFocused}
            onProfileModalOpen={() => setShowProfileModal(true)}
          />

          {/* Jumbotron Banner - show only after auth loads, when not in search mode AND user is not authenticated */}
          {!showSearchMode && !authLoading && !isAuthenticated && <JumbotronBanner />}

          <div className="flex">
            {/* Sidebar Filters - show for authenticated users (or during auth loading), or when in search mode for non-authenticated */}
            {(isAuthenticated || showSearchMode || authLoading) && (
              (authLoading || !searchReady) ? <SidebarFiltersSkeleton /> : <SidebarFilters />
            )}

            <main className={`flex-1 p-6 max-w-7xl mx-auto ${(isAuthenticated || showSearchMode || authLoading) ? 'lg:ml-64' : ''}`}>
              <InfiniteScrollHits onVideoSelect={handleVideoSelect} />
            </main>
          </div>

          {/* Video Modal */}
          {selectedVideo && (
            <>
              {console.log('Rendering VideoModal for:', selectedVideo.title)}
              <VideoModal hit={selectedVideo} onClose={handleVideoClose} />
            </>
          )}

          {/* Profile Modal */}
          <ProfileModal
            isOpen={showProfileModal}
            onClose={() => setShowProfileModal(false)}
          />

          {/* Loading Overlay for video loading */}
          <LoadingOverlay
            isVisible={isLoadingVideo}
            message="Loading video..."
          />
        </div>
      )}
    </VideoManager>
  )
}

export default function Page() {
  return (
    <TypesenseSearchProvider autoInitialize={true}>
      <InstantSearchWrapper indexName="videos">
        <Configure hitsPerPage={12} />
        <SearchProvider>
          <SearchLayout />
        </SearchProvider>
      </InstantSearchWrapper>
    </TypesenseSearchProvider>
  )
}
