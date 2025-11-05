'use client'
import { ReactNode, useEffect, useState } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl'
  showCloseButton?: boolean
  backdrop?: 'light' | 'dark' | 'blur'
  fullScreen?: boolean
  className?: string
}

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = 'lg',
  showCloseButton = true,
  backdrop = 'blur',
  fullScreen = false,
  className = ''
}: ModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setIsClosing(false)
    }
  }, [isOpen])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose()
    }, 200)
  }

  // Close on ESC key
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && handleClose()
    if (isOpen) {
      window.addEventListener('keydown', onEsc)
      return () => window.removeEventListener('keydown', onEsc)
    }
  }, [isOpen])

  if (!isOpen && !isVisible) return null

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '7xl': 'max-w-7xl'
  }

  const backdrops = {
    light: 'bg-black/20',
    dark: 'bg-black/50',
    blur: 'bg-black/75 backdrop-blur-sm'
  }

  const containerClasses = fullScreen 
    ? 'fixed inset-0 z-50 flex items-center justify-center px-2 sm:px-4 py-2 sm:py-6'
    : 'fixed inset-0 z-50 flex items-center justify-center p-4'

  const modalClasses = fullScreen
    ? `relative w-full ${maxWidths[maxWidth]} min-h-[90vh] sm:min-h-[60vh] max-h-[95vh] sm:max-h-[85vh] overflow-hidden rounded-none sm:rounded-lg border-0 sm:border border-gray-200 bg-white shadow-2xl flex flex-col`
    : `bg-white rounded-lg shadow-xl ${maxWidths[maxWidth]} w-full max-h-[90vh] overflow-y-auto`

  return (
    <div 
      className={`${containerClasses} ${backdrops[backdrop]} transition-opacity duration-200 ${
        isVisible && !isClosing ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      <div className={`${modalClasses} ${className} transition-all duration-200 ${
        isVisible && !isClosing 
          ? 'opacity-100 scale-100 translate-y-0' 
          : 'opacity-0 scale-95 translate-y-4'
      }`}>
        {showCloseButton && (
          <button
            onClick={handleClose}
            className={fullScreen 
              ? "absolute right-2 sm:right-4 top-2 sm:top-4 z-10 flex h-10 w-10 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              : "absolute right-4 top-4 z-10 text-gray-400 hover:text-gray-600 text-2xl"
            }
          >
            ×
          </button>
        )}
        
        {title && !fullScreen && (
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          </div>
        )}
        
        <div className={fullScreen ? "flex-1 overflow-hidden" : "p-6"}>
          {children}
        </div>
      </div>
    </div>
  )
}
