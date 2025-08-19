// apiCache.ts
// Système de cache optimisé pour économiser les appels API Football

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  type: string;
  endpoint: string;
}

// Durées de cache optimisées selon le type de données
export const CACHE_DURATIONS = {
  // Données très dynamiques (rafraîchissement fréquent)
  LIVE_MATCHES: 30 * 1000,        // 30 secondes - matchs en direct
  LIVE_STATS: 60 * 1000,          // 1 minute - statistiques en direct
  
  // Données modérément dynamiques
  TODAY_FIXTURES: 5 * 60 * 1000,  // 5 minutes - matchs du jour
  FIXTURES_BY_DATE: 15 * 60 * 1000, // 15 minutes - matchs par date
  
  // Données relativement stables
  STANDINGS: 2 * 60 * 60 * 1000,  // 2 heures - classements
  PLAYER_STATS: 6 * 60 * 60 * 1000, // 6 heures - statistiques joueurs
  LEAGUES: 24 * 60 * 60 * 1000,   // 24 heures - liste des ligues
  
  // Données très stables
  TRANSFERS: 48 * 60 * 60 * 1000, // 48 heures - transferts
  SEASONS: 7 * 24 * 60 * 60 * 1000, // 7 jours - saisons
  
  // Traductions (très stables)
  TRANSLATIONS: 24 * 60 * 60 * 1000, // 24 heures - traductions
} as const;

