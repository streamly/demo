'use client'
import Image from 'next/image'

interface LogoProps {
  showTitle?: boolean
  title?: string
  onClick?: () => void
}

export default function Logo({ showTitle = true, title = "Bizilla Videos", onClick }: LogoProps) {
  const handleClick = onClick || (() => window.location.href = '/')

  return (
    <div className="flex items-center gap-3">
      <button 
        onClick={handleClick}
        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
      >
        <Image
          src="/logo.png"
          alt="Bizilla Videos"
          width={32}
          height={32}
          className="w-8 h-8"
        />
        {showTitle && (
          <h1 className="text-2xl font-semibold text-gray-900 hidden md:block cursor-pointer">
            {title}
          </h1>
        )}
      </button>
    </div>
  )
}
