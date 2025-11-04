import { VideoHit } from '@client/components/types'

class TypesenseService {
  private baseUrl: string
  private apiKey: string

  constructor() {
    this.baseUrl = `https://${process.env.NEXT_PUBLIC_TYPESENSE_HOST || ''}`
    this.apiKey = process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_KEY || ''
  }

  async findVideoById(videoId: string): Promise<VideoHit | null> {
    try {
      if (!this.isConfigured()) {
        console.warn('Typesense not configured')
        return null
      }

      // Try searching by ID using filter instead of query_by
      const searchParams = new URLSearchParams({
        q: '*',
        filter_by: `id:=${videoId}`,
        per_page: '1',
      })

      console.log('Typesense search URL:', `${this.baseUrl}/collections/videos/documents/search?${searchParams}`)
      
      let response = await fetch(`${this.baseUrl}/collections/videos/documents/search?${searchParams}`, {
        headers: {
          'X-TYPESENSE-API-KEY': this.apiKey,
        },
      })

      console.log('Typesense response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Typesense search results:', data)
        if (data.hits && data.hits.length > 0) {
          console.log('Found video by ID field:', data.hits[0].document.title)
          return data.hits[0].document as VideoHit
        }
      } else {
        const errorData = await response.text()
        console.error('Typesense ID search failed:', response.status, errorData)
      }

      // Fallback: try searching by objectID using filter
      const fallbackParams = new URLSearchParams({
        q: '*',
        filter_by: `objectID:=${videoId}`,
        per_page: '1',
      })

      response = await fetch(`${this.baseUrl}/collections/videos/documents/search?${fallbackParams}`, {
        headers: {
          'X-TYPESENSE-API-KEY': this.apiKey,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.hits && data.hits.length > 0) {
          return data.hits[0].document as VideoHit
        }
      }

      // Final fallback: search in title and description for the video ID
      const allFieldsParams = new URLSearchParams({
        q: videoId,
        query_by: 'title,description',
        per_page: '10',
      })

      response = await fetch(`${this.baseUrl}/collections/videos/documents/search?${allFieldsParams}`, {
        headers: {
          'X-TYPESENSE-API-KEY': this.apiKey,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.hits && data.hits.length > 0) {
          // Find exact match in the results
          const exactMatch = data.hits.find((hit: any) => 
            hit.document.id === videoId || hit.document.objectID === videoId
          )
          if (exactMatch) {
            return exactMatch.document as VideoHit
          }
          // If no exact match, return the first result
          return data.hits[0].document as VideoHit
        }
      }

      return null
    } catch (error) {
      console.error('Failed to find video by ID:', error)
      return null
    }
  }

  async searchVideos(query: string, filters?: Record<string, any>): Promise<VideoHit[]> {
    try {
      if (!this.isConfigured()) {
        console.warn('Typesense not configured')
        return []
      }

      // Build filter string
      let filterString = ''
      if (filters) {
        const filterParts: string[] = []
        Object.entries(filters).forEach(([key, value]) => {
          if (Array.isArray(value) && value.length > 0) {
            filterParts.push(`${key}:[${value.map(v => `"${v}"`).join(',')}]`)
          } else if (value && typeof value === 'string') {
            filterParts.push(`${key}:="${value}"`)
          }
        })
        filterString = filterParts.join(' && ')
      }

      const searchParams = new URLSearchParams({
        q: query || '*',
        query_by: 'title,description,company,publisher,tags',
        per_page: '20',
        sort_by: '_text_match:desc,ranking:desc',
      })

      if (filterString) {
        searchParams.set('filter_by', filterString)
      }

      const response = await fetch(`${this.baseUrl}/collections/videos/documents/search?${searchParams}`, {
        headers: {
          'X-TYPESENSE-API-KEY': this.apiKey,
        },
      })

      if (response.ok) {
        const data = await response.json()
        return (data.hits || []).map((hit: any) => hit.document as VideoHit)
      }

      return []
    } catch (error) {
      console.error('Failed to search videos:', error)
      return []
    }
  }

  isConfigured(): boolean {
    return !!(this.apiKey && this.baseUrl && this.baseUrl !== 'https://')
  }
}

export const typesenseService = new TypesenseService()
