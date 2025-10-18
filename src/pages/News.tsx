import {
  stripHtml,
  parseEditorJsContent,
  fetchWordPressNews,
  transformWordPressNews,
} from "@/utils/newsUtils";
import {
  fetchWordPressNewsFirstPageOptimized,
  fetchWordPressNewsBackgroundOptimized,
  useOptimizedNews,
  clearNewsCache
} from "@/utils/optimizedNewsUtils";
import { WORDPRESS_CATEGORIES } from "@/config/wordpressCategories";
import {
  EditorJsBlock,
  EditorJsContent,
  WordPressNewsItem,
  NewsCardItem,
  Category,
  DisplayCategory,
  NewsDBRow,
} from "@/types/news";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import NewsCard from "../components/NewsCard";
import FeaturedNewsCard from "../components/FeaturedNewsCard";
import NewsSlider from "../components/NewsSlider";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import TeamsLogos from "@/components/TeamsLogos";
import Footer from "@/components/Footer";
import CategoryFilterHeader from "@/components/CategoryFilterHeader";
import { HeaderAd, MobileAd, SidebarAd, InArticleAd } from "../components/AdWrapper";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Clock, Flag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { generateUniqueSlug, generateWordPressSlug } from "@/utils/slugUtils";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import { MAIN_LEAGUES } from "@/config/api";
import { requestCache, debounce } from "@/utils/requestCache";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import React, { useEffect, useState, useCallback, useRef } from "react";
// Types for Editor.js content

