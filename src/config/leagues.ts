import { MAIN_LEAGUES } from './api';
import { LEAGUE_IDS } from './leagueIds';

export interface League {
  id: number;
  name: string;
  nameAr: string;
  logo: string;
  country?: string;
  countryAr?: string;
  flag?: string;
}

export const LEAGUES: League[] = [
  {
    name: "Premier League",
    nameAr: "الدوري الإنجليزي الممتاز",
    id: LEAGUE_IDS.PREMIER_LEAGUE,
    logo: "https://media.api-sports.io/football/leagues/39.png",
    country: "England",
    countryAr: "إنجلترا",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿"
  },
  {
    name: "Ligue 1",
    nameAr: "الدوري الفرنسي الممتاز",
    id: LEAGUE_IDS.LIGUE_1,
    logo: "https://media.api-sports.io/football/leagues/61.png",
    country: "France",
    countryAr: "فرنسا",
    flag: "🇫🇷"
  },
  {
    name: "Champions League",
    nameAr: "دوري أبطال أوروبا",
    id: LEAGUE_IDS.CHAMPIONS_LEAGUE,
    logo: "https://media.api-sports.io/football/leagues/2.png",
    country: "Europe",
    countryAr: "أوروبا",
    flag: "🇪🇺"
  },
  {
    name: "Europa League",
    nameAr: "الدوري الأوروبي",
    id: LEAGUE_IDS.EUROPA_LEAGUE,
    logo: "https://media.api-sports.io/football/leagues/3.png",
    country: "Europe",
    countryAr: "أوروبا",
    flag: "🇪🇺"
  },
  {
    name: "Conference League",
    nameAr: "دوري المؤتمر الأوروبي",
    id: LEAGUE_IDS.CONFERENCE_LEAGUE,
    logo: "https://media.api-sports.io/football/leagues/848.png",
    country: "Europe",
    countryAr: "أوروبا",
    flag: "🇪🇺"
  },
  {
    name: "CAF Champions League",
    nameAr: "دوري أبطال أفريقيا",
    id: LEAGUE_IDS.CAF_CHAMPIONS_LEAGUE,
    logo: "https://media.api-sports.io/football/leagues/12.png",
    country: "Africa",
    countryAr: "أفريقيا",
    flag: "🌍"
  },
  {
    name: "CAF Confederation Cup",
    nameAr: "كأس الكونفدرالية الأفريقية",
    id: LEAGUE_IDS.CAF_CONFEDERATION_CUP,
    logo: "https://media.api-sports.io/football/leagues/20.png",
    country: "Africa",
    countryAr: "أفريقيا",
    flag: "🌍"
  },
  {
    name: "Egyptian Premier League",
    nameAr: "الدوري المصري الممتاز",
    id: LEAGUE_IDS.EGYPTIAN_PREMIER_LEAGUE,
    logo: "https://media.api-sports.io/football/leagues/233.png",
    country: "Egypt",
    countryAr: "مصر",
    flag: "🇪🇬"
  },
  {
    name: "La Liga",
    nameAr: "الدوري الإسباني الممتاز",
    id: LEAGUE_IDS.LA_LIGA,
    logo: "https://media.api-sports.io/football/leagues/140.png",
    country: "Spain",
    countryAr: "إسبانيا",
    flag: "🇪🇸"
  },
  {
    name: "Botola Maroc",
    nameAr: "البطولة المغربية - البطولة برو",
    id: LEAGUE_IDS.BOTOLA_MAROC,
    logo: "https://media.api-sports.io/football/leagues/200.png",
    country: "Morocco",
    countryAr: "المغرب",
    flag: "🇲🇦"
  },
  {
    name: "Bundesliga",
    nameAr: "الدوري الألماني الممتاز",
    id: LEAGUE_IDS.BUNDESLIGA,
    logo: "https://media.api-sports.io/football/leagues/78.png",
    country: "Germany",
    countryAr: "ألمانيا",
    flag: "🇩🇪"
  },
  {
    name: "Serie A",
    nameAr: "الدوري الإيطالي الممتاز",
    id: LEAGUE_IDS.SERIE_A,
    logo: "https://media.api-sports.io/football/leagues/135.png",
    country: "Italy",
    countryAr: "إيطاليا",
    flag: "🇮🇹"
  },
  {
    name: "Eredivisie",
    nameAr: "الدوري الهولندي الممتاز",
    id: LEAGUE_IDS.EREDIVISIE,
    logo: "https://media.api-sports.io/football/leagues/88.png",
    country: "Netherlands",
    countryAr: "هولندا",
    flag: "🇳🇱"
  },
  {
    name: "Primeira Liga",
    nameAr: "الدوري البرتغالي الممتاز",
    id: LEAGUE_IDS.PRIMEIRA_LIGA,
    logo: "https://media.api-sports.io/football/leagues/94.png",
    country: "Portugal",
    countryAr: "البرتغال",
    flag: "🇵🇹"
  },
  {
    name: "Saudi Pro League",
    nameAr: "الدوري السعودي للمحترفين",
    id: LEAGUE_IDS.SAUDI_PRO_LEAGUE,
    logo: "https://media.api-sports.io/football/leagues/307.png",
    country: "Saudi Arabia",
    countryAr: "السعودية",
    flag: "🇸🇦"
  },
  {
    name: "QSL Cup",
    nameAr: "كأس قطر QSL",
    id: LEAGUE_IDS.QSL_CUP,
    logo: "https://media.api-sports.io/football/leagues/677.png",
    country: "Qatar",
    countryAr: "قطر",
    flag: "🇶🇦"
  },
  {
    name: "Algeria Ligue 1",
    nameAr: "الدوري الجزائري - الرابطة المحترفة الأولى",
    id: LEAGUE_IDS.ALGERIA_LIGUE_1,
    logo: "https://media.api-sports.io/football/leagues/186.png",
    country: "Algeria",
    countryAr: "الجزائر",
    flag: "🇩🇿"
  },
  {
    name: "Botola 2",
    nameAr: "البطولة المغربية الثانية",
    id: LEAGUE_IDS.BOTOLA_2,
    logo: "https://media.api-sports.io/football/leagues/201.png",
    country: "Morocco",
    countryAr: "المغرب",
    flag: "🇲🇦"
  },
  {
    name: "Morocco Cup",
    nameAr: "كأس المغرب",
    id: LEAGUE_IDS.MOROCCO_CUP,
    logo: "https://media.api-sports.io/football/leagues/822.png",
    country: "Morocco",
    countryAr: "المغرب",
    flag: "🇲🇦"
  },
  {
    name: "Egypt Second League",
    nameAr: "الدوري المصري الدرجة الثانية",
    id: LEAGUE_IDS.EGYPTIAN_SECOND_LEAGUE,
    logo: "https://media.api-sports.io/football/leagues/887.png",
    country: "Egypt",
    countryAr: "مصر",
    flag: "🇪🇬"
  },
  {
    name: "Egypt Super Cup",
    nameAr: "كأس السوبر المصري",
    id: LEAGUE_IDS.EGYPT_SUPER_CUP,
    logo: "https://media.api-sports.io/football/leagues/539.png",
    country: "Egypt",
    countryAr: "مصر",
    flag: "🇪🇬"
  },
  {
    name: "Egypt Cup",
    nameAr: "كأس مصر",
    id: LEAGUE_IDS.EGYPT_CUP,
    logo: "https://media.api-sports.io/football/leagues/714.png",
    country: "Egypt",
    countryAr: "مصر",
    flag: "🇪🇬"
  },
  {
    name: "Egypt League Cup",
    nameAr: "كأس الدوري المصري",
    id: LEAGUE_IDS.EGYPT_LEAGUE_CUP,
    logo: "https://media.api-sports.io/football/leagues/895.png",
    country: "Egypt",
    countryAr: "مصر",
    flag: "🇪🇬"
  },
  {
    name: "King's Cup",
    nameAr: "كأس الملك",
    id: LEAGUE_IDS.KINGS_CUP,
    logo: "https://media.api-sports.io/football/leagues/504.png",
    country: "Saudi Arabia",
    countryAr: "السعودية",
    flag: "🇸🇦"
  },
  {
    name: "Super Cup",
    nameAr: "كأس السوبر",
    id: LEAGUE_IDS.SUPER_CUP,
    logo: "https://media.api-sports.io/football/leagues/826.png",
    country: "Saudi Arabia",
    countryAr: "السعودية",
    flag: "🇸🇦"
  },
  {
    name: "Division 1",
    nameAr: "الدرجة الأولى",
    id: LEAGUE_IDS.DIVISION_1,
    logo: "https://media.api-sports.io/football/leagues/308.png",
    country: "Qatar",
    countryAr: "قطر",
    flag: "🇶🇦"
  },
  {
    name: "Emir Cup",
    nameAr: "كأس الأمير",
    id: LEAGUE_IDS.EMIR_CUP,
    logo: "https://media.api-sports.io/football/leagues/824.png",
    country: "Qatar",
    countryAr: "قطر",
    flag: "🇶🇦"
  },
  {
    name: "Libya Premier League",
    nameAr: "الدوري الليبي الممتاز",
    id: LEAGUE_IDS.LIBYA_PREMIER_LEAGUE,
    logo: "https://media.api-sports.io/football/leagues/584.png",
    country: "Libya",
    countryAr: "ليبيا",
    flag: "🇱🇾"
  },
  {
    name: "World Cup - Qualification Europe",
    nameAr: "تصفيات كأس العالم - أوروبا",
    id: LEAGUE_IDS.WORLD_CUP_QUALIFICATION_EUROPE,
    logo: "https://media.api-sports.io/football/leagues/32.png",
    country: "Europe",
    countryAr: "أوروبا",
    flag: "🌍"
  },
  {
    name: "World Cup - Qualification Africa",
    nameAr: "تصفيات كأس العالم - أفريقيا",
    id: LEAGUE_IDS.WORLD_CUP_QUALIFICATION_AFRICA,
    logo: "https://media.api-sports.io/football/leagues/29.png",
    country: "Africa",
    countryAr: "أفريقيا",
    flag: "🌍"
  },
  {
    name: "Africa Cup of Nations",
    nameAr: "كأس الأمم الأفريقية",
    id: LEAGUE_IDS.AFRICA_CUP_OF_NATIONS,
    logo: "https://media.api-sports.io/football/leagues/6.png",
    country: "Africa",
    countryAr: "أفريقيا",
    flag: "🌍"
  },
  {
    name: "Africa Cup of Nations - Qualification",
    nameAr: "تصفيات كأس الأمم الأفريقية",
    id: LEAGUE_IDS.AFRICA_CUP_QUALIFICATION,
    logo: "https://media.api-sports.io/football/leagues/36.png",
    country: "Africa",
    countryAr: "أفريقيا",
    flag: "🌍"
  },
  {
    name: "Friendlies",
    nameAr: "المباريات الودية",
    id: LEAGUE_IDS.FRIENDLIES,
    logo: "https://media.api-sports.io/football/leagues/10.png",
    country: "International",
    countryAr: "دولي",
    flag: "🌐"
  }
];

// Fonction utilitaire pour obtenir le nom d'une ligue selon la langue
export const getLeagueName = (league: League, language: string): string => {
  return language === 'ar' ? league.nameAr : league.name;
};

// Fonction utilitaire pour obtenir le nom du pays selon la langue
export const getLeagueCountry = (league: League, language: string): string => {
  return language === 'ar' ? (league.countryAr || league.country || '') : (league.country || '');
};

// Fonction pour obtenir une ligue par son ID
export const getLeagueById = (id: number): League | undefined => {
  return LEAGUES.find(league => league.id === id);
};