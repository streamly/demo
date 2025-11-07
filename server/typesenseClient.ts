import { TypesenseVideo } from '@/shared/types/video'
import Typesense, { Client } from 'typesense'


/**
Schema
{
  name: "videos",
  fields: [
    { name: "id", type: "string" },
    { name: "title", type: "string", index: true, infix: true, stem: true },
    { name: "description", type: "string", index: true, infix: true, stem: true },
    { name: "duration", type: "int32", index: true, sort: true, facet: true },
    { name: "types", type: "string[]", index: true, facet: true },
    { name: "audiences", type: "string[]", index: true, facet: true },
    { name: "companies", type: "string[]", index: true, facet: true },
    { name: "topics", type: "string[]", index: true, facet: true },
    { name: "tags", type: "string[]", index: true, facet: true, infix: true },
    { name: "people", type: "string[]", index: true, facet: true },
    { name: "visibility", type: "string", index: true, facet: true },
    { name: "format", type: "string", index: true, facet: true },
    { name: "thumbnail_id", type: "string" },
    { name: "user_id", type: "string", index: true, facet: true },
    { name: "created_at", type: "int64", index: true, facet: true, sort: true },
    { name: "updated_at", type: "int64", index: true, facet: true, sort: true }
  ],
  default_sorting_field: "created_at"
}
*/

const host = process.env.NEXT_PUBLIC_TYPESENSE_HOST
const port = process.env.NEXT_PUBLIC_TYPESENSE_PORT!
const protocol = process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL!
const apiKey = process.env.TYPESENSE_ADMIN_KEY


function createTypesenseClient() {
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

// Legacy type alias for backward compatibility
export type VideoData = TypesenseVideo

export async function getVideoById(videoId: string): Promise<VideoData | null> {
  try {
    const client = getTypesenseClient()
    const searchResults = await client
      .collections(process.env.NEXT_PUBLIC_TYPESENSE_COLLECTION!)
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
      .collections(process.env.NEXT_PUBLIC_TYPESENSE_COLLECTION!)
      .documents()
      .search({
        q: '*',
        filter_by: `id:=${objectId}`,
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

export async function findInactiveVideo(userId: string): Promise<VideoData | null> {
  try {
    const client = getTypesenseClient()
    const searchResults = await client
      .collections(process.env.NEXT_PUBLIC_TYPESENSE_COLLECTION!)
      .documents()
      .search({
        q: '*',
        filter_by: `user_id:=${userId} && visibility:=inactive`,
        per_page: 1,
        sort_by: 'created_at:desc',
      })

    if (searchResults.hits && searchResults.hits.length > 0) {
      const hit = searchResults.hits[0]
      return hit.document as VideoData
    }

    return null
  } catch (error) {
    console.error('Failed to find inactive video from Typesense:', error)
    return null
  }
}

export async function getVideosByUserId(userId: string, limit: number = 20): Promise<VideoData[]> {
  try {
    const client = getTypesenseClient()
    const searchResults = await client
      .collections(process.env.NEXT_PUBLIC_TYPESENSE_COLLECTION!)
      .documents()
      .search({
        q: '*',
        filter_by: `user_id:=${userId}`,
        per_page: limit,
        sort_by: 'updated_at:desc',
      })

    if (searchResults.hits && searchResults.hits.length > 0) {
      return searchResults.hits.map(hit => hit.document as VideoData)
    }

    return []
  } catch (error) {
    console.error('Failed to fetch user videos from Typesense:', error)
    return []
  }
}

export async function saveVideoMetadata(videoData: VideoData, userId?: string): Promise<void> {
  try {
    const client = getTypesenseClient()
    
    // Ensure user_id is included in the document
    const documentToSave = {
      ...videoData,
      ...(userId && { user_id: userId })
    }
    
    await client
      .collections(process.env.NEXT_PUBLIC_TYPESENSE_COLLECTION!)
      .documents()
      .upsert(documentToSave)
  } catch (error) {
    console.error('Failed to save video metadata to Typesense:', error)
    throw error
  }
}
