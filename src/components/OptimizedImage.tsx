import React, { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: string;
  priority?: boolean;
  style?: React.CSSProperties;
  hideLoadingOverlay?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  loading = 'lazy',
  decoding = 'async',
  onLoad,
  onError,
  placeholder,
  priority = false,
  style,
  hideLoadingOverlay = false
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [srcIndex, setSrcIndex] = useState(0);

  // Build the fallback list
  const getWebPSrc = (originalSrc: string) => {
    const lastDotIndex = originalSrc.lastIndexOf('.');
    if (lastDotIndex === -1) return originalSrc;
    return originalSrc.substring(0, lastDotIndex) + '.webp';
  };
  const fallbackList = [];
  if (placeholder) fallbackList.push(placeholder);
  if (typeof window !== 'undefined') {
    // Only check WebP support in browser
    const canvas = document.createElement('canvas');
    if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
      fallbackList.push(getWebPSrc(src));
    }
  }
  fallbackList.push(src);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setSrcIndex(0);
    // eslint-disable-next-line
  }, [src, placeholder]);

  const handleError = () => {
    if (srcIndex < fallbackList.length - 1) {
      setSrcIndex(srcIndex + 1);
    } else {
      setHasError(true);
      onError?.();
    }
  };

  if (hasError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`} style={style}>
        <span className="text-gray-500 text-sm">Image not available</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={style}>
      {/* Placeholder/Loading state */}
      {!isLoaded && !hideLoadingOverlay && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={fallbackList[srcIndex]}
        alt={alt}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        style={style}
        loading={priority ? 'eager' : loading}
        decoding={decoding}
        onLoad={() => {
          if (!isLoaded) {
            setIsLoaded(true);
            onLoad?.();
          }
        }}
        onError={handleError}
      />
    </div>
  );
};

export default OptimizedImage; 