import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'blue' | 'white' | 'gray'
  className?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'blue', 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const colorClasses = {
    blue: 'border-blue-600',
    white: 'border-white',
    gray: 'border-gray-400'
  }

  return (
    <div 
      className={`animate-spin rounded-full border-2 border-t-transparent ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      role="status"
      aria-label="Loading..."
    />
  )
}

interface LoadingCardProps {
  count?: number
  className?: string
}

export function LoadingCard({ count = 1, className = '' }: LoadingCardProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`animate-pulse ${className}`}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Image skeleton */}
            <div className="aspect-square bg-gray-200"></div>
            
            {/* Content skeleton */}
            <div className="p-4 space-y-3">
              {/* Title */}
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              
              {/* Details */}
              <div className="grid grid-cols-2 gap-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
              
              {/* Price */}
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              
              {/* Buttons */}
              <div className="space-y-2">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="flex gap-2">
                  <div className="h-8 bg-gray-200 rounded flex-1"></div>
                  <div className="h-8 bg-gray-200 rounded flex-1"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

interface LoadingPageProps {
  message?: string
}

export function LoadingPage({ message = "Loading..." }: LoadingPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="text-gray-600 mt-4 text-lg">{message}</p>
      </div>
    </div>
  )
}

interface LoadingSectionProps {
  message?: string
  children?: React.ReactNode
}

export function LoadingSection({ 
  message = "Loading...", 
  children 
}: LoadingSectionProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="text-gray-600 mt-4">{message}</p>
        {children}
      </div>
    </div>
  )
} 