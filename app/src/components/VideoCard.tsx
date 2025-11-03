'use client'
import Image from 'next/image'
import { useAuth } from './AuthProvider'
import type { VideoHit } from './types'

interface VideoCardProps {
    hit: VideoHit
    onVideoSelect?: (video: VideoHit) => void
}

export default function VideoCard({ hit, onVideoSelect }: VideoCardProps) {
    const { isAuthenticated, isLoading, signIn } = useAuth()
    const tags = Array.isArray(hit.tags) ? hit.tags.slice(0, 3) : []
    const formattedDuration =
        typeof hit.duration === 'number' ? formatDuration(hit.duration) : null
    const description = hit.description?.trim()
    const company = hit.company?.trim().length ? hit.company : 'Bizilla'

    const handleCardClick = () => {
        // Don't allow clicks while auth is loading
        if (isLoading) {
            console.log('Auth still loading, ignoring click')
            return
        }

        console.log('Video card clicked:', hit.title)
        console.log('User authenticated:', isAuthenticated)
        
        if (!isAuthenticated) {
            console.log('User not authenticated, redirecting to sign in')
            // If not authenticated, redirect to sign in
            signIn()
            return
        }
        
        console.log('Opening video modal for authenticated user')
        // If authenticated, call the onVideoSelect callback
        onVideoSelect?.(hit)
    }

    return (
        <>
            <div
                className={`group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all ${
                    isLoading 
                        ? 'opacity-60 cursor-wait' 
                        : 'cursor-pointer hover:shadow-md'
                }`}
                onClick={handleCardClick}
            >
                <div className="relative aspect-video overflow-hidden">
                    <Image
                        src={`https://img.syndinet.com/${hit.id}`}
                        alt={hit.title}
                        fill
                        sizes="(min-width: 1536px) 330px, (min-width: 1280px) 28vw, (min-width: 1024px) 30vw, (min-width: 768px) 45vw, 90vw"
                        className="h-full w-full object-cover"
                    />

                    {formattedDuration && (
                        <div className="absolute bottom-3 right-3">
                            <span className="rounded bg-black/75 px-2 py-1 text-xs font-medium text-white">
                                {formattedDuration}
                            </span>
                        </div>
                    )}
                </div>

                <div className="p-4">
                    <h3 className="line-clamp-2 text-base font-semibold text-gray-900">
                        {hit.title}
                    </h3>
                    
                    {description && (
                        <p className="mt-2 line-clamp-2 text-sm text-gray-600">{description}</p>
                    )}

                    {tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

const formatDuration = (duration: number) => {
    if (!Number.isFinite(duration) || duration <= 0) return null
    const totalSeconds = Math.round(duration)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    const segments = [
        hours ? String(hours).padStart(2, '0') : null,
        hours ? String(minutes).padStart(2, '0') : String(minutes),
        String(seconds).padStart(2, '0'),
    ].filter(Boolean)

    return segments.join(':')
}
