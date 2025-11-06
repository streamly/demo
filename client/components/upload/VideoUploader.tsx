'use client'
import { useState, useMemo } from 'react'
import { Dashboard } from '@uppy/react'
import { useUppyInstance } from '@client/hooks/useUppyInstance'
import UploadRequirements from './UploadRequirements'
import UploadStatusMessages from './UploadStatusMessages'

interface VideoUploaderProps {
  onUploadComplete?: (videoId: string) => void
}

export default function VideoUploader({ onUploadComplete }: VideoUploaderProps) {
  const [error, setError] = useState<string | null>(null)
  const [uploadStatus, setUploadStatus] = useState<string>('')

  const uppy = useUppyInstance({
    onUploadComplete,
    setError,
    setUploadStatus
  })

  const handleErrorDismiss = () => {
    setError(null)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full max-w-4xl mx-auto">
      <UploadStatusMessages
        error={error}
        uploadStatus={uploadStatus}
        onErrorDismiss={handleErrorDismiss}
      />

      <div className="p-2 sm:p-4 md:p-6">
        <Dashboard
          uppy={uppy}
          note="MP4 format only • 16:9 aspect ratio • Min 60 seconds • Max 1.65 GB"
          height={470}
          metaFields={[
            { id: 'name', name: 'Name', placeholder: 'Video title' },
            { id: 'caption', name: 'Description', placeholder: 'Describe your video' }
          ]}
          showProgressDetails={true}
          proudlyDisplayPoweredByUppy={false}
        />
      </div>

      <UploadRequirements />
    </div>
  )
}