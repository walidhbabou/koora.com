import DatePicker from "@/components/DatePicker";
import LeagueSelector from "@/components/LeagueSelector";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

interface MatchHeaderProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedLeagues: number[];
  onLeaguesChange: (leagues: number[]) => void;
  onReset?: () => void;
}

export default function MatchHeader({
  selectedDate,
  onDateChange,
  selectedLeagues,
  onLeaguesChange,
  onReset
}: MatchHeaderProps) {
  const { currentLanguage, isRTL, direction } = useTranslation();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    
    if (currentLanguage === 'ar') {
      const options: Intl.DateTimeFormatOptions = { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      };
      return date.toLocaleDateString('ar-EG', options);
    } else {
      const options: Intl.DateTimeFormatOptions = { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      };
      return date.toLocaleDateString('fr-FR', options);
    }
  };

  return (
    <div dir={direction} className={`bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm mx-2 sm:mx-3 mt-2 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Version Desktop */}
      <div className="hidden md:block">
        <div className={`px-3 lg:px-4 py-2 flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Titre Matchs */}
          <h1 className={`text-lg lg:text-xl font-bold text-teal-600 dark:text-teal-400 ${isRTL ? 'text-right' : 'text-left'}`}>
            {currentLanguage === 'ar' ? 'المباريات' : 'Matchs'}
          </h1>
          
          {/* Section navigation de date et filtres */}
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* Navigation de Date */}
            <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  const prevDate = new Date(selectedDate);
                  prevDate.setDate(prevDate.getDate() - 1);
                  onDateChange(prevDate.toISOString().split('T')[0]);
                }}
                className="h-7 w-7 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <span className="text-gray-600 dark:text-gray-300 text-base">{isRTL ? '›' : '‹'}</span>
              </Button>
              
              <span className={`text-xs font-medium text-gray-800 dark:text-gray-200 px-2 min-w-[120px] text-center ${isRTL && currentLanguage === 'ar' ? 'arabic-text' : ''}`}>
                {formatDate(selectedDate)}
              </span>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  const nextDate = new Date(selectedDate);
                  nextDate.setDate(nextDate.getDate() + 1);
                  onDateChange(nextDate.toISOString().split('T')[0]);
                }}
                className="h-7 w-7 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <span className="text-gray-600 dark:text-gray-300 text-base">{isRTL ? '‹' : '›'}</span>
              </Button>
            </div>
            
            {/* Séparateur vertical */}
            <div className="w-px h-5 bg-gray-300"></div>
            
            {/* Actions */}
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <DatePicker
                selectedDate={selectedDate}
                onDateChange={onDateChange}
                className="h-7 text-xs"
              />
              
              <LeagueSelector
                selectedLeagues={selectedLeagues}
                onLeaguesChange={onLeaguesChange}
                className="h-7 text-xs"
              />
              
              {onReset && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onReset}
                  className={`h-7 px-2 text-xs text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 ${isRTL && currentLanguage === 'ar' ? 'arabic-text' : ''}`}
                >
                  {currentLanguage === 'ar' ? 'إعادة تعيين' : 'Reset'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Version Mobile */}
      <div className="block md:hidden">
        <div className={`px-2 py-2 space-y-2 ${isRTL ? 'text-right' : 'text-left'}`}>
          {/* Header avec titre */}
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <h1 className={`text-base font-bold text-teal-600 dark:text-teal-400 ${isRTL ? 'text-right' : 'text-left'}`}>
              {currentLanguage === 'ar' ? 'المباريات' : 'Matchs'}
            </h1>
            {onReset && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onReset}
                className={`h-6 px-2 text-xs text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 ${isRTL && currentLanguage === 'ar' ? 'arabic-text' : ''}`}
              >
                {currentLanguage === 'ar' ? 'إعادة تعيين' : 'Reset'}
              </Button>
            )}
          </div>
          
          {/* Navigation de Date Mobile */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
            <div className={`flex items-center justify-between gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  const prevDate = new Date(selectedDate);
                  prevDate.setDate(prevDate.getDate() - 1);
                  onDateChange(prevDate.toISOString().split('T')[0]);
                }}
                className="h-7 w-7 p-0 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-colors shadow-sm"
              >
                <span className="text-teal-600 dark:text-teal-400 text-base font-semibold">{isRTL ? '›' : '‹'}</span>
              </Button>
              
              <div className="flex-1 text-center">
                <span className={`text-xs font-medium text-gray-800 dark:text-gray-200 ${isRTL && currentLanguage === 'ar' ? 'arabic-text' : ''}`}>
                  {formatDate(selectedDate)}
                </span>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  const nextDate = new Date(selectedDate);
                  nextDate.setDate(nextDate.getDate() + 1);
                  onDateChange(nextDate.toISOString().split('T')[0]);
                }}
                className="h-7 w-7 p-0 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-colors shadow-sm"
              >
                <span className="text-teal-600 dark:text-teal-400 text-base font-semibold">{isRTL ? '‹' : '›'}</span>
              </Button>
            </div>
          </div>
          
          {/* Filtres Mobile */}
          <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="flex-1">
              <DatePicker
                selectedDate={selectedDate}
                onDateChange={onDateChange}
                className="h-8 w-full text-xs"
              />
            </div>
            <div className="flex-1">
              <LeagueSelector
                selectedLeagues={selectedLeagues}
                onLeaguesChange={onLeaguesChange}
                className="h-8 w-full text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
