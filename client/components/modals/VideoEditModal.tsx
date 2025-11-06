'use client'
import { useState, useEffect } from 'react'
import Modal from '@client/components/ui/Modal'
import Button from '@client/components/ui/Button'
import { InputField, SelectField } from '@client/components/ui/FormField'
import Alert from '@client/components/ui/Alert'
import VideoPlayer from '@client/components/video/VideoPlayer'
import { getAccessToken } from '@client/services/authService'
import type { VideoHit } from '@client/components/types'

interface VideoEditModalProps {
  isOpen: boolean
  onClose: () => void
  videoId: string | null
}

interface VideoFormData {
  title: string
  description: string
}

export default function VideoEditModal({ isOpen, onClose, videoId }: VideoEditModalProps) {
  const [videoData, setVideoData] = useState<VideoHit | null>(null)
  const [formData, setFormData] = useState<VideoFormData>({
    title: '',
    description: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  // Fetch video data when modal opens
  useEffect(() => {
    if (isOpen && videoId) {
      fetchVideoData()
    }
  }, [isOpen, videoId])

  const fetchVideoData = async () => {
    if (!videoId) return

    setIsLoading(true)
    setError(null)

    try {
      const token = await getAccessToken()
      const response = await fetch(`/api/videos/${videoId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setVideoData(data)
        setFormData({
          title: data.title || '',
          description: data.description || ''
        })
      } else {
        setError('Failed to load video details')
      }
    } catch (err) {
      console.error('Error fetching video:', err)
      setError('Failed to load video details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!videoId) return

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setError(null)

    try {
      // TODO: Implement video update API call
      console.log('Updating video:', videoId, formData)
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSubmitStatus('success')
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      console.error('Error updating video:', err)
      setError('Failed to update video')
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof VideoFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleClose = () => {
    setFormData({
      title: '',
      description: ''
    })
    setVideoData(null)
    setError(null)
    setSubmitStatus('idle')
    onClose()
  }

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
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="7xl"
      fullScreen={true}
      backdrop="blur"
      showCloseButton={true}
    >
      {isLoading ? (
        /* Full Modal Loader */
        <div className="flex items-center justify-center min-h-[60vh] bg-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading video details...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Video Player Section */}
          <div className="aspect-video bg-black flex-shrink-0">
            {videoData && (
              <VideoPlayer
                videoId={videoData.id}
                videoData={videoData}
                onReady={() => console.log('Video player ready for', videoData.id)}
              />
            )}
          </div>

          {/* Content Section */}
          <div className="flex-1 overflow-y-auto border-t border-gray-200 bg-white p-3 sm:p-6 min-h-0 max-h-full">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-8">
              {/* Edit Form */}
              <div className="lg:col-span-3 order-1 lg:order-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Edit Video</h2>

                {error && (
                  <Alert variant="error" className="mb-4">
                    {error}
                  </Alert>
                )}

                {submitStatus === 'success' && (
                  <Alert variant="success" className="mb-4">
                    Video updated successfully!
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                <InputField
                  label="Title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter video title"
                  required
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter video description"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>


                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    isLoading={isSubmitting}
                  >
                    {isSubmitting ? 'Updating...' : 'Update Video'}
                  </Button>
                </div>
                </form>
              </div>

          {/* Video Info Sidebar */}
          <div className="lg:col-span-2 space-y-4 order-2 lg:order-2">
            {videoData && (
              <>
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Video Details</span>
                  <div className="mt-2 space-y-2 text-sm">
                    {videoData.duration && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium text-gray-900">{formatDuration(videoData.duration)}</span>
                      </div>
                    )}

                    {videoData.width && videoData.height && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Resolution:</span>
                        <span className="font-medium text-gray-900">{videoData.width}x{videoData.height}</span>
                      </div>
                    )}

                    {videoData.size && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">File Size:</span>
                        <span className="font-medium text-gray-900">
                          {(videoData.size / (1024 * 1024)).toFixed(1)} MB
                        </span>
                      </div>
                    )}

                    {videoData.created_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created:</span>
                        <span className="font-medium text-gray-900">
                          {formatDate(videoData.created_at)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-gray-600">Visibility:</span>
                      <span className="font-medium text-gray-900 capitalize">{videoData.visibility}</span>
                    </div>
                  </div>
                </div>

                {/* Tags and Categories */}
                <div className="space-y-3">
                  {videoData.types && videoData.types.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Types</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {videoData.types.map((type, index) => (
                          <span key={index} className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {videoData.companies && videoData.companies.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Companies</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {videoData.companies.map((company, index) => (
                          <span key={index} className="inline-block rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                            {company}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {videoData.tags && videoData.tags.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tags</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {videoData.tags.map((tag, index) => (
                          <span key={index} className="inline-block rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
            </div>
          </div>
        </>
      )}
    </Modal>
  )
}
