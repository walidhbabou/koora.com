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

const CategoryFilterHeader = ({ 
  selectedHeaderCategory, 
  setSelectedHeaderCategory,
  selectedSubCategory,
  setSelectedSubCategory,
  currentLanguage 
}) => {
  const [subCategories, setSubCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileOpenCategory, setMobileOpenCategory] = useState(null);

  const headerCategories = useMemo(() => [
    { id: 1, name: 'Internationales', name_ar: 'البطولات الدولية', table: 'competitions_internationales', lightColor: 'from-blue-500 to-blue-600', darkColor: 'from-blue-600 to-blue-800' },
    { id: 2, name: 'Mondiales', name_ar: 'البطولات العالمية', table: 'competitions_mondiales', lightColor: 'from-green-500 to-green-600', darkColor: 'from-green-600 to-green-800' },
    { id: 3, name: 'Continentales', name_ar: 'البطولات القارية', table: 'competitions_continentales', lightColor: 'from-purple-500 to-purple-600', darkColor: 'from-purple-600 to-purple-800' },
    { id: 4, name: 'Locales', name_ar: 'البطولات المحلية', table: 'competitions_locales', lightColor: 'from-orange-500 to-orange-600', darkColor: 'from-orange-600 to-orange-800' },
    { id: 5, name: 'Transferts', name_ar: 'الانتقالات وأخبار اللاعبين', table: 'transferts_news', lightColor: 'from-red-500 to-red-600', darkColor: 'from-red-600 to-red-800' }
  ], []);

  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        setLoading(true);
        const subCatData = {};
        for (const category of headerCategories) {
          const { data, error } = await supabase
            .from(category.table)
            .select("id, nom")
            .order("id");
          subCatData[category.id] = !error && data ? data : [];
        }
        setSubCategories(subCatData);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
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
    setSelectedHeaderCategory(categoryId);
    setSelectedSubCategory(subCategoryId);
    setMobileOpenCategory(null);
  };

  const handleMobileAllCategoryClick = (categoryId) => {
    setSelectedHeaderCategory(categoryId);
    setSelectedSubCategory(null);
    setMobileOpenCategory(null);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-gray-300 dark:border-slate-700/50">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center py-6">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-sport-green border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sport-green text-lg font-medium">
                {currentLanguage === "ar" ? "جاري تحميل الفئات..." : "Chargement..."}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-white via-gray-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-gray-200 dark:border-slate-700/50 shadow-xl">
      <div className="container mx-auto px-4">
        
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
                      text-white
                      ${isActive 
                        ? `bg-gradient-to-r ${category.lightColor} dark:${category.darkColor} shadow-lg`
                        : "hover:text-white"}
                      font-bold text-base
                      hover:bg-gradient-to-r hover:${category.lightColor} dark:hover:${category.darkColor}
                      transition-all duration-300 border-none outline-none
                      rounded-lg backdrop-blur-sm
                      ${isActive ? "transform scale-105" : "hover:transform hover:scale-105"}
                      bg-white/10 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-600/50
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
                  className="bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-800 border border-gray-200 dark:border-slate-600/50 min-w-[320px] shadow-2xl backdrop-blur-md"
                  align="center"
                  sideOffset={12}
                >
                  <div className={`px-4 py-3 border-b border-gray-200 dark:border-slate-600/30 bg-gradient-to-r ${category.lightColor} dark:${category.darkColor}`}>
                    <h4 className="text-white font-bold text-sm">
                      {currentLanguage === "ar" ? category.name_ar : category.name}
                    </h4>
                  </div>

                  <DropdownMenuItem
                    className="text-gray-700 dark:text-sport-green hover:bg-gradient-to-r hover:from-sport-green hover:to-green-600 hover:text-white cursor-pointer font-medium px-4 py-3"
                    onClick={() => {
                      setSelectedHeaderCategory(category.id);
                      setSelectedSubCategory(null);
                    }}
                  >
                    {currentLanguage === "ar" ? `جميع ${category.name_ar}` : `Toutes ${category.name}`}
                  </DropdownMenuItem>

                  <div className="max-h-64 overflow-y-auto">
                    {subCategories[category.id]?.map((subCat) => (
                      <DropdownMenuItem
                        key={subCat.id}
                        className="text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/50 hover:text-sport-green cursor-pointer px-4 py-2"
                        onClick={() => {
                          setSelectedHeaderCategory(category.id);
                          setSelectedSubCategory(subCat.id);
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
                    ${isActive || isOpen
                      ? `bg-gradient-to-r ${category.lightColor} dark:${category.darkColor} text-white shadow-md`
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
                      onClick={() => handleMobileSubCategoryClick(mobileOpenCategory, subCat.id)}
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