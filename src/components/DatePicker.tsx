import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr, ar } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTranslation } from "@/hooks/useTranslation";
import { useSettings } from "@/contexts/SettingsContext";

interface DatePickerProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  className?: string;
  showIcon?: boolean; // show internal calendar icon (default: true)
  variant?: 'outline' | 'ghost'; // forward variant to Button (default: 'outline')
}

const DatePicker = ({ selectedDate, onDateChange, className, showIcon = true, variant = 'outline' }: DatePickerProps) => {
  const { currentLanguage } = useTranslation();
  const { timezone } = useSettings();
  const [open, setOpen] = useState(false);
  
  const date = selectedDate ? new Date(selectedDate) : undefined;
  const locale = currentLanguage === 'ar' ? ar : fr;

  const displayLabel = (() => {
    if (!date) return undefined;
    if (currentLanguage === 'ar') {
      const monthAr = new Intl.DateTimeFormat('ar', { month: 'long', timeZone: timezone }).format(date);
      // Use Intl to get day/year in desired tz, but keep Latin digits
      const day = new Intl.DateTimeFormat('en-US', { day: 'numeric', timeZone: timezone }).format(date);
      const year = new Intl.DateTimeFormat('en-US', { year: 'numeric', timeZone: timezone }).format(date);
      const dayLatin = day;
      const yearLatin = year;
      return `${dayLatin} ${monthAr} ${yearLatin}`; // ex: 4 سبتمبر 2025
    }
    // French: use Intl with timezone to ensure correct date in selected tz
    return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: timezone }).format(date);
  })();
  
  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      onDateChange(format(newDate, "yyyy-MM-dd"));
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          className={cn(
            "justify-start text-left font-normal",
            !date && "text-muted-foreground",
            // make ghost variant blend nicely inside parent containers
            variant === 'ghost' ? 'border-0 bg-transparent hover:bg-transparent' : '',
            className
          )}
        >
          {showIcon && <CalendarIcon className="mr-2 h-4 w-4" />}
          {date ? (
            displayLabel
          ) : (
            <span>
              {currentLanguage === 'ar' ? 'اختر التاريخ' : 'Choisir la date'}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
          locale={locale}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
