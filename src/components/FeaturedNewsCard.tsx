import React from "react";
import { Clock } from "lucide-react";

interface FeaturedNewsProps {
  title: string;
  imageUrl: string;
  publishedAt: string;
  category: string;
}

const FeaturedNewsCard: React.FC<FeaturedNewsProps> = ({ title, imageUrl, publishedAt, category }) => {
  return (
    <div className="relative rounded-xl overflow-hidden shadow-lg group bg-white dark:bg-[#0f1115] border border-slate-200/70 dark:border-slate-800/60">
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-64 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-sport-green/10 rounded-full text-xs text-sport-green font-semibold">{category}</span>
          <Clock className="w-4 h-4 text-white" />
          <span className="text-xs text-white">{publishedAt}</span>
        </div>
        <h2 className="text-lg sm:text-2xl font-bold text-white leading-tight line-clamp-2">
          {title}
        </h2>
      </div>
    </div>
  );
};

export default FeaturedNewsCard;
