import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WORDPRESS_CATEGORIES } from "@/config/wordpressCategories";
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
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileOpenCategory, setMobileOpenCategory] = useState(null);
  const navigate = useNavigate();

  // Catégories WordPress principales organisées par groupes
  const wpCategoryGroups = useMemo(() => [
    {
      id: 'transfers',
      name: 'Transferts',
      name_ar: 'الانتقالات',
      categories: WORDPRESS_CATEGORIES.filter(cat => [2, 3, 4, 5, 6].includes(cat.id)),
      lightColor: 'from-red-500 to-red-600',
      darkColor: 'from-red-600 to-red-800'
    },
    {
      id: 'international',
      name: 'International',
      name_ar: 'البطولات الدولية',
      categories: WORDPRESS_CATEGORIES.filter(cat => [7, 8, 9, 10, 11, 12, 1696, 74].includes(cat.id)),
      lightColor: 'from-blue-500 to-blue-600',
      darkColor: 'from-blue-600 to-blue-800'
    },
    {
      id: 'european',
      name: 'Ligues Européennes',
      name_ar: 'الدوريات الأوروبية',
      categories: WORDPRESS_CATEGORIES.filter(cat => [13, 14, 15, 16, 17, 18].includes(cat.id)),
      lightColor: 'from-green-500 to-green-600',
      darkColor: 'from-green-600 to-green-800'
    },
    {
      id: 'continental',
      name: 'Continental',
      name_ar: 'البطولات القارية',
      categories: WORDPRESS_CATEGORIES.filter(cat => [19, 20, 21, 22, 23, 24].includes(cat.id)),
      lightColor: 'from-purple-500 to-purple-600',
      darkColor: 'from-purple-600 to-purple-800'
    },
    {
      id: 'local',
      name: 'Ligues Locales',
      name_ar: 'البطولات المحلية',
      categories: WORDPRESS_CATEGORIES.filter(cat => [29, 30, 31, 32, 33, 34].includes(cat.id)),
      lightColor: 'from-orange-500 to-orange-600',
      darkColor: 'from-orange-600 to-orange-800'
    }
  ], []);

  // Fonction pour gérer la sélection d'une catégorie WordPress
  const handleCategorySelect = (categoryId) => {
    setSelectedWPCategory(categoryId);
    if (typeof setPage === 'function') setPage(1);
    if (typeof setAllNews === 'function') setAllNews([]);
    if (typeof setDisplayedNews === 'function') setDisplayedNews([]);
    
    // Navigation vers la catégorie
    const category = WORDPRESS_CATEGORIES.find(cat => cat.id === categoryId);
    if (category) {
      navigate(`/news/category/${category.slug}`);
    }
  };

  // Fonction pour naviguer vers toutes les news
  const handleAllNews = () => {
    setSelectedWPCategory(null);
    if (typeof setPage === 'function') setPage(1);
    if (typeof setAllNews === 'function') setAllNews([]);
    if (typeof setDisplayedNews === 'function') setDisplayedNews([]);
    navigate('/news');
  };

  // Fonction pour réinitialiser tous les filtres
  const clearAllFilters = () => {
    setSelectedWPCategory(null);
    if (typeof setPage === 'function') setPage(1);
    if (typeof setAllNews === 'function') setAllNews([]);
    if (typeof setDisplayedNews === 'function') setDisplayedNews([]);
    navigate('/news');
  };

  // Fonction pour vérifier si des filtres sont actifs
  const hasActiveFilters = () => {
    return selectedWPCategory !== null;
  };

  // Fonction pour obtenir le texte des filtres actifs
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

  return (
    <div className="bg-gradient-to-r from-white via-gray-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-gray-200 dark:border-slate-700/50 shadow-xl">
      <div className="container mx-auto px-4">
        
        {/* Indicateur de filtre actif */}
        {hasActiveFilters() && (
          <div className="py-2 border-b border-gray-200 dark:border-slate-700/30">
            <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {currentLanguage === "ar" ? "الفلتر النشط:" : "Filtre actif:"}
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
                {currentLanguage === "ar" ? "مسح الفلتر" : "Effacer"}
              </button>
            </div>
          </div>
        )}
        
        {/* Desktop */}
        <div className="hidden lg:flex justify-center items-center py-4 gap-1">
          {/* Bouton "Toutes les actualités" */}
          <Button
            variant="ghost"
            onClick={handleAllNews}
            className={`
              relative group flex items-center gap-2 px-6 py-4 mx-1
              shadow-md ${!selectedWPCategory ? 'shadow-2xl' : ''}
              ${!selectedWPCategory 
                ? 'bg-gradient-to-r from-sport-green to-green-600 dark:from-sport-green dark:to-green-800 text-white'
                : "text-gray-800 dark:text-white hover:text-white bg-white/10 dark:bg-slate-800/50"}
              font-bold text-base
              hover:bg-gradient-to-r hover:from-sport-green hover:to-green-600 dark:hover:from-sport-green dark:hover:to-green-800 hover:text-white
              transition-all duration-300 border-none outline-none
              rounded-lg backdrop-blur-sm
              ${!selectedWPCategory ? "transform scale-105" : "hover:transform hover:scale-105"}
              border border-gray-200 dark:border-slate-600/50
            `}
          >
            <span className="whitespace-nowrap font-semibold">
              {currentLanguage === "ar" ? "جميع الأخبار" : "Toutes les actualités"}
            </span>
          </Button>
          
          {wpCategoryGroups.map((group) => {
            const isActive = group.categories.some(cat => cat.id === selectedWPCategory);
            return (
              <DropdownMenu 
                key={group.id}
                onOpenChange={(open) => setOpenDropdown(open ? group.id : null)}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`
                      relative group flex items-center gap-2 px-6 py-4 mx-1
                      shadow-md ${isActive ? 'shadow-2xl' : ''}
                      ${isActive 
                        ? `bg-gradient-to-r ${group.lightColor} dark:${group.darkColor} text-white`
                        : "text-gray-800 dark:text-white hover:text-white bg-white/10 dark:bg-slate-800/50"}
                      font-bold text-base
                      hover:bg-gradient-to-r hover:from-sport-green hover:to-green-600 dark:hover:from-sport-green dark:hover:to-green-800 hover:text-white
                      transition-all duration-300 border-none outline-none
                      rounded-lg backdrop-blur-sm
                      ${isActive ? "transform scale-105" : "hover:transform hover:scale-105"}
                      border border-gray-200 dark:border-slate-600/50
                    `}
                  >
                    {openDropdown === group.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                    <span className="whitespace-nowrap font-semibold">
                      {currentLanguage === "ar" ? group.name_ar : group.name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent 
                  className="bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-800 border border-gray-200 dark:border-slate-600/50 min-w-[320px] shadow-2xl backdrop-blur-md text-gray-900 dark:text-white"
                  align="center"
                  sideOffset={12}
                >
                  <div className={`px-4 py-3 border-b border-gray-200 dark:border-slate-600/30 bg-gradient-to-r ${group.lightColor} dark:${group.darkColor}`}>
                    <h4 className="text-white font-bold text-sm">
                      {currentLanguage === "ar" ? group.name_ar : group.name}
                    </h4>
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {group.categories.map((category) => (
                      <DropdownMenuItem
                        key={category.id}
                        className="text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/50 hover:text-sport-green cursor-pointer px-4 py-2"
                        onClick={() => handleCategorySelect(category.id)}
                      >
                        {currentLanguage === "ar" ? category.name_ar : category.name}
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
          {/* Bouton "Toutes les actualités" et catégories principales */}
          <div className="flex overflow-x-auto gap-2 py-3 scrollbar-hide">
            <button
              onClick={handleAllNews}
              className={`
                flex-shrink-0 px-4 py-3 rounded-lg text-sm font-semibold transition-all
                flex items-center gap-2 min-w-[120px] justify-center
                shadow-md ${!selectedWPCategory ? 'shadow-2xl' : ''}
                ${!selectedWPCategory
                  ? 'bg-gradient-to-r from-sport-green to-green-600 dark:from-sport-green dark:to-green-800 text-white'
                  : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"}
              `}
            >
              <span className="text-xs text-center">
                {currentLanguage === "ar" ? "جميع الأخبار" : "Toutes"}
              </span>
            </button>
            
            {wpCategoryGroups.map((group) => {
              const isActive = group.categories.some(cat => cat.id === selectedWPCategory);
              const isOpen = mobileOpenCategory === group.id;
              return (
                <button
                  key={group.id}
                  onClick={() => {
                    if (mobileOpenCategory === group.id) {
                      setMobileOpenCategory(null);
                    } else {
                      setMobileOpenCategory(group.id);
                    }
                  }}
                  className={`
                    flex-shrink-0 px-4 py-3 rounded-lg text-sm font-semibold transition-all
                    flex items-center gap-2 min-w-[120px] justify-center
                    shadow-md ${isActive ? 'shadow-2xl' : ''}
                    ${isActive || isOpen
                      ? `bg-gradient-to-r ${group.lightColor} dark:${group.darkColor} text-white`
                      : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"}
                  `}
                >
                  <span className="text-xs text-center">
                    {currentLanguage === "ar" ? group.name_ar : group.name}
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

          {/* Sous-catégories pour le groupe ouvert */}
          {mobileOpenCategory && (
            <div className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-600 mb-3 rounded-lg shadow-lg">
              <div className="p-3">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-gray-800 dark:text-white">
                    {currentLanguage === "ar" 
                      ? wpCategoryGroups.find(g => g.id === mobileOpenCategory)?.name_ar
                      : wpCategoryGroups.find(g => g.id === mobileOpenCategory)?.name
                    }
                  </h4>
                  <button 
                    onClick={() => setMobileOpenCategory(null)}
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="max-h-48 overflow-y-auto">
                  {wpCategoryGroups.find(g => g.id === mobileOpenCategory)?.categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        handleCategorySelect(category.id);
                        setMobileOpenCategory(null);
                      }}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 text-sm border-b border-gray-100 dark:border-slate-600 last:border-b-0"
                    >
                      {currentLanguage === "ar" ? category.name_ar : category.name}
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