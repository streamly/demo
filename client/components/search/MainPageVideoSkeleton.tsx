'use client'

// Skeleton component for main page video cards
export function VideoCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      {/* Thumbnail skeleton */}
      <div className="aspect-video bg-gray-200"></div>
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title skeleton */}
        <div className="h-5 bg-gray-200 rounded w-4/5"></div>
        
        {/* Description skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
        
        {/* Metadata skeleton */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-5 bg-gray-200 rounded-full w-12"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>
  )
}

// Grid of skeleton cards for initial loading
export default function MainPageVideoSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <VideoCardSkeleton key={index} />
      ))}
    </div>
  )
}
