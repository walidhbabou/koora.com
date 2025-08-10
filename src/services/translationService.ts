import { translateAPI, googleTranslateAPI, GOOGLE_TRANSLATE_CONFIG, MultilingualContent } from '../config/api';

// Service de traduction spécialisé pour le contenu football
export class FootballTranslationService {
  private static instance: FootballTranslationService;
  private translationCache: Map<string, MultilingualContent> = new Map();
  
  private constructor() {}
  
  public static getInstance(): FootballTranslationService {
    if (!FootballTranslationService.instance) {
      FootballTranslationService.instance = new FootballTranslationService();
    }
    return FootballTranslationService.instance;
  }
  
  // Générer une clé de cache
  private getCacheKey(text: string): string {
    return btoa(text).substring(0, 50); // Base64 tronqué pour éviter les clés trop longues
  }
  
  // Traduire le contenu d'actualités avec Google Translate
  async translateNewsContentFast(title: string, summary: string, content?: string): Promise<MultilingualContent> {
    const cacheKey = this.getCacheKey(title + summary);
    
    if (this.translationCache.has(cacheKey)) {
      return this.translationCache.get(cacheKey)!;
    }
    
    try {
      // Utiliser Google Translate pour une traduction plus rapide
      const textsToTranslate = content ? [title, summary, content] : [title, summary];
      const translatedTexts = await googleTranslateAPI.translateBatch(textsToTranslate, 'auto', 'ar');
      
      const [titleAr, summaryAr, contentAr] = translatedTexts;
      
      const result: MultilingualContent = {
        french: `${title}\n\n${summary}${content ? '\n\n' + content : ''}`,
        arabic: `${titleAr}\n\n${summaryAr}${contentAr ? '\n\n' + contentAr : ''}`,
        original: `${title}\n\n${summary}${content ? '\n\n' + content : ''}`
      };
      
      this.translationCache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Fast translation failed, falling back to standard translation:', error);
      // Fallback vers la méthode standard
      return this.translateNewsContent(title, summary, content);
    }
  }
  
  // Traduire le contenu d'actualités (méthode originale avec l'API hybride)
  async translateNewsContent(title: string, summary: string, content?: string): Promise<MultilingualContent> {
    const cacheKey = this.getCacheKey(title + summary);
    
    if (this.translationCache.has(cacheKey)) {
      return this.translationCache.get(cacheKey)!;
    }
    
    try {
      const [titleAr, summaryAr, contentAr] = await Promise.all([
        translateAPI.translateToArabic(title),
        translateAPI.translateToArabic(summary),
        content ? translateAPI.translateToArabic(content) : undefined
      ]);
      
      const result: MultilingualContent = {
        french: `${title}\n\n${summary}${content ? '\n\n' + content : ''}`,
        arabic: `${titleAr}\n\n${summaryAr}${contentAr ? '\n\n' + contentAr : ''}`,
        original: `${title}\n\n${summary}${content ? '\n\n' + content : ''}`
      };
      
      this.translationCache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Translation failed:', error);
      // Retourner le contenu original en cas d'erreur
      return {
        french: `${title}\n\n${summary}${content ? '\n\n' + content : ''}`,
        arabic: `${title}\n\n${summary}${content ? '\n\n' + content : ''}`,
        original: `${title}\n\n${summary}${content ? '\n\n' + content : ''}`
      };
    }
  }
  
  // Traduire les noms d'équipes et joueurs avec Google Translate (plus rapide)
  async translateTeamNameFast(teamName: string): Promise<MultilingualContent> {
    const cacheKey = this.getCacheKey(`team_${teamName}`);
    
    if (this.translationCache.has(cacheKey)) {
      return this.translationCache.get(cacheKey)!;
    }
    
    try {
      const arabicName = await googleTranslateAPI.translateToArabic(teamName);
      
      const result: MultilingualContent = {
        french: teamName,
        arabic: arabicName,
        original: teamName
      };
      
      this.translationCache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Fast team name translation failed, falling back:', error);
      return this.translateTeamName(teamName);
    }
  }
  
  // Traduire les noms d'équipes et joueurs (méthode originale avec cache)
  async translateTeamName(teamName: string): Promise<MultilingualContent> {
    const cacheKey = this.getCacheKey(`team_${teamName}`);
    
    if (this.translationCache.has(cacheKey)) {
      return this.translationCache.get(cacheKey)!;
    }
    
    try {
      const arabicName = await translateAPI.translateToArabic(teamName);
      
      const result: MultilingualContent = {
        french: teamName,
        arabic: arabicName,
        original: teamName
      };
      
      this.translationCache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Team name translation failed:', error);
      return {
        french: teamName,
        arabic: teamName,
        original: teamName
      };
    }
  }
  
  // Traduire les statuts de match
  async translateMatchStatus(status: string): Promise<MultilingualContent> {
    const statusTranslations: Record<string, MultilingualContent> = {
      'NS': { french: 'Pas commencé', arabic: 'لم تبدأ', original: 'Not Started' },
      'LIVE': { french: 'En direct', arabic: 'مباشر', original: 'Live' },
      'HT': { french: 'Mi-temps', arabic: 'استراحة', original: 'Half Time' },
      'FT': { french: 'Terminé', arabic: 'انتهت', original: 'Full Time' },
      'AET': { french: 'Après prolongation', arabic: 'بعد الوقت الإضافي', original: 'After Extra Time' },
      'PEN': { french: 'Aux tirs au but', arabic: 'بضربات الترجيح', original: 'Penalty Shootout' },
      'SUSP': { french: 'Suspendu', arabic: 'معلقة', original: 'Suspended' },
      'INT': { french: 'Interrompu', arabic: 'متوقفة', original: 'Interrupted' },
      'PST': { french: 'Reporté', arabic: 'مؤجلة', original: 'Postponed' },
      'CANC': { french: 'Annulé', arabic: 'ملغية', original: 'Cancelled' },
      'AWD': { french: 'Accordé', arabic: 'منح', original: 'Awarded' },
      'WO': { french: 'Forfait', arabic: 'انسحاب', original: 'Walk Over' }
    };
    
    return statusTranslations[status] || {
      french: status,
      arabic: await translateAPI.translateToArabic(status),
      original: status
    };
  }
  
