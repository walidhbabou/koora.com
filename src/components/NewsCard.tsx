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
        return 'col-span-2 row-span-2';
      case 'small':
        return 'col-span-1';
      default:
        return 'col-span-1';
    }
  };

  const getImageHeight = () => {
    switch (size) {
      case 'large':
        return 'h-64';
      case 'small':
        return 'h-32';
      default:
        return 'h-48';
    }
  };

  return (
    <Card className={`${getCardSize()} overflow-hidden hover:shadow-[var(--shadow-hover)] transition-all duration-300 cursor-pointer group`}>
      <div className={`${getImageHeight()} overflow-hidden`}>
        <img
          src={news.imageUrl}
          alt={news.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{news.publishedAt}</span>
          <span className="text-xs text-sport-green font-medium">{news.category}</span>
        </div>
        
        <h3 className={`font-bold text-foreground mb-2 line-clamp-2 ${
          size === 'large' ? 'text-xl' : 'text-sm'
        }`}>
          {news.title}
        </h3>
        
        {size !== 'small' && (
          <p className="text-muted-foreground text-sm line-clamp-3">
            {news.summary}
          </p>
        )}
      </div>
    </Card>
  );
};

export default NewsCard;