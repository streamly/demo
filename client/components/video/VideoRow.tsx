'use client'
import type { VideoHit } from '@client/components/types'
import { getVideoThumbnail } from '@client/utils/thumbnailUtils'
import { useState } from 'react'

interface VideoRowProps {
  hit: VideoHit
  onClick: (videoId: string) => void
}

export default function VideoRow({ hit, onClick }: VideoRowProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <div
      className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => onClick(hit.id)}
    >
      <div className="flex items-center space-x-4">
        {/* Thumbnail */}
        <div className="flex-shrink-0 w-40 h-24 relative">
          {imageError || !hit.thumbnail_id ? (
            <div className="w-full h-full bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-1 bg-gray-300 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-xs text-gray-500">No thumbnail</p>
              </div>
            </div>
          ) : (
            <img
              src={getVideoThumbnail(hit.thumbnail_id)}
              alt={hit.title}
              className="w-full h-full rounded-lg object-cover"
              onError={() => setImageError(true)}
            />
          )}
          {/* Duration overlay */}
          <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded-md font-medium leading-tight">
            {Math.floor((hit.duration || 0) / 60)}:{((hit.duration || 0) % 60).toString().padStart(2, '0')}
          </div>
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
            {/* Show companies array only */}
            {hit.companies && hit.companies.length > 0 && (
              <span>{hit.companies[0]}</span>
            )}
            {/* Show types/categories */}
            {hit.types && hit.types.length > 0 && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                {hit.types[0]}
              </span>
            )}
            {/* Show created_at */}
            {hit.created_at && (
              <span>
                Published {new Date(hit.created_at).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Show tags */}
          {hit.tags && hit.tags.length > 0 && (
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
  )
}