import { Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

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
        return 'h-48 sm:h-64';
      case 'small':
        return 'h-32 sm:h-36';
      default:
        return 'h-40 sm:h-48';
    }
  };

  return (
    <Card className={`${getCardSize()} overflow-hidden hover:shadow-[var(--shadow-hover)] transition-all duration-300 cursor-pointer group bg-gradient-to-b from-card to-sport-light/30 border hover:border-sport-green/30`}>
      <div className={`${getImageHeight()} overflow-hidden relative`}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <img
          src={news.imageUrl}
          alt={news.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <div className="p-3 sm:p-5 bg-gradient-to-t from-background to-transparent">
        <div className="flex items-center space-x-2 mb-2 sm:mb-3">
          <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
          <span className="text-xs text-muted-foreground">{news.publishedAt}</span>
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
        
        {size === 'large' && (
          <div className="mt-3 sm:mt-4 flex items-center text-sport-green text-xs sm:text-sm font-medium group-hover:translate-x-1 transition-transform duration-300">
            اقرأ المزيد ←
          </div>
        )}
      </div>
    </Card>
  );
};

export default NewsCard;