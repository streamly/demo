'use client'
import VideoUploader from '@client/components/upload/VideoUploader'
import { useRouter } from 'next/navigation'
import '@uppy/react/css/style.css'

export default function UploadPage() {
  const router = useRouter()

  const handleUploadComplete = (videoId: string) => {
    // Redirect to main page with video ID
    router.push(`/?v=${encodeURIComponent(videoId)}`)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
      {/* Upload Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Upload Video
        </h1>
        <p className="text-gray-600">
          Share your business content with the community
        </p>
      </div>

      {/* Video Uploader Component */}
      <VideoUploader onUploadComplete={handleUploadComplete} />
    </div>
  )
}
