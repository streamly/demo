'use client'

export default function VideoListEmptyState() {
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
