import { VideoHit } from '@client/components/types'
import Typesense from 'typesense'
import TypesenseInstantSearchAdapter from 'typesense-instantsearch-adapter'

// Environment variables
const TYPESENSE_HOST = process.env.NEXT_PUBLIC_TYPESENSE_HOST!
const TYPESENSE_PORT = parseInt(process.env.NEXT_PUBLIC_TYPESENSE_PORT!)
const TYPESENSE_PROTOCOL = process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL! as 'http' | 'https'
const TYPESENSE_SEARCH_KEY = process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_KEY!
const TYPESENSE_COLLECTION = process.env.NEXT_PUBLIC_TYPESENSE_COLLECTION!

console.log('Typesense config:', {
  TYPESENSE_HOST,
  TYPESENSE_PORT,
  TYPESENSE_PROTOCOL,
  TYPESENSE_SEARCH_KEY,
  TYPESENSE_COLLECTION,
})

// Initialize Typesense client for direct API calls
const client = new Typesense.Client({
  nodes: [{
    host: TYPESENSE_HOST,
    protocol: TYPESENSE_PROTOCOL,
    port: TYPESENSE_PORT
  }],
  apiKey: TYPESENSE_SEARCH_KEY,
  connectionTimeoutSeconds: 2,
})

// Create InstantSearch adapter with scoped key
export function createInstantSearchAdapter(apiKey?: string) {
  return new TypesenseInstantSearchAdapter({
    server: {
      apiKey: apiKey || TYPESENSE_SEARCH_KEY,
      nodes: [{
        host: TYPESENSE_HOST,
        protocol: TYPESENSE_PROTOCOL,
        port: TYPESENSE_PORT
      }],
    },
    additionalSearchParameters: {
      query_by: 'title,description,types,audiences,companies,topics,tags,people',
      sort_by: 'updated_at:desc',
    },
  })
}


export async function findVideoById(videoId: string): Promise<VideoHit | null> {
  try {
    // Try searching by id field first
    try {
      const searchResults = await client.collections(TYPESENSE_COLLECTION).documents().search({
        q: '*',
        filter_by: `id:=${videoId}`,
        per_page: 1,
      })

      if (searchResults.hits && searchResults.hits.length > 0) {
        console.log('Found video by id:', searchResults.hits[0].document)
        return searchResults.hits[0].document as VideoHit
      }
    } catch {
      console.warn("Search by 'id' failed, trying 'objectID'")
    }

    // Try searching by objectID field
    try {
      const searchResults = await client.collections(TYPESENSE_COLLECTION).documents().search({
        q: '*',
        filter_by: `objectID:=${videoId}`,
        per_page: 1,
      })

      if (searchResults.hits && searchResults.hits.length > 0) {
        console.log('Found video by objectID:', searchResults.hits[0].document)
        return searchResults.hits[0].document as VideoHit
      }
    } catch {
      console.warn("Search by 'objectID' failed, trying direct fetch")
    }

    // Last resort: direct document fetch
    try {
      const document = await client.collections(TYPESENSE_COLLECTION).documents(videoId).retrieve()
      console.log('Found video by direct fetch:', document)
      return document as VideoHit
    } catch {
      console.warn('Direct fetch failed')
    }

    console.log(`No video found with ID: ${videoId}`)
    return null
  } catch (error) {
    console.error('Error finding video by ID:', error)
    return null
  }
}

export async function searchVideos(
  query: string,
  filters: Record<string, string[]> = {}
): Promise<VideoHit[]> {
  try {
    // Build filter string
    const filterParts = Object.entries(filters)
      .filter(([_, values]) => values.length > 0)
      .map(([key, values]) =>
        values.length === 1 ? `${key}:=${values[0]}` : `${key}:[${values.join(',')}]`
      )
    const filterBy = filterParts.join(' && ')

    const searchParameters = {
      q: query || '*',
      query_by: 'title,description,types,audiences,companies,topics,tags,people',
      per_page: 20,
      sort_by: 'updated_at:desc',
      ...(filterBy ? { filter_by: filterBy } : {}),
    }

    console.log('Typesense search parameters:', searchParameters)

    const searchResults = await client.collections(TYPESENSE_COLLECTION).documents().search(searchParameters)

    return searchResults.hits?.map((hit: any) => hit.document) || []
  } catch (error) {
    console.error('Error searching videos:', error)
    return []
  }
}


export async function getRecentVideos(limit: number = 20): Promise<VideoHit[]> {
  try {
    const searchParameters = {
      q: '*',
      query_by: 'title',
      per_page: limit,
      sort_by: 'updated_at:desc',
      filter_by: 'visibility:=public',
    }

    const searchResults = await client.collections(TYPESENSE_COLLECTION).documents().search(searchParameters)
    return searchResults.hits?.map((hit: any) => hit.document) || []
  } catch (error) {
    console.error('Error fetching recent videos:', error)
    return []
  }
}

export async function getTrendingVideos(limit: number = 20): Promise<VideoHit[]> {
  try {
    const searchParameters = {
      q: '*',
      query_by: 'title',
      per_page: limit,
      sort_by: 'updated_at:desc',
      filter_by: 'visibility:=public',
    }

    const searchResults = await client.collections(TYPESENSE_COLLECTION).documents().search(searchParameters)
    return searchResults.hits?.map((hit: any) => hit.document) || []
  } catch (error) {
    console.error('Error fetching trending videos:', error)
    return []
  }
}