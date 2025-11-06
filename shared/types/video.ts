import { UserData } from './user'

// Core video fields that are shared across all systems
export interface CoreVideoFields {
  id: string
  title?: string
  description?: string
  duration: number
  visibility: string
  format: string
}

// Video relationships/metadata fields
export interface VideoRelationships {
  types?: string[]
  topics?: string[]
  tags?: string[]
  companies?: string[]
  people?: string[]
  audiences?: string[]
}

// Use existing shared user type - make all fields optional except id
export type VideoUser = Pick<UserData, 'id'> & Partial<Pick<UserData, 'givenName' | 'familyName' | 'email' | 'company'>>

// Database-specific video data structure
export interface BaseVideo extends CoreVideoFields {
  userId: string
  width: number
  height: number
  fileSize: number
  createdAt?: Date | number
  updatedAt?: Date | number
}

// Extended video data with relationships (for database queries)
export interface VideoWithRelations extends BaseVideo, VideoRelationships {
  user?: VideoUser
}

// Typesense-specific video data structure
export interface TypesenseVideo extends CoreVideoFields, VideoRelationships {
  thumbnail?: string
  created_at: number  // Unix timestamp in milliseconds
  updated_at: number  // Unix timestamp in milliseconds
  uid: string         // User ID for filtering
  
  // Legacy fields for backward compatibility
  objectID?: string
  company?: string
  channel?: string
  gated?: boolean
  billing?: string
  score?: number
  __position?: number
  ranking?: number
  [key: string]: any
}

// Input for creating/updating videos
export interface VideoInput {
  title?: string
  description?: string
  visibility?: string
  format?: string
  thumbnail?: string
  types?: string[]
  topics?: string[]
  tags?: string[]
  companies?: string[]
  people?: string[]
  audiences?: string[]
}

// Video metadata from upload completion
export interface VideoMetadata {
  filename: string
  width: number
  height: number
  size: number
  duration: number
}

// Draft video creation result
export interface DraftVideo {
  id: string
  userId: string
  duration: number
  width: number
  height: number
  fileSize: number
  visibility: string
  format: string
  createdAt: Date
  updatedAt: Date
}
