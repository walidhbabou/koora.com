import { Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  publishedAt: string;
  category: string;
}

interface NewsCardProps {
  news: NewsItem;
  size?: 'large' | 'medium' | 'small';
}

const NewsCard = ({ news, size = 'medium' }: NewsCardProps) => {
  const { isRTL } = useTranslation();
  const getCardSize = () => {
    switch (size) {
      case 'large':
        return 'sm:col-span-2 sm:row-span-2';
      case 'small':
        return 'col-span-1';
      default:
        return 'col-span-1';
    }
  };

  const getImageHeight = () => {
    switch (size) {
      case 'large':
        return 'h-56 sm:h-72';
      case 'small':
        return 'h-40 sm:h-48';
      default:
        return 'h-48 sm:h-56';
    }
  };

  return (
    <Card className={`${getCardSize()} overflow-hidden rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group bg-white dark:bg-[#0f1115] border border-slate-200/70 dark:border-slate-800/60 hover:border-sport-green/40`}>
      <div className={`${getImageHeight()} overflow-hidden relative rounded-t-2xl`}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <img
          src={news.imageUrl}
          alt={news.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <div className="p-3 sm:p-5 bg-white/90 dark:bg-[#0f1115]/90">
        <div className={`flex items-center justify-between mb-2 sm:mb-3 text-slate-600 dark:text-slate-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Right side (RTL): time */}
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground">{news.publishedAt}</span>
          </div>
          {/* Left side (RTL): category */}
          <div className="px-2 py-0.5 bg-sport-green/10 rounded-full">
            <span className="text-xs text-sport-green font-semibold">{news.category}</span>
          </div>
        </div>
        
        <h3 className={`font-bold text-foreground mb-2 sm:mb-3 line-clamp-2 group-hover:text-sport-green transition-colors duration-300 ${
          size === 'large' ? 'text-lg sm:text-xl leading-tight' : 'text-sm leading-snug'
        }`}>
          {news.title}
        </h3>
        
        {size !== 'small' && (
          <p className="text-muted-foreground text-xs sm:text-sm line-clamp-3 leading-relaxed">
            {news.summary}
          </p>
        )}
        
        <div className={`mt-3 sm:mt-4 ${size === 'large' ? '' : 'sm:mt-3'}`}>
          <span className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-black text-sport-green text-xs sm:text-sm font-semibold shadow hover:shadow-lg transition-all group-hover:-translate-y-0.5">
            أكمل القراءة
          </span>
        </div>
      </div>
    </Card>
  );
};

export default NewsCard;