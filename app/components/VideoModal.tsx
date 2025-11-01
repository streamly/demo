'use client'
import { useEffect, useRef } from 'react'

interface VideoModalProps {
    videoId?: string
    title?: string
    onClose: () => void
}

export default function VideoModal({ videoId, title, onClose }: VideoModalProps) {
    const modalRef = useRef<HTMLDivElement | null>(null)

    // Close on ESC key
    useEffect(() => {
        const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
        window.addEventListener('keydown', onEsc)
        return () => window.removeEventListener('keydown', onEsc)
    }, [onClose])

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                onClose()
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [onClose])

    if (!videoId) return null

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div
                ref={modalRef}
                className="bg-white rounded-xl overflow-hidden shadow-lg w-full max-w-4xl relative"
            >
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-2xl font-bold z-10"
                >
                    &times;
                </button>

                <div className="aspect-video bg-black">
                    <video
                        key={videoId}
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                        src={`https://cdn.tubie.cx/${videoId}`}
                    />
                </div>

                {title && (
                    <div className="p-4 border-t">
                        <h2 className="text-lg font-semibold">{title}</h2>
                    </div>
                )}
            </div>
        </div>
    )
}