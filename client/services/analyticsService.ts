import { VideoHit } from '@client/components/types'
import { authService } from '@client/services/authService'

class AnalyticsService {
  private trackedVideos = new Set<string>() // Track videos played in this session

  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await authService.getAccessToken()
    
    if (!token) {
      throw new Error('User not authenticated')
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  async trackVideoPlay(videoData: VideoHit): Promise<boolean> {
    try {
      const videoId = videoData.objectID || videoData.id
      
      // Check if we already tracked this video in this session
      if (this.trackedVideos.has(videoId)) {
        console.log('Video play already tracked in this session:', videoId)
        return true // Return success but don't send duplicate
      }

      const headers = await this.getAuthHeaders()

      const response = await fetch('/api/analytics/play', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          videoId
        })
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Failed to track video play:', error)
        return false
      }

      const result = await response.json()
      
      // Mark this video as tracked in this session
      this.trackedVideos.add(videoId)
      
      console.log('Video play tracked successfully:', result)
      return true

    } catch (error) {
      console.error('Error tracking video play:', error)
      return false
    }
  }

  async trackContactSubmit(videoData: VideoHit, message?: string): Promise<boolean> {
    try {
      const headers = await this.getAuthHeaders()

      const response = await fetch('/api/analytics/contact', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          videoId: videoData.objectID || videoData.id,
          message
        })
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Failed to track contact submit:', error)
        return false
      }

      const result = await response.json()
      console.log('Contact submit tracked successfully:', result)
      return true

    } catch (error) {
      console.error('Error tracking contact submit:', error)
      return false
    }
  }

  // Method to track video play with retry logic
  async trackVideoPlayWithRetry(videoData: VideoHit, maxRetries: number = 3): Promise<boolean> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const success = await this.trackVideoPlay(videoData)
      
      if (success) {
        return true
      }

      if (attempt < maxRetries) {
        console.log(`Retrying video play tracking (attempt ${attempt + 1}/${maxRetries})`)
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }

    console.error(`Failed to track video play after ${maxRetries} attempts`)
    return false
  }

  // Method to check if user is authenticated for analytics
  async canTrack(): Promise<boolean> {
    try {
      const token = await authService.getAccessToken()
      return !!token
    } catch (error) {
      return false
    }
  }

  // Method to get analytics data (for admin/reporting)
  async getAnalytics(dateFrom?: string, dateTo?: string): Promise<any> {
    try {
      const headers = await this.getAuthHeaders()
      
      const params = new URLSearchParams()
      if (dateFrom) params.set('from', dateFrom)
      if (dateTo) params.set('to', dateTo)

      const response = await fetch(`/api/analytics/report?${params}`, {
        method: 'GET',
        headers
      })

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching analytics:', error)
      throw error
    }
  }
}

export const analyticsService = new AnalyticsService()
