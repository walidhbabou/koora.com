import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";

const TeamsLogos = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const { currentLanguage } = useTranslation();
  
  // Équipes principales avec vrais logos et IDs API
  const teams = [
    { 
      id: 33, 
      name: currentLanguage === 'ar' ? "مانشستر يونايتد" : "Manchester United", 
      logo: "https://media.api-sports.io/football/teams/33.png",
      league: "Premier League"
    },
    { 
      id: 40, 
      name: currentLanguage === 'ar' ? "ليفربول" : "Liverpool", 
      logo: "https://media.api-sports.io/football/teams/40.png",
      league: "Premier League"
    },
    { 
      id: 42, 
      name: currentLanguage === 'ar' ? "أرسنال" : "Arsenal", 
      logo: "https://media.api-sports.io/football/teams/42.png",
      league: "Premier League"
    },
    { 
      id: 50, 
      name: currentLanguage === 'ar' ? "مانشستر سيتي" : "Manchester City", 
      logo: "https://media.api-sports.io/football/teams/50.png",
      league: "Premier League"
    },
    { 
      id: 49, 
      name: currentLanguage === 'ar' ? "تشيلسي" : "Chelsea", 
      logo: "https://media.api-sports.io/football/teams/49.png",
      league: "Premier League"
    },
    { 
      id: 541, 
      name: currentLanguage === 'ar' ? "ريال مدريد" : "Real Madrid", 
      logo: "https://media.api-sports.io/football/teams/541.png",
      league: "La Liga"
    },
    { 
      id: 529, 
      name: currentLanguage === 'ar' ? "برشلونة" : "Barcelona", 
      logo: "https://media.api-sports.io/football/teams/529.png",
      league: "La Liga"
    },
    { 
      id: 157, 
      name: currentLanguage === 'ar' ? "بايرن ميونخ" : "Bayern Munich", 
      logo: "https://media.api-sports.io/football/teams/157.png",
      league: "Bundesliga"
    },
    { 
      id: 496, 
      name: currentLanguage === 'ar' ? "يوفنتوس" : "Juventus", 
      logo: "https://media.api-sports.io/football/teams/496.png",
      league: "Serie A"
    },
    { 
      id: 489, 
      name: currentLanguage === 'ar' ? "إنتر ميلان" : "Inter Milan", 
      logo: "https://media.api-sports.io/football/teams/489.png",
      league: "Serie A"
    },
    { 
      id: 511, 
      name: currentLanguage === 'ar' ? "إيه سي ميلان" : "AC Milan", 
      logo: "https://media.api-sports.io/football/teams/511.png",
      league: "Serie A"
    },
    { 
      id: 85, 
      name: currentLanguage === 'ar' ? "باريس سان جيرمان" : "Paris Saint-Germain", 
      logo: "https://media.api-sports.io/football/teams/85.png",
      league: "Ligue 1"
    }
  ];

  // Responsive number of visible teams
  const getVisibleTeams = () => {
    if (typeof window === 'undefined') return 8;
    if (window.innerWidth < 640) return 4; // Mobile
    if (window.innerWidth < 1024) return 6; // Tablet
    return 10; // Desktop
  };

  const [visibleTeams, setVisibleTeams] = useState(getVisibleTeams());
  
  const nextSlide = () => {
    setCurrentIndex((prev) => 
      prev >= teams.length - visibleTeams ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => 
      prev <= 0 ? teams.length - visibleTeams : prev - 1
    );
  };

  // Handle window resize and keep listener in effect
  useEffect(() => {
    const handleResize = () => setVisibleTeams(getVisibleTeams());
    // run once to ensure correct size
    handleResize();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  return (
    <div className="bg-background dark:bg-[#181a20] sm:border-b sm:border-border sm:dark:border-[#23262f] pt-2 pb-0 sm:py-4 mt-0">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="relative">
          {/* Navigation Buttons - Hidden on mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 dark:bg-[#23262f]/80 hover:bg-sport-green/10 hover:text-sport-green transition-all duration-300 rounded-full shadow-md hidden sm:flex"
            onClick={prevSlide}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 dark:bg-[#23262f]/80 hover:bg-sport-green/10 hover:text-sport-green transition-all duration-300 rounded-full shadow-md hidden sm:flex"
            onClick={nextSlide}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          {/* Teams Logos Carousel */}
          <div className="overflow-hidden sm:mx-8">
            {/* Mobile: horizontal scrollable row so all logos are reachable and fixed visually */}
            {visibleTeams <= 4 ? (
              <div className="flex gap-3 overflow-x-auto py-2 px-2 -mx-2 sm:hidden">
                {teams.map((team) => (
                  <div key={team.id} className="flex-shrink-0 w-20">
                    <div
                      className="group cursor-pointer w-20 h-20 bg-white dark:bg-[#181a20] rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 flex items-center justify-center border border-gray-100 dark:border-[#23262f]"
                      onClick={() => navigate(`/team/${team.id}`)}
                    >
                      <img
                        src={team.logo}
                        alt={team.name}
                        className="w-12 h-12 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.svg";
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Desktop / tablet carousel */
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ 
                  transform: `translateX(-${currentIndex * (100 / visibleTeams)}%)`,
                  width: `${(teams.length * 100) / visibleTeams}%`
                }}
              >
                {teams.map((team, index) => (
                  <div
                    key={team.id}
                    className="flex-shrink-0"
                    style={{ width: `${100 / teams.length}%` }}
                  >
                    <div 
                      className="group cursor-pointer"
                      onClick={() => navigate(`/team/${team.id}`)}
                    >
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-white dark:bg-[#181a20] rounded-lg sm:rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 group-hover:scale-105 flex items-center justify-center border border-gray-100 dark:border-[#23262f]">
                        <img
                          src={team.logo}
                          alt={team.name}
                          className="w-8 h-8 sm:w-12 sm:h-12 object-contain"
                          onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg";
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mobile swipe indicators */}
          <div className="flex justify-center mt-0 space-x-1 sm:hidden">
            {Array.from({ length: Math.ceil(teams.length / visibleTeams) }).map((_, index) => (
              <button
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  Math.floor(currentIndex / visibleTeams) === index
                    ? 'bg-sport-green'
                    : 'bg-gray-300'
                }`}
                onClick={() => setCurrentIndex(index * visibleTeams)}
              />
            ))}
          </div>

          {/* Desktop dots indicator */}
          <div className="hidden sm:flex justify-center mt-4 space-x-2">
            {Array.from({ length: Math.ceil(teams.length / visibleTeams) }).map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  Math.floor(currentIndex / visibleTeams) === index
                    ? 'bg-sport-green'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                onClick={() => setCurrentIndex(index * visibleTeams)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamsLogos;
