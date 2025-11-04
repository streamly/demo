class UrlService {
  setVideoId(videoId: string) {
    if (typeof window === 'undefined') return

    const url = new URL(window.location.href)
    url.searchParams.set('video', videoId)
    
    // Update URL without page reload
    window.history.pushState({ videoId }, '', url.toString())
  }

  removeVideoId() {
    if (typeof window === 'undefined') return

    const url = new URL(window.location.href)
    url.searchParams.delete('video')
    
    // Update URL without page reload
    window.history.pushState({}, '', url.toString())
  }

  getVideoIdFromUrl(): string | null {
    if (typeof window === 'undefined') return null

    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('video')
  }

  // Listen for browser back/forward navigation
  onUrlChange(callback: (videoId: string | null) => void) {
    if (typeof window === 'undefined') return () => {}

    const handlePopState = (event: PopStateEvent) => {
      const videoId = this.getVideoIdFromUrl()
      callback(videoId)
    }

    window.addEventListener('popstate', handlePopState)
    
    // Return cleanup function
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }

  // Get current URL parameters as object
  getUrlParams(): Record<string, string> {
    if (typeof window === 'undefined') return {}

    const params: Record<string, string> = {}
    const urlParams = new URLSearchParams(window.location.search)
    
    urlParams.forEach((value, key) => {
      params[key] = value
    })
    
    return params
  }

  // Set multiple URL parameters
  setUrlParams(params: Record<string, string | null>) {
    if (typeof window === 'undefined') return

    const url = new URL(window.location.href)
    
    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        url.searchParams.delete(key)
      } else {
        url.searchParams.set(key, value)
      }
    })
    
    window.history.pushState({}, '', url.toString())
  }
}

export const urlService = new UrlService()
