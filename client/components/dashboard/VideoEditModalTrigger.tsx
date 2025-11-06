'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import VideoEditModal from '@client/components/modals/VideoEditModal'

export default function VideoEditModalTrigger() {
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
    <VideoEditModal
      isOpen={isEditModalOpen}
      onClose={handleCloseEditModal}
      videoId={selectedVideoId}
    />
  )
}
