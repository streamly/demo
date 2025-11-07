import { AuthgearError, verifyAuthgearUser } from '@server/authgearClient'
import { createDraftVideo, getVideoById, verifyVideoOwnership } from '@server/db/video'
import {
  authErrorResponseWithCors,
  errorResponseWithCors,
  internalErrorResponseWithCors,
  setCorsHeaders,
  successResponseWithCors
} from '@server/responses'
import {
  abortMultipartUpload,
  completeMultipartUpload,
  createMultipartUpload,
  generatePartUploadUrl,
  generateVideoUploadUrl,
  listParts
} from '@server/s3Client'
import { findInactiveVideo, saveVideoMetadata } from '@server/typesenseClient'
import { NextRequest, NextResponse } from 'next/server'

export async function OPTIONS() {
  return setCorsHeaders(new NextResponse(null, { status: 200 }))
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authHeader = request.headers.get('authorization')
    const decoded = await verifyAuthgearUser(authHeader || undefined)
    const userId = decoded.sub

    if (!userId) {
      return authErrorResponseWithCors('Missing user ID in token')
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    switch (type) {
      case 'listParts': {
        const uploadId = searchParams.get('uploadId')
        const id = searchParams.get('id')

        if (!uploadId || !id) {
          return errorResponseWithCors('Missing uploadId or id', 400)
        }

        // Verify video ownership
        const isOwner = await verifyVideoOwnership(userId, id)
        if (!isOwner) {
          return errorResponseWithCors('Video not found or access denied', 403)
        }

        const key = `videos/${userId}/${id}.mp4`
        const parts = await listParts(key, uploadId)

        return successResponseWithCors({ parts })
      }

      case 'getUploadPartURL': {
        const uploadId = searchParams.get('uploadId')
        const id = searchParams.get('id')
        const partNumber = searchParams.get('partNumber')

        if (!id || !uploadId || !partNumber) {
          return errorResponseWithCors('Missing uploadId, id, or partNumber', 400)
        }

        // Verify video ownership
        const isOwner = await verifyVideoOwnership(userId, id)
        if (!isOwner) {
          return errorResponseWithCors('Video not found or access denied', 403)
        }

        const key = `videos/${userId}/${id}.mp4`
        const signedUrl = await generatePartUploadUrl(key, uploadId, parseInt(partNumber))

        return successResponseWithCors({ url: signedUrl })
      }

      default:
        return errorResponseWithCors('Invalid operation type', 400)
    }

  } catch (err: any) {
    if (err instanceof AuthgearError) {
      console.error('GET Upload API - Authgear Error:', {
        code: err.code,
        message: err.message,
        stack: err.stack
      })
      return authErrorResponseWithCors(err.message)
    }

    console.error('GET Upload API - Unexpected Error:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      cause: err.cause
    })
    return internalErrorResponseWithCors(`Internal server error: ${err.message}`)
  }
}