export class ApiCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private cacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0
  };

  // Générer une clé de cache intelligente
  private generateCacheKey(endpoint: string, params?: Record<string, unknown>): string {
    const baseKey = endpoint;
    if (!params || Object.keys(params).length === 0) {
      return baseKey;
    }
    
    // Trier les paramètres pour une clé cohérente
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    
    return `${baseKey}?${sortedParams}`;
  }

  // Déterminer la durée de cache selon le type de données
  private getCacheDuration(endpoint: string, params?: Record<string, unknown>): number {
    // Matchs en direct
    if (endpoint.includes('live') || endpoint.includes('fixtures/live')) {
      return CACHE_DURATIONS.LIVE_MATCHES;
    }
    
    // Statistiques en direct
    if (endpoint.includes('statistics') && params?.fixture) {
      return CACHE_DURATIONS.LIVE_STATS;
    }
    
    // Matchs du jour
    if (endpoint.includes('fixtures') && params?.date === new Date().toISOString().split('T')[0]) {
      return CACHE_DURATIONS.TODAY_FIXTURES;
    }
    
    // Matchs par date
    if (endpoint.includes('fixtures') && params?.date) {
      return CACHE_DURATIONS.FIXTURES_BY_DATE;
    }
    
    // Classements
    if (endpoint.includes('standings')) {
      return CACHE_DURATIONS.STANDINGS;
    }
    
    // Statistiques joueurs
    if (endpoint.includes('players') || endpoint.includes('topscorers')) {
      return CACHE_DURATIONS.PLAYER_STATS;
    }
    
    // Ligues
    if (endpoint.includes('leagues')) {
      return CACHE_DURATIONS.LEAGUES;
    }
    
    // Transferts
    if (endpoint.includes('transfers')) {
      return CACHE_DURATIONS.TRANSFERS;
    }
    
    // Saisons
    if (endpoint.includes('seasons')) {
      return CACHE_DURATIONS.SEASONS;
    }
    
    // Traductions
    if (endpoint.includes('translate')) {
      return CACHE_DURATIONS.TRANSLATIONS;
    }
    
    // Durée par défaut
    return CACHE_DURATIONS.TODAY_FIXTURES;
  }

  // Vérifie si la donnée est en cache et valide
  get<T>(endpoint: string, params?: Record<string, unknown>): T | null {
    const key = this.generateCacheKey(endpoint, params);
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (entry) {
      const duration = this.getCacheDuration(endpoint, params);
      if (Date.now() - entry.timestamp < duration) {
        this.cacheStats.hits++;
        console.log(`🎯 Cache HIT: ${endpoint} (${Math.round((Date.now() - entry.timestamp) / 1000)}s old)`);
        return entry.data;
      } else {
        // Cache expiré, le supprimer
        this.cache.delete(key);
        console.log(`⏰ Cache EXPIRED: ${endpoint}`);
      }
    }
    
    this.cacheStats.misses++;
    console.log(`❌ Cache MISS: ${endpoint}`);
    return null;
  }

  // Met en cache la donnée avec type et endpoint
  set<T>(endpoint: string, data: T, params?: Record<string, unknown>): void {
    const key = this.generateCacheKey(endpoint, params);
    const duration = this.getCacheDuration(endpoint, params);
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      type: this.getDataType(endpoint),
      endpoint
    });
    
    this.cacheStats.sets++;
    console.log(`💾 Cache SET: ${endpoint} (expires in ${Math.round(duration / 1000)}s)`);
  }

  // Détermine le type de données selon l'endpoint
  private getDataType(endpoint: string): string {
    if (endpoint.includes('live')) return 'live_matches';
    if (endpoint.includes('fixtures')) return 'fixtures';
    if (endpoint.includes('standings')) return 'standings';
    if (endpoint.includes('players')) return 'player_stats';
    if (endpoint.includes('leagues')) return 'leagues';
    if (endpoint.includes('transfers')) return 'transfers';
    if (endpoint.includes('seasons')) return 'seasons';
    if (endpoint.includes('translate')) return 'translations';
    return 'unknown';
  }

  // Supprime une entrée du cache
  delete(endpoint: string, params?: Record<string, unknown>): void {
    const key = this.generateCacheKey(endpoint, params);
    this.cache.delete(key);
    this.cacheStats.deletes++;
    console.log(`🗑️ Cache DELETE: ${endpoint}`);
  }

  // Vide tout le cache
  clear(): void {
    this.cache.clear();
    console.log(`🧹 Cache CLEARED: ${this.cache.size} entries removed`);
  }

  // Vide le cache par type
  clearByType(type: string): void {
    let deletedCount = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.type === type) {
        this.cache.delete(key);
        deletedCount++;
      }
    }
    console.log(`🧹 Cache CLEARED by type ${type}: ${deletedCount} entries removed`);
  }

  // Nettoyer les entrées expirées
  cleanExpired(): void {
    const now = Date.now();
    let deletedCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      const duration = this.getCacheDuration(entry.endpoint);
      if (now - entry.timestamp >= duration) {
        this.cache.delete(key);
        deletedCount++;
      }
    }
    
    if (deletedCount > 0) {
      console.log(`🧹 Cleaned ${deletedCount} expired cache entries`);
    }
  }

  // Obtenir les statistiques du cache
  getStats() {
    const now = Date.now();
    const typeStats: Record<string, number> = {};
    let totalSize = 0;
    let validEntries = 0;
    
    for (const entry of this.cache.values()) {
      const duration = this.getCacheDuration(entry.endpoint);
      if (now - entry.timestamp < duration) {
        validEntries++;
        typeStats[entry.type] = (typeStats[entry.type] || 0) + 1;
      }
      totalSize++;
    }
    
    return {
      totalEntries: totalSize,
      validEntries,
      typeStats,
      hitRate: this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses),
      stats: this.cacheStats
    };
  }

  // Précharger des données importantes
  async preloadImportantData(): Promise<void> {
    console.log('🚀 Preloading important data...');
    
    // Précharger les ligues principales (cache long)
    try {
      // Cette méthode sera appelée au démarrage de l'app
      console.log('📋 Preloading leagues data...');
    } catch (error) {
      console.error('Error preloading leagues:', error);
    }
  }

  // Optimiser le cache (supprimer les anciennes entrées si trop volumineux)
  optimize(maxEntries: number = 1000): void {
    if (this.cache.size <= maxEntries) return;
    
    // Trier par timestamp (plus ancien en premier)
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);
    
    // Supprimer les entrées les plus anciennes
    const toDelete = entries.slice(0, this.cache.size - maxEntries);
    toDelete.forEach(([key]) => this.cache.delete(key));
    
    console.log(`🔧 Cache optimized: removed ${toDelete.length} old entries`);
  }
}

// Singleton pour utilisation globale
export const apiCache = new ApiCache();

// Nettoyer le cache expiré toutes les 5 minutes
setInterval(() => {
  apiCache.cleanExpired();
}, 5 * 60 * 1000);

// Optimiser le cache toutes les 30 minutes
setInterval(() => {
  apiCache.optimize();
}, 30 * 60 * 1000);
