// Fonctions utilitaires pour la gestion des matchs
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

export const isArabic = (str: string) => /[\u0600-\u06FF]/.test(str);

export const getDisplayTeamName = (name: string, getTeamTranslation: (name: string) => string) => {
  const translated = getTeamTranslation(name);
  return isArabic(translated) ? translated : name;
};

export const formatDisplayDate = (dateString: string, currentLanguage: string, tz: string) => {
  if (!dateString) return '';
  const localDate = dayjs.utc(dateString).tz(tz);
  if (currentLanguage === 'ar') {
    return localDate.locale('ar').format('D MMMM YYYY');
  }
  return localDate.locale('fr').format('D MMM YYYY');
};

export const formatTimeLocalized = (dateString: string, currentLanguage: string, tz: string, hourFormat: '12'|'24') => {
  if (!dateString) return '';
  const localDate = dayjs.utc(dateString).tz(tz);
  let formatString = hourFormat === '12' ? 'hh:mm A' : 'HH:mm';
  if (currentLanguage === 'ar') {
    return localDate.locale('ar').format(formatString);
  }
  return localDate.locale('fr').format(formatString);
};

export const flattenMatch = (item: any) => {
  const fixture = item.fixture || item;
  const league = item.league || {};
  return {
    id: fixture.id,
    date: fixture.date,
    status: fixture.status?.short || item.status || '',
    league: {
      id: league.id,
      name: league.name || '',
      logo: league.logo || '',
    },
    teams: item.teams,
    goals: item.goals,
    score: item.score,
  };
};
