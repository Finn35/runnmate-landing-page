'use client'

import React, { useState, useRef, useEffect } from 'react'

interface SearchProps {
  placeholder?: string
  onSearch: (query: string) => void
  value?: string
  className?: string
  showSuggestions?: boolean
  suggestions?: string[]
}

export function Search({
  placeholder = "Search shoes...",
  onSearch,
  value = "",
  className = "",
  showSuggestions = false,
  suggestions = []
}: SearchProps) {
  const [query, setQuery] = useState(value)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // Filter suggestions based on query
  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5) // Limit to 5 suggestions

  useEffect(() => {
    setQuery(value)
  }, [value])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query.trim())
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setQuery(newQuery)
    setIsOpen(showSuggestions && newQuery.length > 0)
    setSelectedIndex(-1)
    
    // Live search (debounced)
    if (newQuery.length > 2) {
      onSearch(newQuery.trim())
    } else if (newQuery.length === 0) {
      onSearch('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredSuggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          const selected = filteredSuggestions[selectedIndex]
          setQuery(selected)
          onSearch(selected)
        } else {
          onSearch(query.trim())
        }
        setIsOpen(false)
        setSelectedIndex(-1)
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    onSearch(suggestion)
    setIsOpen(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  const handleClear = () => {
    setQuery('')
    onSearch('')
    setIsOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg 
              className="h-5 w-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(showSuggestions && query.length > 0)}
            onBlur={() => {
              // Delay to allow suggestion clicks
              setTimeout(() => setIsOpen(false), 150)
            }}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
          />
          
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          )}
        </div>
      </form>

      {/* Suggestions dropdown */}
      {isOpen && showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <ul ref={listRef} className="max-h-60 overflow-auto py-1">
            {filteredSuggestions.map((suggestion, index) => (
              <li key={suggestion}>
                <button
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
                    index === selectedIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {suggestion}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// Quick search suggestions for shoes
export const SHOE_SUGGESTIONS = [
  'Nike Air Zoom Pegasus',
  'Adidas Ultraboost',
  'Hoka Clifton',
  'ASICS Gel Nimbus',
  'Brooks Ghost',
  'New Balance Fresh Foam',
  'Salomon Speedcross',
  'Mizuno Wave Rider',
  'Nike Vaporfly',
  'Adidas Adizero',
  'Hoka Bondi',
  'ASICS Gel Kayano',
  'Brooks Adrenaline',
  'New Balance 1080',
  'Salomon Sense Ride',
] 