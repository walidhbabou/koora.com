import { footballTranslationService } from '@/services/translationService';

// teamTranslations.ts
export const teamTranslations: Record<string, string> = {

    // Premier League (20 clubs)
    'Arsenal': 'آرسنال',
    'Aston Villa': 'أستون فيلا',
    'AFC Bournemouth': 'بورنموث',
    'Brentford': 'برينتفورد',
    'Brighton & Hove Albion': 'برايتون أند هوف ألبیون',
    'Burnley': 'بيرنلي',
    'Chelsea': 'تشيلسي',
    'Crystal Palace': 'كريستال بالاس',
    'Everton': 'إيفرتون',
    'Fulham': 'فولهام',
    'Leeds United': 'ليدز يونايتد',
    'Liverpool': 'ليفربول',
    'Manchester City': 'مانشستر سيتي',
    'Manchester United': 'مانشستر يونايتد',
    'Newcastle United': 'نيوكاسل يونايتد',
    'Nottingham Forest': 'نوتنغهام فورست',
    'Sunderland': 'سندرلاند',
    'Tottenham Hotspur': 'توتنهام هوتسبير',
    'West Ham United': 'وست هام يونايتد',
    'Wolverhampton Wanderers': 'وولفرهامبتون واندررز',
  
    // La Liga (20 clubs)
    'Athletic Club': 'أتلتيك بلباو',
    'Alavés': 'ألافيس',
    'Barcelona': 'برشلونة',
    'Celta Vigo': 'سيلتا فيغو',
    'Elche': 'إلتشي',
    'Espanyol': 'إسبانيول',
    'Valencia': 'فالنسيا',
    'Atlético de Madrid': 'أتلتيكو مدريد',
    'Getafe': 'خيتافي',
    'Rayo Vallecano': 'رايو فاليكانو',
    'Real Madrid': 'ريال مدريد',
    'Sevilla': 'إشبيلية',
    'Real Betis': 'ريال بيتيس',
    'Villarreal': 'فياريال',
    'Real Sociedad': 'ريال سوسيداد',
    'Osasuna': 'أوساسونا',
    'RCD Mallorca': 'ريال نادي مايوركا',
    'Cádiz': 'قادش',
    'Granada': 'غرناطة',
    'Valladolid': 'بلد الوليد',
  
    // Serie A (20 clubs)
    'Juventus': 'يوفنتوس',
    'Inter Milan': 'إنتر ميلان',
    'AC Milan': 'إيه سي ميلان',
    'Roma': 'روما',
    'Napoli': 'نابولي',
    'Atalanta': 'أتالانتا',
    'Lazio': 'لاتسيو',
    'Torino': 'تورينو',
    'Fiorentina': 'فيورنتينا',
    'Bologna': 'بولونيا',
    'Sassuolo': 'ساسولو',
    'Frosinone': 'فروسينوني',
    'Empoli': 'إمبولي',
    'Genoa': 'جينوا',
    'Udinese': 'أودينيزي',
    'Monza': 'مونزا',
    'Lecce': 'ليتشي',
    'Spezia': 'سبزيا',
    'Verona': 'هيلاس فيرونا',
    'Salernitana': 'ساليرنيتانا',
  
    // Bundesliga (18 clubs)
    'Bayern Munich': 'بايرن ميونخ',
    'Borussia Dortmund': 'بوروسيا دورتموند',
    'Eintracht Frankfurt': 'آينتراخت فرانكفورت',
    'Bayer Leverkusen': 'باير ليفركوزن',
    'RB Leipzig': 'لايبزيغ',
    'VfL Wolfsburg': 'فولفسبورغ',
    'Stuttgart': 'شتوتغارت',
    'Union Berlin': 'أونيون برلين',
    'Werder Bremen': 'وردر بريمن',
    'Mainz': 'ماينز',
    'Hoffenheim': 'هوفنهايم',
    'Heidenheim': 'هايدنهايم',
    'Freiburg': 'فرايبورغ',
    'Dortmund': 'دورتموند',
    'Koln': 'كولن',
    'Bochum': 'بوخوم',
    'Augsburg': 'أوجسبورغ',
    'Hansa Rostock': 'هانزا روستوك',
  
    // Ligue 1 (18 clubs)
    'Paris Saint-Germain': 'باريس سان جيرمان',
    'Marseille': 'مرسيليا',
    'Monaco': 'موناكو',
    'Lyon': 'ليون',
    'Lens': 'لنس',
    'Lille': 'ليل',
    'Rennes': 'رين',
    'Strasbourg': 'ستراسبورغ',
    'Brest': 'بريست',
    'Nice': 'نيس',
    'Toulouse': 'تولوز',
    'Angers': 'أنجيه',
    'Auxerre': 'أوكسير',
    'Le Havre': 'لوهافر',
    'Nantes': 'نانت',
    'Metz': 'ميتز',
    'Lorient': 'لورين',
    'Clermont': 'كليرمون',
  
    // Botola Pro (16 clubs)
    'Wydad Casablanca': 'الوداد الرياضي',
    'Raja Casablanca': 'الرجاء الرياضي',
    'FAR Rabat': 'الجيش الملكي',
    'Moghreb Tétouan': 'المغرب التطواني',
    'Olympic Safi': 'أولمبيك آسفي',
    'Hassania Agadir': 'حسنية أكادير',
    'Ittihad Tanger': 'اتحاد طنجة',
    'Difaa El Jadida': 'الدفاع الحسني الجديدي',
    'RS Berkane': 'الرجاء الرياضي البركاني',
    'Olympic Khouribga': 'أولمبيك خريبكة',
    'Youssoufia Berrechid': 'اليوسفية البرشيد',
    'Mouloudia Oujda': 'المولودية الوجدية',
    'Renaissance Berkane': 'نهضة بركان',
    'Chabab Mohammédia': 'شباب المحمدية',
    'Kawkab Marrakech': 'الكوكب المراكشي',
    'Racing de Casablanca': 'الرجاء البيضاوي',
  
    // UEFA Champions League 2025-26 (phase de poules, 36 clubs) :contentReference[oaicite:0]{index=0}
    'PSV Eindhoven': 'بي إس في آيندهوفن',
    'Ajax': 'أياكس',
    'Sporting CP': 'سبورتينغ لشبونة',
    'Olympiacos': 'أولمبياكوس',
    'Benfica': 'بنفيكا',
    'Club Brugge': 'كلوب بروج',
    'Copenhagen': 'كوبنهاغن',
    'Galatasaray': 'غلطة سراي',
    'Union Saint-Gilloise': 'يونيون سان جيلوّيز',
    'Qarabağ': 'قره باغ',
    'Pafos': 'بابوس',
    'Kairat Almaty': 'كايارت ألماتي',
  
  };
  
