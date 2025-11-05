'use client'
import { useEffect, useRef, useState } from 'react'
import { useInfiniteHits } from 'react-instantsearch'
import { getVideoThumbnail } from '@client/utils/thumbnailUtils'

// Skeleton component for loading state
function VideoCardSkeleton() {
  return (
    <div className="p-4 animate-pulse">
      <div className="flex items-center space-x-4">
        {/* Thumbnail skeleton */}
        <div className="flex-shrink-0">
          <div className="w-40 h-24 bg-gray-200 rounded-lg"></div>
        </div>

        {/* Content skeleton */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Title */}
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
          {/* Description */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
          {/* Metadata */}
          <div className="flex items-center space-x-4">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        </div>

        {/* Action button skeleton */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  )
}

// Component that shows loading state only for video hits
export default function SearchAwareVideoHits() {
  const { items, showMore, isLastPage } = useInfiniteHits()
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // Track initial loading state
  useEffect(() => {
    // Consider loaded after first render with items or after a short delay
    const timer = setTimeout(() => {
      setIsInitialLoading(false)
    }, 1000)

    if (items.length > 0) {
      setIsInitialLoading(false)
      clearTimeout(timer)
    }

    return () => clearTimeout(timer)
  }, [items.length])

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

  // Show skeleton loading for initial load
  if (isInitialLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200">
          {Array.from({ length: 3 }).map((_, index) => (
            <VideoCardSkeleton key={index} />
          ))}
        </div>
      </div>
    )
  }

  // Show empty state
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

  // Show video hits
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
      {!isLastPage && <div ref={sentinelRef} className="h-10" />}
    </div>
  )
}
