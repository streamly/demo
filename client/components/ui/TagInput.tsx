'use client'
import { useState, KeyboardEvent } from 'react'

interface TagInputProps {
  label: string
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  className?: string
}

export default function TagInput({ 
  label, 
  value, 
  onChange, 
  placeholder = `Add ${label.toLowerCase()}...`,
  className = '' 
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      onChange(value.slice(0, -1))
    }
  }

  const addTag = () => {
    const trimmedValue = inputValue.trim()
    if (trimmedValue && !value.includes(trimmedValue)) {
      onChange([...value, trimmedValue])
      setInputValue('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove))
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      <div className="border border-gray-300 rounded-md p-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
        {/* Tags display */}
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-blue-600 hover:text-blue-800 ml-1"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        
        {/* Input field */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={placeholder}
          className="w-full border-none outline-none text-sm"
        />
      </div>
      
      <p className="text-xs text-gray-500">
        Press Enter or comma to add. Click × to remove.
      </p>
    </div>
  )
}
