import React, { useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Clock, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { generateSlug } from "@/utils/slugUtils";

interface NewsSliderItem {
  id: string;
  title: string;
  imageUrl: string;
  publishedAt: string;
  summary?: string;
  source?: 'wordpress' | 'supabase';
}

interface NewsSliderProps {
  news: NewsSliderItem[];
  autoplay?: boolean;
  autoplayDelay?: number;
  showThumbnails?: boolean;
  className?: string;
}

const NewsSlider: React.FC<NewsSliderProps> = ({
  news,
  autoplay = true,
  autoplayDelay = 5000,
  showThumbnails = true,
  className = "",
}) => {
  const [current, setCurrent] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(autoplay);
  const [isLoading, setIsLoading] = React.useState(true);
  const max = news.length;

  const goPrev = useCallback(() => {
    setCurrent((c) => (c === 0 ? max - 1 : c - 1));
  }, [max]);

  const goNext = useCallback(() => {
    setCurrent((c) => (c === max - 1 ? 0 : c + 1));
  }, [max]);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || max <= 1) return;

    const interval = setInterval(goNext, autoplayDelay);
    return () => clearInterval(interval);
  }, [isPlaying, autoplayDelay, goNext, max]);

  // Touch/swipe support
  const [touchStart, setTouchStart] = React.useState(0);
  const [touchEnd, setTouchEnd] = React.useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) goNext();
    if (isRightSwipe) goPrev();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
      if (e.key === " ") {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [goPrev, goNext, isPlaying]);

  if (max === 0) return null;

  return (
  <div className={`relative w-full mx-auto ${className}`}>
      {/* Main Slider */}
      <div
        className="relative overflow-hidden shadow-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900" // removed rounded-2xl
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Loading skeleton */}
        {isLoading && (
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse z-50" />
        )}

        {/* Slider container */}
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {news.map((item, index) => (
            <div key={item.id} className="w-full flex-shrink-0 relative">
              <Link
                to={`/news/${generateSlug(item.title)}`}
                className="block group relative overflow-hidden"
                onMouseEnter={() => setIsPlaying(false)}
                onMouseLeave={() => setIsPlaying(autoplay)}
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-72 sm:h-80 md:h-96 object-cover group-hover:scale-110 transition-transform duration-700" // no rounded
                  onLoad={() => index === 0 && setIsLoading(false)}
                  loading={index === 0 ? "eager" : "lazy"}
                />

                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />

                {/* Content overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 space-y-3">
                  {/* Category badge */}
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-sport-primary/20 backdrop-blur-sm border border-white/20">
                    <span className="text-xs font-medium text-white">
                      أخبار رياضية
                    </span>
                  </div>

                  {/* Date and reading time */}
                  <div className="flex items-center gap-4 text-white/80">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{item.publishedAt}</span>
                    </div>
                    {/* <span className="text-sm">قراءة 3 دقائق</span> */}
                  </div>

                  {/* Title */}
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight line-clamp-2 group-hover:text-sport-light transition-colors duration-300">
                    {item.title}
                  </h2>

                  {/* Summary */}
                  {item.summary && (
                    <p className="text-sm sm:text-base text-white/90 leading-relaxed line-clamp-2 max-w-2xl">
                      {item.summary}
                    </p>
                  )}
                </div>

                {/* Read more indicator */}
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ChevronLeft className="w-5 h-5 text-white" />
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        {max > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md text-white p-3 hover:bg-white/20 transition-all duration-300 border border-white/20 group" // removed rounded-full
              aria-label="الخبر السابق"
            >
              <ChevronRight className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={goNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md text-white p-3 hover:bg-white/20 transition-all duration-300 border border-white/20 group" // removed rounded-full
              aria-label="الخبر التالي"
            >
              <ChevronLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </>
        )}

        {/* Autoplay control */}
        {max > 1 && autoplay && (
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute top-4 left-4 bg-white/10 backdrop-blur-md text-white p-2 hover:bg-white/20 transition-all duration-300 border border-white/20" // removed rounded-full
            aria-label={isPlaying ? "إيقاف التشغيل التلقائي" : "تشغيل التلقائي"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Progress indicators */}
      {max > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {news.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`relative overflow-hidden rounded-full transition-all duration-300 ${
                idx === current
                  ? "w-8 h-3 bg-sport-primary"
                  : "w-3 h-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
              }`}
              aria-label={`الانتقال إلى الخبر ${idx + 1}`}
            >
              {idx === current && isPlaying && (
                <div
                  className="absolute inset-0 bg-sport-light rounded-full"
                  style={{
                    animation: `progress ${autoplayDelay}ms linear infinite`,
                  }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Thumbnail navigation */}
      {showThumbnails && max > 1 && (
        <div className="mt-6 hidden sm:block">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {news.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setCurrent(idx)}
                className={`flex-shrink-0 group relative ${
                  idx === current ? "ring-2 ring-sport-primary" : ""
                } overflow-hidden transition-all duration-300 hover:scale-105`} // removed rounded-lg
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-20 h-14 object-cover" // no rounded
                  loading="lazy"
                />
                <div
                  className={`absolute inset-0 ${
                    idx === current
                      ? "bg-sport-primary/20"
                      : "bg-black/40 group-hover:bg-black/20"
                  } transition-colors duration-300`}
                />
                {idx === current && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom styles for progress animation */}
      <style>{`
        @keyframes progress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default NewsSlider;
