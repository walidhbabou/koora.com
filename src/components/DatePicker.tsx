import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTranslation } from "@/hooks/useTranslation";

interface DatePickerProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  className?: string;
}

const DatePicker = ({ selectedDate, onDateChange, className }: DatePickerProps) => {
  const { currentLanguage } = useTranslation();
  const [open, setOpen] = useState(false);
  
  const date = selectedDate ? new Date(selectedDate) : undefined;
  const locale = fr; // Force l'affichage en français avec chiffres latins
  
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
          variant="outline"
          className={cn(
            "justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, "PPP", { locale })
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
