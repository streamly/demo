// Industry options for profile forms
export const INDUSTRY_OPTIONS = [
  { value: 'Advertising', label: 'Advertising' },
  { value: 'Accounting', label: 'Accounting' },
  { value: 'Automotive', label: 'Automotive' },
  { value: 'Broadcast_Media', label: 'Broadcast Media' },
  { value: 'Education', label: 'Education' },
  { value: 'Financial_Services', label: 'Financial Services' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Hospitality', label: 'Hospitality' },
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'Real Estate', label: 'Real Estate' },
  { value: 'Technology', label: 'Technology' },
  { value: 'Other', label: 'Other' }
]

// Common URLs
export const URLS = {
  SIGNUP: '/auth/signup',
  SETTINGS: '/auth/settings',
  TEST_ANCHOR: '#test'
} as const

// App metadata
export const APP_INFO = {
  NAME: 'Bizilla Videos',
  DESCRIPTION: 'Stream free live events and on-demand videos from leading companies, thought leaders, and business experts. Discover launch stories, investor updates, and product explainers from innovative companies in the Bizilla network.',
  LOGO_PATH: '/logo.png'
} as const

// Common messages
export const MESSAGES = {
  LOADING: {
    DEFAULT: 'Loading...',
    APP: 'Loading Bizilla Videos',
    APP_SUBTITLE: 'Please wait while we initialize the application...',
    MORE_VIDEOS: 'Loading more videos...'
  },
  PROFILE: {
    COMPLETE_TITLE: 'Complete Your Profile',
    COMPLETE_MESSAGE: 'Please complete your profile information to access all features.',
    UPDATE_SUCCESS: 'Profile updated successfully!',
    UPDATE_ERROR: 'Failed to update profile. Please try again.'
  },
  EMPTY_STATE: {
    NO_VIDEOS: 'No videos found',
    NO_VIDEOS_SUBTITLE: 'Try adjusting your search or filters'
  }
} as const
