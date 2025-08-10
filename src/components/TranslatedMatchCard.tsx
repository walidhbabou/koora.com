import React, { useEffect, useState } from "react";
import { Clock, Play, Globe } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFootballTranslation } from "@/services/translationService";

interface Match {
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  time: string;
  status: 'live' | 'upcoming' | 'finished';
  competition: string;
  homeLogo?: string;
  awayLogo?: string;
}

interface MatchCardProps {
  match: Match;
  showTranslation?: boolean;
}

interface TranslatedContent {
  homeTeam: string;
  awayTeam: string;
  competition: string;
  isTranslated: boolean;
}

const TranslatedMatchCard = ({ match, showTranslation = true }: MatchCardProps) => {
  const { language } = useLanguage();
  const { quickTranslateToArabic, quickTranslateToFrench, translateBatchToArabic } = useFootballTranslation();
  
  const [translatedContent, setTranslatedContent] = useState<TranslatedContent>({
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    competition: match.competition,
    isTranslated: false
  });
  
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const translateContent = async () => {
      if (!showTranslation || language === 'en') {
        setTranslatedContent({
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          competition: match.competition,
          isTranslated: false
        });
        return;
      }

      setIsTranslating(true);
      
      try {
        // Utiliser la traduction en lot pour optimiser les performances
        const textsToTranslate = [match.homeTeam, match.awayTeam, match.competition];
        const translatedTexts = language === 'ar' 
          ? await translateBatchToArabic(textsToTranslate)
          : await Promise.all(textsToTranslate.map(text => quickTranslateToFrench(text)));
        
        setTranslatedContent({
          homeTeam: translatedTexts[0] || match.homeTeam,
          awayTeam: translatedTexts[1] || match.awayTeam,
          competition: translatedTexts[2] || match.competition,
          isTranslated: true
        });
      } catch (error) {
        console.error('Translation failed:', error);
        // Garder le contenu original en cas d'erreur
        setTranslatedContent({
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          competition: match.competition,
          isTranslated: false
        });
      } finally {
        setIsTranslating(false);
      }
    };

    translateContent();
  }, [match, language, showTranslation]);

  const getStatusColor = () => {
    switch (match.status) {
      case 'live':
        return 'text-sport-green';
      case 'upcoming':
        return 'text-muted-foreground';
      case 'finished':
        return 'text-sport-dark';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusText = () => {
    if (language === 'ar') {
      switch (match.status) {
        case 'live': return 'مباشر';
        case 'upcoming': return 'قادم';
        case 'finished': return 'انتهت';
        default: return match.time;
      }
    } else if (language === 'fr') {
      switch (match.status) {
        case 'live': return 'En direct';
        case 'upcoming': return 'À venir';
        case 'finished': return 'Terminé';
        default: return match.time;
      }
    }
    return match.time;
  };

  const isRTL = language === 'ar';

  return (
    <Card className={`relative p-3 sm:p-4 hover:shadow-[var(--shadow-hover)] transition-all duration-300 bg-gradient-to-r from-card to-sport-light border-l-4 border-l-transparent hover:border-l-sport-green group overflow-hidden ${isRTL ? 'text-right' : ''}`}>
      {match.status === 'live' && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-sport-green rounded-full animate-pulse shadow-[var(--live-pulse)]"></div>
      )}
      
      {/* Indicateur de traduction */}
      {showTranslation && (
        <div className="absolute top-2 left-2 flex items-center gap-1">
          {isTranslating ? (
            <Badge variant="outline" className="text-xs">
              <Globe className="w-3 h-3 animate-spin mr-1" />
              {language === 'ar' ? 'ترجمة...' : 'Traduction...'}
            </Badge>
          ) : translatedContent.isTranslated ? (
            <Badge variant="secondary" className="text-xs">
              <Globe className="w-3 h-3 mr-1" />
              {language === 'ar' ? 'مترجم' : 'Traduit'}
            </Badge>
          ) : null}
        </div>
      )}

      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between relative z-10 space-y-3 sm:space-y-0 ${showTranslation ? 'mt-6' : ''}`}>
        <div className={`flex items-center justify-between flex-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Home Team */}
          <div className={`flex items-center space-x-2 flex-1 min-w-0 ${isRTL ? 'flex-row-reverse space-x-reverse justify-end' : ''}`}>
            {match.homeLogo ? (
              <img 
                src={match.homeLogo} 
                alt={match.homeTeam}
                className="w-5 h-5 sm:w-6 sm:h-6 object-contain flex-shrink-0"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0 ${match.homeLogo ? 'hidden' : ''}`}>
              <span className="text-white text-xs font-bold">H</span>
            </div>
            <span className={`font-medium text-foreground text-sm sm:text-base truncate ${isTranslating ? 'opacity-60' : ''}`}>
              {translatedContent.homeTeam}
            </span>
          </div>

          {/* Score or Time */}
          <div className="flex flex-col items-center justify-center px-2 sm:px-4">
            {match.status === 'finished' || match.status === 'live' ? (
              <>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <span className="text-lg sm:text-2xl font-bold text-sport-dark">{match.homeScore}</span>
                  <span className="text-muted-foreground text-sm sm:text-base">-</span>
                  <span className="text-lg sm:text-2xl font-bold text-sport-dark">{match.awayScore}</span>
                </div>
                {match.status === 'live' && (
                  <div className="flex items-center space-x-1 mt-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-red-500 font-medium">{getStatusText()}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                <span className={`font-medium text-xs sm:text-sm ${getStatusColor()}`}>{getStatusText()}</span>
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className={`flex items-center space-x-2 flex-1 min-w-0 ${isRTL ? 'flex-row-reverse space-x-reverse' : 'justify-end'}`}>
            <span className={`font-medium text-foreground text-sm sm:text-base truncate ${isTranslating ? 'opacity-60' : ''}`}>
              {translatedContent.awayTeam}
            </span>
            {match.awayLogo ? (
              <img 
                src={match.awayLogo} 
                alt={match.awayTeam}
                className="w-5 h-5 sm:w-6 sm:h-6 object-contain flex-shrink-0"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 ${match.awayLogo ? 'hidden' : ''}`}>
              <span className="text-white text-xs font-bold">A</span>
            </div>
          </div>
        </div>

        {match.status === 'live' && (
          <Button variant="ghost" size="icon" className="ml-0 sm:ml-4 self-center">
            <Play className="w-3 h-3 sm:w-4 sm:h-4 text-sport-green" />
          </Button>
        )}
      </div>
      
      <div className={`mt-2 text-xs text-muted-foreground text-center ${isTranslating ? 'opacity-60' : ''}`}>
        {translatedContent.competition}
      </div>
    </Card>
  );
};

export default TranslatedMatchCard;
