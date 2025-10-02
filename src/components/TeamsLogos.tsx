import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";

// Animation configuration constants
const ANIMATION_CONFIG = {
  SMOOTH_TAU: 0.25,
  MIN_COPIES: 2,
  COPY_HEADROOM: 2,
} as const;

const TeamsLogos = () => {
  const navigate = useNavigate();
  const { currentLanguage } = useTranslation();

  // Animation refs and state
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const seqRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const velocityRef = useRef(0);

  const [seqWidth, setSeqWidth] = useState<number>(0);
  const [copyCount, setCopyCount] = useState<number>(
    ANIMATION_CONFIG.MIN_COPIES
  );
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Équipes principales avec vrais logos et IDs API
  const teams = [
    // La Liga
    {
      id: 541,
      name: currentLanguage === "ar" ? "ريال مدريد" : "Real Madrid",
      logo: "https://media.api-sports.io/football/teams/541.png",
      league: "La Liga",
      leagueId: 140,
    },
    // Premier League
    {
      id: 33,
      name: currentLanguage === "ar" ? "مانشستر يونايتد" : "Manchester United",
      logo: "https://media.api-sports.io/football/teams/33.png",
      league: "Premier League",
      leagueId: 39,
    },
    {
      id: 49,
      name: currentLanguage === "ar" ? "تشيلسي" : "Chelsea",
      logo: "https://media.api-sports.io/football/teams/49.png",
      league: "Premier League",
      leagueId: 39,
    },
    {
      id: 40,
      name: currentLanguage === "ar" ? "ليفربول" : "Liverpool",
      logo: "https://media.api-sports.io/football/teams/40.png",
      league: "Premier League",
      leagueId: 39,
    },
    {
      id: 42,
      name: currentLanguage === "ar" ? "أرسنال" : "Arsenal",
      logo: "https://media.api-sports.io/football/teams/42.png",
      league: "Premier League",
      leagueId: 39,
    },
    {
      id: 50,
      name: currentLanguage === "ar" ? "مانشستر سيتي" : "Manchester City",
      logo: "https://media.api-sports.io/football/teams/50.png",
      league: "Premier League",
      leagueId: 39,
    },
    // Bundesliga
    {
      id: 157,
      name: currentLanguage === "ar" ? "بايرن ميونخ" : "Bayern Munich",
      logo: "https://media.api-sports.io/football/teams/157.png",
      league: "Bundesliga",
      leagueId: 78,
    },
    // Ligue 1
    {
      id: 85,
      name:
        currentLanguage === "ar" ? "باريس سان جيرمان" : "Paris Saint-Germain",
      logo: "https://media.api-sports.io/football/teams/85.png",
      league: "Ligue 1",
      leagueId: 61,
    },
    // Serie A
    {
      id: 496,
      name: currentLanguage === "ar" ? "يوفنتوس" : "Juventus",
      logo: "https://media.api-sports.io/football/teams/496.png",
      league: "Serie A",
      leagueId: 135,
    },
    {
      id: 489,
      name: currentLanguage === "ar" ? "إيه سي ميلان" : "AC Milan",
      logo: "https://media.api-sports.io/football/teams/489.png",
      league: "Serie A",
      leagueId: 135,
    },
    {
      id: 505,
      name: currentLanguage === "ar" ? "إنتر ميلان" : "Inter Milan",
      logo: "https://media.api-sports.io/football/teams/505.png",
      league: "Serie A",
      leagueId: 135,
    },
    // Équipes africaines
    {
      id: 1023,
      name: currentLanguage === "ar" ? "الأهلي" : "Al Ahly",
      logo: "https://media.api-sports.io/football/teams/1023.png",
      league: "Egyptian Premier League",
      leagueId: 233,
    },
    {
      id: 968,
      name: currentLanguage === "ar" ? "الوداد الرياضي" : "Wydad Casablanca",
      logo: "https://media.api-sports.io/football/teams/968.png",
      league: "Botola Pro",
      leagueId: 564,
    },
    {
      id: 976,
      name: currentLanguage === "ar" ? "الرجاء الرياضي" : "Raja Casablanca",
      logo: "https://media.api-sports.io/football/teams/976.png",
      league: "Botola Pro",
      leagueId: 564,
    },
    // New teams added
    {
      id: 1577,
      name: currentLanguage === "ar" ? "الأهلي" : "Al Ahly (Libya)",
      logo: "https://media.api-sports.io/football/teams/1029.png",
      league: "Libyan Premier League",
      leagueId: 1040,
    },
    {
      id: 1040,
      name: currentLanguage === "ar" ? "الزمالك" : "Zamalek",
      logo: "https://media.api-sports.io/football/teams/1040.png",
      league: "Egyptian Premier League",
      leagueId: 233,
    },
    {
      id: 969,
      name: currentLanguage === "ar" ? "الجيش الملكي" : "FAR Rabat",
      logo: "https://media.api-sports.io/football/teams/969.png",
      league: "Botola Pro",
      leagueId: 200,
    },
    {
      id: 10755,
      name: currentLanguage === "ar" ? "مولودية واد" : "Mouloudia Oued",
      logo: "https://media.api-sports.io/football/teams/10755.png",
      league: "Algerian Ligue 1",
      leagueId: 302,
    },
    {
      id: 3453,
      name: currentLanguage === "ar" ? "المغرب الفاسي" : "Maghreb Fès",
      logo: "https://media.api-sports.io/football/teams/3453.png",
      league: "Botola Pro",
      leagueId: 200,
    },
    {
      id: 2932,
      name: currentLanguage === "ar" ? "الهلال السعودي" : "Al-Hilal Saudi FC",
      logo: "https://media.api-sports.io/football/teams/2932.png",
      league: "Saudi Pro League",
      leagueId: 307,
    },
    {
      id: 2938,
      name: currentLanguage === "ar" ? "الاتحاد السعودي" : "Al-Ittihad FC",
      logo: "https://media.api-sports.io/football/teams/2938.png",
      league: "Saudi Pro League",
      leagueId: 307,
    },
    {
      id: 2939,
      name: currentLanguage === "ar" ? "النصر السعودي" : "Al-Nassr",
      logo: "https://media.api-sports.io/football/teams/2939.png",
      league: "Saudi Pro League",
      leagueId: 307,
    },
    {
      id: 9568,
      name: currentLanguage === "ar" ? "انتر ميامي" : "Inter Miami",
      logo: "https://media.api-sports.io/football/teams/9568.png",
      league: "Major League Soccer",
      leagueId: 253,
    },
  ];

  // Animation configuration
  const speed = 60; // pixels per second
  const direction = "left";
  const pauseOnHover = true;

  const targetVelocity = useMemo(() => {
    const magnitude = Math.abs(speed);
    const directionMultiplier = direction === "left" ? 1 : -1;
    const speedMultiplier = speed < 0 ? -1 : 1;
    return magnitude * directionMultiplier * speedMultiplier;
  }, [speed, direction]);

  // Update dimensions for infinite loop
  const updateDimensions = useCallback(() => {
    const containerWidth = containerRef.current?.clientWidth ?? 0;
    const sequenceWidth = seqRef.current?.getBoundingClientRect?.()?.width ?? 0;

    if (sequenceWidth > 0) {
      setSeqWidth(Math.ceil(sequenceWidth));
      const copiesNeeded =
        Math.ceil(containerWidth / sequenceWidth) +
        ANIMATION_CONFIG.COPY_HEADROOM;
      setCopyCount(Math.max(ANIMATION_CONFIG.MIN_COPIES, copiesNeeded));
    }
  }, []);

  // Resize observer effect
  useEffect(() => {
    if (!window.ResizeObserver) {
      const handleResize = () => updateDimensions();
      window.addEventListener("resize", handleResize);
      updateDimensions();
      return () => window.removeEventListener("resize", handleResize);
    }

    const observers = [containerRef, seqRef].map((ref) => {
      if (!ref.current) return null;
      const observer = new ResizeObserver(updateDimensions);
      observer.observe(ref.current);
      return observer;
    });

    updateDimensions();

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, [updateDimensions]);

  // Animation loop
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (seqWidth > 0) {
      offsetRef.current =
        ((offsetRef.current % seqWidth) + seqWidth) % seqWidth;
      track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
    }

    if (prefersReduced) {
      track.style.transform = "translate3d(0, 0, 0)";
      return () => {
        lastTimestampRef.current = null;
      };
    }

    const animate = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }

      const deltaTime =
        Math.max(0, timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      const target = pauseOnHover && isHovered ? 0 : targetVelocity;

      const easingFactor =
        1 - Math.exp(-deltaTime / ANIMATION_CONFIG.SMOOTH_TAU);
      velocityRef.current += (target - velocityRef.current) * easingFactor;

      if (seqWidth > 0) {
        let nextOffset = offsetRef.current + velocityRef.current * deltaTime;
        nextOffset = ((nextOffset % seqWidth) + seqWidth) % seqWidth;
        offsetRef.current = nextOffset;

        const translateX = -offsetRef.current;
        track.style.transform = `translate3d(${translateX}px, 0, 0)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTimestampRef.current = null;
    };
  }, [targetVelocity, seqWidth, isHovered, pauseOnHover]);

  // Mouse hover handlers
  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover) setIsHovered(true);
  }, [pauseOnHover]);

  const handleMouseLeave = useCallback(() => {
    if (pauseOnHover) setIsHovered(false);
  }, [pauseOnHover]);

  return (
    <div className="bg-background dark:bg-[#181a20] sm:border-b sm:border-border sm:dark:border-[#23262f] pt-2 pb-0 sm:py-4 mt-0">
      <div className="container mx-auto px-2 sm:px-4">
        <div
          ref={containerRef}
          className="relative overflow-hidden"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Infinite Loop Animation Track */}
          <div
            ref={trackRef}
            className="flex w-max will-change-transform select-none motion-reduce:transform-none py-2"
          >
            {Array.from({ length: copyCount }, (_, copyIndex) => (
              <div
                key={`copy-${copyIndex}`}
                ref={copyIndex === 0 ? seqRef : undefined}
                className="flex gap-4 px-2"
              >
                {teams.map((team) => (
                  <div
                    key={`${copyIndex}-${team.id}`}
                    className="flex-shrink-0"
                  >
                    <div
                      className="group cursor-pointer"
                      onClick={() =>
                        navigate(`/team/${team.id}`, {
                          state: { leagueId: team.leagueId },
                        })
                      }
                    >
                      <div className="w-16 h-16 md:w-20 md:h-20 lg:w-22 lg:h-22 xl:w-24 xl:h-24 mx-auto bg-white dark:bg-[#181a20] rounded-2xl shadow hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group-hover:scale-105 flex items-center justify-center border border-gray-100 dark:border-[#23262f]">
                        <img
                          src={team.logo}
                          alt={team.name}
                          className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg";
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamsLogos;
