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
  thumbnail?: string       // URL for video thumbnail
  created_at?: number      // Unix timestamp (ms)
  updated_at?: number      // Unix timestamp (ms)

  // Legacy fields for backward compatibility (optional)
  company?: string
  publisher?: string
  host?: string
  hostDescription?: string
  industry?: string
  url?: string
  width?: number
  height?: number
  size?: number
  firstname?: string
  lastname?: string
  role?: string
  email?: string
  phone?: string
  message?: string
  ranking?: number
  score?: number
  cpv?: number
  budget?: number
  topic?: string
  audience?: string
  created?: string | number
  modified?: string | number
  active?: boolean
  category?: string[]
  channel?: string[]
  length?: string
  bid?: number[]
  billing?: number
  bookmark?: number
  cid?: number
  hash?: number[]
  plan?: number
  trial?: number
  trusted?: number
  uid?: string
  objectID?: string
}