import Typesense, { Client } from 'typesense'


/**
Schema
{
  name: "videos",
  fields: [
    // Unique video ID
    { name: "id", type: "string" },

    // Video title — searchable and indexed
    { name: "title", type: "string", index: true, infix: true, stem: true },

    // Video description — full-text searchable
    { name: "description", type: "string", index: true, infix: true, stem: true },

    // Duration in seconds — sortable and facetable
    { name: "duration", type: "int32", index: true, sort: true, facet: true },

    // Video categories (Corporate, Investor, Event, etc.)
    { name: "types", type: "string[]", index: true, facet: true },

    // Target audiences (Investors, Professionals, etc.)
    { name: "audiences", type: "string[]", index: true, facet: true },

    // Related companies (Tesla, Apple, etc.)
    { name: "companies", type: "string[]", index: true, facet: true },

    // Topics covered (Electric Vehicles, AI, Sustainability, etc.)
    { name: "topics", type: "string[]", index: true, facet: true },

    // Generic tags for easier filtering and search
    { name: "tags", type: "string[]", index: true, facet: true, infix: true },

    // People featured or mentioned in the video
    { name: "people", type: "string[]", index: true, facet: true },

    // Visibility setting: public, unlisted, private
    { name: "visibility", type: "string", index: true, facet: true },

    // File format or content type (e.g. video/mp4)
    { name: "format", type: "string", index: true, facet: true },

    // URL for the video thumbnail
    { name: "thumbnail", type: "string", index: true },

    // Date/time when the video was created (timestamp, Unix ms)
    { name: "created_at", type: "int64", index: true, facet: true, sort: true },

    // Date/time when the video was last updated (timestamp, Unix ms)
    { name: "updated_at", type: "int64", index: true, facet: true, sort: true }
  ],

  // Default sorting field for queries
  default_sorting_field: "created_at"
}
 */

// Initialize Typesense client for server-side use
function createTypesenseClient() {
  const host = process.env.NEXT_PUBLIC_TYPESENSE_HOST
  const port = process.env.NEXT_PUBLIC_TYPESENSE_PORT ?? '443'
  const protocol = process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL ?? 'https'
  // Try both possible API key variable names
  const apiKey = process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_KEY

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
  // Core fields from new schema
  id: string
  title: string
  description?: string
  duration?: number
  types?: string[]           // Video categories (Corporate, Investor, Event, etc.)
  audiences?: string[]       // Target audiences (Investors, Professionals, etc.)
  companies?: string[]       // Related companies (Tesla, Apple, etc.)
  topics?: string[]          // Topics covered (Electric Vehicles, AI, etc.)
  tags?: string[]           // Generic tags for filtering and search
  people?: string[]         // People featured or mentioned
  visibility?: string       // public, unlisted, private
  format?: string          // File format or content type
  thumbnail?: string       // URL for video thumbnail
  created_at?: number      // Unix timestamp (ms)
  updated_at?: number      // Unix timestamp (ms)

  // Legacy fields for backward compatibility
  objectID?: string
  uid?: string
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
