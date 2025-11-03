import { VideoHit } from '../components/types'
import VideojsTracker from '@newrelic/video-videojs'

interface NewRelicOptions {
  info: {
    beacon: string
    licenseKey: string
    applicationID: string
  }
  customData?: {
    contentTitle?: string
    customPlayerName?: string
    customPlayerVersion?: string
    [key: string]: any
  }
}

class NewRelicService {
  private getNewRelicOptions(customData?: Record<string, any>): NewRelicOptions | null {
    const beacon = process.env.NEXT_PUBLIC_NEWRELIC_BEACON
    const licenseKey = process.env.NEXT_PUBLIC_NEWRELIC_LICENSE_KEY
    const applicationID = process.env.NEXT_PUBLIC_NEWRELIC_APPLICATION_ID

    if (!beacon || !licenseKey || !applicationID) {
      console.warn('New Relic configuration missing. Video tracking disabled.')
      return null
    }

    return {
      info: {
        beacon,
        licenseKey,
        applicationID,
      },
      customData: {
        customPlayerName: 'Bizilla Video Player',
        customPlayerVersion: '1.0.0',
        ...customData,
      }
    }
  }

  async createVideoTracker(player: any, videoData: VideoHit, userContext?: any) {
    try {
      // Only load on client side
      if (typeof window === 'undefined') {
        return null
      }

      // Get New Relic options
      const options = this.getNewRelicOptions({
        contentTitle: videoData.title,
        videoId: videoData.objectID || videoData.id,
        companyName: videoData.company,
        tags: videoData.tags?.join(', '),
        industry: videoData.industry,
        publisher: videoData.publisher,
        userId: userContext?.sub,
        userCompany: userContext?.customAttributes?.company,
        userIndustry: userContext?.customAttributes?.industry,
      })

      if (!options) {
        return null
      }

      // New Relic tracker is already imported at the top

      // Set player version if available
      if (player && typeof player.version === 'function') {
        player.version = player.version()
      } else if ((window as any).videojs?.VERSION) {
        player.version = (window as any).videojs.VERSION
      }

      // Initialize tracker
      const tracker = new VideojsTracker(player, options)
      
      // Debug: Check what methods are actually available on the tracker
      console.log('New Relic tracker instance:', tracker)
      console.log('New Relic tracker methods:', Object.getOwnPropertyNames(tracker))
      console.log('New Relic tracker prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(tracker)))
      
      // Check for common New Relic tracker methods
      const commonMethods = ['on', 'addEventListener', 'addListener', 'sendEvent', 'sendMetric', 'track', 'start', 'stop']
      commonMethods.forEach(method => {
        if (typeof (tracker as any)[method] === 'function') {
          console.log(`New Relic: Found method '${method}' on tracker`)
        }
      })
      
      // Try to add New Relic specific event listeners if available
      try {
        const trackerAny = tracker as any
        if (typeof trackerAny.on === 'function') {
          trackerAny.on('play', () => console.log('New Relic tracker: Play event'))
          trackerAny.on('pause', () => console.log('New Relic tracker: Pause event'))
          trackerAny.on('ended', () => console.log('New Relic tracker: Ended event'))
          console.log('New Relic: Event listeners added via tracker.on()')
        } else if (typeof trackerAny.addEventListener === 'function') {
          trackerAny.addEventListener('play', () => console.log('New Relic tracker: Play event'))
          trackerAny.addEventListener('pause', () => console.log('New Relic tracker: Pause event'))
          trackerAny.addEventListener('ended', () => console.log('New Relic tracker: Ended event'))
          console.log('New Relic: Event listeners added via tracker.addEventListener()')
        } else {
          console.warn('New Relic: No event listener methods found on tracker')
          console.warn('New Relic: Available methods:', Object.getOwnPropertyNames(tracker))
        }
      } catch (error) {
        console.error('New Relic: Failed to add event listeners:', error)
      }
      
      console.log('New Relic video tracker initialized', {
        videoId: videoData.objectID || videoData.id,
        title: videoData.title,
        company: videoData.company
      })

      return tracker
    } catch (error) {
      console.error('❌ Failed to initialize New Relic video tracker:', error)
      return null
    }
  }

  isConfigured(): boolean {
    return !!(
      process.env.NEXT_PUBLIC_NEWRELIC_BEACON &&
      process.env.NEXT_PUBLIC_NEWRELIC_LICENSE_KEY &&
      process.env.NEXT_PUBLIC_NEWRELIC_APPLICATION_ID
    )
  }

  // Manual tracking methods for testing
  testTracking(tracker: any, player: any) {
    if (!tracker || !player) {
      console.warn('New Relic: No tracker or player available for testing')
      return
    }

    console.log('New Relic: Starting manual tracking test...')
    
    // Test manual event tracking
    try {
      // Check if tracker has sendEvent method
      if (typeof tracker.sendEvent === 'function') {
        tracker.sendEvent('custom_test_event', {
          customData: {
            testType: 'manual_test',
            timestamp: Date.now()
          }
        })
        console.log('New Relic: Custom event sent successfully')
      }

      // Check if tracker has other methods
      if (typeof tracker.sendMetric === 'function') {
        tracker.sendMetric('test_metric', 1)
        console.log('New Relic: Custom metric sent successfully')
      }

      // Log player state for debugging
      console.log('New Relic: Player state:', {
        currentTime: player.currentTime(),
        duration: player.duration(),
        paused: player.paused(),
        volume: player.volume(),
        src: player.currentSrc()
      })

    } catch (error) {
      console.error('New Relic: Manual tracking test failed:', error)
    }
  }

  // Method to check if tracking is working
  checkTrackingStatus(tracker: any) {
    if (!tracker) {
      console.warn('New Relic: No tracker available')
      return false
    }

    console.log('New Relic: Tracker status check')
    console.log('New Relic: Tracker instance:', tracker)
    console.log('New Relic: Available methods:', Object.getOwnPropertyNames(tracker))
    
    // Check if New Relic global is available
    if (typeof window !== 'undefined' && (window as any).newrelic) {
      console.log('New Relic: Global newrelic object available')
      console.log('New Relic: Global methods:', Object.getOwnPropertyNames((window as any).newrelic))
    } else {
      console.warn('New Relic: Global newrelic object not found')
    }

    return true
  }
}

export const newRelicService = new NewRelicService()
