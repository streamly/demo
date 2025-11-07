'use client'
import type { VideoWithRelations } from '@shared/types/video'
import VideoPlayer from '@client/components/video/VideoPlayer'
import { getVideoThumbnail } from '@client/utils/thumbnailUtils'
import Image from 'next/image'

interface VideoInfoSidebarProps {
  videoData: VideoWithRelations
}

export default function VideoInfoSidebar({ videoData }: VideoInfoSidebarProps) {
  const formatDuration = (duration: number) => {
    if (!Number.isFinite(duration) || duration <= 0) return null
    const totalSeconds = Math.round(duration)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    const segments = [
      hours ? String(hours).padStart(2, '0') : null,
      hours ? String(minutes).padStart(2, '0') : String(minutes),
      String(seconds).padStart(2, '0'),
    ].filter(Boolean)

    return segments.join(':')
  }

  const formatDate = (timestamp: Date | number) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="space-y-4">
      {/* Video Player */}
      <div>
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Video Preview</span>
        <div className="mt-2">
          <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
            <VideoPlayer
              videoId={videoData.id}
              videoData={videoData as any}
              onReady={() => console.log('Video player ready for', videoData.id)}
            />
          </div>
        </div>
      </div>

      {/* Thumbnail Section */}
      <div>
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Thumbnail</span>
        <div className="mt-2 relative">
          {videoData.thumbnailId ? (
            <div className="relative">
              <Image
                src={getVideoThumbnail(videoData.thumbnailId)}
                alt="Video thumbnail"
                className="w-full aspect-video object-cover rounded-lg border border-gray-200"
              />
              {/* Duration overlay on thumbnail */}
              {videoData.duration && (
                <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded font-medium">
                  {formatDuration(videoData.duration)}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full aspect-video bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center relative">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-gray-300 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 font-medium">Thumbnail will be generated</p>
                <p className="text-xs text-gray-400 mt-1">after video processing</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Technical Details */}
      <div>
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Technical Details</span>
        <div className="mt-2 space-y-2 text-sm">
          {videoData.width !== undefined && videoData.height !== undefined && (
            <div className="flex justify-between">
              <span className="text-gray-600">Resolution:</span>
              <span className="font-medium text-gray-900">
                {videoData.width}x{videoData.height}
              </span>
            </div>
          )}

          {videoData.fileSize && (
            <div className="flex justify-between">
              <span className="text-gray-600">File Size:</span>
              <span className="font-medium text-gray-900">
                {(videoData.fileSize / (1024 * 1024)).toFixed(1)} MB
              </span>
            </div>
          )}

          {videoData.format && (
            <div className="flex justify-between">
              <span className="text-gray-600">Format:</span>
              <span className="font-medium text-gray-900">{videoData.format}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-gray-600">Visibility:</span>
            <span className="font-medium text-gray-900 capitalize">{videoData.visibility}</span>
          </div>
        </div>
      </div>

      {/* Timestamps */}
      <div>
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Timestamps</span>
        <div className="mt-2 space-y-2 text-sm">
          {videoData.createdAt && (
            <div className="flex justify-between">
              <span className="text-gray-600">Created:</span>
              <span className="font-medium text-gray-900">
                {formatDate(videoData.createdAt)}
              </span>
            </div>
          )}

          {videoData.updatedAt && (
            <div className="flex justify-between">
              <span className="text-gray-600">Updated:</span>
              <span className="font-medium text-gray-900">
                {formatDate(videoData.updatedAt)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
