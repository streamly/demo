import { useCallback } from 'react'

export interface VideoValidationResult {
  isValid: boolean
  error?: string
  metadata?: {
    width: number
    height: number
    duration: number
    size: number
  }
}

export function useVideoValidation() {
  const generateVideoId = useCallback((filename: string): string => {
    const timestamp = Date.now()
    const cleanName = filename.replace(/\s+/g, '_')
    return `${timestamp}_${cleanName}`
  }, [])

  const validateVideo = useCallback(async (file: any): Promise<VideoValidationResult> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('video/')) {
        resolve({
          isValid: false,
          error: 'Please select a video file.'
        })
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
          resolve({
            isValid: false,
            error: 'Video must be at least 60 seconds long.'
          })
          return
        }

        if (Math.abs(ratio - aspectRatio) > tolerance) {
          resolve({
            isValid: false,
            error: 'Video must have a 16:9 aspect ratio.'
          })
          return
        }

        // Generate unique ID and prepare metadata
        const videoId = generateVideoId(file.name)
        const metadata = {
          width: video.videoWidth,
          height: video.videoHeight,
          duration: Math.round(duration),
          size: file.data.size
        }

        // Set metadata on file
        file.meta = {
          ...file.meta,
          id: videoId,
          ...metadata
        }

        resolve({
          isValid: true,
          metadata
        })
      }

      video.onerror = () => {
        URL.revokeObjectURL(video.src)
        resolve({
          isValid: false,
          error: 'Invalid video file.'
        })
      }
    })
  }, [generateVideoId])

  return {
    validateVideo,
    generateVideoId
  }
}
