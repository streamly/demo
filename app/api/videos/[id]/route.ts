import { AuthgearError, verifyAuthgearUser } from '@server/authgearClient'
import { getVideoById } from '@server/db/video'
import { 
  successResponse, 
  notFoundResponse, 
  authErrorResponse, 
  internalErrorResponse 
} from '@server/responses'
import { NextRequest } from 'next/server'

// Helper function for optional authentication
async function getOptionalUserId(request: NextRequest): Promise<string | null> {
    try {
        const authHeader = request.headers.get('authorization')
        if (authHeader) {
            const decoded = await verifyAuthgearUser(authHeader)
            return decoded.sub || null
        }
        return null
    } catch (authError) {
        console.log('Authentication failed for video request:', authError)
        return null
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: videoId } = await params

        // Get video from database
        const video = await getVideoById(videoId)

        if (!video) {
            return notFoundResponse('Video not found')
        }

        console.log('Found video', video)

        // Try to get user ID (optional for public videos)
        const userId = await getOptionalUserId(request)
        
        const isOwner = userId === video?.user?.id
        const isPublic = video.visibility === 'public'

        // Return 404 for private videos if user is not the owner
        if (!isOwner && !isPublic) {
            return notFoundResponse('Video not found')
        }

        return successResponse({
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
            types: video.types,
            topics: video.topics,
            tags: video.tags,
            companies: video.companies,
            people: video.people,
            audiences: video.audiences,
        })

    } catch (error: any) {
        console.error('Error fetching video:', error)

        if (error instanceof AuthgearError) {
            return authErrorResponse(error.message)
        }

        return internalErrorResponse('Failed to fetch video')
    }
}