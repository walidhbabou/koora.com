// Centralized Arabic translations for football-related labels (events, stats, misc)
// and helpers to render Arabic team names consistently.

import { getTeamTranslation } from './teamNameMap';

// Event detail translations mapping (based on API-FOOTBALL typical values)
const eventDetailArMap: Record<string, string> = {
  // Goals
  'Normal Goal': 'هدف',
  'Penalty': 'ركلة جزاء',
  'Penalty confirmed': 'تأكيد ركلة الجزاء',
  'Missed Penalty': 'ركلة جزاء مهدرة',
  'Own Goal': 'هدف عكسي',
  'VAR: Goal cancelled': 'VAR: إلغاء الهدف',

  // Cards
  'Yellow Card': 'بطاقة صفراء',
  'Red Card': 'بطاقة حمراء',
  'Second Yellow card': 'بطاقة صفراء ثانية',

  // Substitutions
  'Substitution': 'تبديل',
  'Substitution 1': 'تبديل 1',
  'Substitution 2': 'تبديل 2',
  'Substitution 3': 'تبديل 3',
  'Substitution 4': 'تبديل 4',

  // Misc / common variations
  'Kick Off': 'بداية المباراة',
  'Half Time': 'نهاية الشوط الأول',
  'Second Half': 'بداية الشوط الثاني',
  'Extra Time': 'وقت إضافي',
  'Penalty Shootout': 'ركلات الترجيح',
};

// Normalize keys to compare safely
function normalizeKey(s: string): string {
  return (s || '').toLowerCase().trim();
}

export function translateEventDetail(detail: string, lang: string): string {
  if (lang !== 'ar') return detail;
  // attempt exact match first
  if (eventDetailArMap[detail]) return eventDetailArMap[detail];

  // attempt normalized contains
  const key = normalizeKey(detail);
  if (key.includes('yellow') && key.includes('card')) return 'بطاقة صفراء';
  if (key.includes('red') && key.includes('card')) return 'بطاقة حمراء';
  if (key.includes('goal') && key.includes('own')) return 'هدف عكسي';
  if (key.includes('goal')) return 'هدف';
  if (key.includes('penalty') && key.includes('miss')) return 'ركلة جزاء مهدرة';
  if (key.includes('penalty')) return 'ركلة جزاء';
  if (key.includes('substitution')) {
    // keep trailing number if present
    const num = detail.match(/\d+/)?.[0];
    return num ? `تبديل ${num}` : 'تبديل';
  }

  return detail; // fallback
}

// Statistics type translations (API-FOOTBALL common types)
const statTypeArMap: Record<string, string> = {
  'Ball Possession': 'الاستحواذ',
  'Possession': 'الاستحواذ',
  'Shots on Goal': 'تسديدات على المرمى',
  'Shots off Goal': 'تسديدات خارج المرمى',
  'Total Shots': 'إجمالي التسديدات',
  'Blocked Shots': 'تسديدات محجوبة',
  'Shots insidebox': 'تسديدات من داخل المنطقة',
  'Shots outsidebox': 'تسديدات من خارج المنطقة',
  'Fouls': 'الأخطاء',
  'Corner Kicks': 'الركنيات',
  'Offsides': 'التسللات',
  'Yellow Cards': 'البطاقات الصفراء',
  'Red Cards': 'البطاقات الحمراء',
  'Goalkeeper Saves': 'تصديات الحارس',
  'Total passes': 'إجمالي التمريرات',
  'Passes accurate': 'تمريرات دقيقة',
  'Passes %': 'نسبة التمريرات',
  'expected_goals': 'الأهداف المتوقعة',
};

export function translateStatType(type: string, lang: string): string {
  if (lang !== 'ar') return type;
  if (statTypeArMap[type]) return statTypeArMap[type];
  // normalize some variations
  const key = normalizeKey(type);
  if (key.includes('possession')) return 'الاستحواذ';
  if (key.includes('shot') && key.includes('goal')) return 'تسديدات على المرمى';
  if (key.includes('shot') && key.includes('off')) return 'تسديدات خارج المرمى';
  if (key.startsWith('shots')) return 'إجمالي التسديدات';
  if (key.includes('corner')) return 'الركنيات';
  if (key.includes('offside')) return 'التسللات';
  if (key.includes('foul')) return 'الأخطاء';
  if (key.includes('yellow') && key.includes('card')) return 'البطاقات الصفراء';
  if (key.includes('red') && key.includes('card')) return 'البطاقات الحمراء';
  if (key.includes('save')) return 'تصديات الحارس';
  if (key.includes('pass') && key.includes('%')) return 'نسبة التمريرات';
  if (key.includes('pass')) return 'إجمالي التمريرات';
  return type;
}

export function translateTeam(name: string, lang: string): string {
  return lang === 'ar' ? getTeamTranslation(name) : name;
}
