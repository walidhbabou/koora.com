import DatePicker from "@/components/DatePicker";
import LeagueSelector from "@/components/LeagueSelector";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { Filter, Calendar } from "lucide-react";

interface MatchHeaderProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedLeagues: number[];
  onLeaguesChange: (leagues: number[]) => void;
  onReset?: () => void;
  onOpenFilter?: () => void;
}

export default function MatchHeader({
  selectedDate,
  onDateChange,
  selectedLeagues,
  onLeaguesChange,
  onReset,
  onOpenFilter
}: MatchHeaderProps) {
  const { currentLanguage, isRTL, direction } = useTranslation();

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    // If UI is Arabic: Arabic month name, Latin digits for day/year
    if (currentLanguage === 'ar') {
      const monthAr = new Intl.DateTimeFormat('ar', { month: 'long' }).format(d);
      const dayLatin = d.getDate().toString();
      const yearLatin = d.getFullYear().toString();
      // Example: 29 أغسطس 2025
      return `${dayLatin} ${monthAr} ${yearLatin}`;
    }
    // Default FR full date with long month
    return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
  };

  return (
    <div dir={direction} className={`bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm mx-2 sm:mx-3 mt-2 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Version Desktop */}
      <div className="hidden md:block">
        <div className={`px-3 lg:px-4 py-2 flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Bouton filtre à gauche */}
          <div className={`flex items-center shrink-0 ${isRTL ? 'order-3' : 'order-1'}`}>
            <Button onClick={onOpenFilter} variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <Filter className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </Button>
          </div>

          {/* Navigateur de date au centre (pill) */}
          <div className={`flex items-center flex-1 justify-center ${isRTL ? 'order-2' : 'order-2'}`}>
            <div className={`flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1.5 min-w-[220px] max-w-full justify-center`}> 
              <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  const prevDate = new Date(selectedDate);
                  prevDate.setDate(prevDate.getDate() - 1);
                  onDateChange(prevDate.toISOString().split('T')[0]);
                }}
                className="h-7 w-7 p-0 hover:bg-white/60 dark:hover:bg-gray-700 rounded-md"
              >
                <span className="text-gray-700 dark:text-gray-200 text-base">{isRTL ? '›' : '‹'}</span>
              </Button>
              {/* Desktop DatePicker Trigger */}
              <div className="min-w-[150px] max-w-[220px]">
                <DatePicker
                  selectedDate={selectedDate}
                  onDateChange={onDateChange}
                  className="h-7 text-sm px-2 py-0 whitespace-nowrap truncate"
                  showIcon={false}
                  variant="ghost"
                />
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  const nextDate = new Date(selectedDate);
                  nextDate.setDate(nextDate.getDate() + 1);
                  onDateChange(nextDate.toISOString().split('T')[0]);
                }}
                className="h-7 w-7 p-0 hover:bg-white/60 dark:hover:bg-gray-700 rounded-md"
              >
                <span className="text-gray-700 dark:text-gray-200 text-base">{isRTL ? '‹' : '›'}</span>
              </Button>
            </div>
          </div>

          {/* Titre à droite */}
          <h1 className={`text-lg lg:text-xl font-bold text-teal-600 dark:text-teal-400 shrink-0 ${isRTL ? 'order-1' : 'order-3'} ${isRTL ? 'text-right' : 'text-left'}`}>
            {currentLanguage === 'ar' ? 'المباريات' : 'Matchs'}
          </h1>
        </div>
      </div>

      {/* Version Mobile - même style que Desktop (compact) */}
      <div className="block md:hidden">
        <div className={`px-3 py-2.5 ${isRTL ? 'text-right' : 'text-left'}`}>
          <div className={`flex items-center justify-between gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* Bouton filtre */}
            <div className={`flex items-center shrink-0 ${isRTL ? 'order-3' : 'order-1'}`}>
              <Button onClick={onOpenFilter} variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 shrink-0">
                <Filter className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </Button>
            </div>

            {/* Pilule date au centre (compact) */}
            <div className={`flex items-center flex-1 justify-center min-w-0 ${isRTL ? 'order-2' : 'order-2'}`}>
              <div className={`flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-2.5 py-1.5 min-w-0 max-w-full justify-center flex-1 overflow-hidden`}> 
                <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-300 shrink-0" />
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    const prevDate = new Date(selectedDate);
                    prevDate.setDate(prevDate.getDate() - 1);
                    onDateChange(prevDate.toISOString().split('T')[0]);
                  }}
                  className="h-7 w-7 p-0 hover:bg-white/60 dark:hover:bg-gray-700 rounded-md shrink-0"
                >
                  <span className="text-gray-700 dark:text-gray-200 text-base">{isRTL ? '›' : '‹'}</span>
                </Button>
                {/* Mobile DatePicker Trigger */}
                <div className="flex-1 min-w-0 max-w-[150px] sm:max-w-[220px]">
                  <DatePicker
                    selectedDate={selectedDate}
                    onDateChange={onDateChange}
                    className="h-7 text-sm px-2 py-0 whitespace-nowrap truncate"
                    showIcon={false}
                    variant="ghost"
                  />
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    const nextDate = new Date(selectedDate);
                    nextDate.setDate(nextDate.getDate() + 1);
                    onDateChange(nextDate.toISOString().split('T')[0]);
                  }}
                  className="h-7 w-7 p-0 hover:bg-white/60 dark:hover:bg-gray-700 rounded-md shrink-0"
                >
                  <span className="text-gray-700 dark:text-gray-200 text-base">{isRTL ? '‹' : '›'}</span>
                </Button>
              </div>
            </div>

            {/* Titre + Reset à droite */}
            <div className={`flex items-center gap-2 shrink-0 ${isRTL ? 'order-1' : 'order-3'}`}>
              <h1 className={`hidden sm:block text-base font-bold text-teal-600 dark:text-teal-400 max-w-[160px] truncate ${isRTL ? 'text-right' : 'text-left'}`}>
                {currentLanguage === 'ar' ? 'المباريات' : 'Matchs'}
              </h1>
              {onReset && (
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={onReset}
                  className={`h-7 px-2 text-[11px] rounded-full bg-teal-50 text-teal-700 hover:bg-teal-100 dark:bg-teal-900/20 dark:text-teal-300 border border-teal-200/60 dark:border-teal-700 shrink-0 ${isRTL && currentLanguage === 'ar' ? 'arabic-text' : ''}`}
                >
                  {currentLanguage === 'ar' ? 'إعادة تعيين' : 'Reset'}
                </Button>
              )}
            </div>
          </div>

          {/* Filtres Mobile retirés pour n'afficher qu'une seule rangée, comme desktop */}
        </div>
      </div>
    </div>
  );
}
