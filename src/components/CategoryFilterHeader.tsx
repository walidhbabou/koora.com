import React, { useEffect, useState, useMemo } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WORDPRESS_CATEGORIES, SUPABASE_TO_WORDPRESS_MAPPING } from "@/config/wordpressCategories";
import { useNavigate } from "react-router-dom";

const CategoryFilterHeader = ({ 
  selectedHeaderCategory, 
  setSelectedHeaderCategory,
  selectedSubCategory,
  setSelectedSubCategory,
  currentLanguage,
  selectedWPCategory,
  setSelectedWPCategory,
  setPage,
  setAllNews,
  setDisplayedNews
}) => {
  const [subCategories, setSubCategories] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileOpenCategory, setMobileOpenCategory] = useState(null);
  const navigate = useNavigate();

  const headerCategories = useMemo(() => [
    { id: 1, name: 'Internationales', name_ar: 'البطولات الدولية', table: 'competitions_internationales', lightColor: 'from-blue-500 to-blue-600', darkColor: 'from-blue-600 to-blue-800' },
    { id: 2, name: 'Mondiales', name_ar: 'البطولات العالمية', table: 'competitions_mondiales', lightColor: 'from-green-500 to-green-600', darkColor: 'from-green-600 to-green-800' },
    { id: 3, name: 'Continentales', name_ar: 'البطولات القارية', table: 'competitions_continentales', lightColor: 'from-purple-500 to-purple-600', darkColor: 'from-purple-600 to-purple-800' },
    { id: 4, name: 'Locales', name_ar: 'البطولات المحلية', table: 'competitions_locales', lightColor: 'from-orange-500 to-orange-600', darkColor: 'from-orange-600 to-orange-800' },
    { id: 5, name: 'Transferts', name_ar: 'الانتقالات وأخبار اللاعبين', table: 'transferts_news', lightColor: 'from-red-500 to-red-600', darkColor: 'from-red-600 to-red-800' }
    // Suppression de la catégorie WordPress News (id: 6) de l'affichage
  ], []);

  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const subCatData = {};
        for (const category of headerCategories) {
          // Seulement pour les catégories Supabase, plus de catégorie WordPress
          const { data, error } = await supabase
            .from(category.table)
            .select("id, nom")
            .order("id");
          subCatData[category.id] = !error && data ? data : [];
        }
        setSubCategories(subCatData);
      } catch (error) {
        console.error("Erreur:", error);
      }
    };
    fetchSubCategories();
  }, [headerCategories]);

  const handleMobileCategoryClick = (categoryId) => {
    if (mobileOpenCategory === categoryId) {
      setMobileOpenCategory(null);
    } else {
      setMobileOpenCategory(categoryId);
    }
  };

  const handleMobileSubCategoryClick = (categoryId, subCategoryId) => {
    // Plus de logique WordPress car on n'affiche plus cette catégorie
    // Pour toutes les catégories Supabase, appliquer le mapping WordPress automatiquement
    setSelectedHeaderCategory(categoryId);
    setSelectedSubCategory(subCategoryId);
    
    // Appliquer automatiquement le mapping WordPress correspondant
    const mapping = SUPABASE_TO_WORDPRESS_MAPPING[categoryId];
    if (mapping && mapping.subCategories[subCategoryId]) {
      const wpCategories = mapping.subCategories[subCategoryId];
      // Pour simplifier, on prend la première catégorie WordPress mappée
      setSelectedWPCategory(wpCategories[0]);
      console.log(`Auto-mapping Supabase category ${categoryId}.${subCategoryId} to WordPress category ${wpCategories[0]}`);
    }
    
    if (typeof setPage === 'function') setPage(1);
    if (typeof setAllNews === 'function') setAllNews([]);
    if (typeof setDisplayedNews === 'function') setDisplayedNews([]);
    
    setMobileOpenCategory(null);
  };

  const handleMobileAllCategoryClick = (categoryId) => {
    setSelectedHeaderCategory(categoryId);
    setSelectedSubCategory(null);
    
    // Appliquer automatiquement le mapping WordPress pour "toutes" les sous-catégories
    const mapping = SUPABASE_TO_WORDPRESS_MAPPING[categoryId];
    if (mapping && mapping.all && mapping.all.length > 0) {
      // Pour simplifier, on prend la première catégorie WordPress de "all"
      setSelectedWPCategory(mapping.all[0]);
      console.log(`Auto-mapping Supabase category ${categoryId} (all) to WordPress category ${mapping.all[0]}`);
    }
    
    setMobileOpenCategory(null);
  };

  // Fonction pour réinitialiser tous les filtres
  const clearAllFilters = () => {
    setSelectedHeaderCategory(null);
    setSelectedSubCategory(null);
    setSelectedWPCategory(null);
    if (typeof setPage === 'function') setPage(1);
    if (typeof setAllNews === 'function') setAllNews([]);
    if (typeof setDisplayedNews === 'function') setDisplayedNews([]);
    navigate('/news');
  };

  // Fonction pour vérifier si plusieurs filtres sont actifs
  const hasMultipleFilters = () => {
    const filtersCount = [selectedHeaderCategory, selectedWPCategory].filter(f => f !== null).length;
    return filtersCount > 1;
  };

  // Fonction pour obtenir le texte des filtres actifs
  const getActiveFiltersText = () => {
    const filters = [];
    
    if (selectedHeaderCategory) {
      const headerCat = headerCategories.find(c => c.id === selectedHeaderCategory);
      if (headerCat) {
        const catName = currentLanguage === "ar" ? headerCat.name_ar : headerCat.name;
        if (selectedSubCategory) {
          const subCat = subCategories[selectedHeaderCategory]?.find(s => s.id === selectedSubCategory);
          if (subCat) {
            filters.push(`${catName}: ${subCat.nom}`);
          }
        } else {
          filters.push(catName);
        }
      }
    }
    
    if (selectedWPCategory) {
      const wpCat = WORDPRESS_CATEGORIES.find(c => c.id === selectedWPCategory);
      if (wpCat) {
        filters.push(currentLanguage === "ar" ? wpCat.name_ar : wpCat.name);
      }
    }
    
    return filters;
  };

  return (
    <div className="bg-gradient-to-r from-white via-gray-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-gray-200 dark:border-slate-700/50 shadow-xl">
      <div className="container mx-auto px-4">
        
        {/* Indicateur de filtres multiples */}
        {hasMultipleFilters() && (
          <div className="py-2 border-b border-gray-200 dark:border-slate-700/30">
            <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {currentLanguage === "ar" ? "الفلاتر النشطة:" : "Filtres actifs:"}
                </span>
                {getActiveFiltersText().map((filter, index) => (
                  <span key={index} className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">
                    {filter}
                  </span>
                ))}
              </div>
              <button
                onClick={clearAllFilters}
                className="bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 px-3 py-1 rounded-full text-xs font-medium transition-colors"
              >
                {currentLanguage === "ar" ? "مسح الكل" : "Tout effacer"}
              </button>
            </div>
          </div>
        )}
        
        {/* Desktop */}
        <div className="hidden lg:flex justify-center items-center py-4 gap-1">
          {headerCategories.map((category) => {
            const isActive = selectedHeaderCategory === category.id;
            return (
              <DropdownMenu 
                key={category.id}
                onOpenChange={(open) => setOpenDropdown(open ? category.id : null)}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`
                      relative group flex items-center gap-2 px-6 py-4 mx-1
                      shadow-md ${isActive ? 'shadow-2xl' : ''}
                      ${isActive 
                        ? `bg-gradient-to-r ${category.lightColor} dark:${category.darkColor} text-white`
                        : "text-gray-800 dark:text-white hover:text-white bg-white/10 dark:bg-slate-800/50"}
                      font-bold text-base
                      hover:bg-gradient-to-r hover:from-sport-green hover:to-green-600 dark:hover:from-sport-green dark:hover:to-green-800 hover:text-white
                      transition-all duration-300 border-none outline-none
                      rounded-lg backdrop-blur-sm
                      ${isActive ? "transform scale-105" : "hover:transform hover:scale-105"}
                      border border-gray-200 dark:border-slate-600/50
                    `}
                  >
                    {openDropdown === category.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                    <span className="whitespace-nowrap font-semibold">
                      {currentLanguage === "ar" ? category.name_ar : category.name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent 
                  className="bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-800 border border-gray-200 dark:border-slate-600/50 min-w-[320px] shadow-2xl backdrop-blur-md text-gray-900 dark:text-white"
                  align="center"
                  sideOffset={12}
                >
                  <div className={`px-4 py-3 border-b border-gray-200 dark:border-slate-600/30 bg-gradient-to-r ${category.lightColor} dark:${category.darkColor}`}>
                    <h4 className="text-white font-bold text-sm">
                      {currentLanguage === "ar" ? category.name_ar : category.name}
                    </h4>
                  </div>

                  <DropdownMenuItem
                    className="text-gray-800 dark:text-sport-green hover:bg-gradient-to-r hover:from-sport-green hover:to-green-600 hover:text-white cursor-pointer font-medium px-4 py-3"
                    onClick={() => {
                      // Plus de logique WordPress car on n'affiche plus cette catégorie
                      setSelectedHeaderCategory(category.id);
                      setSelectedSubCategory(null);
                      
                      // Appliquer automatiquement le mapping WordPress pour "toutes" les sous-catégories
                      const mapping = SUPABASE_TO_WORDPRESS_MAPPING[category.id];
                      if (mapping && mapping.all && mapping.all.length > 0) {
                        setSelectedWPCategory(mapping.all[0]);
                        console.log(`Auto-mapping Supabase category ${category.id} (all) to WordPress category ${mapping.all[0]}`);
                      }
                    }}
                  >
                    {currentLanguage === "ar" ? `جميع ${category.name_ar}` : `Toutes ${category.name}`}
                  </DropdownMenuItem>

                  <div className="max-h-64 overflow-y-auto">
                    {subCategories[category.id]?.map((subCat) => (
                      <DropdownMenuItem
                        key={subCat.id}
                        className="text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/50 hover:text-sport-green cursor-pointer px-4 py-2"
                        onClick={() => {
                          // Plus de logique WordPress car on n'affiche plus cette catégorie
                          setSelectedHeaderCategory(category.id);
                          setSelectedSubCategory(subCat.id);
                          
                          // Appliquer automatiquement le mapping WordPress correspondant
                          const mapping = SUPABASE_TO_WORDPRESS_MAPPING[category.id];
                          if (mapping && mapping.subCategories[subCat.id]) {
                            const wpCategories = mapping.subCategories[subCat.id];
                            setSelectedWPCategory(wpCategories[0]);
                            console.log(`Auto-mapping Supabase category ${category.id}.${subCat.id} to WordPress category ${wpCategories[0]}`);
                          }
                          
                          if (typeof setPage === 'function') setPage(1);
                          if (typeof setAllNews === 'function') setAllNews([]);
                          if (typeof setDisplayedNews === 'function') setDisplayedNews([]);
                        }}
                      >
                        {subCat.nom}
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            );
          })}
        </div>

        {/* Mobile */}
        <div className="lg:hidden">
          {/* Categories principales */}
          <div className="flex overflow-x-auto gap-2 py-3 scrollbar-hide">
            {headerCategories.map((category) => {
              const isActive = selectedHeaderCategory === category.id;
              const isOpen = mobileOpenCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => handleMobileCategoryClick(category.id)}
                  className={`
                    flex-shrink-0 px-4 py-3 rounded-lg text-sm font-semibold transition-all
                    flex items-center gap-2 min-w-[120px] justify-center
                    shadow-md ${isActive ? 'shadow-2xl' : ''}
                    ${isActive || isOpen
                      ? `bg-gradient-to-r ${category.lightColor} dark:${category.darkColor} text-white`
                      : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"}
                  `}
                >
                  <span className="text-xs text-center">
                    {currentLanguage === "ar" ? category.name_ar : category.name}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Sous-catégories pour la catégorie ouverte */}
          {mobileOpenCategory && (
            <div className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-600 mb-3 rounded-lg shadow-lg">
              <div className="p-3">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-gray-800 dark:text-white">
                    {currentLanguage === "ar" 
                      ? headerCategories.find(c => c.id === mobileOpenCategory)?.name_ar
                      : headerCategories.find(c => c.id === mobileOpenCategory)?.name
                    }
                  </h4>
                  <button 
                    onClick={() => setMobileOpenCategory(null)}
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <button
                  onClick={() => handleMobileAllCategoryClick(mobileOpenCategory)}
                  className="w-full text-left p-3 mb-2 rounded-lg bg-gradient-to-r from-sport-green to-green-600 text-white font-semibold text-sm"
                >
                  {currentLanguage === "ar" 
                    ? `جميع ${headerCategories.find(c => c.id === mobileOpenCategory)?.name_ar}`
                    : `Toutes ${headerCategories.find(c => c.id === mobileOpenCategory)?.name}`
                  }
                </button>
                
                <div className="max-h-48 overflow-y-auto">
                  {subCategories[mobileOpenCategory]?.map((subCat) => (
                    <button
                      key={subCat.id}
                      onClick={() => {
                        // Plus de logique WordPress car on n'affiche plus cette catégorie
                        handleMobileSubCategoryClick(mobileOpenCategory, subCat.id);
                      }}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 text-sm border-b border-gray-100 dark:border-slate-600 last:border-b-0"
                    >
                      {subCat.nom}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryFilterHeader;