'use client'
import { VideoHit } from './types'

export default function VideoCard({ hit }: { hit: VideoHit }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 overflow-hidden">
            <div className="relative">
                <img
                    src={`https://img.syndinet.com/${hit.id}`}
                    alt={hit.title}
                    className="w-full h-48 object-cover"
                />
                {hit.duration && (
                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded-md">
                        {formatDuration(hit.duration)}
                    </span>
                )}
            </div>

            <div className="p-3">
                <h3 className="font-semibold text-gray-800 line-clamp-2 mb-1">
                    {hit.title}
                </h3>
                {hit.company && <p className="text-sm text-gray-500">{hit.company}</p>}
                {hit.tags && (
                    <div className="mt-2 flex flex-wrap gap-1">
                        {hit.tags.slice(0, 3).map((tag, i) => (
                            <span
                                key={i}
                                className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function formatDuration(seconds?: number) {
    if (!seconds) return ''
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
}