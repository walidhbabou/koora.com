// Cache global pour réduire les requêtes API
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class GlobalCache {
  private cache = new Map<string, CacheItem<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes par défaut
  
  // TTL spécifiques par type de données
  private readonly TTL_CONFIG = {
    'wordpress_news': 3 * 60 * 1000,     // 3 minutes pour les news
    'wordpress_first_page': 2 * 60 * 1000, // 2 minutes pour première page
    'wordpress_background': 10 * 60 * 1000, // 10 minutes pour arrière-plan
    'supabase_news': 5 * 60 * 1000,      // 5 minutes pour Supabase
    'matches': 1 * 60 * 1000,            // 1 minute pour les matchs
    'leagues': 60 * 60 * 1000,           // 1 heure pour les ligues
  } as const;

  set<T>(key: string, data: T, customTTL?: number): void {
    const ttl = customTTL || this.getTTLForKey(key) || this.DEFAULT_TTL;
    const expiry = Date.now() + ttl;
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry
    });
    
    // Nettoyer automatiquement les entrées expirées
    this.cleanExpired();
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Nettoyer les entrées expirées
  private cleanExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  // Obtenir TTL selon le type de clé
  private getTTLForKey(key: string): number | undefined {
    for (const [type, ttl] of Object.entries(this.TTL_CONFIG)) {
      if (key.includes(type)) {
        return ttl;
      }
    }
    return undefined;
  }

  // Statistiques du cache
  getStats() {
    const now = Date.now();
    const total = this.cache.size;
    const expired = Array.from(this.cache.values()).filter(item => now > item.expiry).length;
    
    return {
      total,
      active: total - expired,
      expired,
      hitRate: this.cache.size > 0 ? (total - expired) / total : 0
    };
  }

  // Précharger des données importantes
  async preload(keys: Array<{ key: string; fetcher: () => Promise<any>; ttl?: number }>) {
    const promises = keys.map(async ({ key, fetcher, ttl }) => {
      if (!this.has(key)) {
        try {
          const data = await fetcher();
          this.set(key, data, ttl);
          return { key, success: true };
        } catch (error) {
          console.warn(`Préchargement échoué pour ${key}:`, error);
          return { key, success: false, error };
        }
      }
      return { key, success: true, cached: true };
    });
    
    return Promise.all(promises);
  }
}

// Instance singleton
export const globalCache = new GlobalCache();

// Hook React pour utiliser le cache
import { useState, useEffect } from 'react';

export function useCachedData<T>(
  key: string, 
  fetcher: () => Promise<T>, 
  deps: any[] = [],
  ttl?: number
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      // Vérifier le cache d'abord
      const cached = globalCache.get<T>(key);
      if (cached) {
        setData(cached);
        setLoading(false);
        return;
      }
      
      // Si pas en cache, charger
      try {
        setLoading(true);
        const result = await fetcher();
        
        if (isMounted) {
          globalCache.set(key, result, ttl);
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error };
}

// Debounce pour limiter les appels
export function debounceCache<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise((resolve) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        resolve(func(...args));
      }, wait);
    });
  };
}