'use client'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'blue' | 'gray' | 'white'
  className?: string
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'blue',
  className = '' 
}: LoadingSpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-12 w-12'
  }

  const colors = {
    blue: 'border-blue-600 border-t-transparent',
    gray: 'border-gray-300 border-t-transparent', 
    white: 'border-white border-t-transparent'
  }

  return (
    <div 
      className={`animate-spin rounded-full border-2 ${sizes[size]} ${colors[color]} ${className}`}
    />
  )
}
