import { useState } from "react";
import { Check, ChevronsUpDown, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTranslation } from "@/hooks/useTranslation";
import { MAIN_LEAGUES } from "@/config/api";

interface League {
  id: number;
  name: string;
  flag: string;
}

interface LeagueSelectorProps {
  selectedLeagues: number[];
  onLeaguesChange: (leagues: number[]) => void;
  className?: string;
}

const LeagueSelector = ({ selectedLeagues, onLeaguesChange, className }: LeagueSelectorProps) => {
  const { currentLanguage } = useTranslation();
  const [open, setOpen] = useState(false);

  // Données des ligues disponibles (plan gratuit API Football)
  const leagues: League[] = [
    { 
      id: MAIN_LEAGUES.PREMIER_LEAGUE, 
      name: currentLanguage === 'ar' ? "البريمير ليغ" : "Premier League", 
      flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" 
    },
    { 
      id: MAIN_LEAGUES.LIGUE_1, 
      name: currentLanguage === 'ar' ? "الدوري الفرنسي" : "Ligue 1", 
      flag: "🇫🇷" 
    },
    { 
      id: MAIN_LEAGUES.BUNDESLIGA, 
      name: currentLanguage === 'ar' ? "البوندسليغا" : "Bundesliga", 
      flag: "🇩🇪" 
    },
    { 
      id: MAIN_LEAGUES.LA_LIGA, 
      name: currentLanguage === 'ar' ? "الليغا الإسبانية" : "La Liga", 
      flag: "🇪🇸" 
    },
    { 
      id: MAIN_LEAGUES.SERIE_A, 
      name: currentLanguage === 'ar' ? "الدوري الإيطالي" : "Serie A", 
      flag: "🇮🇹" 
    },
    { 
      id: MAIN_LEAGUES.CHAMPIONS_LEAGUE, 
      name: currentLanguage === 'ar' ? "دوري أبطال أوروبا" : "Champions League", 
      flag: "🏆" 
    },
    { 
      id: MAIN_LEAGUES.EREDIVISIE, 
      name: currentLanguage === 'ar' ? "الدوري الهولندي" : "Eredivisie", 
      flag: "🇳🇱" 
    },
    { 
      id: MAIN_LEAGUES.PRIMERA_DIVISION, 
      name: currentLanguage === 'ar' ? "الدوري البرتغالي" : "Primeira Liga", 
      flag: "🇵🇹" 
    }
  ];

  const handleLeagueToggle = (leagueId: number) => {
    const newSelectedLeagues = selectedLeagues.includes(leagueId)
      ? selectedLeagues.filter(id => id !== leagueId)
      : [...selectedLeagues, leagueId];
    
    onLeaguesChange(newSelectedLeagues);
  };

  const clearAllSelections = () => {
    onLeaguesChange([]);
  };

  const selectAllLeagues = () => {
    onLeaguesChange(leagues.map(league => league.id));
  };

  const getSelectedLeaguesText = () => {
    if (selectedLeagues.length === 0) {
      return currentLanguage === 'ar' ? 'جميع البطولات' : 'Tous les championnats';
    }
    if (selectedLeagues.length === 1) {
      const league = leagues.find(l => l.id === selectedLeagues[0]);
      return league?.name || '';
    }
    return `${selectedLeagues.length} ${currentLanguage === 'ar' ? 'بطولات مختارة' : 'championnats sélectionnés'}`;
  };

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between min-w-[200px]"
          >
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span className="truncate">{getSelectedLeaguesText()}</span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput 
              placeholder={currentLanguage === 'ar' ? 'البحث عن بطولة...' : 'Rechercher un championnat...'}
            />
            <CommandList>
              <CommandEmpty>
                {currentLanguage === 'ar' ? 'لا توجد بطولة' : 'Aucun championnat trouvé.'}
              </CommandEmpty>
              <CommandGroup>
                <CommandItem onSelect={selectAllLeagues}>
                  <div className="flex items-center space-x-2">
                    <span>🌍</span>
                    <span>{currentLanguage === 'ar' ? 'تحديد الكل' : 'Sélectionner tout'}</span>
                  </div>
                </CommandItem>
                <CommandItem onSelect={clearAllSelections}>
                  <div className="flex items-center space-x-2">
                    <span>🚫</span>
                    <span>{currentLanguage === 'ar' ? 'إلغاء التحديد' : 'Effacer la sélection'}</span>
                  </div>
                </CommandItem>
                {leagues.map((league) => (
                  <CommandItem
                    key={league.id}
                    onSelect={() => handleLeagueToggle(league.id)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-2">
                        <span>{league.flag}</span>
                        <span>{league.name}</span>
                      </div>
                      <Check
                        className={cn(
                          "h-4 w-4",
                          selectedLeagues.includes(league.id) ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default LeagueSelector;
