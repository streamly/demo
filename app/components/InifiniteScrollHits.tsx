'use client'
import { useEffect, useRef } from 'react'
import { useInfiniteHits } from 'react-instantsearch'
import VideoCard from './VideoCard'
import type { VideoHit } from './types'

export default function InfiniteScrollHits() {
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
            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {items.map((hit) => (
                    <VideoCard key={hit.id} hit={hit} />
                ))}
            </div>

            {!isLastPage && (
                <div
                    ref={sentinelRef}
                    className="h-12 flex justify-center items-center text-gray-400 text-sm mt-6"
                >
                    Loading more…
                </div>
            )}
        </>
    )
}