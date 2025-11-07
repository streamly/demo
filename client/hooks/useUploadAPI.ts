import { getAccessToken } from '@client/services/authService'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export interface UploadAPIHooks {
  createDraftVideo: () => Promise<string>
  getUploadParameters: (file: any) => Promise<any>
  createMultipartUpload: (file: any) => Promise<any>
  listParts: (file: any, params: any) => Promise<any[]>
  signPart: (file: any, params: any) => Promise<{ url: string }>
  completeMultipartUpload: (file: any, params: any) => Promise<any>
  abortMultipartUpload: (file: any, params: any) => Promise<void>
  saveVideoMetadata: (file: any, metadata: any) => Promise<any>
}

export function useUploadAPI(): UploadAPIHooks {
  const router = useRouter()

  const createDraftVideo = useCallback(async (): Promise<string> => {
    console.log('🆕 Creating draft video...')
    const token = await getAccessToken()

    const response = await fetch('/api/videos/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ type: 'createDraftVideo' })
    })

    console.log('Draft video response status:', response.status, response.statusText)

    if (!response.ok) {
      const data = await response.json()
      console.error('Draft video creation failed:', data)
      if (data.code === 'UNACTIVATED_VIDEO') {
        alert('Please finish your existing video first. Redirecting...')
        router.push(`/dashboard?v=${encodeURIComponent(data.details.videoId)}`)
        throw new Error('Upload blocked: unfinished video exists')
      }
      throw new Error(data.error || 'Failed to create draft video')
    }

    const data = await response.json()
    console.log('Draft video created:', data.videoId)
    return data.videoId
  }, [router])

  const getUploadParameters = useCallback(async (file: any) => {
    console.log('getUploadParameters called for file:', file.name, 'ID:', file.meta?.id, 'Size:', file.size)
    const token = await getAccessToken()
    console.log('Token obtained, making API request...')

    // Check if we already have a server-generated UUID, if not create one
    let videoId = file.meta?.serverVideoId
    if (!videoId) {
      console.log('No server video ID found, creating draft video...')
      videoId = await createDraftVideo()
      // Store the server-generated ID in file metadata
      file.meta = { ...file.meta, serverVideoId: videoId }
      console.log('Server video ID created and stored:', videoId)
    }

    const requestBody = {
      type: 'getUploadParameters',
      filename: file.name,
      contentType: file.type,
      id: videoId
    }
    console.log('Request body:', requestBody)

    const response = await fetch('/api/videos/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    })

    console.log('Response status:', response.status, response.statusText)

    if (!response.ok) {
      const data = await response.json()
      console.error('Upload parameters request failed:', data)
      if (data.code === 'UNACTIVATED_VIDEO') {
        alert('Please finish your existing video first. Redirecting...')
        router.push(`/dashboard?v=${encodeURIComponent(data.details.videoId)}`)
        throw new Error('Upload blocked: unfinished video exists')
      }
      throw new Error(data.error || 'Failed to get upload parameters')
    }

    const data = await response.json()
    console.log('Upload parameters received:', data)

    return {
      method: 'PUT' as const,
      url: data.url,
      headers: {
        'Content-Type': file.type
      }
    }
  }, [router])

  const createMultipartUpload = useCallback(async (file: any) => {
    console.log('createMultipartUpload called for file:', file.name, 'ID:', file.meta?.id)
    const token = await getAccessToken()

    // Check if we already have a server-generated UUID, if not create one
    let videoId = file.meta?.serverVideoId
    if (!videoId) {
      console.log('No server video ID found, creating draft video...')
      videoId = await createDraftVideo()
      // Store the server-generated ID in file metadata
      file.meta = { ...file.meta, serverVideoId: videoId }
      console.log('Server video ID created and stored:', videoId)
    }

    const requestBody = {
      type: 'createMultipartUpload',
      filename: file.name,
      contentType: file.type,
      id: videoId
    }
    console.log('Multipart request body:', requestBody)

    const response = await fetch('/api/videos/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    })

    console.log('Multipart response status:', response.status, response.statusText)

    if (!response.ok) {
      const data = await response.json()
      console.error('Multipart upload creation failed:', data)
      if (data.code === 'UNACTIVATED_VIDEO') {
        alert('Please finish your existing video first. Redirecting...')
        router.push(`/dashboard?v=${encodeURIComponent(data.details.videoId)}`)
        throw new Error('Upload blocked: unfinished video exists')
      }
      throw new Error(data.error || 'Failed to create multipart upload')
    }

    const result = await response.json()
    console.log('Multipart upload created:', result)
    return result
  }, [router])

  const listParts = useCallback(async (file: any, { uploadId }: any) => {
    const videoId = file.meta?.serverVideoId || file.meta?.id
    console.log('listParts called - uploadId:', uploadId, 'videoId:', videoId)
    const token = await getAccessToken()
    const response = await fetch(`/api/videos/upload?type=listParts&uploadId=${uploadId}&id=${videoId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    console.log('listParts response:', response.status)
    const data = await response.json()
    console.log('Parts listed:', data.parts?.length || 0, 'parts')
    return data.parts || []
  }, [])

  const signPart = useCallback(async (file: any, { uploadId, partNumber }: any) => {
    const videoId = file.meta?.serverVideoId || file.meta?.id
    console.log('signPart called - uploadId:', uploadId, 'partNumber:', partNumber, 'videoId:', videoId)
    const token = await getAccessToken()
    const response = await fetch(`/api/videos/upload?type=getUploadPartURL&uploadId=${uploadId}&id=${videoId}&partNumber=${partNumber}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    console.log('signPart response:', response.status)
    const data = await response.json()
    console.log('Part URL signed:', data.url ? 'URL received' : 'No URL')
    return { url: data.url }
  }, [])

  const completeMultipartUpload = useCallback(async (file: any, { uploadId, parts }: any) => {
    const videoId = file.meta?.serverVideoId || file.meta?.id
    console.log('completeMultipartUpload called - uploadId:', uploadId, 'parts:', parts?.length, 'videoId:', videoId)
    const token = await getAccessToken()

    const requestBody = {
      type: 'completeMultipartUpload',
      uploadId,
      id: videoId,
      parts
    }
    console.log('Complete multipart request:', requestBody)

    const response = await fetch('/api/videos/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    })

    console.log('Complete multipart response:', response.status)
    const result = await response.json()
    console.log('Multipart upload completed:', result)
    return result
  }, [])

  const abortMultipartUpload = useCallback(async (file: any, { uploadId }: any) => {
    const videoId = file.meta?.serverVideoId || file.meta?.id
    console.log('abortMultipartUpload called - uploadId:', uploadId, 'videoId:', videoId)
    const token = await getAccessToken()

    const requestBody = {
      type: 'abortMultipartUpload',
      uploadId,
      id: videoId
    }
    console.log('Abort multipart request:', requestBody)

    const response = await fetch('/api/videos/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    })

    console.log('Abort multipart response:', response.status)
    console.log('Multipart upload aborted')
  }, [])

  const saveVideoMetadata = useCallback(async (file: any, metadata: any) => {
    console.log('Saving metadata to database...')
    const token = await getAccessToken()

    const videoId = file.meta?.serverVideoId || file.meta?.id
    const requestBody = {
      type: 'complete',
      filename: file.name,
      width: metadata?.width || 0,
      height: metadata?.height || 0,
      size: metadata?.size || 0,
      duration: metadata?.duration || 0,
      id: videoId
    }
    console.log('Metadata request:', requestBody)

    const response = await fetch('/api/videos/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    })

    console.log('Metadata response:', response.status)
    const data = await response.json()
    console.log('Metadata result:', data)

    return data
  }, [])

  return {
    createDraftVideo,
    getUploadParameters,
    createMultipartUpload,
    listParts,
    signPart,
    completeMultipartUpload,
    abortMultipartUpload,
    saveVideoMetadata
  }
}
