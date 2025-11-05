'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@client/components/auth/AuthProvider'
import { findVideoById } from '@client/services/typesenseService'
import { urlService } from '@client/services/urlService'
import type { VideoHit } from '@client/components/types'

interface VideoManagerProps {
  children: (props: {
    selectedVideo: VideoHit | null
    isLoadingVideo: boolean
    handleVideoSelect: (video: VideoHit) => void
    handleVideoClose: () => void
  }) => React.ReactNode
}

export default function VideoManager({ children }: VideoManagerProps) {
  const { isAuthenticated, isLoading: authLoading, checkIfUserHasCompleteProfile } = useAuth()
  const [selectedVideo, setSelectedVideo] = useState<VideoHit | null>(null)
  const [isLoadingVideo, setIsLoadingVideo] = useState(false)
  const [pendingVideoId, setPendingVideoId] = useState<string | null>(null)

  // Handle video ID from URL on page load - wait for auth to load first
  useEffect(() => {
    const videoId = urlService.getVideoIdFromUrl()
    console.log('Initial URL check - videoId:', videoId, 'authLoading:', authLoading)
    
    if (videoId) {
      if (authLoading) {
        // Auth is still loading, store the video ID for later
        console.log('Auth still loading, storing video ID:', videoId)
        setPendingVideoId(videoId)
      } else {
        // Auth has loaded, process the video ID immediately
        console.log('Auth already loaded, processing video ID now:', videoId)
        loadVideoById(videoId)
      }
    } else {
      console.log('No video ID in URL')
    }
  }, [authLoading])

  // Process pending video ID when auth finishes loading
  useEffect(() => {
    console.log('Pending video check:', { authLoading, pendingVideoId })
    if (!authLoading && pendingVideoId) {
      console.log('Processing pending video ID:', pendingVideoId)
      loadVideoById(pendingVideoId)
      setPendingVideoId(null)
    }
  }, [authLoading, pendingVideoId])

  // Listen for browser navigation (back/forward)
  useEffect(() => {
    const cleanup = urlService.onUrlChange(async (videoId) => {
      if (videoId && !authLoading) {
        // Only process if auth has finished loading
        loadVideoById(videoId)
      } else if (!videoId) {
        setSelectedVideo(null)
      }
    })

    return cleanup
  }, [authLoading])

  const loadVideoById = async (videoId: string) => {
    console.log('loadVideoById called with:', videoId)
    console.log('Auth state:', { isAuthenticated, authLoading, hasCompleteProfile: checkIfUserHasCompleteProfile() })

    setIsLoadingVideo(true)
    try {
      console.log('Searching for video:', videoId)
      const video = await findVideoById(videoId)
      console.log('Video found:', video ? video.title : 'null')
      
      if (video) {
        // Check if user is authenticated and has complete profile
        if (!isAuthenticated) {
          console.log('User not authenticated, setting video (will trigger auth flow)')
          setSelectedVideo(video)
        } else if (!checkIfUserHasCompleteProfile()) {
          console.log('User profile incomplete, setting video (will redirect to profile)')
          setSelectedVideo(video) // This will trigger the profile redirect in VideoModal
        } else {
          console.log('User authenticated with complete profile, setting video')
          setSelectedVideo(video)
        }
        console.log('selectedVideo state will be set to:', video.title)
      } else {
        console.warn('Video not found:', videoId)
        urlService.removeVideoId()
      }
    } catch (error) {
      console.error('Failed to load video from URL:', error)
      urlService.removeVideoId()
    } finally {
      setIsLoadingVideo(false)
      console.log('Loading finished')
    }
  }

  // Handle video selection from search results
  const handleVideoSelect = (video: VideoHit) => {
    setSelectedVideo(video)
    urlService.setVideoId(video.id)
  }

  // Handle video modal close
  const handleVideoClose = () => {
    setSelectedVideo(null)
    urlService.removeVideoId()
  }

  return (
    <>
      {children({
        selectedVideo,
        isLoadingVideo,
        handleVideoSelect,
        handleVideoClose
      })}
    </>
  )
}
