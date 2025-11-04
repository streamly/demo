'use client'
import { ReactNode, useRef, useEffect } from 'react'

interface DropdownProps {
  isOpen: boolean
  onClose: () => void
  trigger: ReactNode
  children: ReactNode
  align?: 'left' | 'right'
  className?: string
}

export default function Dropdown({ 
  isOpen, 
  onClose, 
  trigger, 
  children, 
  align = 'right',
  className = ''
}: DropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const alignmentClass = align === 'right' ? 'right-0' : 'left-0'

  return (
    <div className="relative" ref={dropdownRef}>
      {trigger}
      {isOpen && (
        <div className={`absolute ${alignmentClass} mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50 ${className}`}>
          {children}
        </div>
      )}
    </div>
  )
}

interface DropdownItemProps {
  onClick: () => void
  children: ReactNode
  className?: string
}

export function DropdownItem({ onClick, children, className = '' }: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${className}`}
    >
      {children}
    </button>
  )
}

export function DropdownSeparator() {
  return <hr className="my-1" />
}
