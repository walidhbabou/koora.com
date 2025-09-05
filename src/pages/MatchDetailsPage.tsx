import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MatchDetails from "@/components/MatchDetails";
import { useTranslation } from "@/hooks/useTranslation";
import { useSettings } from "@/contexts/SettingsContext";
import { Button } from "@/components/ui/button";

const MatchDetailsPage: React.FC = () => {
  const { currentLanguage, isRTL, direction } = useTranslation();
  const { timezone, hourFormat } = useSettings();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation() as any;
  const match = location?.state?.match as any | undefined;

  return (
    <div dir={direction} className={`min-h-screen bg-[#f6f7fa] dark:bg-[#020617] ${isRTL ? 'rtl' : 'ltr'}`}>
      <Header />
      <div className="container mx-auto px-2 sm:px-3 py-3 sm:py-6 max-w-[980px]">
        <div className="mb-3">
          <Button variant="outline" className="rounded-full" onClick={() => navigate(-1)}>
            {currentLanguage === 'ar' ? 'رجوع' : 'Retour'}
          </Button>
        </div>

        {!match ? (
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-[#e5e9f0] dark:border-[#334155] p-6 text-center">
            <div className="text-lg font-semibold mb-2 text-[#0f172a] dark:text-[#e2e8f0]">
              {currentLanguage === 'ar' ? 'لا توجد معلومات للمباراة' : 'Aucune donnée de match fournie'}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {currentLanguage === 'ar' ? 'يرجى العودة واختيار مباراة' : 'Veuillez revenir en arrière et sélectionner un match.'}
            </div>
          </div>
        ) : (
          <MatchDetails 
            match={{
              id: match.id,
              date: match.date,
              time: new Intl.DateTimeFormat(
                currentLanguage === 'ar' ? 'ar' : 'fr-FR',
                { hour: '2-digit', minute: '2-digit', hour12: hourFormat === '12', timeZone: timezone }
              ).format(new Date(match.date)),
              status: match.status || 'scheduled',
              venue: undefined,
              referee: undefined,
              league: {
                id: match.league?.id,
                name: match.league?.name,
                logo: match.league?.logo,
                country: ''
              },
              teams: {
                home: {
                  id: match.teams?.home?.id,
                  name: match.teams?.home?.name,
                  logo: match.teams?.home?.logo,
                  score: match.goals?.home || undefined
                },
                away: {
                  id: match.teams?.away?.id,
                  name: match.teams?.away?.name,
                  logo: match.teams?.away?.logo,
                  score: match.goals?.away || undefined
                }
              },
              goals: [],
              cards: [],
              substitutions: []
            }}
            onClose={() => navigate(-1)}
          />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MatchDetailsPage;
