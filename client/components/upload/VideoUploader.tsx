'use client'
import { getAccessToken } from '@client/services/authService'
import AwsS3 from '@uppy/aws-s3'
import Uppy from '@uppy/core'
import { Dropzone, UppyContextProvider } from '@uppy/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import UploadRequirements from './UploadRequirements'
import UploadStatusMessages from './UploadStatusMessages'

interface VideoUploaderProps {
  onUploadComplete?: (videoId: string) => void
}

function generateVideoId(filename: string): string {
  const timestamp = Date.now()
  const cleanName = filename.replace(/\s+/g, '_')
  return `${timestamp}_${cleanName}`
}

function createUppy(router: any, onUploadComplete?: (videoId: string) => void, setError?: (error: string) => void, setUploadStatus?: (status: string) => void) {
  const uppyInstance = new Uppy({
    autoProceed: false,
    restrictions: {
      allowedFileTypes: ['.mp4', '.MP4'],
      maxNumberOfFiles: 1,
      maxFileSize: 1771673011 // ~1.65GB
    }
  })

  // Add AWS S3 plugin
  uppyInstance.use(AwsS3, {
    shouldUseMultipart: (file: any) => file.size > 100 * 1024 * 1024,
    getChunkSize: () => 5 * 1024 * 1024,
    getUploadParameters: async (file: any) => {
      const token = await getAccessToken()
      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'getUploadParameters',
          filename: file.name,
          contentType: file.type,
          id: file.meta.id
        })
      })

      if (!response.ok) {
        const data = await response.json()
        if (data.code === 'UNACTIVATED_VIDEO') {
          alert('Please finish your existing video first. Redirecting...')
          router.push(`/?v=${encodeURIComponent(data.details.videoId)}`)
          throw new Error('Upload blocked: unfinished video exists')
        }
        throw new Error(data.error || 'Failed to get upload parameters')
      }

      const data = await response.json()
      return {
        method: 'PUT' as const,
        url: data.url,
        headers: {
          'Content-Type': file.type
        }
      }
    },
    createMultipartUpload: async (file: any) => {
      const token = await getAccessToken()
      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'createMultipartUpload',
          filename: file.name,
          contentType: file.type,
          id: file.meta.id
        })
      })

      if (!response.ok) {
        const data = await response.json()
        if (data.code === 'UNACTIVATED_VIDEO') {
          alert('Please finish your existing video first. Redirecting...')
          router.push(`/?v=${encodeURIComponent(data.details.videoId)}`)
          throw new Error('Upload blocked: unfinished video exists')
        }
        throw new Error(data.error || 'Failed to create multipart upload')
      }

      return await response.json()
    },
    listParts: async (file: any, { uploadId, key }: any) => {
      const token = await getAccessToken()
      const response = await fetch(`/api/videos/upload?type=listParts&uploadId=${uploadId}&key=${encodeURIComponent(key)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      return data.parts || []
    },
    signPart: async (file: any, { uploadId, key, partNumber }: any) => {
      const token = await getAccessToken()
      const response = await fetch(`/api/videos/upload?type=getUploadPartURL&uploadId=${uploadId}&key=${encodeURIComponent(key)}&partNumber=${partNumber}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      return { url: data.url }
    },
    completeMultipartUpload: async (file: any, { uploadId, key, parts }: any) => {
      const token = await getAccessToken()
      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'completeMultipartUpload',
          uploadId,
          key,
          parts
        })
      })
      return await response.json()
    },
    abortMultipartUpload: async (file: any, { uploadId, key }: any) => {
      const token = await getAccessToken()
      await fetch('/api/videos/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'abortMultipartUpload',
          uploadId,
          key
        })
      })
    }
  })

  // File validation
  uppyInstance.on('file-added', async (file: any) => {
    try {
      const isValid = await validateVideo(file, setError)
      if (!isValid) {
        uppyInstance.removeFile(file.id)
        return
      }
    } catch (error) {
      console.error('Video validation error:', error)
      uppyInstance.removeFile(file.id)
    }
  })

  // Upload events
  uppyInstance.on('upload', () => {
    setUploadStatus?.('Uploading...')
  })

  uppyInstance.on('upload-progress', (file: any, progress: any) => {
    const percentage = Math.round((progress.bytesUploaded / progress.bytesTotal) * 100)
    setUploadStatus?.(`Uploading... ${percentage}%`)
  })

  uppyInstance.on('complete', async (result: any) => {
    if (result.failed?.length > 0) {
      setError?.(`Upload failed: ${result.failed[0].error?.message || 'Unknown error'}`)
      setUploadStatus?.('')
      return
    }

    if (!result.successful?.length) {
      setError?.('No files uploaded.')
      setUploadStatus?.('')
      return
    }

    const uploadedFile = result.successful[0]
    const meta = uploadedFile.meta
    const videoId = meta?.id

    try {
      setUploadStatus?.('Saving metadata...')
      const token = await getAccessToken()
      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'complete',
          filename: uploadedFile.name,
          width: meta?.width || 0,
          height: meta?.height || 0,
          size: meta?.size || 0,
          duration: meta?.duration || 0,
          id: videoId
        })
      })

      const data = await response.json()
      if (data.success) {
        setUploadStatus?.('Upload complete! Redirecting...')
        setTimeout(() => {
          if (onUploadComplete) {
            onUploadComplete(videoId)
          } else {
            router.push(`/?v=${encodeURIComponent(videoId)}`)
          }
        }, 1000)
      } else {
        setError?.('Metadata save failed. Check server logs.')
        setUploadStatus?.('')
      }
    } catch (err) {
      console.error('Metadata save error:', err)
      setError?.('Upload succeeded but saving metadata failed. Please try again later.')
      setUploadStatus?.('')
    }
  })

  uppyInstance.on('error', (error: any) => {
    console.error('Uppy error:', error)
    setError?.(error.message || 'Upload failed')
    setUploadStatus?.('')
  })

  return uppyInstance
}

