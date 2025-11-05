'use client'
import { useEffect, useRef, useState } from 'react'
import { useInfiniteHits, useInstantSearch } from 'react-instantsearch'
import VideoCard from '@client/components/video/VideoCard'
import LoadingSpinner from '@client/components/ui/LoadingSpinner'
import MainPageVideoSkeleton from '@client/components/search/MainPageVideoSkeleton'
import type { VideoHit } from '@client/components/types'

interface InfiniteScrollHitsProps {
  onVideoSelect?: (video: VideoHit) => void
}

export default function InfiniteScrollHits({ onVideoSelect }: InfiniteScrollHitsProps) {
    const { items, showMore, isLastPage } = useInfiniteHits<VideoHit>()
    const { indexUiState } = useInstantSearch()
    const sentinelRef = useRef<HTMLDivElement | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [hasTriggeredLoad, setHasTriggeredLoad] = useState(false)
    const [isInitialLoading, setIsInitialLoading] = useState(true)

    // Reset loading state when search changes
    useEffect(() => {
        setIsLoading(false)
        setHasTriggeredLoad(false)
        setIsInitialLoading(true)
    }, [indexUiState.query, indexUiState.refinementList])

    // Track initial loading state
    useEffect(() => {
        // Consider loaded after first render with items or after a short delay
        const timer = setTimeout(() => {
            setIsInitialLoading(false)
        }, 1500)

        if (items.length > 0) {
            setIsInitialLoading(false)
            clearTimeout(timer)
        }

        return () => clearTimeout(timer)
    }, [items.length])

    useEffect(() => {
        const el = sentinelRef.current
        if (!el || isLastPage || isLoading) return

        const io = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !hasTriggeredLoad) {
                    setIsLoading(true)
                    setHasTriggeredLoad(true)
                    
                    // Add a small delay to prevent rapid firing
                    setTimeout(() => {
                        showMore()
                        setIsLoading(false)
                    }, 100)
                }
            },
            {
                root: null,
                rootMargin: '200px 0px 200px 0px', // Reduced margin to prevent premature loading
                threshold: 0.1,
            }
        )

        io.observe(el)
        return () => io.disconnect()
    }, [showMore, isLastPage, isLoading, hasTriggeredLoad])

    // Reset hasTriggeredLoad when more items are loaded
    useEffect(() => {
        if (items.length > 0) {
            setHasTriggeredLoad(false)
        }
    }, [items.length])

    // Show skeleton loading for initial load
    if (isInitialLoading) {
        return <MainPageVideoSkeleton count={12} />
    }

    if (items.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="text-gray-500 text-lg mb-2">No videos found</div>
                    <div className="text-gray-400 text-sm">Try adjusting your search or filters</div>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((hit, index) => (
                    <VideoCard 
                        key={`${hit.objectID || hit.id}-${index}`} 
                        hit={hit} 
                        onVideoSelect={onVideoSelect} 
                    />
                ))}
            </div>

            {!isLastPage && items.length > 0 && (
                <div
                    ref={sentinelRef}
                    className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500 min-h-[60px]"
                >
                    {isLoading ? (
                        <>
                            <LoadingSpinner size="sm" color="gray" />
                            <span className="ml-2">Loading more videos...</span>
                        </>
                    ) : (
                        <div className="h-4 w-4" /> // Invisible placeholder to maintain space
                    )}
                </div>
            )}
        </>
    )
}
