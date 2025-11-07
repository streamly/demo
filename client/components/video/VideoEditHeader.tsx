'use client'
import VideoPlayer from '@client/components/video/VideoPlayer'
import type { VideoHit } from '@client/components/types'

interface VideoEditHeaderProps {
  videoData: VideoHit
}

export default function VideoEditHeader({ videoData }: VideoEditHeaderProps) {
  return (
    <div className="bg-black shrink-0" style={{ height: '40vh' }}>
      <VideoPlayer
        videoId={videoData.id}
        videoData={videoData}
        onReady={() => console.log('Video player ready for', videoData.id)}
      />
    </div>
  )
}
