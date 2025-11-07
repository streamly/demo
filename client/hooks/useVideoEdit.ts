'use client'
import { useState, useEffect } from 'react'
import { getAccessToken } from '@client/services/authService'
import type { VideoWithRelations } from '@shared/types/video'
import type { VideoFormData } from '@client/components/video/VideoEditForm'

interface UseVideoEditProps {
  videoId: string | null
  isOpen: boolean
  onClose: () => void
}

export function useVideoEdit({ videoId, isOpen, onClose }: UseVideoEditProps) {
  const [videoData, setVideoData] = useState<VideoWithRelations | null>(null)
  const [formData, setFormData] = useState<VideoFormData>({
    title: '',
    description: '',
    types: [],
    topics: [],
    tags: [],
    companies: [],
    people: [],
    audiences: []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  // Fetch video data when modal opens
  useEffect(() => {
    if (isOpen && videoId) {
      fetchVideoData()
    }
  }, [isOpen, videoId])

  const fetchVideoData = async () => {
    if (!videoId) return

    setIsLoading(true)
    setError(null)

    try {
      const token = await getAccessToken()
      const response = await fetch(`/api/videos/${videoId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const { data } = await response.json()
        setVideoData(data)
        setFormData({
          title: data.title || '',
          description: data.description || '',
          types: data.types || [],
          topics: data.topics || [],
          tags: data.tags || [],
          companies: data.companies || [],
          people: data.people || [],
          audiences: data.audiences || []
        })
      } else {
        setError('Failed to load video details')
      }
    } catch (err) {
      console.error('Error fetching video:', err)
      setError('Failed to load video details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!videoId) return

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setError(null)

    try {
      // TODO: Implement video update API call
      console.log('Updating video:', videoId, formData)
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSubmitStatus('success')
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      console.error('Error updating video:', err)
      setError('Failed to update video')
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof VideoFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleArrayChange = (field: keyof VideoFormData, value: string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      types: [],
      topics: [],
      tags: [],
      companies: [],
      people: [],
      audiences: []
    })
    setVideoData(null)
    setError(null)
    setSubmitStatus('idle')
    onClose()
  }

  return {
    videoData,
    formData,
    isLoading,
    isSubmitting,
    submitStatus,
    error,
    handleSubmit,
    handleInputChange,
    handleArrayChange,
    handleClose
  }
}
