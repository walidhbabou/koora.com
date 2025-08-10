// apiCache.ts
// Système de cache simple pour économiser les appels API

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class ApiCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private readonly cacheDuration: number; // en ms

  constructor(cacheDuration: number = 5 * 60 * 1000) { // 5 minutes par défaut
    this.cacheDuration = cacheDuration;
  }

  // Vérifie si la donnée est en cache et valide
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && Date.now() - entry.timestamp < this.cacheDuration) {
      return entry.data as T;
    }
    return null;
  }

  // Met en cache la donnée
  set<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // Supprime une entrée du cache
  delete(key: string): void {
    this.cache.delete(key);
  }

  // Vide tout le cache
  clear(): void {
    this.cache.clear();
  }

  // Change la durée du cache
  setCacheDuration(durationMs: number): void {
    this.cacheDuration = durationMs;
  }
}

// Singleton pour utilisation globale
export const apiCache = new ApiCache();
