import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const TeamsLogos = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Sample team logos - using placeholder for now, you can replace with actual URLs
  const teams = [
    { name: "Bayern Munich", logo: "/placeholder.svg" },
    { name: "Juventus", logo: "/placeholder.svg" },
    { name: "AS Roma", logo: "/placeholder.svg" },
    { name: "Inter Milan", logo: "/placeholder.svg" },
    { name: "AC Milan", logo: "/placeholder.svg" },
    { name: "Liverpool", logo: "/placeholder.svg" },
    { name: "Arsenal", logo: "/placeholder.svg" },
    { name: "Manchester City", logo: "/placeholder.svg" },
    { name: "Chelsea", logo: "/placeholder.svg" },
    { name: "Manchester United", logo: "/placeholder.svg" },
    { name: "Real Madrid", logo: "/placeholder.svg" },
    { name: "Barcelona", logo: "/placeholder.svg" }
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

  // Handle window resize
  const handleResize = () => {
    setVisibleTeams(getVisibleTeams());
  };

  // Add event listener for window resize
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize);
  }

  return (
    <div className="bg-background border-b border-border py-3 sm:py-4">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="relative">
          {/* Navigation Buttons - Hidden on mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-sport-green/10 hover:text-sport-green transition-all duration-300 rounded-full shadow-md hidden sm:flex"
            onClick={prevSlide}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-sport-green/10 hover:text-sport-green transition-all duration-300 rounded-full shadow-md hidden sm:flex"
            onClick={nextSlide}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          {/* Teams Logos Carousel */}
          <div className="overflow-hidden sm:mx-8">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ 
                transform: `translateX(-${currentIndex * (100 / visibleTeams)}%)`,
                width: `${(teams.length * 100) / visibleTeams}%`
              }}
            >
              {teams.map((team, index) => (
                <div
                  key={team.name}
                  className="flex-shrink-0"
                  style={{ width: `${100 / teams.length}%` }}
                >
                  <div className="group cursor-pointer">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 group-hover:scale-105 flex items-center justify-center border border-gray-100">
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
          </div>

          {/* Mobile swipe indicators */}
          <div className="flex justify-center mt-3 space-x-1 sm:hidden">
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
