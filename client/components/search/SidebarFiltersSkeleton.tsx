'use client'

// Skeleton for individual filter sections
function FilterSectionSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Filter title */}
      <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
      
      {/* Filter items */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-3 w-3 bg-gray-200 rounded"></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-3 w-3 bg-gray-200 rounded"></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-28"></div>
          <div className="h-3 w-3 bg-gray-200 rounded"></div>
        </div>
      </div>
      
      {/* Show more link */}
      <div className="mt-2 h-3 bg-gray-200 rounded w-16"></div>
    </div>
  )
}

// Skeleton for duration filter
function DurationFilterSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Duration title */}
      <div className="h-4 bg-gray-200 rounded w-16 mb-3"></div>
      
      {/* Preset buttons */}
      <div className="space-y-2 mb-4">
        <div className="h-8 bg-gray-200 rounded w-full"></div>
        <div className="h-8 bg-gray-200 rounded w-full"></div>
        <div className="h-8 bg-gray-200 rounded w-full"></div>
        <div className="h-8 bg-gray-200 rounded w-full"></div>
      </div>
      
      {/* Custom range section */}
      <div className="border-t border-gray-200 pt-3">
        <div className="h-3 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="flex gap-2 items-center">
          <div className="h-8 bg-gray-200 rounded w-20"></div>
          <div className="h-3 bg-gray-200 rounded w-4"></div>
          <div className="h-8 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>
  )
}

// Main skeleton component for sidebar filters
export default function SidebarFiltersSkeleton() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white lg:block fixed left-0 top-20 bottom-0 overflow-y-auto">
      <div className="p-6">
        <div className="mb-6">
          {/* Header with title and clear button */}
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-8 animate-pulse"></div>
          </div>

          {/* Search input */}
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Filter sections */}
        <FilterSectionSkeleton />
        
        <div className="my-6 border-t border-gray-200" />
        
        <FilterSectionSkeleton />
        
        <div className="my-6 border-t border-gray-200" />
        
        <DurationFilterSkeleton />
        
        <div className="my-6 border-t border-gray-200" />
        
        <FilterSectionSkeleton />
        
        <div className="my-6 border-t border-gray-200" />
        
        <FilterSectionSkeleton />
        
        <div className="my-6 border-t border-gray-200" />
        
        <FilterSectionSkeleton />
      </div>
    </aside>
  )
}