// Cache pour les traductions automatiques
const autoTranslationCache = new Map<string, string>();

// Fonction pour vérifier si un nom d'équipe est déjà en arabe
const isArabicText = (text: string): boolean => {
  // Vérifier si le texte contient des caractères arabes
  const arabicRegex = /[\u0600-\u06FF]/;
  return arabicRegex.test(text);
};

// Fonction pour obtenir la traduction d'une équipe (statique ou automatique)
  export const getTeamTranslation = (teamName: string): string => {
  // Si le nom est vide ou null, retourner tel quel
  if (!teamName || teamName.trim() === '') {
    return teamName;
  }

  // Si le nom est déjà en arabe, le retourner tel quel
  if (isArabicText(teamName)) {
    return teamName;
  }

  // Vérifier d'abord dans le mapping statique
  if (teamTranslations[teamName]) {
    return teamTranslations[teamName];
  }

  // Vérifier dans le cache des traductions automatiques
  if (autoTranslationCache.has(teamName)) {
    return autoTranslationCache.get(teamName)!;
  }

  // Si pas trouvé, déclencher la traduction automatique immédiatement
  // et retourner le nom original temporairement
  translateTeamNameAsync(teamName).catch(error => {
    console.error(`Erreur lors de la traduction automatique de "${teamName}":`, error);
  });
  
  return teamName;
};

// Fonction pour traduire automatiquement un nom d'équipe
export const translateTeamNameAsync = async (teamName: string): Promise<string> => {
  // Si le nom est vide ou null, retourner tel quel
  if (!teamName || teamName.trim() === '') {
    return teamName;
  }

  // Si le nom est déjà en arabe, le retourner tel quel
  if (isArabicText(teamName)) {
    return teamName;
  }

  // Vérifier d'abord dans le mapping statique
  if (teamTranslations[teamName]) {
    return teamTranslations[teamName];
  }

  // Vérifier dans le cache des traductions automatiques
  if (autoTranslationCache.has(teamName)) {
    return autoTranslationCache.get(teamName)!;
  }

  try {
    // Utiliser le service de traduction automatique
    const translation = await footballTranslationService.quickTranslateToArabic(teamName);
    
    // Mettre en cache la traduction
    autoTranslationCache.set(teamName, translation);
    
    return translation;
  } catch (error) {
    console.error(`Erreur lors de la traduction de "${teamName}":`, error);
    // En cas d'erreur, retourner le nom original
    return teamName;
  }
};

