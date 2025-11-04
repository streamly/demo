'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@client/components/auth/AuthProvider'
import Modal from '@client/components/ui/Modal'
import Button from '@client/components/ui/Button'
import Alert from '@client/components/ui/Alert'
import { InputField, SelectField } from '@client/components/ui/FormField'
import { INDUSTRY_OPTIONS, MESSAGES } from '@client/constants'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { userProfile, updateUserProfile, getMissingProfileFields } = useAuth()
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    position: '',
    company: '',
    industry: '',
    url: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (isOpen && userProfile) {
      setFormData({
        firstname: userProfile.firstname || '',
        lastname: userProfile.lastname || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        position: userProfile.position || '',
        company: userProfile.company || '',
        industry: userProfile.industry || '',
        url: userProfile.url || ''
      })
    }
  }, [isOpen, userProfile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      await updateUserProfile(formData)
      setSubmitStatus('success')
      setTimeout(() => {
        onClose()
        setSubmitStatus('idle')
      }, 1000)
    } catch (error) {
      console.error('Failed to update profile:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const missingFields = getMissingProfileFields()
  const hasIncompleteProfile = missingFields.length > 0

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Edit Profile"
      maxWidth="2xl"
      backdrop="light"
    >

          {hasIncompleteProfile && (
            <Alert 
              variant="info" 
              title={MESSAGES.PROFILE.COMPLETE_TITLE}
              className="mb-6"
            >
              {MESSAGES.PROFILE.COMPLETE_MESSAGE}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="First Name"
                id="firstname"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                required
              />

              <InputField
                label="Last Name"
                id="lastname"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                required
              />
            </div>

            <InputField
              label="Email"
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled
              className="opacity-60"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Phone"
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />

              <InputField
                label="Title / Position"
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Company / Organization"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
              />

              <SelectField
                label="Industry"
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                options={INDUSTRY_OPTIONS}
                placeholder="Select an industry"
                required
              />
            </div>

            <InputField
              label="Website URL"
              type="url"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://example.com"
            />

            <div className="flex justify-end gap-3 pt-6">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Save Profile
              </Button>
            </div>

            {submitStatus === 'success' && (
              <div className="text-green-600 text-sm text-center">
                {MESSAGES.PROFILE.UPDATE_SUCCESS}
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="text-red-600 text-sm text-center">
                {MESSAGES.PROFILE.UPDATE_ERROR}
              </div>
            )}
          </form>
    </Modal>
  )
}
