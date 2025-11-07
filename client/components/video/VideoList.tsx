'use client'
import { useEffect, useRef, useState } from 'react'
import { useInfiniteHits } from 'react-instantsearch'
import VideoRow from '@client/components/video/VideoRow'
import VideoRowSkeleton from '@client/components/video/VideoRowSkeleton'
import VideoListEmptyState from '@client/components/video/VideoListEmptyState'
import VideoEditModal from '@client/components/modals/VideoEditModal'
import type { VideoHit } from '@client/components/types'

export default function VideoList() {
  const { items, showMore, isLastPage } = useInfiniteHits()
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)
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

  // Handle video row click
  const handleVideoClick = (videoId: string) => {
    setSelectedVideoId(videoId)
    setIsEditModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsEditModalOpen(false)
    setSelectedVideoId(null)
  }

  // Infinite scroll observer
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
            <VideoRowSkeleton key={index} />
          ))}
        </div>
      </div>
    )
  }

  // Show empty state
  if (items.length === 0) {
    return <VideoListEmptyState />
  }

  // Show video list
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="divide-y divide-gray-200">
        {items.map((item: any) => {
          const hit = item as VideoHit
          return (
            <VideoRow 
              key={hit.id} 
              hit={hit}
              onClick={handleVideoClick}
            />
          )
        })}
      </div>
      {!isLastPage && <div ref={sentinelRef} className="h-10" />}
      
      {/* Video Edit Modal */}
      <VideoEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        videoId={selectedVideoId}
      />
    </div>
  )
}