const News = () => {
  // ...existing code...
  const { category } = useParams<{ category?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // États locaux pour la pagination et les données
  const [allNews, setAllNews] = useState<NewsCardItem[]>([]);
  const [displayedNews, setDisplayedNews] = useState<NewsCardItem[]>([]);
  const [loadingNews, setLoadingNews] = useState<boolean>(true);
  const [page, setPage] = useState(1);
  const pageSize = 30;
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isPageTransition, setIsPageTransition] = useState<boolean>(false);
  const [selectedWPCategory, setSelectedWPCategory] = useState<number | null>(null);
  const { currentLanguage } = useTranslation();
  const { toast } = useToast();
  const [reportingId, setReportingId] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const [reportOpenId, setReportOpenId] = useState<string | null>(null);
  const [reportDesc, setReportDesc] = useState("");
  const [selectedChampion, setSelectedChampion] = useState<number | null>(null);
  const [news, setNews] = useState<WordPressNewsItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsCardItem[]>([]);
  const [wpNewsCache, setWpNewsCache] = useState<Map<string, NewsCardItem[]>>(new Map());

  // Preloading queue for background fetching
  const preloadQueueRef = useRef<Set<number>>(new Set());
  const isPreloadingRef = useRef(false);

  // Performance monitoring avec plus de détails
  const [performanceStats, setPerformanceStats] = useState({
    cacheHits: 0,
    cacheMisses: 0,
    averageLoadTime: 0,
    lastLoadTime: 0,
    totalArticlesLoaded: 0,
    lastCacheUpdate: Date.now()
  });

  // States pour CategoryFilterHeader - set to non-null initially to prevent immediate API calls
  const [selectedHeaderCategory, setSelectedHeaderCategory] = useState<
    number | null
  >(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<number | null>(
    null
  );

  // Flag to prevent initial filter-triggered requests
  const initialLoadComplete = useRef(false);

  // Éléments supprimés pour le scroll infini automatique
  // const [isAutoLoading, setIsAutoLoading] = useState(false);
  // const observerRef = useRef<IntersectionObserver | null>(null);
  // const loadMoreRef = useRef<HTMLDivElement>(null);

  // Fonction pour paginer les news déjà chargées
  const paginateNews = useCallback((newsArray: NewsCardItem[], currentPage: number) => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedNews = newsArray.slice(startIndex, endIndex);
    const totalPagesCount = Math.ceil(newsArray.length / pageSize);
    
    console.log(`📄 Page ${currentPage}: Affichage de ${paginatedNews.length} articles sur ${newsArray.length} total (${totalPagesCount} pages)`);
    
    setDisplayedNews(paginatedNews);
    setTotalPages(totalPagesCount);
    setHasMore(currentPage < totalPagesCount);
    
    return paginatedNews;
  }, [pageSize]);

  // Fonction pour récupérer les news Supabase
  const fetchSupabaseNews = useCallback(
    async (nextPage: number): Promise<NewsCardItem[]> => {
      try {
        let query = supabase
          .from("news")
          .select("*", { count: "exact" })
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .range(0, 99); // Augmenté de 49 à 99 pour récupérer plus d'articles

        // Filter by category header selection
        if (selectedHeaderCategory && selectedSubCategory) {
          switch (selectedHeaderCategory) {
            case 1:
              query = query.eq(
                "competition_internationale_id",
                selectedSubCategory
              );
              break;
            case 2:
              query = query.eq("competition_mondiale_id", selectedSubCategory);
              break;
            case 3:
              query = query.eq(
                "competition_continentale_id",
                selectedSubCategory
              );
              break;
            case 4:
              query = query.eq("competition_locale_id", selectedSubCategory);
              break;
            case 5:
              query = query.eq("transfert_news_id", selectedSubCategory);
              break;
          }
        } else if (selectedHeaderCategory) {
          switch (selectedHeaderCategory) {
            case 1:
              query = query.not("competition_internationale_id", "is", null);
              break;
            case 2:
              query = query.not("competition_mondiale_id", "is", null);
              break;
            case 3:
              query = query.not("competition_continentale_id", "is", null);
              break;
            case 4:
              query = query.not("competition_locale_id", "is", null);
              break;
            case 5:
              query = query.not("transfert_news_id", "is", null);
              break;
        }
      }

      if (selectedChampion) {
        switch (selectedChampion) {
          case 1:
            query = query.eq("competition_internationale_id", 1);
            break;
          case 2:
            query = query.eq("competition_internationale_id", 2);
            break;
          case 3:
            query = query.eq("competition_internationale_id", 3);
            break;
          case 4:
            query = query.eq("competition_internationale_id", 4);
            break;
          case 5:
            query = query.eq("competition_internationale_id", 5);
            break;
          case 6:
            query = query.eq("competition_internationale_id", 6);
            break;
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error("Supabase error:", error);
        return [];
      }

      if (data) {
        console.log(`Supabase news fetched: ${data.length} articles`);
        return data.map((n: NewsDBRow) => {
          const parsedContent = parseEditorJsContent(String(n.content || ""));
          const plain = stripHtml(parsedContent);
          return {
            id: String(n.id || ""),
            title: String(n.title || "-"),
            summary: plain.slice(0, 160) + (plain.length > 160 ? "…" : ""),
            imageUrl: String(n.image_url || "/placeholder.svg"),
            publishedAt: n.created_at
              ? new Date(n.created_at).toISOString().slice(0, 10)
              : "",
            category: "أخبار",
            source: "supabase",
          };
        });
      }

      return [];
    } catch (error) {
      console.error("Supabase fetch error:", error);
      return [];
    }
    },
    [selectedChampion, selectedHeaderCategory, selectedSubCategory]
  );

  // Fonction pour récupérer les news WordPress avec cache optimisé
  const fetchWordPressNewsData = useCallback(async (categoryId?: number): Promise<NewsCardItem[]> => {
    const startTime = performance.now();
    try {
      console.log(`🚀 Fetching WordPress news with categoryId: ${categoryId}`);
      
      // Vérifier le cache d'abord
      const cacheKey = categoryId ? `cat-${categoryId}` : 'all';
      if (wpNewsCache.has(cacheKey)) {
        console.log(`🎯 Cache HIT pour ${cacheKey}`);
        setPerformanceStats(prev => ({ 
          ...prev, 
          cacheHits: prev.cacheHits + 1 
        }));
        return wpNewsCache.get(cacheKey)!;
      }
      
      console.log(`🔄 Cache MISS pour ${cacheKey} - Chargement rapide de la première page`);
      setPerformanceStats(prev => ({ 
        ...prev, 
        cacheMisses: prev.cacheMisses + 1 
      }));
      
      // Étape 1: Charger rapidement la première page (affichage immédiat)
      const firstPageResult = await fetchWordPressNewsFirstPage({
        categories: categoryId ? [categoryId] : undefined,
      });
      
      // Mettre en cache partiellement et afficher immédiatement
      const partialCacheKey = `${cacheKey}_partial`;
      setWpNewsCache(prev => new Map(prev).set(partialCacheKey, firstPageResult));
      
      // Enregistrer les statistiques de la première page
      const firstPageLoadTime = performance.now() - startTime;
      setPerformanceStats(prev => ({ 
        ...prev, 
        lastLoadTime: firstPageLoadTime,
        totalArticlesLoaded: firstPageResult.length,
        lastCacheUpdate: Date.now()
      }));
      
      console.log(`✅ Première page chargée: ${firstPageResult.length} articles en ${firstPageLoadTime.toFixed(2)}ms`);
      
      // Étape 2: Charger le reste en arrière-plan (sans bloquer l'affichage)
      setTimeout(async () => {
        try {
          console.log(`📦 Chargement en arrière-plan pour ${cacheKey}...`);
          const backgroundResult = await fetchWordPressNewsBackground({
            categories: categoryId ? [categoryId] : undefined,
            excludeFirstPage: true
          });
          
          // Combiner première page + pages d'arrière-plan
          const combinedResult = [...firstPageResult, ...backgroundResult];
          
          // Supprimer les doublons
          const uniqueResult = combinedResult.filter((item, index, self) => 
            index === self.findIndex(t => t.id === item.id)
          );
          
          // Mettre en cache le résultat complet
          setWpNewsCache(prev => new Map(prev).set(cacheKey, uniqueResult));
          
          const totalLoadTime = performance.now() - startTime;
          setPerformanceStats(prev => ({ 
            ...prev, 
            averageLoadTime: prev.cacheMisses === 1 ? totalLoadTime : (prev.averageLoadTime + totalLoadTime) / 2,
            totalArticlesLoaded: uniqueResult.length,
            lastCacheUpdate: Date.now()
          }));
          
          console.log(`🎉 Chargement complet terminé: ${uniqueResult.length} articles au total`);
          
          // Optionnel: Mettre à jour les données affichées si l'utilisateur est toujours sur la même page
          // Cette partie sera gérée par les effets React si nécessaire
        } catch (backgroundError) {
          console.error("❌ Erreur chargement arrière-plan:", backgroundError);
        }
      }, 100); // Délai minimal pour ne pas bloquer l'UI
      
      return firstPageResult;
    } catch (error) {
      console.error("❌ WordPress news fetch failed:", error);
      const loadTime = performance.now() - startTime;
      setPerformanceStats(prev => ({ 
        ...prev, 
        lastLoadTime: loadTime
      }));
      return [];
    }
  }, [wpNewsCache]);
      

  // Background preloading system
  const preloadCategories = useCallback(async () => {
    if (isPreloadingRef.current || preloadQueueRef.current.size === 0) return;
    
    isPreloadingRef.current = true;
    const categoriesToLoad = Array.from(preloadQueueRef.current).slice(0, 2); // Max 2 at once
    
    for (const categoryId of categoriesToLoad) {
      const cacheKey = `wp_${categoryId}`;
      if (!wpNewsCache.has(cacheKey)) {
        try {
          const wpData = await fetchWordPressNewsData(categoryId);
          setWpNewsCache(prev => new Map(prev).set(cacheKey, wpData));
          console.log(`⚡ Préchargé catégorie ${categoryId} (${wpData.length} articles)`);
        } catch (error) {
          console.log(`❌ Erreur préchargement catégorie ${categoryId}:`, error);
        }
      }
      preloadQueueRef.current.delete(categoryId);
    }
    
    isPreloadingRef.current = false;
    
    // Continue if more categories to preload
    if (preloadQueueRef.current.size > 0) {
      setTimeout(preloadCategories, 3000); // 3 sec pause between batches
    }
  }, [wpNewsCache, fetchWordPressNewsData]);

  // Add categories to preload queue
  const queuePreload = useCallback((categoryId: number) => {
    preloadQueueRef.current.add(categoryId);
    
    // Start preloading after 5 seconds (when user is likely engaged)
    setTimeout(() => {
      if (!isPreloadingRef.current) {
        preloadCategories();
      }
    }, 5000);
  }, [preloadCategories]);

  // Queue popular categories for preloading
  useEffect(() => {
    // Only queue if not already selected
    const popularCategories = [3, 4, 5]; // كرة القدم, دوريات, منتخبات
    popularCategories.forEach(catId => {
      if (catId !== selectedWPCategory) {
        queuePreload(catId);
      }
    });
  }, [selectedWPCategory, queuePreload]);

  // Fonction principale pour récupérer seulement les news WordPress
  const fetchAllNews = useCallback(
    async (nextPage: number = 1, append: boolean = false) => {
      // Éviter les rechargements si on a déjà des données en cache et qu'on pagine seulement
      if (append && allNews.length > 0) {
        console.log('Using cached data for pagination, no API call needed');
        paginateNews(allNews, nextPage);
        setPage(nextPage);
        return;
      }

      console.log(`Fetching WordPress news for page ${nextPage}, append: ${append}, filters:`, {
        selectedWPCategory
      });
      setLoadingNews(true);
      
      try {
        // Vérifier d'abord le cache avant de faire un appel API
        const cacheKey = selectedWPCategory ? `cat-${selectedWPCategory}` : 'all';
        if (wpNewsCache.has(cacheKey) && !append) {
          console.log(`🎯 Using cached WordPress data for ${cacheKey}`);
          const cachedData = wpNewsCache.get(cacheKey)!;
          setNews([]);
          setFilteredNews(cachedData);
          setAllNews(cachedData);
          paginateNews(cachedData, nextPage);
          setPage(nextPage);
          setLoadingNews(false);
          return;
        }

        // Charger seulement WordPress avec catégorie spécifique ou toutes
        const startTime = Date.now();
        const wordpressNews = await fetchWordPressNewsData(selectedWPCategory || undefined);

        console.log(`WordPress fetch completed in ${Date.now() - startTime}ms`);
        console.log(`WordPress: ${wordpressNews.length} articles`);

        // Trier par date
        wordpressNews.sort((a, b) => 
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );

        // Mise à jour des états
        setNews([]);
        setFilteredNews(wordpressNews);
        setAllNews(wordpressNews);
        paginateNews(wordpressNews, nextPage);
        setPage(nextPage);
        
        // Plus de hasMore maintenant qu'on charge tout en une fois
        setHasMore(wordpressNews.length > pageSize * nextPage);
        setTotalPages(Math.ceil(wordpressNews.length / pageSize));

      } catch (error) {
        console.error("Failed to load WordPress news", error);
        setAllNews([]);
        setDisplayedNews([]);
        setHasMore(false);
      } finally {
        setLoadingNews(false);
      }
    },
    [fetchWordPressNewsData, paginateNews, selectedWPCategory, pageSize, allNews, wpNewsCache]
  );

  // useEffect pour charger les news WordPress (pour debug et état séparé)


  // useEffect pour gérer les paramètres d'URL
  useEffect(() => {
    if (category) {
      // Chercher la catégorie par slug dans WORDPRESS_CATEGORIES
      const categoryInfo = WORDPRESS_CATEGORIES.find(cat => 
        cat.slug === category || cat.name_ar === category || `category-${cat.id}` === category
      );
      if (categoryInfo) {
        console.log(`Setting selectedWPCategory to ${categoryInfo.id} for category slug: ${category}`);
        setSelectedWPCategory(categoryInfo.id);
      } else {
        // Si la catégorie n'existe pas, rediriger vers /news
        console.warn(`Category not found: ${category}`);
        navigate('/news', { replace: true });
      }
    } else {
      setSelectedWPCategory(null);
    }
  }, [category, navigate]);

  // useEffect principal pour charger seulement les news WordPress - simplifié
  useEffect(() => {
    console.log("News component mounted, loading WordPress news...");
    initialLoadComplete.current = true;
    
    // Chargement optimisé avec les fonctions optimisées
    const quickLoad = async () => {
      setLoadingNews(true);
      
      try {
        console.log(`🚀 Chargement optimisé des actualités pour: ${selectedWPCategory || 'all'}`);
        
        // Étape 1: Charger rapidement la première page seulement (30 articles)
        const firstPageResult = await fetchWordPressNewsFirstPageOptimized({
          categories: selectedWPCategory ? [selectedWPCategory] : undefined,
        });
        
        console.log(`✅ Première page chargée: ${firstPageResult.length} articles`);
        
        // Afficher immédiatement la première page
        setNews(firstPageResult);
        setFilteredNews(firstPageResult);
        setAllNews(firstPageResult);
        paginateNews(firstPageResult, 1);
        setLoadingNews(false);
        
        // Étape 2: Charger le reste en arrière-plan (après 500ms)
        setTimeout(async () => {
          try {
            console.log(`📦 Chargement des pages supplémentaires en arrière-plan...`);
            const backgroundResult = await fetchWordPressNewsBackgroundOptimized({
              categories: selectedWPCategory ? [selectedWPCategory] : undefined,
              excludeFirstPage: true
            });
            
            // Combiner première page + pages d'arrière-plan
            const combinedResult = [...firstPageResult, ...backgroundResult];
            
            // Supprimer les doublons
            const uniqueResult = combinedResult.filter((item, index, self) => 
              index === self.findIndex(t => t.id === item.id)
            );
            
            console.log(`🎉 Chargement complet terminé: ${uniqueResult.length} articles au total`);
            
            // Mettre à jour les données avec tous les articles
            setNews(uniqueResult);
            setFilteredNews(uniqueResult);
            setAllNews(uniqueResult);
            
            // Recalculer la pagination avec tous les articles
            const totalPagesCount = Math.ceil(uniqueResult.length / pageSize);
            setTotalPages(totalPagesCount);
            setHasMore(1 < totalPagesCount);
            console.log(`📄 Pagination mise à jour: ${totalPagesCount} pages pour ${uniqueResult.length} articles`);
            
          } catch (backgroundError) {
            console.error('❌ Erreur chargement arrière-plan:', backgroundError);
          }
        }, 500); // Délai de 500ms pour laisser l'UI se stabiliser
        
      } catch (error) {
        console.error('❌ Erreur chargement première page:', error);
        setLoadingNews(false);
        setAllNews([]);
        setDisplayedNews([]);
      }
    };
    
    quickLoad();
  }, [selectedWPCategory, paginateNews, pageSize]);

  // useEffect pour recharger quand les filtres WordPress changent - optimisé
  const prevFiltersRef = useRef({ selectedWPCategory });
  const filterChangeDebounced = useRef(
    debounce(() => {
      console.log("WordPress category filter changed (debounced), refetching news...");
      // Clear cache for WordPress requests when filters change
      setWpNewsCache(new Map());
      requestCache.clearCache('wordpress');
      setAllNews([]);
      setDisplayedNews([]);
      fetchAllNews(1, false);
    }, 500)
  );

  useEffect(() => {
    if (!initialLoadComplete.current) return;

    const prev = prevFiltersRef.current;
    const hasFilterChanged = prev.selectedWPCategory !== selectedWPCategory;

    if (hasFilterChanged) {
      console.log("WordPress category filter change detected:", {
        wpCategory: selectedWPCategory
      });
      
      // Chargement immédiat pour filtres WordPress
      filterChangeDebounced.current();
    }

    prevFiltersRef.current = { selectedWPCategory };
  }, [selectedWPCategory, fetchWordPressNewsData]);

  const handleLoadMore = useCallback(async () => {
    const maxPages = Math.ceil(allNews.length / pageSize);
    if (loadingNews || isPageTransition || page >= maxPages || displayedNews.length >= allNews.length) return;
    
    setIsPageTransition(true);
    
    // Utiliser les données déjà chargées en cache au lieu de recharger
    const nextPage = page + 1;
    
    console.log(`Loading more from cache: page ${nextPage} (${displayedNews.length}/${allNews.length} articles)`);
    
    setTimeout(() => {
      const startIndex = (nextPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const newItems = allNews.slice(startIndex, endIndex);
      setDisplayedNews(prevItems => [...prevItems, ...newItems]);
      setPage(nextPage);
      setHasMore(nextPage < maxPages);
      setIsPageTransition(false);
    }, 50); // Réduit encore plus pour une réactivité maximale
  }, [loadingNews, isPageTransition, page, pageSize, allNews, displayedNews.length]);

  
  // useEffect(() => {
  //   if (!loadMoreRef.current) return;

  //   observerRef.current = new IntersectionObserver(
  //     (entries) => {
  //       const target = entries[0];
  //       if (target.isIntersecting && hasMore && !loadingNews && !isPageTransition && !isAutoLoading) {
  //         console.log('Scroll infini détecté, chargement automatique...');
  //         setIsAutoLoading(true);
  //         handleLoadMore().finally(() => {
  //           setTimeout(() => setIsAutoLoading(false), 1000);
  //         });
  //       }
  //     },
  //     {
  //       threshold: 0.1,
  //       rootMargin: '100px', // Déclencher 100px avant d'atteindre l'élément
  //     }
  //   );

  //   if (loadMoreRef.current) {
  //     observerRef.current.observe(loadMoreRef.current);
  //   }

  //   return () => {
  //     if (observerRef.current) {
  //       observerRef.current.disconnect();
  //     }
  //   };
  // }, [hasMore, loadingNews, isPageTransition, isAutoLoading, handleLoadMore]);

  const reportNews = async (newsId: string, description: string) => {
    if (reportingId) return;
    if (!isAuthenticated || !user?.id) {
      toast({
        title: "يرجى تسجيل الدخول",
        description: "يجب تسجيل الدخول لإرسال البلاغ",
        variant: "destructive",
      });
      return;
    }

    // Ne pas permettre le signalement des news WordPress
    if (newsId.startsWith("wp_")) {
      toast({
        title: "غير متاح",
        description: "لا يمكن الإبلاغ عن هذا المحتوى الخارجي",
        variant: "destructive",
      });
      return;
    }

    setReportingId(newsId);
    try {
      try {
        const { error } = await supabase.rpc("create_report", {
          p_type: "content",
          p_target: `news:${newsId}`,
          p_reason: "inappropriate",
          p_description: description,
          p_reported_by: user.id,
        });
        if (error) throw error;
      } catch (rpcErr: unknown) {
        const err = rpcErr as { message?: string };
        const msg = err?.message || "";
        const fnMissing =
          msg.includes("create_report") &&
          msg.toLowerCase().includes("function");
        if (!fnMissing) throw rpcErr;
        const { error: insErr } = await supabase.from("reports").insert({
          type: "content",
          target: `news:${newsId}`,
          reason: "inappropriate",
          description,
          reported_by: user.id,
        });
        if (insErr) throw insErr;
      }
      toast({ description: "تم إرسال البلاغ" });
      setReportOpenId(null);
      setReportDesc("");
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast({
        title: "Erreur",
        description: err?.message || "تعذر إرسال البلاغ",
        variant: "destructive",
      });
    } finally {
      setReportingId(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (loadingNews || newPage < 1 || newPage > totalPages) return;
    paginateNews(allNews, newPage);
    setPage(newPage);
    // Scroll vers le haut quand on change de page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChampionClick = (championId: number | null) => {
    setSelectedChampion(championId);
    setPage(1);
    setAllNews([]);
    setDisplayedNews([]);
    fetchAllNews(1);
  };

  // Fonction pour naviguer vers une catégorie
  const handleCategoryChange = (categoryId: number | null) => {
    if (categoryId === null) {
      navigate('/news');
    } else {
      const categoryInfo = WORDPRESS_CATEGORIES.find(cat => cat.id === categoryId);
      if (categoryInfo) {
        const slug = categoryInfo.slug || categoryInfo.name_ar;
        navigate(`/news/category/${slug}`);
      }
    }
  };

  // Fonction pour gérer les changements de catégorie WordPress
  const handleWordPressCategoryChange = (categoryId: number | null) => {
    setSelectedWPCategory(categoryId);
    setPage(1);
    setAllNews([]);
    setDisplayedNews([]);
    handleCategoryChange(categoryId);
  };

  // Fonction pour vérifier si des filtres WordPress sont actifs
  const hasActiveFilters = () => {
    return selectedWPCategory;
  };

  // Fonction pour obtenir le texte des filtres WordPress actifs
  const getActiveFiltersText = () => {
    const filters = [];
    
    if (selectedWPCategory) {
      const wpCat = WORDPRESS_CATEGORIES.find(c => c.id === selectedWPCategory);
      if (wpCat) {
        filters.push(currentLanguage === "ar" ? wpCat.name_ar : wpCat.name);
      }
    }
    
    return filters;
  };

  // Fonction pour réinitialiser tous les filtres WordPress
  const clearAllFilters = () => {
    setSelectedWPCategory(null);
    setPage(1);
    setAllNews([]);
    setDisplayedNews([]);
    navigate('/news');
  };

  // Trending topics derived from latest news titles
  const trendingTopics = displayedNews.slice(0, 5).map((n) => n.title);

  // Mapping between league IDs and competition IDs (adjust these based on your actual data)
  const leagueToCompetitionMap: { [key: number]: number } = {
    [MAIN_LEAGUES.CHAMPIONS_LEAGUE]: 1,
    [MAIN_LEAGUES.PREMIER_LEAGUE]: 2,
    [MAIN_LEAGUES.LA_LIGA]: 3,
    [MAIN_LEAGUES.SERIE_A]: 4,
    [MAIN_LEAGUES.BUNDESLIGA]: 5,
    [MAIN_LEAGUES.LIGUE_1]: 6,
  };

  // Leagues list (left sidebar) localized
  const leagues = [
    {
      id: MAIN_LEAGUES.CHAMPIONS_LEAGUE,
      name: currentLanguage === "ar" ? "دوري أبطال أوروبا" : "Champions League",
      logo: "https://media.api-sports.io/football/leagues/2.png",
      championId: leagueToCompetitionMap[MAIN_LEAGUES.CHAMPIONS_LEAGUE],
    },
    {
      id: MAIN_LEAGUES.PREMIER_LEAGUE,
      name:
        currentLanguage === "ar"
          ? "الدوري الإنجليزي الممتاز"
          : "Premier League",
      logo: "https://media.api-sports.io/football/leagues/39.png",
      championId: leagueToCompetitionMap[MAIN_LEAGUES.PREMIER_LEAGUE],
    },
    {
      id: MAIN_LEAGUES.LA_LIGA,
      name: currentLanguage === "ar" ? "الدوري الإسباني الممتاز" : "La Liga",
      logo: "https://media.api-sports.io/football/leagues/140.png",
      championId: leagueToCompetitionMap[MAIN_LEAGUES.LA_LIGA],
    },
    {
      id: MAIN_LEAGUES.SERIE_A,
      name: currentLanguage === "ar" ? "الدوري الإيطالي الممتاز" : "Serie A",
      logo: "https://media.api-sports.io/football/leagues/135.png",
      championId: leagueToCompetitionMap[MAIN_LEAGUES.SERIE_A],
    },
    {
      id: MAIN_LEAGUES.BUNDESLIGA,
      name: currentLanguage === "ar" ? "الدوري الألماني الممتاز" : "Bundesliga",
      logo: "https://media.api-sports.io/football/leagues/78.png",
      championId: leagueToCompetitionMap[MAIN_LEAGUES.BUNDESLIGA],
    },
    {
      id: MAIN_LEAGUES.LIGUE_1,
      name: currentLanguage === "ar" ? "الدوري الفرنسي الممتاز" : "Ligue 1",
      logo: "https://media.api-sports.io/football/leagues/61.png",
      championId: leagueToCompetitionMap[MAIN_LEAGUES.LIGUE_1],
    },
  ];



  return (
    <React.Fragment>
      <div className="min-h-screen bg-gradient-to-br from-background via-sport-light/20 to-background">
        <SEO
          title={
            selectedWPCategory 
              ? `${WORDPRESS_CATEGORIES.find(cat => cat.id === selectedWPCategory)?.name_ar || 'أخبار'} | كورة - آخر أخبار كرة القدم والرياضة`
              : "الأخبار | كورة - آخر أخبار كرة القدم والرياضة"
          }
          description="تابع آخر أخبار كرة القدم العربية والعالمية، أخبار الانتقالات، تحليلات المباريات، وكل ما يخص عالم الرياضة على كورة."
          keywords={[
            "أخبار كرة القدم",
            "أخبار رياضية",
            "انتقالات لاعبين",
            "تحليلات رياضية",
            "أخبار الدوريات",
            "كورة أخبار",
          ]}
          type="website"
        />
        <Header />



        <CategoryFilterHeader
          selectedHeaderCategory={null}
          setSelectedHeaderCategory={() => {}}
          selectedSubCategory={null}
          setSelectedSubCategory={() => {}}
          selectedWPCategory={selectedWPCategory}
          setSelectedWPCategory={setSelectedWPCategory}
          currentLanguage={currentLanguage}
        />
        
        <TeamsLogos />

       

       

     

        <div className="container mx-auto px-1 sm:px-2 lg:px-4 py-1 sm:py-2 lg:py-4">
          


          <div className="flex flex-col lg:flex-row gap-1 sm:gap-2 lg:gap-4">
            {/* Main Content - Grid Layout */}
            <div className="flex-1">
              {/* Loading state - Responsive Grid avec indicateur de filtre */}
              {loadingNews && displayedNews.length === 0 && (
                <div className="space-y-4">
                  {/* Enhanced Loading Indicator for WordPress Filters */}
                  {hasActiveFilters() && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-blue-800 dark:text-blue-200 text-sm">
                          {currentLanguage === "ar" 
                            ? `جاري تحميل الأخبار المفلترة...` 
                            : "Chargement des actualités filtrées..."
                          }
                        </span>
                        <div className="flex gap-1 flex-wrap">
                          {getActiveFiltersText().map((filter, index) => (
                            <span key={index} className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-1 py-0.5 rounded text-xs">
                              {filter}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2 lg:gap-3">
                    {[...Array(6)].map((_, index) => (
                      <div
                        key={index}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden animate-pulse"
                      >
                        <div className="w-full h-28 sm:h-32 lg:h-40 bg-gray-200 dark:bg-gray-700"></div>
                        <div className="p-2 sm:p-3 lg:p-4 space-y-1 sm:space-y-2">
                          <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                          <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Afficher le contenu existant même pendant le chargement de nouvelles données */}
              {displayedNews.length > 0 && (
                <>
                  {/* News Grid - Responsive - Tous les articles disponibles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2 lg:gap-4">
                    {displayedNews.map((newsItem, index) => (
                      <React.Fragment key={newsItem.id}>
                        <div className="relative">
                          <Link to={`/news/${newsItem.source === 'wordpress' ? generateSlug(newsItem.title) : generateUniqueSlug(newsItem.title, newsItem.id)}`}>
                            <NewsCard news={newsItem} size="medium" />
                            {newsItem.source === "wordpress" && (
                              <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                                {currentLanguage === "ar" ? "كورة" : "Koora"}
                              </div>
                            )}
                          </Link>
                        </div>
                        
                       

                        {/* Bannière supprimée */}
                      </React.Fragment>
                    ))}
                  </div>
                  
                  {/* Indicateur de chargement de contenu supplémentaire */}
                  {loadingNews && (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sport-dark"></div>
                      <span className="ml-2 text-gray-600">جاري تحميل المزيد...</span>
                    </div>
                  )}
                </>
              )}

              {/* No news state */}
              {!loadingNews && displayedNews.length === 0 && allNews.length === 0 && (
                <div className="flex justify-center py-8 sm:py-12">
                  <NewsCard
                    news={{
                      id: "empty",
                      title:
                        currentLanguage === "ar"
                          ? "لا توجد أخبار متاحة حالياً"
                          : "Aucune actualité disponible",
                      summary:
                        currentLanguage === "ar"
                          ? "انتظر تحديثات جديدة قريباً."
                          : "De nouvelles actualités arriveront bientôt.",
                      imageUrl: "/placeholder.svg",
                      publishedAt: "",
                      category: currentLanguage === "ar" ? "أخبار" : "News",
                    }}
                    size="medium"
                  />
                </div>
              )}

              {/* Load More Button - Pagination manuelle uniquement */}
              {displayedNews.length < allNews.length && allNews.length > pageSize && (
                <div className="flex justify-center pt-4 sm:pt-6 lg:pt-8">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-sport-dark text-white hover:bg-sport-dark/80 transition-colors disabled:opacity-50 px-6 py-3"
                    onClick={(e) => {
                      e.preventDefault();
                      handleLoadMore();
                    }}
                    disabled={loadingNews || isPageTransition}
                  >
                    {loadingNews || isPageTransition ? 'جاري التحميل...' : `اظهر المزيد `}
                  </Button>
                </div>
              )}

              {/* Pagination - même logique que Index.tsx */}
              {(allNews.length > pageSize) && (
                <div className="flex justify-center mt-8">
                  <Pagination>
                    <PaginationContent>
                      {page > 1 && (
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => handlePageChange(page - 1)}
                            className="cursor-pointer"
                          />
                        </PaginationItem>
                      )}
                      
                      {/* Page numbers */}
                      {Array.from({ length: Math.min(5, Math.ceil(allNews.length / pageSize)) }, (_, i) => {
                        const maxPages = Math.ceil(allNews.length / pageSize);
                        let pageNum;
                        if (maxPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= maxPages - 2) {
                          pageNum = maxPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => handlePageChange(pageNum)}
                              isActive={page === pageNum}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      {Math.ceil(allNews.length / pageSize) > 5 && page < Math.ceil(allNews.length / pageSize) - 2 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      
                      {page < Math.ceil(allNews.length / pageSize) && (
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => handlePageChange(page + 1)}
                            className="cursor-pointer"
                          />
                        </PaginationItem>
                      )}
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
              
             
            </div>

            {/* Right Sidebar */}
            <div className="hidden xl:block w-64 space-y-4">
            
              
              {/* Trending Topics */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b pb-2">
                  المواضيع الأكثر بحثاً
                </h3>
                <div className="space-y-3">
                  {trendingTopics.slice(0, 5).map((topic, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      <span className="text-sm font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 w-6 h-6 rounded-full flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 line-clamp-2 flex-1">
                        {topic.length > 50
                          ? topic.substring(0, 50) + "..."
                          : topic}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

             
            </div>
          </div>
        </div>

        <Footer />
        
      </div>

      {/* Report Dialog - Mobile Responsive */}
      <Dialog
        open={!!reportOpenId}
        onOpenChange={(o) => {
          setReportOpenId(o ? reportOpenId : null);
          if (!o) setReportDesc("");
        }}
      >
        <DialogContent className="w-[90vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-sm sm:text-base lg:text-lg">
              {currentLanguage === "ar"
                ? "سبب التبليغ"
                : "Raison du signalement"}
            </DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder={
              currentLanguage === "ar"
                ? "اكتب سبب التبليغ بإيجاز"
                : "Décrivez brièvement la raison"
            }
            value={reportDesc}
            onChange={(e) => setReportDesc(e.target.value)}
            className="min-h-[80px] sm:min-h-[100px] lg:min-h-[120px] text-xs sm:text-sm lg:text-base"
            dir="auto"
          />
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setReportOpenId(null);
                setReportDesc("");
              }}
              disabled={!!reportingId}
              className="order-2 sm:order-1 w-full sm:w-auto text-xs sm:text-sm lg:text-base py-2"
            >
              {currentLanguage === "ar" ? "إلغاء" : "Annuler"}
            </Button>
            <Button
              onClick={() => {
                const d = reportDesc.trim();
                if (!d) {
                  toast({
                    title:
                      currentLanguage === "ar"
                        ? "مطلوب وصف"
                        : "Description requise",
                    description:
                      currentLanguage === "ar"
                        ? "يرجى كتابة سبب التبليغ"
                        : "Veuillez écrire la raison du signalement",
                    variant: "destructive",
                  });
                  return;
                }
                if (reportOpenId) reportNews(reportOpenId, d);
              }}
              disabled={!!reportingId}
              className="order-1 sm:order-2 w-full sm:w-auto text-xs sm:text-sm lg:text-base py-2"
            >
              {reportingId
                ? "..."
                : currentLanguage === "ar"
                ? "إرسال البلاغ"
                : "Envoyer le signalement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default News;
