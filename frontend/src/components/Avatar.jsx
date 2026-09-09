import React, { useState, useEffect } from 'react';

export const getMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  let base = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  base = base.replace(/\/api\/?$/, '');
  if (base.endsWith('/')) {
    base = base.slice(0, -1);
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
};

export const Avatar = ({ src, name = 'Client', size = 'w-10 h-10', textSize = 'text-base', className = '' }) => {
  const [error, setError] = useState(false);
  const mediaUrl = getMediaUrl(src);

  useEffect(() => {
    setError(false);
  }, [src]);

  const initial = name && name.trim() ? name.trim()[0].toUpperCase() : 'C';

  if (mediaUrl && !error) {
    return (
      <img
        src={mediaUrl}
        alt={name}
        onError={() => setError(true)}
        className={`${size} rounded-full object-cover border-2 border-emerald-500 shadow-md ${className}`}
      />
    );
  }

  return (
    <div
      className={`${size} rounded-full bg-emerald-700 text-white font-bold ${textSize} flex items-center justify-center border-2 border-emerald-500 shadow-md shrink-0 ${className}`}
    >
      {initial}
    </div>
  );
};
