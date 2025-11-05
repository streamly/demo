'use client'

interface LoadingOverlayProps {
  isVisible: boolean
  message?: string
}

export default function LoadingOverlay({ isVisible, message = 'Loading...' }: LoadingOverlayProps) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="text-gray-700">{message}</span>
      </div>
    </div>
  )
}