// Fonction pour traduire plusieurs noms d'équipes en lot
export const translateTeamNamesBatch = async (teamNames: string[]): Promise<string[]> => {
  const results: string[] = [];
  const toTranslate: string[] = [];

  // Première passe : vérifier le mapping statique et le cache
  for (const teamName of teamNames) {
    if (!teamName || teamName.trim() === '') {
      results.push(teamName);
    } else if (isArabicText(teamName)) {
      results.push(teamName);
    } else if (teamTranslations[teamName]) {
      results.push(teamTranslations[teamName]);
    } else if (autoTranslationCache.has(teamName)) {
      results.push(autoTranslationCache.get(teamName)!);
    } else {
      results.push(''); // Placeholder pour les noms à traduire
      toTranslate.push(teamName);
    }
  }

  // Deuxième passe : traduire les noms manquants
  if (toTranslate.length > 0) {
    try {
      const translations = await footballTranslationService.translateBatchToArabic(toTranslate);
      
      // Mettre à jour les résultats et le cache
      let translateIndex = 0;
      for (let i = 0; i < results.length; i++) {
        if (results[i] === '') {
          const translation = translations[translateIndex];
          results[i] = translation;
          autoTranslationCache.set(teamNames[i], translation);
          translateIndex++;
        }
      }
    } catch (error) {
      console.error('Erreur lors de la traduction en lot:', error);
      // En cas d'erreur, remplacer les placeholders par les noms originaux
      for (let i = 0; i < results.length; i++) {
        if (results[i] === '') {
          results[i] = teamNames[i];
        }
      }
    }
  }

  return results;
};

// Fonction pour vider le cache des traductions automatiques
export const clearAutoTranslationCache = (): void => {
  autoTranslationCache.clear();
};

// Fonction pour obtenir la taille du cache
export const getAutoTranslationCacheSize = (): number => {
  return autoTranslationCache.size;
};

// Fonction pour ajouter manuellement une traduction au cache
export const addTeamTranslation = (originalName: string, arabicName: string): void => {
  autoTranslationCache.set(originalName, arabicName);
};

// Fonction pour forcer la traduction automatique de tous les noms d'équipes
export const forceTranslateAllTeams = async (teamNames: string[]): Promise<void> => {
  const uniqueTeamNames = [...new Set(teamNames.filter(name => 
    name && name.trim() !== '' && !isArabicText(name) && !teamTranslations[name] && !autoTranslationCache.has(name)
  ))];

  if (uniqueTeamNames.length > 0) {
    try {
      // Traduire par petits lots pour éviter de bloquer l'interface
      const batchSize = 5;
      for (let i = 0; i < uniqueTeamNames.length; i += batchSize) {
        const batch = uniqueTeamNames.slice(i, i + batchSize);
        const translations = await footballTranslationService.translateBatchToArabic(batch);
        
        // Mettre en cache les traductions
        batch.forEach((name, index) => {
          if (translations[index]) {
            autoTranslationCache.set(name, translations[index]);
          }
        });
        
        // Petite pause pour ne pas bloquer l'interface
        if (i + batchSize < uniqueTeamNames.length) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
    } catch (error) {
      console.error('Erreur lors de la traduction forcée:', error);
    }
  }
};

// Fonction pour obtenir la traduction avec mise à jour automatique du cache
export const getTeamTranslationWithAutoUpdate = async (teamName: string): Promise<string> => {
  // Si le nom est vide ou null, retourner tel quel
  if (!teamName || teamName.trim() === '') {
    return teamName;
  }

  // Si le nom est déjà en arabe, le retourner tel quel
  if (isArabicText(teamName)) {
    return teamName;
  }

  // Vérifier d'abord dans le mapping statique
  if (teamTranslations[teamName]) {
    return teamTranslations[teamName];
  }

  // Vérifier dans le cache des traductions automatiques
  if (autoTranslationCache.has(teamName)) {
    return autoTranslationCache.get(teamName)!;
  }

  // Si pas trouvé, traduire automatiquement et mettre en cache
  try {
    const translation = await footballTranslationService.quickTranslateToArabic(teamName);
    autoTranslationCache.set(teamName, translation);
    return translation;
  } catch (error) {
    console.error(`Erreur lors de la traduction de "${teamName}":`, error);
    return teamName;
  }
  };
  