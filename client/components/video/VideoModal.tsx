'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { VideoHit } from '@client/components/types'
import VideoPlayer from '@client/components/video/VideoPlayer'
import Modal from '@client/components/ui/Modal'
import { useAuth } from '@client/components/auth/AuthProvider'

interface VideoModalProps {
    hit: VideoHit
    onClose: () => void
}

export default function VideoModal({ hit, onClose }: VideoModalProps) {
    const router = useRouter()
    const { isAuthenticated, checkIfUserHasCompleteProfile } = useAuth()
    const [contactMessage, setContactMessage] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

    // Check profile completion on mount
    useEffect(() => {
        if (isAuthenticated && !checkIfUserHasCompleteProfile()) {
            // Close modal and redirect to profile
            onClose()
            router.push('/profile?reason=video-access')
            return
        }
    }, [isAuthenticated, checkIfUserHasCompleteProfile, onClose, router])

    // Handle contact form submission
    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!contactMessage.trim()) return
        
        setIsSubmitting(true)
        setSubmitStatus('idle')
        
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: contactMessage,
                    videoId: hit.id,
                    videoTitle: hit.title,
                }),
            })
            
            if (response.ok) {
                setSubmitStatus('success')
                setContactMessage('')
            } else {
                setSubmitStatus('error')
            }
        } catch (error) {
            console.error('Failed to send contact message:', error)
            setSubmitStatus('error')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!hit?.id) return null

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

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const company = hit.companies?.[0] || 'Bizilla'
    const tags = Array.isArray(hit.tags) ? hit.tags : []
    const categories = Array.isArray(hit.types) ? hit.types : []
    const channels = Array.isArray(hit.audiences) ? hit.audiences : []

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            maxWidth="7xl"
            fullScreen={true}
            backdrop="blur"
            showCloseButton={true}
        >
            <div className="aspect-video bg-black flex-shrink-0">
                <VideoPlayer
                    videoId={hit.id}
                    videoData={hit}
                    onReady={() => console.log('Video player ready for', hit.id)}
                />
            </div>

                <div className="flex-1 overflow-y-auto border-t border-gray-200 bg-white p-3 sm:p-6 min-h-0 max-h-full">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-8">
                        {/* Main Info */}
                        <div className="lg:col-span-3 order-1 lg:order-1">
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">{hit.title}</h2>

                            {hit.description && (
                                <p className="text-sm text-gray-600 mb-4 leading-relaxed">{hit.description}</p>
                            )}

                            {/* Contact Form - Hidden on mobile, shown on desktop */}
                            <div className="hidden lg:block pt-4 border-t border-gray-200">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contact Us</span>
                                <form onSubmit={handleContactSubmit} className="mt-2 space-y-3">
                                    <div>
                                        <textarea
                                            value={contactMessage}
                                            onChange={(e) => setContactMessage(e.target.value)}
                                            placeholder="Enter your message about this video..."
                                            rows={3}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none touch-manipulation"
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !contactMessage.trim()}
                                            className="px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation min-h-[44px]"
                                        >
                                            {isSubmitting ? 'Sending...' : 'Send'}
                                        </button>
                                        
                                        {submitStatus === 'success' && (
                                            <span className="text-sm text-green-600">Message sent!</span>
                                        )}
                                        
                                        {submitStatus === 'error' && (
                                            <span className="text-sm text-red-600">Failed to send</span>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* User-relevant Info */}
                        <div className="lg:col-span-2 space-y-4 order-2 lg:order-2">
                            <div>
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">About</span>
                                <div className="mt-2 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Company:</span>
                                        <span className="font-medium text-gray-900">{company}</span>
                                    </div>

                                    {hit.duration && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Duration:</span>
                                            <span className="font-medium text-gray-900">{formatDuration(hit.duration)}</span>
                                        </div>
                                    )}

                                    {hit.created_at && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Published:</span>
                                            <span className="font-medium text-gray-900">
                                                {formatDate(hit.created_at)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tags and Categories */}
                            <div className="space-y-3">
                                {tags.length > 0 && (
                                    <div>
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tags</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {tags.map((tag, index) => (
                                                <span key={index} className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {categories.length > 0 && (
                                    <div>
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Categories</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {categories.map((category: string, index: number) => (
                                                <span key={index} className="inline-block rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                                                    {category}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {channels.length > 0 && (
                                    <div>
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Channels</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {channels.map((channel: string, index: number) => (
                                                <span key={index} className="inline-block rounded bg-green-100 px-2 py-1 text-xs text-green-800">
                                                    {channel}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Contact Form - Mobile only, at bottom */}
                    <div className="lg:hidden mt-6 pt-4 border-t border-gray-200 order-3">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contact Us</span>
                        <form onSubmit={handleContactSubmit} className="mt-2 space-y-3">
                            <div>
                                <textarea
                                    value={contactMessage}
                                    onChange={(e) => setContactMessage(e.target.value)}
                                    placeholder="Enter your message about this video..."
                                    rows={3}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none touch-manipulation"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !contactMessage.trim()}
                                    className="px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation min-h-[44px]"
                                >
                                    {isSubmitting ? 'Sending...' : 'Send'}
                                </button>
                                
                                {submitStatus === 'success' && (
                                    <span className="text-sm text-green-600">Message sent!</span>
                                )}
                                
                                {submitStatus === 'error' && (
                                    <span className="text-sm text-red-600">Failed to send</span>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
        </Modal>
    )
}
