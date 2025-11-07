import { UserProfile } from './user'

export interface CoreVideoFields {
  id: string
  title?: string
  description?: string
  duration: number
  visibility: string
  format: string
}

export interface VideoRelationships {
  types?: string[]
  topics?: string[]
  tags?: string[]
  companies?: string[]
  people?: string[]
  audiences?: string[]
}

export type VideoUser = Pick<UserProfile, 'id'> & Partial<Pick<UserProfile, 'givenName' | 'familyName' | 'email' | 'company'>>

export interface BaseVideo extends CoreVideoFields {
  width: number
  height: number
  fileSize: number
  createdAt?: Date | number
  updatedAt?: Date | number
  thumbnailId?: string
}

export interface VideoWithRelations extends BaseVideo, VideoRelationships {
  user: VideoUser
}

export interface TypesenseVideo extends CoreVideoFields, VideoRelationships {
  thumbnail?: string
}

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

export interface VideoMetadata {
  filename: string
  width: number
  height: number
  size: number
  duration: number
}

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