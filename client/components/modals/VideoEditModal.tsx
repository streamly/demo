'use client'
import Alert from '@client/components/ui/Alert'
import Modal from '@client/components/ui/Modal'
import VideoEditForm from '@client/components/video/VideoEditForm'
import VideoInfoSidebar from '@client/components/video/VideoInfoSidebar'
import { useVideoEdit } from '@client/hooks/useVideoEdit'

interface VideoEditModalProps {
  isOpen: boolean
  onClose: () => void
  videoId: string | null
}

export default function VideoEditModal({ isOpen, onClose, videoId }: VideoEditModalProps) {
  const {
    videoData,
    formData,
    isLoading,
    isSubmitting,
    submitStatus,
    error,
    handleSubmit,
    handleInputChange,
    handleArrayChange,
    handleClose
  } = useVideoEdit({ videoId, isOpen, onClose })

  if (!isOpen) return null

  console.log('Video', videoData)

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="7xl"
      fullScreen={false}
      backdrop="blur"
      showCloseButton={true}
    >
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh] bg-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading video details...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-[60vh] bg-white p-8">
          <div className="text-center max-w-md">
            <div className="mx-auto h-16 w-16 text-red-500 mb-6">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.814-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Unable to Load Video</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      ) : !videoData ? (
        <div className="flex items-center justify-center min-h-[60vh] bg-white p-8">
          <div className="text-center max-w-md">
            <div className="mx-auto h-16 w-16 text-gray-400 mb-6">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Video Not Found</h3>
            <p className="text-gray-600 mb-6">The video you are trying to edit could not be found.</p>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Info Sidebar - Shows first on mobile */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            {videoData && <VideoInfoSidebar videoData={videoData} />}
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit Video</h2>

            {submitStatus === 'success' && (
              <Alert variant="success" className="mb-4">
                Video updated successfully!
              </Alert>
            )}

            <VideoEditForm
              formData={formData}
              isSubmitting={isSubmitting}
              onInputChange={handleInputChange}
              onArrayChange={handleArrayChange}
              onSubmit={handleSubmit}
              onCancel={handleClose}
            />
          </div>
        </div>
      )}
    </Modal>
  )
}
