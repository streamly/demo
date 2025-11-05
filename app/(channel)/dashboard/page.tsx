'use client'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Configure,
  useInfiniteHits,
  useInstantSearch,
  useSearchBox
} from 'react-instantsearch'
import { getVideoThumbnail } from '@client/utils/thumbnailUtils'
import DashboardSearchInitializer from '@client/components/search/DashboardSearchWrapper'
import SearchAwareVideoHits from '@client/components/search/SearchAwareVideoHits'
import SidebarFilters from '@client/components/search/SidebarFilters'
import SidebarFiltersSkeleton from '@client/components/search/SidebarFiltersSkeleton'
import { useAuth } from '@client/components/auth/AuthProvider'
import { useTypesenseSearch } from '@client/components/search/TypesenseSearchProvider'

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

// Component to trigger initial search
function InitialSearchTrigger() {
  const { refine } = useSearchBox()

  useEffect(() => {
    // Trigger initial search with empty query to get all results
    console.log('Dashboard: Triggering initial search')
    refine('')
  }, [refine])

  return null
}

// Debug component to check search state
function SearchDebugger() {
  const { indexUiState, results, error } = useInstantSearch()

  useEffect(() => {
    console.log('Dashboard Search State:', {
      query: indexUiState.query,
      results: results,
      error: error,
      nbHits: results?.nbHits,
      processingTimeMS: results?.processingTimeMS
    })
  }, [indexUiState, results, error])

  return null
}

// Dashboard-specific video hits component with row layout
function DashboardVideoHits() {
  const { items, showMore, isLastPage } = useInfiniteHits()
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || isLastPage) return

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          showMore()
        }
      },
      { threshold: 0.1 }
    )

    io.observe(el)
    return () => io.disconnect()
  }, [isLastPage, showMore])

  console.log('Dashboard hits:', items.length, items) // Debug log
  console.log('Dashboard search state:', { isLastPage, itemsLength: items.length })

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No videos found</h3>
        <p className="text-gray-500">Try adjusting your search or filters to find videos.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="divide-y divide-gray-200">
        {items.map((hit: any) => (
          <div key={hit.objectID} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-4">
              {/* Thumbnail */}
              <div className="flex-shrink-0 relative">
                <img
                  src={getVideoThumbnail(hit.id)}
                  alt={hit.title}
                  className="w-40 h-24 rounded-lg object-cover"
                />
                {hit.duration && (
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                    {Math.floor(hit.duration / 60)}:{(hit.duration % 60).toString().padStart(2, '0')}
                  </div>
                )}
              </div>

              {/* Video Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {hit.title}
                </h3>
                {hit.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {hit.description}
                  </p>
                )}
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                  {/* Show companies array or fallback to legacy company field */}
                  {(hit.companies?.length > 0 || hit.company) && (
                    <span>{hit.companies?.[0] || hit.company}</span>
                  )}
                  {/* Show types/categories */}
                  {hit.types?.length > 0 && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {hit.types[0]}
                    </span>
                  )}
                  {/* Show created_at or fallback to legacy created field */}
                  {(hit.created_at || hit.created) && (
                    <span>
                      Published {new Date((hit.created_at || hit.created * 1000)).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {/* Show tags if available */}
                {hit.tags?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {hit.tags.slice(0, 3).map((tag: string, index: number) => (
                      <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                    {hit.tags.length > 3 && (
                      <span className="text-gray-500 text-xs">+{hit.tags.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex-shrink-0">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {isLastPage && <div ref={sentinelRef} className="h-10" />}
    </div>
  )
}


export default function DashboardPage() {
  const { isLoading: authLoading } = useAuth()
  const { isReady: searchReady } = useTypesenseSearch()

  return (
    <div className="flex">
      {/* Sidebar Filters */}
      {(authLoading || !searchReady) ? <SidebarFiltersSkeleton /> : <SidebarFilters />}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
          {/* Dashboard Header */}
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
              <div className="flex-shrink-0">
                <UploadButton />
              </div>
            </div>
          </div>

          {/* Search configuration and initialization */}
          <DashboardSearchInitializer>
            <Configure hitsPerPage={20} query="" />
            <InitialSearchTrigger />
            <SearchDebugger />
          </DashboardSearchInitializer>

          {/* Video hits with their own loading state */}
          <SearchAwareVideoHits />
        </div>
      </div>
    </div>
  )
}
