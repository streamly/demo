export interface VideoHit {
  id: string
  title: string
  description?: string
  company?: string
  publisher?: string
  host?: string
  hostDescription?: string
  industry?: string
  thumbnail?: string
  url?: string
  duration?: number
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
  tags?: string[]
  topic?: string
  audience?: string
  format?: string
  created?: string | number
  modified?: string | number
  active?: boolean
}