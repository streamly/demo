'use client'
import { useState, useEffect } from 'react'
import {
  Configure,
  InstantSearch,
  useInstantSearch,
} from 'react-instantsearch'
import TypesenseInstantSearchAdapter from 'typesense-instantsearch-adapter'

import InfiniteScrollHits from './src/components/InifiniteScrollHits'
import JumbotronBanner from './src/components/JumbotronBanner'
import SearchHeader from './src/components/SearchHeader'
import SidebarFilters from './src/components/SidebarFilters'
import VideoModal from './src/components/VideoModal'
import { useAuth } from './src/components/AuthProvider'
import { typesenseService } from './src/services/typesenseService'
import { urlService } from './src/services/urlService'
import type { VideoHit } from './src/components/types'

const typesenseAdapter = new TypesenseInstantSearchAdapter({
  server: {
    apiKey: process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_KEY!,
    nodes: [
      {
        host: process.env.NEXT_PUBLIC_TYPESENSE_HOST!,
        port: 443,
        protocol: 'https',
      },
    ],
  },
  additionalSearchParameters: {
    query_by: 'title,description,company,tags',
  },
})

const searchClient = typesenseAdapter.searchClient

function SearchLayout() {
  const { indexUiState } = useInstantSearch()
  const { isAuthenticated, isLoading: authLoading, checkIfUserHasCompleteProfile } = useAuth()
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [hasEverSearched, setHasEverSearched] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<VideoHit | null>(null)
  const [isLoadingVideo, setIsLoadingVideo] = useState(false)
  const [pendingVideoId, setPendingVideoId] = useState<string | null>(null)

  // Check if user has searched (has query or filters)
  const hasSearched = !!(
    indexUiState.query ||
    indexUiState.refinementList ||
    indexUiState.range ||
    indexUiState.hierarchicalMenu
  )

  // Track if user has ever interacted with search
  const handleSearchFocus = (focused: boolean) => {
    setIsSearchFocused(focused)
    if (focused) {
      setHasEverSearched(true)
    }
  }

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

  const loadVideoById = async (videoId: string) => {
    console.log('loadVideoById called with:', videoId)
    console.log('Typesense configured:', typesenseService.isConfigured())
    console.log('Auth state:', { isAuthenticated, authLoading, hasCompleteProfile: checkIfUserHasCompleteProfile() })

    if (!typesenseService.isConfigured()) {
      console.warn('Typesense not configured')
      return
    }

    setIsLoadingVideo(true)
    try {
      console.log('Searching for video:', videoId)
      const video = await typesenseService.findVideoById(videoId)
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

  // Show search mode when focused OR when user has searched OR has ever searched
  const showSearchMode = isSearchFocused || hasSearched || hasEverSearched

  return (
    <div className="min-h-screen">
      <SearchHeader onSearchFocus={handleSearchFocus} />

      {/* Jumbotron Banner - show when not in search mode */}
      {!showSearchMode && <JumbotronBanner />}

      <div className="flex">
        {/* Sidebar Filters - show when in search mode */}
        {showSearchMode && <SidebarFilters />}

        <main className={`flex-1 p-6 ${!showSearchMode ? 'max-w-7xl mx-auto' : ''}`}>
          <InfiniteScrollHits onVideoSelect={handleVideoSelect} />
        </main>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <>
          {console.log('Rendering VideoModal for:', selectedVideo.title)}
          <VideoModal hit={selectedVideo} onClose={handleVideoClose} />
        </>
      )}

      {/* Loading State */}
      {(isLoadingVideo || (authLoading && pendingVideoId)) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">
              {authLoading && pendingVideoId ? 'Initializing...' : 'Loading video...'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Page() {
  return (
    <InstantSearch indexName="videos" searchClient={searchClient}>
      <Configure hitsPerPage={12} />
      <SearchLayout />
    </InstantSearch>
  )
}
