'use client'
import LoadingSpinner from '@client/components/ui/LoadingSpinner'

interface LoadingScreenProps {
  title?: string
  subtitle?: string
  fullScreen?: boolean
}

export default function LoadingScreen({ 
  title = 'Loading...',
  subtitle = 'Please wait while we load the content',
  fullScreen = true 
}: LoadingScreenProps) {
  const containerClass = fullScreen 
    ? 'flex items-center justify-center min-h-[calc(100vh-5rem)] bg-gray-50'
    : 'flex items-center justify-center py-12'

  return (
    <div className={containerClass}>
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600">{subtitle}</p>
      </div>
    </div>
  )
}
