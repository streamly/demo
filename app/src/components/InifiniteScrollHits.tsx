'use client'
import { useEffect, useRef } from 'react'
import { useInfiniteHits } from 'react-instantsearch'
import VideoCard from './VideoCard'
import type { VideoHit } from './types'

interface InfiniteScrollHitsProps {
  onVideoSelect?: (video: VideoHit) => void
}

export default function InfiniteScrollHits({ onVideoSelect }: InfiniteScrollHitsProps) {
    const { items, showMore, isLastPage } = useInfiniteHits<VideoHit>()
    const sentinelRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const el = sentinelRef.current
        if (!el || isLastPage) return

        const io = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) showMore()
            },
            {
                root: null,
                rootMargin: '600px 0px 600px 0px', // prefetch earlier for smoother UX
                threshold: 0,
            }
        )

        io.observe(el)
        return () => io.disconnect()
    }, [showMore, isLastPage])

    return (
        <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((hit) => (
                    <VideoCard key={hit.id} hit={hit} onVideoSelect={onVideoSelect} />
                ))}
            </div>

            {!isLastPage && (
                <div
                    ref={sentinelRef}
                    className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500"
                >
                    <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
                    Loading more videos...
                </div>
            )}
        </>
    )
}
