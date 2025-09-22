import React from "react";
import { Link } from "react-router-dom";
import { Clock } from "lucide-react";

interface NewsSliderItem {
  id: string;
  title: string;
  imageUrl: string;
  publishedAt: string;
}

interface NewsSliderProps {
  news: NewsSliderItem[];
}

const NewsSlider: React.FC<NewsSliderProps> = ({ news }) => {
  const [current, setCurrent] = React.useState(0);
  const max = news.length;

  const goPrev = () => setCurrent((c) => (c === 0 ? max - 1 : c - 1));
  const goNext = () => setCurrent((c) => (c === max - 1 ? 0 : c + 1));

  if (max === 0) return null;

  return (
    <div className="relative w-full max-w-2xl mx-auto mb-6">
      <div className="overflow-hidden rounded-xl shadow-lg">
        <Link to={`/news/${news[current].id}`}
          className="block group">
          <img
            src={news[current].imageUrl}
            alt={news[current].title}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
          <div className="absolute bottom-0 left-0 right-0 p-4 z-20 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-white" />
              <span className="text-xs text-white">{news[current].publishedAt}</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-white leading-tight line-clamp-2">
              {news[current].title}
            </h2>
          </div>
        </Link>
      </div>
      {/* Navigation arrows */}
      {max > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full p-2 hover:bg-black/80 z-30"
            aria-label="Précédent"
          >
            &#8592;
          </button>
          <button
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full p-2 hover:bg-black/80 z-30"
            aria-label="Suivant"
          >
            &#8594;
          </button>
        </>
      )}
      {/* Dots */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 z-30">
        {news.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-3 h-3 rounded-full ${idx === current ? 'bg-blue-600' : 'bg-gray-400'} transition-all`}
            aria-label={`Aller à la news ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default NewsSlider;
