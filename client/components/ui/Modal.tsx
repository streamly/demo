'use client'
import { ReactNode } from 'react'
import Button from '@client/components/ui/Button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  showCloseButton?: boolean
  backdrop?: 'light' | 'dark'
}

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = 'lg',
  showCloseButton = true,
  backdrop = 'light'
}: ModalProps) {
  if (!isOpen) return null

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  }

  const backdrops = {
    light: 'bg-black bg-opacity-20',
    dark: 'bg-black bg-opacity-50'
  }

  return (
    <div className={`fixed inset-0 ${backdrops[backdrop]} flex items-center justify-center z-50 p-4`}>
      <div className={`bg-white rounded-lg shadow-xl ${maxWidths[maxWidth]} w-full max-h-[90vh] overflow-y-auto`}>
        {(title || showCloseButton) && (
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            {title && (
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl ml-auto"
              >
                ×
              </button>
            )}
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
