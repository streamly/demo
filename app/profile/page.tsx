'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { useAuth } from '../src/components/AuthProvider'
import FormField from '../src/components/FormField'
import SelectField from '../src/components/SelectField'

const industries = [
  { value: 'Advertising', label: 'Advertising' },
  { value: 'Accounting', label: 'Accounting' },
  { value: 'Automotive', label: 'Automotive' },
  { value: 'Broadcast_Media', label: 'Broadcast Media' },
  { value: 'Education', label: 'Education' },
  { value: 'Financial_Services', label: 'Financial Services' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Hospitality', label: 'Hospitality' },
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Technology', label: 'Technology' },
  { value: 'Other', label: 'Other' }
]

function ProfilePageContent() {
  const { isAuthenticated, isLoading, userProfile, updateUserProfile, getMissingProfileFields } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [profileData, setProfileData] = useState({
    firstname: '',
    lastname: '',
    position: '',
    company: '',
    industry: '',
    phone: '',
    email: '',
    url: ''
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, isLoading, router])

  // Load user profile data when available
  useEffect(() => {
    if (userProfile) {
      setProfileData({
        firstname: userProfile.firstname || '',
        lastname: userProfile.lastname || '',
        position: userProfile.position || '',
        company: userProfile.company || '',
        industry: userProfile.industry || '',
        phone: userProfile.phone || '',
        email: userProfile.email || '',
        url: userProfile.url || ''
      })
    }
  }, [userProfile])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const success = await updateUserProfile(profileData)
      if (success) {
        setSubmitStatus('success')
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Failed to save profile:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get missing fields for validation
  const missingFields = isAuthenticated ? getMissingProfileFields() : []
  const hasIncompleteProfile = missingFields.length > 0

  // Check if user was redirected from video access or signin
  const reason = searchParams.get('reason')
  const isFromVideoAccess = reason === 'video-access'
  const isFromSignin = reason === 'signin-incomplete'

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="text-2xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
          >
            ← Bizilla Videos
          </button>
        </div>
      </header>

      {/* Profile Container */}
      <div className="container mx-auto py-12 px-6">
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-8">
                <h1 className="text-2xl font-semibold text-gray-900 text-center mb-8">
                  Edit Your Profile
                </h1>

                {/* Missing Fields Alert */}
                {hasIncompleteProfile && (
                  <div className={`border rounded-md p-4 mb-6 ${
                    isFromVideoAccess || isFromSignin
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-amber-50 border-amber-200'
                    }`}>
                    <div className="flex">
                      <div className="flex-shrink-0">
                        {isFromVideoAccess || isFromSignin ? (
                          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="ml-3">
                        <h3 className={`text-sm font-medium ${
                          isFromVideoAccess || isFromSignin ? 'text-blue-800' : 'text-amber-800'
                          }`}>
                          {isFromVideoAccess
                            ? 'Complete Your Profile to Watch Videos'
                            : isFromSignin
                            ? 'Welcome! Complete Your Profile'
                            : 'Profile Incomplete'
                          }
                        </h3>
                        <div className={`mt-2 text-sm ${
                          isFromVideoAccess || isFromSignin ? 'text-blue-700' : 'text-amber-700'
                          }`}>
                          <p>
                            {isFromVideoAccess
                              ? 'To access video content, please complete your profile by filling out the required fields'
                              : isFromSignin
                              ? 'To get started with Bizilla Videos, please complete your profile information below'
                              : 'Please complete the following required fields'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                      id="firstname"
                      name="firstname"
                      label="First Name"
                      value={profileData.firstname}
                      onChange={handleInputChange}
                      required
                    />

                    <FormField
                      id="lastname"
                      name="lastname"
                      label="Last Name"
                      value={profileData.lastname}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <FormField
                    id="position"
                    name="position"
                    label="Title / Position"
                    value={profileData.position}
                    onChange={handleInputChange}
                    required
                  />

                  <FormField
                    id="company"
                    name="company"
                    label="Company / Organization"
                    value={profileData.company}
                    onChange={handleInputChange}
                    required
                  />

                  <SelectField
                    id="industry"
                    name="industry"
                    label="Industry"
                    value={profileData.industry}
                    onChange={handleInputChange}
                    options={industries}
                    required
                    placeholder="Select an industry"
                  />

                  <FormField
                    id="phone"
                    name="phone"
                    label="Phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    required
                  />

                  <FormField
                    id="email"
                    name="email"
                    label="Email"
                    type="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    required
                    disabled
                  />

                  <FormField
                    id="url"
                    name="url"
                    label="Website"
                    type="url"
                    value={profileData.url}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                  />

                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      By using this service, you acknowledge and agree that you are
                      voluntarily providing your profile information to content
                      providers. You further confirm that you have read,
                      understood, and accepted our Terms of Service and Privacy Policy.
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Saving...' : 'Save'}
                    </button>

                    {submitStatus === 'success' && (
                      <span className="text-sm text-green-600">✓ Profile saved successfully!</span>
                    )}

                    {submitStatus === 'error' && (
                      <span className="text-sm text-red-600">✗ Failed to save profile</span>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main component with Suspense boundary
export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    }>
      <ProfilePageContent />
    </Suspense>
  )
}
