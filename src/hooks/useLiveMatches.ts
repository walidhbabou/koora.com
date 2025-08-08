import { useEffect, useState } from "react";
import { footballAPI, translateAPI } from "@/config/api";

export const useLiveMatches = ({ translateContent = false, refreshInterval = 0 }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result: any = await footballAPI.getLiveFixtures();

      if (translateContent) {
        for (const match of result.response) {
          // Traduire noms d’équipes
          if (match.teams?.home?.name) {
            const translated = await translateAPI.translateToArabic(match.teams.home.name);
            match.teams.home.nameTranslated = { arabic: translated };
          }
          if (match.teams?.away?.name) {
            const translated = await translateAPI.translateToArabic(match.teams.away.name);
            match.teams.away.nameTranslated = { arabic: translated };
          }

          // Traduire nom de ligue
          if (match.league?.name) {
            const translated = await translateAPI.translateToArabic(match.league.name);
            match.league.nameTranslated = { arabic: translated };
          }
        }
      }

      setData(result);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    let interval: NodeJS.Timeout;
    if (refreshInterval > 0) {
      interval = setInterval(fetchData, refreshInterval);
    }
    return () => clearInterval(interval);
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    lastUpdated
  };
};
