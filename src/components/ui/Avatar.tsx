import React from 'react';

interface AvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Generate a consistent color based on a string
function stringToColor(string: string) {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Use HSL for vibrant, distinct colors
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 70%, 40%)`;
}

function getInitials(name: string) {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].substring(0, 1).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ name, imageUrl, size = 'md', className = '' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg'
  };

  const bgColor = stringToColor(name || 'Unknown');
  const initials = getInitials(name || 'Unknown');

  return (
    <div 
      className={`relative inline-flex items-center justify-center rounded-full shrink-0 overflow-hidden font-medium text-white ${sizeClasses[size]} ${className}`}
      style={!imageUrl ? { backgroundColor: bgColor } : {}}
      title={name}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
