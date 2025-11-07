'use client'
import Image from 'next/image'
import { useState } from 'react'
import { useAuth } from '@client/components/auth/AuthProvider'
import type { VideoHit } from '@client/components/types'
import { getVideoThumbnail, getThumbnailPlaceholder } from '@client/utils/thumbnailUtils'

interface VideoCardProps {
    hit: VideoHit
    onVideoSelect?: (video: VideoHit) => void
}

export default function VideoCard({ hit, onVideoSelect }: VideoCardProps) {
    const { isAuthenticated, isLoading, signIn } = useAuth()
    const [imageError, setImageError] = useState(false)
    const tags = Array.isArray(hit.tags) ? hit.tags.slice(0, 3) : []
    const description = hit.description?.trim()
    // Use new companies array or fallback to legacy company field
    const company = hit.companies?.[0]
    // Get the primary type/category
    const primaryType = hit.types?.[0]

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
                    {imageError || !hit.thumbnail_id ? (
                        <div className="w-full h-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-12 h-12 mx-auto mb-2 bg-gray-300 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="text-sm text-gray-500 font-medium">No thumbnail</p>
                            </div>
                        </div>
                    ) : (
                        <Image
                            src={getVideoThumbnail(hit.thumbnail_id)}
                            alt={hit.title}
                            fill
                            sizes="(min-width: 1536px) 330px, (min-width: 1280px) 28vw, (min-width: 1024px) 30vw, (min-width: 768px) 45vw, 90vw"
                            className="h-full w-full object-cover"
                            onError={() => setImageError(true)}
                        />
                    )}
                    
                    {/* Duration overlay - ALWAYS positioned relative to the outer container */}
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded-md font-medium leading-tight">
                        {Math.floor((hit.duration || 0) / 60)}:{((hit.duration || 0) % 60).toString().padStart(2, '0')}
                    </div>
                </div>

                <div className="p-4">
                    <h3 className="line-clamp-2 text-base font-semibold text-gray-900">
                        {hit.title}
                    </h3>
                    
                    {/* Company and Type info */}
                    <div className="mt-1 flex items-center space-x-2 text-sm text-gray-500">
                        <span>{company}</span>
                        {primaryType && (
                            <>
                                <span>•</span>
                                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                                    {primaryType}
                                </span>
                            </>
                        )}
                    </div>
                    
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

