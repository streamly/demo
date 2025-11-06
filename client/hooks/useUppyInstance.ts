import { useMemo, useCallback } from 'react'
import Uppy from '@uppy/core'
import AwsS3 from '@uppy/aws-s3'
import { useRouter } from 'next/navigation'
import { useVideoValidation } from './useVideoValidation'
import { useUploadAPI } from './useUploadAPI'

interface UseUppyInstanceProps {
  onUploadComplete?: (videoId: string) => void
  setError?: (error: string | null) => void
  setUploadStatus?: (status: string) => void
}

export function useUppyInstance({ 
  onUploadComplete, 
  setError, 
  setUploadStatus 
}: UseUppyInstanceProps) {
  const router = useRouter()
  const { validateVideo } = useVideoValidation()
  const uploadAPI = useUploadAPI()

  const uppy = useMemo(() => {
    const uppyInstance = new Uppy({
      autoProceed: false,
      restrictions: {
        allowedFileTypes: ['.mp4', '.MP4'],
        maxNumberOfFiles: 1,
        maxFileSize: 1771673011 // ~1.65GB
      }
    })

    // Dashboard will be handled by React component

    // Add AWS S3 plugin
    uppyInstance.use(AwsS3, {
      shouldUseMultipart: (file: any) => file.size > 100 * 1024 * 1024,
      getChunkSize: () => 5 * 1024 * 1024,
      getUploadParameters: uploadAPI.getUploadParameters,
      createMultipartUpload: uploadAPI.createMultipartUpload,
      listParts: uploadAPI.listParts,
      signPart: uploadAPI.signPart,
      completeMultipartUpload: uploadAPI.completeMultipartUpload,
      abortMultipartUpload: uploadAPI.abortMultipartUpload
    })

    return uppyInstance
  }, [uploadAPI])

  // File validation event handler
  const handleFileAdded = useCallback(async (file: any) => {
    console.log('File added:', file.name, 'Size:', file.size)
    
    try {
      // Only validate the video when file is added
      const result = await validateVideo(file)
      if (!result.isValid) {
        console.log('File validation failed:', result.error)
        setError?.(result.error || 'File validation failed')
        uppy.removeFile(file.id)
        return
      }
      console.log('File validation passed')

      // Set validation metadata (but not video ID yet)
      uppy.setFileMeta(file.id, { 
        ...file.meta, 
        ...result.metadata 
      })
      
      setError?.(null) // Clear any previous errors
    } catch (error: any) {
      console.error('File validation error:', error)
      setError?.(error.message || 'Video validation failed')
      uppy.removeFile(file.id)
    }
  }, [validateVideo, setError, uppy])

  // Upload progress handler
  const handleUploadProgress = useCallback((file: any, progress: any) => {
    const percentage = Math.round((progress.bytesUploaded / progress.bytesTotal) * 100)
    console.log(`📊 Upload progress: ${percentage}% (${progress.bytesUploaded}/${progress.bytesTotal} bytes)`)
    setUploadStatus?.(`Uploading... ${percentage}%`)
  }, [setUploadStatus])

  // Upload complete handler
  const handleUploadComplete = useCallback(async (result: any) => {
    console.log('🎯 Upload complete event:', result)
    
    if (result.failed?.length > 0) {
      console.error('❌ Upload failed:', result.failed)
      setError?.(`Upload failed: ${result.failed[0].error?.message || 'Unknown error'}`)
      setUploadStatus?.('')
      return
    }

    if (!result.successful?.length) {
      console.error('❌ No files uploaded successfully')
      setError?.('No files uploaded.')
      setUploadStatus?.('')
      return
    }

    const uploadedFile = result.successful[0]
    const meta = uploadedFile.meta
    const videoId = meta?.serverVideoId
    console.log('✅ File uploaded successfully:', uploadedFile.name, 'ID:', videoId, 'Meta:', meta)

    try {
      setUploadStatus?.('Saving metadata...')
      
      const data = await uploadAPI.saveVideoMetadata(uploadedFile, meta)
      
      if (data.success) {
        console.log('✅ Upload and metadata save complete!')
        setUploadStatus?.('Upload complete! Redirecting...')
        setTimeout(() => {
          if (onUploadComplete) {
            console.log('🔄 Calling onUploadComplete callback')
            onUploadComplete(videoId)
          } else {
            console.log('🔄 Redirecting to dashboard with video ID')
            router.push(`/dashboard?v=${encodeURIComponent(videoId)}`)
          }
        }, 1000)
      } else {
        console.error('❌ Metadata save failed:', data)
        setError?.('Metadata save failed. Check server logs.')
        setUploadStatus?.('')
      }
    } catch (err) {
      console.error('❌ Metadata save error:', err)
      setError?.('Upload succeeded but saving metadata failed. Please try again later.')
      setUploadStatus?.('')
    }
  }, [uploadAPI, onUploadComplete, router, setError, setUploadStatus])

  // Upload error handler
  const handleUploadError = useCallback((error: any) => {
    console.error('Uppy error:', error)
    setError?.(error.message || 'Upload failed')
    setUploadStatus?.('')
  }, [setError, setUploadStatus])

  // Setup event listeners
  useMemo(() => {
    uppy.on('file-added', handleFileAdded)
    uppy.on('upload', () => {
      console.log('🚀 Upload started')
      setUploadStatus?.('Uploading...')
    })
    uppy.on('upload-progress', handleUploadProgress)
    uppy.on('complete', handleUploadComplete)
    uppy.on('error', handleUploadError)

    return () => {
      uppy.off('file-added', handleFileAdded)
      uppy.off('upload', () => {})
      uppy.off('upload-progress', handleUploadProgress)
      uppy.off('complete', handleUploadComplete)
      uppy.off('error', handleUploadError)
    }
  }, [uppy, handleFileAdded, handleUploadProgress, handleUploadComplete, handleUploadError, setUploadStatus])

  return uppy
}
