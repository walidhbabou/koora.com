import DatePicker from "@/components/DatePicker";
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
  onReset,
  onOpenFilter
}: MatchHeaderProps) {
  const { currentLanguage, isRTL, direction } = useTranslation();

  return (
    <div
      dir={direction}
      className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm"
    >
      <div className="px-3 sm:px-4 py-2 flex items-center justify-between gap-2">
        
        {/* Filtre (gauche) */}
        <Button
          onClick={onOpenFilter}
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Filter className="h-4 w-4 text-gray-700 dark:text-gray-300" />
        </Button>

        {/* Pilule Date (centre) */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-2.5 py-1 shadow-sm min-w-[180px] max-w-[240px] justify-center">
          <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-300 shrink-0" />

          {/* Prev */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const prevDate = new Date(selectedDate);
              prevDate.setDate(prevDate.getDate() - 1);
              onDateChange(prevDate.toISOString().split("T")[0]);
            }}
            className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            <span className="text-gray-700 dark:text-gray-200 text-sm">
              {isRTL ? "<" : "‹"}
            </span>
          </Button>

          {/* DatePicker */}
          <DatePicker
            selectedDate={selectedDate}
            onDateChange={onDateChange}
            className="h-6 text-sm px-2 py-0 font-medium whitespace-nowrap truncate"
            showIcon={false}
            variant="ghost"
          />

          {/* Next */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const nextDate = new Date(selectedDate);
              nextDate.setDate(nextDate.getDate() + 1);
              onDateChange(nextDate.toISOString().split("T")[0]);
            }}
            className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            <span className="text-gray-700 dark:text-gray-200 text-sm">
              {isRTL ? ">" : "›"}
            </span>
          </Button>
        </div>

        {/* Titre (droite) */}
        <h1 className="text-sm sm:text-base font-semibold text-teal-600 dark:text-teal-400 whitespace-nowrap">
          {currentLanguage === "ar" ? "المباريات" : "Matchs"}
        </h1>
      </div>
    </div>
  );
}
