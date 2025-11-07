export interface VideoHit {
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
  thumbnail_id?: string    // ID for video thumbnail (new field)
  created_at?: number      // Unix timestamp (ms)
  updated_at?: number      // Unix timestamp (ms)
}