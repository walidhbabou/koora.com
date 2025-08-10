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
  const { currentLanguage } = useTranslation();

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
    <div className="bg-white rounded-lg border shadow-sm mx-2 sm:mx-3 mt-2">
      {/* Version Desktop */}
      <div className="hidden md:block">
        <div className="px-3 lg:px-4 py-2 flex items-center justify-between">
          {/* Titre Matchs */}
          <h1 className="text-lg lg:text-xl font-bold text-teal-600">
            {currentLanguage === 'ar' ? 'المباريات' : 'Matchs'}
          </h1>
          
          {/* Section navigation de date et filtres */}
          <div className="flex items-center gap-3">
            {/* Navigation de Date */}
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  const prevDate = new Date(selectedDate);
                  prevDate.setDate(prevDate.getDate() - 1);
                  onDateChange(prevDate.toISOString().split('T')[0]);
                }}
                className="h-7 w-7 p-0 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-gray-600 text-base">‹</span>
              </Button>
              
              <span className="text-xs font-medium text-gray-800 px-2 min-w-[120px] text-center">
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
                className="h-7 w-7 p-0 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-gray-600 text-base">›</span>
              </Button>
            </div>
            
            {/* Séparateur vertical */}
            <div className="w-px h-5 bg-gray-300"></div>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
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
                  className="h-7 px-2 text-xs text-teal-600 border-teal-200 hover:bg-teal-50"
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
        <div className="px-2 py-2 space-y-2">
          {/* Header avec titre */}
          <div className="flex items-center justify-between">
            <h1 className="text-base font-bold text-teal-600">
              {currentLanguage === 'ar' ? 'المباريات' : 'Matchs'}
            </h1>
            {onReset && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onReset}
                className="h-6 px-2 text-xs text-teal-600 border-teal-200 hover:bg-teal-50"
              >
                {currentLanguage === 'ar' ? 'إعادة تعيين' : 'Reset'}
              </Button>
            )}
          </div>
          
          {/* Navigation de Date Mobile */}
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="flex items-center justify-between gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  const prevDate = new Date(selectedDate);
                  prevDate.setDate(prevDate.getDate() - 1);
                  onDateChange(prevDate.toISOString().split('T')[0]);
                }}
                className="h-7 w-7 p-0 hover:bg-white rounded-lg transition-colors shadow-sm"
              >
                <span className="text-teal-600 text-base font-semibold">‹</span>
              </Button>
              
              <div className="flex-1 text-center">
                <span className="text-xs font-medium text-gray-800">
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
                className="h-7 w-7 p-0 hover:bg-white rounded-lg transition-colors shadow-sm"
              >
                <span className="text-teal-600 text-base font-semibold">›</span>
              </Button>
            </div>
          </div>
          
          {/* Filtres Mobile */}
          <div className="flex gap-2">
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