export async function POST(request: NextRequest) {
  let userId: string | undefined
  let operationType: string | undefined
  let requestData: any = {}

  try {
    // Authenticate user
    const authHeader = request.headers.get('authorization')
    const decoded = await verifyAuthgearUser(authHeader || undefined)
    userId = decoded.sub

    if (!userId) {
      return setCorsHeaders(NextResponse.json(
        { error: 'Missing user ID in token' },
        { status: 401 }
      ))
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    // If no type in query params, check request body
    try {
      requestData = await request.json()
    } catch {
      requestData = {}
    }

    operationType = type || requestData.type

    switch (operationType) {
      case 'createDraftVideo': {
        try {
          console.log('Creating draft video for user:', userId)

          // Check for inactive video first
          const inactive = await findInactiveVideo(userId)
          if (inactive) {
            console.log('Inactive video found:', inactive.id)
            return setCorsHeaders(NextResponse.json({
              error: 'Unactivated video exists',
              code: 'UNACTIVATED_VIDEO',
              details: { videoId: inactive.id },
            }, { status: 409 }))
          }

          // Create a new draft video in the database
          console.log('Creating new draft video...')
          const draftVideo = await createDraftVideo(userId)
          console.log('Draft video created:', draftVideo.id)

          return setCorsHeaders(NextResponse.json({
            videoId: draftVideo.id,
            message: 'Draft video created successfully'
          }))
        } catch (error: any) {
          console.error('Error in createDraftVideo:', {
            error: error.message,
            stack: error.stack,
            userId
          })
          throw error
        }
      }

      case 'getUploadParameters': {
        const { contentType, id } = requestData

        if (!id || !contentType) {
          return setCorsHeaders(NextResponse.json(
            { error: 'Missing id or contentType' },
            { status: 400 }
          ))
        }

        // Verify video ownership
        const isOwner = await verifyVideoOwnership(userId, id)
        if (!isOwner) {
          return setCorsHeaders(NextResponse.json(
            { error: 'Video not found or access denied' },
            { status: 403 }
          ))
        }

        const filename = id
        const signedUrl = await generateVideoUploadUrl(filename, contentType, userId)

        return setCorsHeaders(NextResponse.json({ url: signedUrl }))
      }

      case 'createMultipartUpload': {
        const { contentType, id } = requestData

        if (!id || !contentType) {
          return setCorsHeaders(NextResponse.json(
            { error: 'Missing id or contentType' },
            { status: 400 }
          ))
        }

        // Verify video ownership
        const isOwner = await verifyVideoOwnership(userId, id)
        if (!isOwner) {
          return setCorsHeaders(NextResponse.json(
            { error: 'Video not found or access denied' },
            { status: 403 }
          ))
        }

        const filename = id
        const result = await createMultipartUpload(filename, contentType, userId)

        return setCorsHeaders(NextResponse.json(result))
      }

      case 'completeMultipartUpload': {
        const { uploadId, id, parts } = requestData
        if (!uploadId || !id || !parts || !Array.isArray(parts)) {
          return setCorsHeaders(NextResponse.json(
            { error: 'Missing uploadId, id, or parts array' },
            { status: 400 }
          ))
        }

        // Verify video ownership
        const isOwner = await verifyVideoOwnership(userId, id)
        if (!isOwner) {
          return setCorsHeaders(NextResponse.json(
            { error: 'Video not found or access denied' },
            { status: 403 }
          ))
        }

        const key = `videos/${userId}/${id}.mp4`
        const result = await completeMultipartUpload(key, uploadId, parts)

        return setCorsHeaders(NextResponse.json(result))
      }

      case 'abortMultipartUpload': {
        const { uploadId, id } = requestData
        if (!uploadId || !id) {
          return setCorsHeaders(NextResponse.json(
            { error: 'Missing uploadId or id' },
            { status: 400 }
          ))
        }

        // Verify video ownership
        const isOwner = await verifyVideoOwnership(userId, id)
        if (!isOwner) {
          return setCorsHeaders(NextResponse.json(
            { error: 'Video not found or access denied' },
            { status: 403 }
          ))
        }

        const key = `videos/${userId}/${id}.mp4`
        await abortMultipartUpload(key, uploadId)

        return setCorsHeaders(NextResponse.json({ success: true }))
      }

      case 'complete': {
        const { filename, width, height, size, duration, id, title, description } = requestData

        if (!id) {
          return setCorsHeaders(NextResponse.json(
            { error: 'Missing video id' },
            { status: 400 }
          ))
        }

        // Verify video ownership
        const isOwner = await verifyVideoOwnership(userId, id)
        if (!isOwner) {
          return setCorsHeaders(NextResponse.json(
            { error: 'Video not found or access denied' },
            { status: 403 }
          ))
        }

        // Get the updated video from database
        const updatedVideo = await getVideoById(id)
        if (!updatedVideo) {
          return setCorsHeaders(NextResponse.json(
            { error: 'Failed to retrieve updated video' },
            { status: 500 }
          ))
        }

        // Save basic video information to Typesense
        const typesenseData = {
          id: updatedVideo.id,
          title: updatedVideo.title || 'Untitled Video',
          description: updatedVideo.description || '',
          duration: updatedVideo.duration,
          format: updatedVideo.format,
          visibility: updatedVideo.visibility,
          user_id: userId,
          created_at: updatedVideo.createdAt instanceof Date ? updatedVideo.createdAt.getTime() : Date.now(),
          updated_at: updatedVideo.updatedAt instanceof Date ? updatedVideo.updatedAt.getTime() : Date.now(),
          thumbnail_id: id,
          // Empty arrays for relationships - these can be added later via separate API
          types: [],
          audiences: [],
          companies: [],
          topics: [],
          tags: [],
          people: []
        }

        await saveVideoMetadata(typesenseData, userId)

        return setCorsHeaders(NextResponse.json({
          success: true,
          videoId: id,
          message: 'Video metadata saved successfully'
        }))
      }

      default:
        return setCorsHeaders(NextResponse.json(
          { error: 'Invalid operation type' },
          { status: 400 }
        ))
    }

  } catch (err: any) {
    if (err instanceof AuthgearError) {
      console.error('POST Upload API - Authgear Error:', {
        code: err.code,
        message: err.message,
        stack: err.stack,
        operationType,
        userId
      })
      return setCorsHeaders(NextResponse.json(
        { error: err.code, message: err.message },
        { status: 401 }
      ))
    }

    console.error('POST Upload API - Unexpected Error:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      cause: err.cause,
      operationType,
      userId,
      requestData: JSON.stringify(requestData, null, 2)
    })
    return setCorsHeaders(NextResponse.json(
      { error: 'Upload operation failed', details: err.message, operationType },
      { status: 500 }
    ))
  }
}
