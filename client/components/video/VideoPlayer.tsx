'use client'
import { useAuth } from '@client/components/auth/AuthProvider'
import type { VideoHit } from '@client/components/types'
import { newRelicService } from '@client/services/newRelicService'
import { useEffect, useRef } from 'react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'

interface VideoPlayerProps {
  videoId: string
  videoData?: VideoHit
  onReady?: () => void
}

const callbacks: (() => void)[] = []
let frameReady = false

export function onFirstVideoFrame(callback: () => void) {
  callbacks.push(callback)
}

export function pauseVideo(player: any) {
  if (player) {
    player.pause()
  }
}

export default function VideoPlayer({ videoId, videoData, onReady }: VideoPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)
  const trackerRef = useRef<any>(null)
  const { user } = useAuth()

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      // The Video.js player needs to be attached to the actual video element
      const videoElement = document.createElement('video-js')

      videoElement.classList.add('vjs-big-play-centered')
      if (videoRef.current) {
        videoRef.current.appendChild(videoElement)
      }

      const player = playerRef.current = videojs(videoElement, {
        autoplay: true,
        muted: false,
        controls: true,
        responsive: true,
        fluid: true,
        fill: true,
        aspectRatio: '16:9',
        playbackRates: [0.5, 1, 1.25, 1.5, 2],
        plugins: {
          // Add any Video.js plugins here if needed
        }
      }, async () => {
        // Player ready callback
        console.log('Video.js player is ready')

        // Initialize New Relic tracker if video data is available
        if (videoData && newRelicService.isConfigured()) {
          try {
            trackerRef.current = await newRelicService.createVideoTracker(player, videoData, user)

            // Add testing methods to window for debugging
            if (typeof window !== 'undefined') {
              (window as any).testNewRelic = () => {
                newRelicService.testTracking(trackerRef.current, player)
              }
              (window as any).checkNewRelicStatus = () => {
                newRelicService.checkTrackingStatus(trackerRef.current)
              }
              console.log('New Relic: Test methods added to window object')
              console.log('New Relic: Run window.testNewRelic() to test tracking')
              console.log('New Relic: Run window.checkNewRelicStatus() to check status')
            }
          } catch (error) {
            console.warn('Failed to initialize New Relic tracker:', error)
          }
        }

        onReady?.()
      })

      // Add analytics tracking (only once during player initialization)
      player.on('play', async () => {
        console.log('Video started playing')

        // Track video play event
        if (videoData) {
          try {
            // await trackVideo(videoData)
          } catch (error) {
            console.warn('Failed to track video play:', error)
          }
        }
      })

      player.on('timeupdate', () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        if (!frameReady && player.currentTime() > 0) {
          frameReady = true
          // Call all registered callbacks
          callbacks.forEach(cb => cb())
        }
      })

      // Set the video source
      playVideo(player, videoId, videoData)
    }
  }, [videoId, onReady])

  // Dispose the Video.js player when the component unmounts
  useEffect(() => {
    const player = playerRef.current
    const tracker = trackerRef.current

    return () => {
      // Dispose New Relic tracker first
      if (tracker && typeof tracker.dispose === 'function') {
        try {
          tracker.dispose()
          trackerRef.current = null
        } catch (error) {
          console.warn('Failed to dispose New Relic tracker:', error)
        }
      }

      // Then dispose Video.js player
      if (player && !player.isDisposed()) {
        player.dispose()
        playerRef.current = null
      }
    }
  }, [])

  // Update video source when videoId changes
  useEffect(() => {
    if (playerRef.current && videoId) {
      playVideo(playerRef.current, videoId, videoData)
    }
  }, [videoId, videoData])

  return (
    <div className="w-full h-full">
      <div
        ref={videoRef}
        className="w-full h-full"
        data-vjs-player
      />
    </div>
  )
}

function playVideo(player: any, videoId: string, videoData?: VideoHit) {
  if (!player || !videoId) return

  frameReady = false

  // Set the video source with HLS support
  player.src({
    src: `${process.env.NEXT_PUBLIC_VIDEOS_HOST!}/${videoId}/playlist.m3u8`,
    type: 'application/x-mpegURL',
  })
}