async function validateVideo(file: any, setError?: (error: string) => void): Promise<boolean> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('video/')) {
      setError?.('Please select a video file.')
      resolve(false)
      return
    }

    const video = document.createElement('video')
    video.preload = 'metadata'
    video.src = URL.createObjectURL(file.data)

    video.onloadedmetadata = () => {
      const duration = video.duration
      const ratio = video.videoWidth / video.videoHeight
      const aspectRatio = 16 / 9
      const tolerance = 0.05

      URL.revokeObjectURL(video.src)

      if (duration < 60) {
        setError?.('Video must be at least 60 seconds long.')
        resolve(false)
        return
      }

      if (Math.abs(ratio - aspectRatio) > tolerance) {
        setError?.('Video must have a 16:9 aspect ratio.')
        resolve(false)
        return
      }

      // Generate unique ID and set metadata
      const videoId = generateVideoId(file.name)
      file.meta = {
        ...file.meta,
        id: videoId,
        width: video.videoWidth,
        height: video.videoHeight,
        duration: Math.round(duration),
        size: file.data.size
      }

      resolve(true)
    }

    video.onerror = () => {
      URL.revokeObjectURL(video.src)
      setError?.('Invalid video file.')
      resolve(false)
    }
  })
}

export default function VideoUploader({ onUploadComplete }: VideoUploaderProps) {
  const [error, setError] = useState<string | null>(null)
  const [uploadStatus, setUploadStatus] = useState<string>('')
  const router = useRouter()

  // Important: use an initializer function to prevent the state from recreating
  const [uppy] = useState(() => createUppy(router, onUploadComplete, setError, setUploadStatus))

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
        <UppyContextProvider uppy={uppy}>
          <Dropzone
            note="MP4 format only • 16:9 aspect ratio • Min 60 seconds • Max 1.65 GB"
          />
        </UppyContextProvider>
      </div>

      <UploadRequirements />
    </div>
  )
}