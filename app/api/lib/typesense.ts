import Typesense, { Client } from 'typesense'

// Initialize Typesense client for server-side use
function createTypesenseClient() {
  const host = process.env.NEXT_PUBLIC_TYPESENSE_HOST
  const port = process.env.NEXT_PUBLIC_TYPESENSE_PORT || '443'
  const protocol = process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL || 'https'
  // Try both possible API key variable names
  const apiKey = process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY || process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_KEY

  if (!host || !apiKey) {
    throw new Error(`Typesense configuration missing. Required: HOST (${host}), API_KEY (${apiKey ? 'set' : 'missing'})`)
  }

  return new Typesense.Client({
    nodes: [
      {
        host,
        port: parseInt(port),
        protocol,
      },
    ],
    apiKey,
    connectionTimeoutSeconds: 2,
  })
}

let typesenseClient: Client | null = null

function getTypesenseClient() {
  if (!typesenseClient) {
    typesenseClient = createTypesenseClient()
  }
  return typesenseClient
}

export interface VideoData {
  id: string
  objectID: string
  uid?: string
  title: string
  company?: string
  channel?: string
  gated?: boolean
  billing?: string
  score?: number
  __position?: number
  ranking?: number
  [key: string]: any
}

export async function getVideoById(videoId: string): Promise<VideoData | null> {
  try {
    const client = getTypesenseClient()
    const searchResults = await client
      .collections('videos')
      .documents()
      .search({
        q: '*',
        filter_by: `id:=${videoId}`,
        per_page: 1,
      })

    if (searchResults.hits && searchResults.hits.length > 0) {
      const hit = searchResults.hits[0]
      return hit.document as VideoData
    }

    return null
  } catch (error) {
    console.error('Failed to fetch video from Typesense:', error)
    return null
  }
}

export async function getVideoByObjectId(objectId: string): Promise<VideoData | null> {
  try {
    const client = getTypesenseClient()
    const searchResults = await client
      .collections('videos')
      .documents()
      .search({
        q: '*',
        filter_by: `objectID:=${objectId}`,
        per_page: 1,
      })

    if (searchResults.hits && searchResults.hits.length > 0) {
      const hit = searchResults.hits[0]
      return hit.document as VideoData
    }

    return null
  } catch (error) {
    console.error('Failed to fetch video from Typesense:', error)
    return null
  }
}
