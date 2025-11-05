import { VideoHit } from "@client/components/types"
import Typesense from "typesense"
import TypesenseInstantSearchAdapter from 'typesense-instantsearch-adapter'

// Log environment configuration (safe subset)
if (process.env.NODE_ENV !== "production") {
  console.log("[Typesense Config]:")
  console.log("  HOST:", process.env.NEXT_PUBLIC_TYPESENSE_HOST)
  console.log("  PORT:", process.env.NEXT_PUBLIC_TYPESENSE_PORT)
  console.log("  PROTOCOL:", process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL)
  console.log("  SEARCH KEY set:", Boolean(process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_KEY))
}

// Shared Typesense configuration
export const typesenseConfig = {
  host: process.env.NEXT_PUBLIC_TYPESENSE_HOST!,
  port: parseInt(process.env.NEXT_PUBLIC_TYPESENSE_PORT!),
  protocol: process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL! as 'http' | 'https',
  apiKey: process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_KEY!,
}

// Initialize Typesense client for direct API calls
const client = new Typesense.Client({
  nodes: [typesenseConfig],
  apiKey: typesenseConfig.apiKey,
  connectionTimeoutSeconds: 2,
})

// Create InstantSearch adapter with shared config
export function createInstantSearchAdapter(apiKey?: string) {
  return new TypesenseInstantSearchAdapter({
    server: {
      apiKey: apiKey || typesenseConfig.apiKey,
      nodes: [typesenseConfig],
    },
    additionalSearchParameters: {
      query_by: 'title,description,types,audiences,companies,topics,tags,people',
      sort_by: 'created_at:desc',
      // Performance optimizations
      highlight_full_fields: 'title,description',
      highlight_affix_num_tokens: 3,
      typo_tokens_threshold: 1,
      drop_tokens_threshold: 1,
      prioritize_exact_match: true,
      prioritize_token_position: true,
    },
  })
}

function isConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_TYPESENSE_HOST &&
    process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_KEY
  )
}

export async function findVideoById(videoId: string): Promise<VideoHit | null> {
  try {
    if (!isConfigured()) {
      console.warn("Typesense not configured")
      return null
    }

    // Try searching by id field first
    try {
      const searchResults = await client.collections("videos").documents().search({
        q: "*",
        filter_by: `id:=${videoId}`,
        per_page: 1,
      })

      if (searchResults.hits && searchResults.hits.length > 0) {
        console.log("Found video by id:", searchResults.hits[0].document)
        return searchResults.hits[0].document as VideoHit
      }
    } catch {
      console.warn("Search by 'id' failed, trying 'objectID'")
    }

    // Try searching by objectID field
    try {
      const searchResults = await client.collections("videos").documents().search({
        q: "*",
        filter_by: `objectID:=${videoId}`,
        per_page: 1,
      })

      if (searchResults.hits && searchResults.hits.length > 0) {
        console.log("Found video by objectID:", searchResults.hits[0].document)
        return searchResults.hits[0].document as VideoHit
      }
    } catch {
      console.warn("Search by 'objectID' failed, trying direct fetch")
    }

    // Last resort: direct document fetch
    try {
      const document = await client.collections("videos").documents(videoId).retrieve()
      console.log("Found video by direct fetch:", document)
      return document as VideoHit
    } catch {
      console.warn("Direct fetch failed")
    }

    console.log(`No video found with ID: ${videoId}`)
    return null
  } catch (error) {
    console.error("Error finding video by ID:", error)
    return null
  }
}

export async function searchVideos(
  query: string,
  filters: Record<string, string[]> = {}
): Promise<VideoHit[]> {
  try {
    if (!isConfigured()) {
      console.warn("Typesense not configured")
      return []
    }

    // Build filter string
    const filterParts = Object.entries(filters)
      .filter(([_, values]) => values.length > 0)
      .map(([key, values]) =>
        values.length === 1 ? `${key}:=${values[0]}` : `${key}:[${values.join(",")}]`
      )
    const filterBy = filterParts.join(" && ")

    const searchParameters = {
      q: query || "*",
      query_by: "title,description,types,audiences,companies,topics,tags,people",
      per_page: 20,
      sort_by: "created_at:desc",
      ...(filterBy ? { filter_by: filterBy } : {}),
    }

    console.log("Typesense search parameters:", searchParameters)

    const searchResults = await client.collections("videos").documents().search(searchParameters)

    return searchResults.hits?.map((hit: any) => hit.document) || []
  } catch (error) {
    console.error("Error searching videos:", error)
    return []
  }
}

// Utility functions for common search operations
export async function searchVideosByCompany(company: string, limit: number = 10): Promise<VideoHit[]> {
  return searchVideos('*', { companies: [company] })
}

export async function searchVideosByType(type: string, limit: number = 10): Promise<VideoHit[]> {
  return searchVideos('*', { types: [type] })
}

export async function searchVideosByTopic(topic: string, limit: number = 10): Promise<VideoHit[]> {
  return searchVideos('*', { topics: [topic] })
}

export async function searchVideosByPerson(person: string, limit: number = 10): Promise<VideoHit[]> {
  return searchVideos('*', { people: [person] })
}

export async function getRecentVideos(limit: number = 20): Promise<VideoHit[]> {
  try {
    if (!isConfigured()) {
      console.warn("Typesense not configured")
      return []
    }

    const searchParameters = {
      q: "*",
      query_by: "title",
      per_page: limit,
      sort_by: "created_at:desc",
      filter_by: "visibility:=public",
    }

    const searchResults = await client.collections("videos").documents().search(searchParameters)
    return searchResults.hits?.map((hit: any) => hit.document) || []
  } catch (error) {
    console.error("Error fetching recent videos:", error)
    return []
  }
}

export async function getTrendingVideos(limit: number = 20): Promise<VideoHit[]> {
  try {
    if (!isConfigured()) {
      console.warn("Typesense not configured")
      return []
    }

    // For trending, we could sort by view count or engagement if those fields exist
    // For now, we'll use recent videos as a fallback
    const searchParameters = {
      q: "*",
      query_by: "title",
      per_page: limit,
      sort_by: "created_at:desc",
      filter_by: "visibility:=public",
    }

    const searchResults = await client.collections("videos").documents().search(searchParameters)
    return searchResults.hits?.map((hit: any) => hit.document) || []
  } catch (error) {
    console.error("Error fetching trending videos:", error)
    return []
  }
}