import { VideoHit } from '@client/components/types'
import { trackVideoPlay, sendContactForm } from './api'

// Simple analytics functions - no class needed!
const trackedVideos = new Set<string>() // Track videos played in this session

export async function trackVideo(videoData: VideoHit): Promise<boolean> {
  try {
    const videoId = videoData.id
    
    // Check if already tracked in this session
    if (trackedVideos.has(videoId)) {
      console.log('Video already tracked:', videoId)
      return true
    }

    await trackVideoPlay(videoData)
    trackedVideos.add(videoId)
    console.log('Video tracked successfully:', videoId)
    return true
  } catch (error) {
    console.error('Failed to track video:', error)
    return false
  }
}

export async function trackContact(videoData: VideoHit, message: string): Promise<boolean> {
  try {
    await sendContactForm({
      videoId: videoData.id,
      videoTitle: videoData.title,
      message,
      timestamp: new Date().toISOString()
    })
    console.log('Contact tracked successfully')
    return true
  } catch (error) {
    console.error('Failed to track contact:', error)
    return false
  }
}

