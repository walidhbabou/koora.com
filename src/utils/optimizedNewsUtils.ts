// ==============================================
// FONCTIONS OPTIMISÉES AVEC CACHE GLOBAL - NOUVELLES
// ==============================================

import { globalCache, debounceCache } from './globalCache';
import { transformWordPressNews } from './newsUtils';
import { NewsCardItem, WordPressNewsItem } from '../types/news';

// Fonction optimisée pour première page avec cache global
export const fetchWordPressNewsFirstPageOptimized = debounceCache(async (params: {
  categories?: number[];
  per_page?: number;
}): Promise<NewsCardItem[]> => {
  const { categories, per_page = 30 } = params;
  const cacheKey = `wordpress_first_page_${categories?.join(',') || 'all'}_${per_page}`;
  
  // Vérifier le cache global
  const cached = globalCache.get<NewsCardItem[]>(cacheKey);
  if (cached) {
    console.log(`🎯 Cache HIT pour première page: ${cacheKey}`);
    return cached;
  }
  
  console.log(`🔄 Cache MISS pour première page: ${cacheKey}`);
  
  try {
    const baseUrl = "https://koradisport.com/wp-json/wp/v2/posts";
    const params_obj = new URLSearchParams({
      per_page: per_page.toString(),
      page: "1",
      _embed: "true",
      orderby: "date",
      order: "desc",
    });

    if (categories && categories.length > 0) {
      params_obj.append("categories", categories.join(","));
    }

    const response = await fetch(`${baseUrl}?${params_obj}`);
    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status}`);
    }

    const posts = await response.json();
    const newsItems = transformWordPressNews(posts);
    
    // Mettre en cache avec TTL de 2 minutes pour première page
    globalCache.set(cacheKey, newsItems, 2 * 60 * 1000);
    
    return newsItems;
  } catch (error) {
    console.error("Error fetching WordPress first page:", error);
    return [];
  }
}, 1000); // Debounce de 1 seconde

// Fonction optimisée pour arrière-plan avec cache global
export const fetchWordPressNewsBackgroundOptimized = debounceCache(async (params: {
  categories?: number[];
  excludeFirstPage?: boolean;
  per_page?: number;
}): Promise<NewsCardItem[]> => {
  const { categories, excludeFirstPage = true, per_page = 30 } = params;
  const cacheKey = `wordpress_background_${categories?.join(',') || 'all'}_${per_page}`;
  
  // Vérifier le cache global
  const cached = globalCache.get<NewsCardItem[]>(cacheKey);
  if (cached) {
    console.log(`🎯 Cache HIT pour arrière-plan: ${cacheKey}`);
    return cached;
  }
  
  console.log(`🔄 Cache MISS pour arrière-plan: ${cacheKey}`);
  
  try {
    const allNews: NewsCardItem[] = [];
    const startPage = excludeFirstPage ? 2 : 1;
    const maxPages = 3; // Limiter à 3 pages pour éviter trop de requêtes
    
    // Paralléliser les requêtes mais limiter le nombre
    const promises = [];
    for (let page = startPage; page <= startPage + maxPages - 1; page++) {
      promises.push(fetchWordPressPageOptimized(page, categories, per_page));
    }
    
    const results = await Promise.allSettled(promises);
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        allNews.push(...result.value);
      }
    });
    
    // Mettre en cache avec TTL de 10 minutes pour arrière-plan
    globalCache.set(cacheKey, allNews, 10 * 60 * 1000);
    
    return allNews;
  } catch (error) {
    console.error("Error fetching WordPress background:", error);
    return [];
  }
}, 2000); // Debounce de 2 secondes pour arrière-plan

// Fonction helper optimisée pour une page spécifique
const fetchWordPressPageOptimized = async (
  page: number, 
  categories?: number[], 
  per_page: number = 30
): Promise<NewsCardItem[]> => {
  const cacheKey = `wordpress_page_${page}_${categories?.join(',') || 'all'}_${per_page}`;
  
  // Vérifier le cache pour cette page spécifique
  const cached = globalCache.get<NewsCardItem[]>(cacheKey);
  if (cached) {
    return cached;
  }
  
  const baseUrl = "https://koradisport.com/wp-json/wp/v2/posts";
  const params = new URLSearchParams({
    per_page: per_page.toString(),
    page: page.toString(),
    _embed: "true",
    orderby: "date", 
    order: "desc",
  });

  if (categories && categories.length > 0) {
    params.append("categories", categories.join(","));
  }

  const response = await fetch(`${baseUrl}?${params}`);
  if (!response.ok) {
    throw new Error(`WordPress API error: ${response.status}`);
  }

  const posts = await response.json();
  const newsItems = transformWordPressNews(posts);
  
  // Mettre en cache cette page avec TTL de 5 minutes
  globalCache.set(cacheKey, newsItems, 5 * 60 * 1000);
  
  return newsItems;
};

// Fonction pour précharger les catégories populaires
export const preloadPopularCategories = async () => {
  const popularCategories = [3, 4, 5]; // كرة القدم, دوريات, منتخبات
  
  console.log('🚀 Préchargement des catégories populaires...');
  
  const preloadPromises = popularCategories.map(async (categoryId) => {
    try {
      await fetchWordPressNewsFirstPageOptimized({ categories: [categoryId] });
      console.log(`✅ Préchargé catégorie ${categoryId}`);
    } catch (error) {
      console.warn(`❌ Erreur préchargement catégorie ${categoryId}:`, error);
    }
  });
  
  await Promise.allSettled(preloadPromises);
  console.log('🎉 Préchargement terminé');
};

// Hook React optimisé pour les news
import { useState, useEffect, useMemo } from 'react';

export const useOptimizedNews = (
  categories?: number[],
  options: { autoPreload?: boolean } = {}
) => {
  const [firstPageNews, setFirstPageNews] = useState<NewsCardItem[]>([]);
  const [allNews, setAllNews] = useState<NewsCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const categoriesKey = useMemo(() => categories?.join(',') || '', [categories]);

  useEffect(() => {
    let isMounted = true;
    
    const loadNews = async () => {
      try {
        setLoading(true);
        
        // Charger rapidement la première page
        const firstPage = await fetchWordPressNewsFirstPageOptimized({ 
          categories: categories 
        });
        
        if (isMounted) {
          setFirstPageNews(firstPage);
          setAllNews(firstPage);
          setLoading(false);
        }
        
        // Charger le reste en arrière-plan avec délai
        const loadBackground = async () => {
          try {
            const backgroundNews = await fetchWordPressNewsBackgroundOptimized({
              categories: categories,
              excludeFirstPage: true
            });
            
            if (isMounted) {
              const combined = [...firstPage, ...backgroundNews];
              // Supprimer les doublons
              const uniqueNews = [];
              const seenIds = new Set();
              
              for (const item of combined) {
                if (!seenIds.has(item.id)) {
                  seenIds.add(item.id);
                  uniqueNews.push(item);
                }
              }
              
              setAllNews(uniqueNews);
            }
          } catch (bgError) {
            console.warn('Erreur chargement arrière-plan:', bgError);
          }
        };
        
        setTimeout(loadBackground, 100);
        
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          setLoading(false);
        }
      }
    };
    
    loadNews();
    
    // Précharger les catégories populaires si activé
    if (options.autoPreload && !categories) {
      setTimeout(preloadPopularCategories, 3000);
    }
    
    return () => {
      isMounted = false;
    };
  }, [categoriesKey, options.autoPreload, categories]);

  return { 
    firstPageNews, 
    allNews, 
    loading, 
    error,
    cacheStats: globalCache.getStats()
  };
};

// Fonction pour nettoyer le cache si nécessaire
export const clearNewsCache = () => {
  // Nettoyer seulement les clés relatives aux news
  const keys = ['wordpress_first_page', 'wordpress_background', 'wordpress_page'];
  keys.forEach(keyPattern => {
    // Note: Le globalCache n'a pas de méthode pour nettoyer par pattern,
    // mais on peut l'ajouter si nécessaire
    console.log(`Clearing cache for pattern: ${keyPattern}`);
  });
  
  // Pour l'instant, nettoyer tout le cache
  globalCache.clear();
  console.log('🧹 Cache nettoyé');
};