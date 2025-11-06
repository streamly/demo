import { NextRequest, NextResponse } from 'next/server'
import { AuthgearError, verifyAuthgearUser } from '@server/authgearClient'
import { getVideoById } from '@server/db/video'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: videoId } = await params
        
        // Get video from database
        const video = await getVideoById(videoId)
        if (!video) {
            return NextResponse.json(
                { error: 'Video not found' },
                { status: 404 }
            )
        }

        // Try to authenticate user (optional for public videos)
        let userId: string | null = null
        try {
            const authHeader = request.headers.get('authorization')
            if (authHeader) {
                const decoded = await verifyAuthgearUser(authHeader)
                userId = decoded.sub || null
            }
        } catch (authError) {
            // Authentication failed, but we continue for public videos
            console.log('Authentication failed for video request:', authError)
        }

        // Check access permissions
        const isOwner = userId === video.userId
        const isPublic = video.visibility === 'public'

        if (!isOwner && !isPublic) {
            // Not owner and video is not public - return 404 to hide existence
            return NextResponse.json(
                { error: 'Video not found' },
                { status: 404 }
            )
        }

        // Return video data (exclude sensitive info for non-owners)
        const responseData = {
            id: video.id,
            title: video.title,
            description: video.description,
            duration: video.duration,
            width: video.width,
            height: video.height,
            fileSize: video.fileSize,
            visibility: video.visibility,
            format: video.format,
            createdAt: video.createdAt,
            updatedAt: video.updatedAt,
            types: video.types || [],
            topics: video.topics || [],
            tags: video.tags || [],
            companies: video.companies || [],
            people: video.people || [],
            audiences: video.audiences || [],
            // Only include user info for owners or if explicitly needed
            user: isOwner ? video.user : undefined
        }

        return NextResponse.json(responseData)

    } catch (error: any) {
        console.error('Error fetching video:', error)
        
        if (error instanceof AuthgearError) {
            return NextResponse.json(
                { error: 'Authentication failed' },
                { status: 401 }
            )
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}