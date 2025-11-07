'use client'

export default function VideoRowSkeleton() {
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
