'use client'
import { UserProfileInput } from '@/shared/types/user'
import { useAuth } from '@client/components/auth/AuthProvider'
import Alert from '@client/components/ui/Alert'
import Button from '@client/components/ui/Button'
import { InputField, SelectField } from '@client/components/ui/FormField'
import Modal from '@client/components/ui/Modal'
import { INDUSTRY_OPTIONS, MESSAGES } from '@client/constants'
import { useEffect, useState } from 'react'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { userProfile, updateUserProfile, getMissingProfileFields } = useAuth()
  const [formData, setFormData] = useState<UserProfileInput>({
    givenName: '',
    familyName: '',
    email: '',
    phone: '',
    position: '',
    company: '',
    industry: '',
    website: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen && userProfile) {
      setFormData({
        givenName: userProfile.givenName || '',
        familyName: userProfile.familyName || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        position: userProfile.position || '',
        company: userProfile.company || '',
        industry: userProfile.industry || '',
        website: userProfile.website || ''
      })
      setFieldErrors({})
      setSubmitStatus('idle')
    }
  }, [isOpen, userProfile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setFieldErrors({})

    // Client-side validation matching backend schema
    const errors: Record<string, string> = {}

    // Required fields with length validation
    const requiredFields = {
      givenName: { label: 'First Name', maxLength: 100 },
      familyName: { label: 'Last Name', maxLength: 100 },
      position: { label: 'Title / Position', maxLength: 100 },
      company: { label: 'Company / Organization', maxLength: 100 },
      industry: { label: 'Industry', maxLength: 100 },
      phone: { label: 'Phone', maxLength: null },
      email: { label: 'Email', maxLength: null }
    }

    for (const [field, config] of Object.entries(requiredFields)) {
      const value = formData[field as keyof UserProfileInput]
      const trimmedValue = typeof value === 'string' ? value.trim() : ''

      if (!trimmedValue) {
        errors[field] = `${config.label} is required`
      } else if (config.maxLength && trimmedValue.length > config.maxLength) {
        errors[field] = `${config.label} must be ${config.maxLength} characters or less`
      }
    }

    // Website validation (optional but must be valid URL if provided)
    if (formData.website && formData.website.trim()) {
      const website = formData.website.trim()
      if (website.length > 255) {
        errors.website = 'Website URL must be 255 characters or less'
      } else {
        try {
          new URL(website)
        } catch {
          errors.website = 'Website URL must be a valid URL'
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setSubmitStatus('error')
      setIsSubmitting(false)
      return
    }

    const success = await updateUserProfile(formData)

    if (success) {
      setSubmitStatus('success')
      setTimeout(() => {
        onClose()
        setSubmitStatus('idle')
      }, 1000)
    } else {
      setSubmitStatus('error')
    }

    setIsSubmitting(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
      if (Object.keys(fieldErrors).length === 1) {
        setSubmitStatus('idle')
      }
    }
  }

  const missingFields = getMissingProfileFields()
  const hasIncompleteProfile = missingFields.length > 0

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Profile"
      maxWidth="2xl"
      backdrop="blur"
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
        <InputField
          label="First Name"
          id="givenName"
          name="givenName"
          value={formData.givenName!}
          onChange={handleChange}
          required
          error={fieldErrors.givenName}
        />

        <InputField
          label="Last Name"
          id="familyName"
          name="familyName"
          value={formData.familyName!}
          onChange={handleChange}
          required
          error={fieldErrors.familyName}
        />

        <InputField
          label="Email"
          type="email"
          id="email"
          name="email"
          value={formData.email!}
          onChange={handleChange}
          disabled
          className="opacity-60"
          error={fieldErrors.email}
        />

        <InputField
          label="Phone"
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone!}
          onChange={handleChange}
          required
          error={fieldErrors.phone}
        />

        <InputField
          label="Company / Organization"
          id="company"
          name="company"
          value={formData.company!}
          onChange={handleChange}
          required
          error={fieldErrors.company}
        />

        <InputField
          label="Title / Position"
          id="position"
          name="position"
          value={formData.position!}
          onChange={handleChange}
          required
          error={fieldErrors.position}
        />

        <SelectField
          label="Industry"
          id="industry"
          name="industry"
          value={formData.industry!}
          onChange={handleChange}
          options={INDUSTRY_OPTIONS}
          placeholder="Select an industry"
          required
          error={fieldErrors.industry}
        />

        <InputField
          label="Website URL"
          type="url"
          id="website"
          name="website"
          value={formData.website!}
          onChange={handleChange}
          placeholder="https://example.com"
          error={fieldErrors.website}
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

        {submitStatus === 'error' && Object.keys(fieldErrors).length === 0 && (
          <div className="text-red-600 text-sm text-center">
            {MESSAGES.PROFILE.UPDATE_ERROR}
          </div>
        )}
      </form>
    </Modal>
  )
}