  // Traduire les positions dans le classement
  async translateStandingDescription(description: string): Promise<MultilingualContent> {
    const commonDescriptions: Record<string, MultilingualContent> = {
      'Promotion - Champions League (Group Stage)': {
        french: 'Promotion - Ligue des Champions (Phase de groupes)',
        arabic: 'الترقية - دوري أبطال أوروبا (مرحلة المجموعات)',
        original: description
      },
      'Promotion - Europa League (Group Stage)': {
        french: 'Promotion - Ligue Europa (Phase de groupes)',
        arabic: 'الترقية - الدوري الأوروبي (مرحلة المجموعات)',
        original: description
      },
      'Relegation - Championship': {
        french: 'Relégation - Championship',
        arabic: 'الهبوط - الدرجة الثانية',
        original: description
      }
    };
    
    return commonDescriptions[description] || {
      french: await googleTranslateAPI.translateToFrench(description),
      arabic: await googleTranslateAPI.translateToArabic(description),
      original: description
    };
  }
  
  // Traduire les informations de transfert
  async translateTransferType(transferType: string): Promise<MultilingualContent> {
    const transferTypes: Record<string, MultilingualContent> = {
      'loan': { french: 'Prêt', arabic: 'إعارة', original: 'Loan' },
      'free': { french: 'Libre', arabic: 'انتقال حر', original: 'Free' },
      'transfer': { french: 'Transfert', arabic: 'انتقال', original: 'Transfer' },
      'permanent': { french: 'Permanent', arabic: 'دائم', original: 'Permanent' },
      'temporary': { french: 'Temporaire', arabic: 'مؤقت', original: 'Temporary' }
    };
    
    return transferTypes[transferType.toLowerCase()] || {
      french: transferType,
      arabic: await googleTranslateAPI.translateToArabic(transferType),
      original: transferType
    };
  }
  
  // Vider le cache de traduction
  clearCache(): void {
    this.translationCache.clear();
  }
  
  // Obtenir la taille du cache
  getCacheSize(): number {
    return this.translationCache.size;
  }
  
  // Nouvelles méthodes utilisant Google Translate directement
  async quickTranslateToArabic(text: string): Promise<string> {
    return googleTranslateAPI.translateToArabic(text);
  }
  
  async quickTranslateToFrench(text: string): Promise<string> {
    return googleTranslateAPI.translateToFrench(text);
  }
  
  // Traduction en lot pour les listes (équipes, joueurs, etc.)
  async translateBatchToArabic(texts: string[]): Promise<string[]> {
    return googleTranslateAPI.translateBatch(texts, 'auto', 'ar');
  }
  
  async translateBatchToFrench(texts: string[]): Promise<string[]> {
    return googleTranslateAPI.translateBatch(texts, 'auto', 'fr');
  }
  
  // Obtenir les statistiques de traduction
  getTranslationStats() {
    return {
      cacheSize: this.getCacheSize(),
      googleStats: googleTranslateAPI.getCacheStats()
    };
  }
  
  // Nettoyer tous les caches
  clearAllCaches(): void {
    this.clearCache();
    googleTranslateAPI.clearCache();
  }
}

// Instance singleton
export const footballTranslationService = FootballTranslationService.getInstance();

// Hook personnalisé pour React
export const useFootballTranslation = () => {
  return {
    // Méthodes rapides avec Google Translate
    translateNewsFast: footballTranslationService.translateNewsContentFast.bind(footballTranslationService),
    translateTeamFast: footballTranslationService.translateTeamNameFast.bind(footballTranslationService),
    quickTranslateToArabic: footballTranslationService.quickTranslateToArabic.bind(footballTranslationService),
    quickTranslateToFrench: footballTranslationService.quickTranslateToFrench.bind(footballTranslationService),
    translateBatchToArabic: footballTranslationService.translateBatchToArabic.bind(footballTranslationService),
    translateBatchToFrench: footballTranslationService.translateBatchToFrench.bind(footballTranslationService),
    
    // Méthodes originales (avec fallback)
    translateNews: footballTranslationService.translateNewsContent.bind(footballTranslationService),
    translateTeam: footballTranslationService.translateTeamName.bind(footballTranslationService),
    translateStatus: footballTranslationService.translateMatchStatus.bind(footballTranslationService),
    translateStanding: footballTranslationService.translateStandingDescription.bind(footballTranslationService),
    translateTransfer: footballTranslationService.translateTransferType.bind(footballTranslationService),
    
    // Gestion du cache
    clearCache: footballTranslationService.clearCache.bind(footballTranslationService),
    clearAllCaches: footballTranslationService.clearAllCaches.bind(footballTranslationService),
    getCacheSize: footballTranslationService.getCacheSize.bind(footballTranslationService),
    getStats: footballTranslationService.getTranslationStats.bind(footballTranslationService)
  };
};
