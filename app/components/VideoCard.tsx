'use client'
import { useState } from 'react'
import VideoModal from './VideoModal'
import type { VideoHit } from './types'

export default function VideoCard({ hit }: { hit: VideoHit }) {
    const [open, setOpen] = useState(false)

    return (
        <>
            <div
                className="bg-white rounded-2xl shadow p-3 hover:shadow-lg transition cursor-pointer"
                onClick={() => setOpen(true)}
            >
                <img
                    src={`https://img.syndinet.com/${hit.id}`}
                    alt={hit.title}
                    className="w-full h-48 object-cover rounded-lg mb-2"
                />
                <h3 className="font-semibold text-gray-800 line-clamp-2">{hit.title}</h3>
                <p className="text-sm text-gray-500">{hit.company}</p>
            </div>

            {open && (
                <VideoModal
                    videoId={hit.id}
                    title={hit.title}
                    onClose={() => setOpen(false)}
                />
            )}
        </>
    )
}