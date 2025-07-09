import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: 'full' | 'icon';
}

export default function Logo({ size = 'md', className = '', variant = 'full' }: LogoProps) {
  const getHeight = () => {
    switch (size) {
      case 'sm': return 'h-6';
      case 'md': return 'h-8';
      case 'lg': return 'h-10';
      case 'xl': return 'h-12';
      default: return 'h-8';
    }
  };

  if (variant === 'icon') {
    // Return just the R icon for favicon/small spaces
    return (
      <div className={`${getHeight()} aspect-square ${className} flex items-center justify-center`}>
        <svg viewBox="0 0 40 40" className="w-full h-full">
          <defs>
            <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{stopColor:'#2563EB', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'#3B82F6', stopOpacity:1}} />
            </linearGradient>
          </defs>
          <circle cx="20" cy="20" r="20" fill="url(#iconGradient)"/>
          <circle cx="20" cy="20" r="12" fill="white" fillOpacity="0.2"/>
          <circle cx="20" cy="20" r="8" fill="white"/>
          <text x="20" y="25" textAnchor="middle" fill="url(#iconGradient)" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="10">R</text>
        </svg>
      </div>
    );
  }

  return (
    <div className={`${getHeight()} ${className} flex items-center`} style={{ width: 'auto' }}>
      <div className="relative flex items-center">
        <span className="text-2xl font-semibold text-blue-600 tracking-tight">
          Ru
        </span>
        <div className="relative">
          <span className="text-2xl font-semibold text-blue-600 tracking-tight">
            nn
          </span>
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 text-sm text-orange-500">
            ♥
          </div>
        </div>
        <span className="text-2xl font-semibold text-blue-600 tracking-tight">
          mate
        </span>
      </div>
    </div>
  );
} 