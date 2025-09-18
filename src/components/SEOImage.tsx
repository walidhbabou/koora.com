import React, { useState } from 'react';

interface SEOImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  placeholder?: string;
  onError?: () => void;
  title?: string;
  quality?: number;
}

const SEOImage: React.FC<SEOImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  placeholder = '/placeholder.svg',
  onError,
  title,
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    setImgSrc(placeholder);
    if (onError) {
      onError();
    }
  };

  const generateSrcSet = (baseSrc: string) => {
    if (baseSrc.startsWith('http') && !baseSrc.includes('placeholder')) {
      // For external images, we can't generate srcset
      return undefined;
    }
    
    // For local images, generate different sizes
    const extensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = extensions.find(e => baseSrc.toLowerCase().includes(e));
    
    if (ext && !baseSrc.includes('placeholder')) {
      const baseUrl = baseSrc.replace(ext, '');
      return `
        ${baseUrl}${ext} 1x,
        ${baseUrl}@2x${ext} 2x
      `.trim();
    }
    
    return undefined;
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}
      
      <img
        src={imgSrc}
        alt={alt}
        title={title || alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        width={width}
        height={height}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        srcSet={generateSrcSet(src)}
        sizes={width ? `${width}px` : undefined}
        decoding="async"
        // SEO and accessibility improvements
        itemProp="image"
        role="img"
      />
      
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 text-sm">
          صورة غير متاحة
        </div>
      )}
    </div>
  );
};

export default SEOImage;