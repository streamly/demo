import { getVideoById, getVideoByObjectId } from '@/server/typesenseClient'
import { getUserInfoFromAuthgear, verifyAuthgearUser } from '@server/authgearClient'
// Redis client removed - analytics data will be handled differently
import { createHash, randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

interface ContactActionData {
  uuid: string
  guid: string
  aid?: string
  videoId: string
  videoTitle: string
  videoCompany: string
  gated: boolean
  hostUrl: string
  userId?: string
  userFirstname?: string
  userLastname?: string
  userCompany?: string
  userPosition?: string
  userIndustry?: string
  userEmail?: string
  userPhone?: string
  message?: string
  timestamp: number
}

function getUserUUID(request: NextRequest): string {
  // Get user IP from request headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const remoteAddr = request.headers.get('remote-addr')

  // Try different headers to get the real IP
  const ip = forwarded?.split(',')[0] || realIP || remoteAddr || 'unknown'

  // Create MD5 hash of IP
  const hash = createHash('md5').update(ip).digest('hex')

  return hash
}

export async function POST(request: NextRequest) {
  try {
    // Verify Authgear token
    const authHeader = request.headers.get('authorization')
    const jwtPayload = await verifyAuthgearUser(authHeader || undefined)
    const token = authHeader!.slice('Bearer '.length).trim()

    const body = await request.json()
    const { videoId, message } = body

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      )
    }

    // Fetch video data from Typesense
    let videoData = await getVideoById(videoId)
    if (!videoData) {
      // Try by objectID if not found by id
      videoData = await getVideoByObjectId(videoId)
    }

    if (!videoData) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    // Fetch user info from Authgear
    const userInfo = await getUserInfoFromAuthgear(token)

    const uuid = getUserUUID(request)
    const guid = randomUUID()

    // Build contact action data
    const actionData: ContactActionData = {
      uuid,
      guid,
      aid: videoData.uid,
      videoId: videoData.id,
      videoTitle: videoData.title || 'Untitled Video',
      videoCompany: videoData.company || videoData.channel || '',
      gated: Boolean(videoData.gated),
      hostUrl: request.headers.get('origin') || '',
      userId: userInfo.sub,
      userFirstname: userInfo.givenName,
      userLastname: userInfo.familyName,
      userCompany: userInfo.customAttributes?.company,
      userPosition: userInfo.customAttributes?.position,
      userIndustry: userInfo.customAttributes?.industry,
      userEmail: userInfo.email,
      userPhone: userInfo.customAttributes?.phone,
      message: message?.trim() || undefined,
      timestamp: Date.now()
    }

    // TODO: Store analytics data in database instead of Redis
    // For now, just log the contact event
    console.log('Contact analytics data would be stored:', {
      key: `analytics:contact:${actionData.guid}`,
      data: actionData,
      userId: userInfo.sub
    })

    console.log('Contact event tracked:', {
      videoId: actionData.videoId,
      videoTitle: actionData.videoTitle,
      userId: actionData.userId,
      userEmail: actionData.userEmail,
      hasMessage: !!actionData.message,
      timestamp: actionData.timestamp
    })

    return NextResponse.json({
      success: true,
      guid: actionData.guid,
      message: 'Contact event tracked successfully'
    })

  } catch (error) {
    console.error('Failed to track contact event:', error)
    return NextResponse.json(
      { error: 'Failed to track contact event' },
      { status: 500 }
    )
  }
}
