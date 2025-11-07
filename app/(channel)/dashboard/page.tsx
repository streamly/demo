'use client'
import { useAuth } from '@client/components/auth/AuthProvider'
import VideoEditModal from '@client/components/modals/VideoEditModal'
import DashboardSearchInitializer from '@client/components/search/DashboardSearchWrapper'
import VideoList from '@client/components/video/VideoList'
import SidebarFilters from '@client/components/search/SidebarFilters' // Temporarily disabled
import SidebarFiltersSkeleton from '@client/components/search/SidebarFiltersSkeleton'
import { useTypesenseSearch } from '@client/components/search/TypesenseSearchProvider'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Configure,
  useInstantSearch,
  useSearchBox
} from 'react-instantsearch'



// Upload button component
function UploadButton() {
  const router = useRouter()

  const handleUploadClick = () => {
    router.push('/dashboard/videos/upload')
  }

  return (
    <button
      onClick={handleUploadClick}
      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      Upload Video
    </button>
  )
}

// Component to trigger initial search with user filter
function InitialSearchTrigger() {
  const { refine } = useSearchBox()
  const { user } = useAuth()

  useEffect(() => {
    // Trigger initial search with empty query to get all results
    console.log('Dashboard: Triggering initial search for user:', user?.sub)
    refine('')
  }, [refine, user?.sub])

  return null
}

// Debug component to check search state
function SearchDebugger() {
  const { indexUiState, results, error } = useInstantSearch()
  const { user } = useAuth()

  useEffect(() => {
    console.log('Dashboard Search State:', {
      userId: user?.sub,
      query: indexUiState.query,
      filters: indexUiState.configure?.filters,
      results: results,
      error: error,
      nbHits: results?.nbHits,
      processingTimeMS: results?.processingTimeMS
    })
  }, [indexUiState, results, error, user?.sub])

  return null
}

export default function DashboardPage() {
  const { isLoading: authLoading, user } = useAuth()
  const { isReady: searchReady } = useTypesenseSearch()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)

  // Check for video ID in query params and open edit modal
  useEffect(() => {
    const vParam = searchParams.get('v')
    if (vParam) {
      setSelectedVideoId(vParam)
      setIsEditModalOpen(true)
      // Clean up the URL by removing the query parameter
      router.replace('/dashboard', { scroll: false })
    }
  }, [searchParams, router])

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setSelectedVideoId(null)
  }

  return (
    <div className="flex">
      {(authLoading || !searchReady) ? <SidebarFiltersSkeleton /> : <SidebarFilters />}

      <div className="flex-1 lg:ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
          <VideoEditModal
            isOpen={isEditModalOpen}
            onClose={handleCloseEditModal}
            videoId={selectedVideoId}
          />

          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  My Videos
                </h1>
                <p className="text-gray-600">
                  Manage and track your video content
                </p>
              </div>
              <div className="shrink-0">
                <UploadButton />
              </div>
            </div>
          </div>

          <DashboardSearchInitializer>
            <Configure 
              hitsPerPage={20} 
              query="" 
              filters={user?.sub ? `user_id:=${user.sub}` : ''}
            />
            <InitialSearchTrigger />
            <SearchDebugger />
          </DashboardSearchInitializer>

          <VideoList />
        </div>
      </div>
    </div>
  )
}
