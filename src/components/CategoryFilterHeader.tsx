import React, { useEffect, useState, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Styles CSS simples pour scroll
const styles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

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

  // Les 5 catégories avec couleurs adaptées aux deux modes
  const headerCategories = useMemo(() => [
    {
      id: 1,
      name: 'Internationales',
      name_ar: 'البطولات الدولية',
      table: 'competitions_internationales',
      lightColor: 'from-blue-500 to-blue-600',
      darkColor: 'from-blue-600 to-blue-800',
    },
    {
      id: 2,
      name: 'Mondiales',
      name_ar: 'البطولات العالمية',
      table: 'competitions_mondiales',
      lightColor: 'from-green-500 to-green-600',
      darkColor: 'from-green-600 to-green-800',
    },
    {
      id: 3,
      name: 'Continentales', 
      name_ar: 'البطولات القارية',
      table: 'competitions_continentales',
      lightColor: 'from-purple-500 to-purple-600',
      darkColor: 'from-purple-600 to-purple-800',
    },
    {
      id: 4,
      name: 'Locales',
      name_ar: 'البطولات المحلية', 
      table: 'competitions_locales',
      lightColor: 'from-orange-500 to-orange-600',
      darkColor: 'from-orange-600 to-orange-800',
    },
    {
      id: 5,
      name: 'Transferts',
      name_ar: 'الانتقالات وأخبار اللاعبين',
      table: 'transferts_news',
      lightColor: 'from-red-500 to-red-600',
      darkColor: 'from-red-600 to-red-800',
    }
  ], []);

  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        setLoading(true);
        const subCatData = {};
        
        for (const category of headerCategories) {
          try {
            const { data, error } = await supabase
              .from(category.table)
              .select('id, nom')
              .order('id');
            
            if (!error && data) {
              subCatData[category.id] = data;
            } else {
              subCatData[category.id] = [];
            }
          } catch (err) {
            console.warn(`Erreur lors du chargement de ${category.table}:`, err);
            subCatData[category.id] = [];
          }
        }
        
        setSubCategories(subCatData);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubCategories();
  }, [headerCategories]);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-gray-300 dark:border-slate-700/50">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center py-6">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-sport-green border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sport-green text-lg font-medium">
                {currentLanguage === 'ar' ? 'جاري تحميل الفئات...' : 'Chargement...'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Injection des styles CSS */}
      <style>{styles}</style>
      
      {/* Header avec couleurs adaptées au mode */}
      <div className="bg-gradient-to-r from-white via-gray-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-gray-200 dark:border-slate-700/50 shadow-xl">
        <div className="container mx-auto px-4">
          {/* Desktop Version */}
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
                        text-gray-700 dark:text-sport-green font-bold text-base
                        hover:bg-gradient-to-r hover:${category.lightColor} dark:hover:${category.darkColor} hover:text-white
                        ${isActive ? `bg-gradient-to-r ${category.lightColor} dark:${category.darkColor} text-white shadow-lg` : ''}
                        transition-all duration-300 border-none outline-none
                        rounded-lg backdrop-blur-sm
                        ${isActive ? 'transform scale-105' : 'hover:transform hover:scale-105'}
                        bg-white/70 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-600/50
                      `}
                    >
                      <div className="transition-transform duration-200">
                        {openDropdown === category.id ? 
                          <ChevronUp className="w-4 h-4" /> : 
                          <ChevronDown className="w-4 h-4" />
                        }
                      </div>
                      
                      <span className="whitespace-nowrap font-semibold">
                        {currentLanguage === 'ar' ? category.name_ar : category.name}
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
                        {currentLanguage === 'ar' ? category.name_ar : category.name}
                      </h4>
                    </div>
                    
                    <DropdownMenuItem
                      className="text-gray-700 dark:text-sport-green hover:bg-gradient-to-r hover:from-sport-green hover:to-green-600 hover:text-white cursor-pointer font-medium px-4 py-3 transition-all duration-200"
                      onClick={() => {
                        setSelectedHeaderCategory(category.id);
                        setSelectedSubCategory(null);
                      }}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-2 h-2 bg-sport-green rounded-full"></div>
                        <span className="flex-1">
                          {currentLanguage === 'ar' ? `جميع ${category.name_ar}` : `Toutes ${category.name}`}
                        </span>
                      </div>
                    </DropdownMenuItem>
                    
                    <div className="max-h-64 overflow-y-auto">
                      {subCategories[category.id]?.map((subCat, index) => (
                        <DropdownMenuItem
                          key={subCat.id}
                          className="text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/50 hover:text-sport-green cursor-pointer px-4 py-2.5 transition-all duration-200"
                          onClick={() => {
                            setSelectedHeaderCategory(category.id);
                            setSelectedSubCategory(subCat.id);
                          }}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-slate-400 rounded-full"></div>
                            <span className="text-sm flex-1">{subCat.nom}</span>
                            <span className="text-xs text-gray-400 dark:text-slate-500">#{index + 1}</span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </div>
                    
                    {(!subCategories[category.id] || subCategories[category.id].length === 0) && (
                      <div className="px-4 py-6 text-center text-gray-400 dark:text-slate-400">
                        <div className="text-sm">
                          {currentLanguage === 'ar' ? 'لا توجد عناصر متاحة' : 'Aucun élément disponible'}
                        </div>
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })}
          </div>

          {/* Mobile Version - Scroll simple naturel comme TeamsLogos */}
          <div className="lg:hidden py-4">
            {/* Container de scroll horizontal simple */}
            <div className="flex gap-3 overflow-x-auto py-2 px-2 -mx-2 scrollbar-hide">
              {headerCategories.map((category) => {
                const isActive = selectedHeaderCategory === category.id;
                
                return (
                  <div key={category.id} className="flex-shrink-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className={`
                            flex items-center gap-2 px-3 py-2 whitespace-nowrap
                            text-gray-700 dark:text-sport-green font-semibold text-sm
                            ${isActive 
                              ? `bg-gradient-to-r ${category.lightColor} dark:${category.darkColor} text-white shadow-lg` 
                              : 'bg-white/95 dark:bg-slate-800/95 hover:bg-gray-50 dark:hover:bg-slate-700'
                            }
                            hover:bg-gradient-to-r hover:${category.lightColor} dark:hover:${category.darkColor} hover:text-white
                            transition-all duration-200 rounded-lg 
                            border ${isActive ? 'border-transparent' : 'border-gray-200 dark:border-slate-600/50'}
                            shadow-sm min-w-[100px]
                          `}
                        >
                          <ChevronDown className="w-4 h-4 flex-shrink-0" />
                          <span className="flex-1 font-medium">
                            {currentLanguage === 'ar' ? category.name_ar : category.name}
                          </span>
                          
                          {/* Badge de compteur */}
                          <span className={`
                            px-1.5 py-0.5 text-xs font-bold rounded-full flex-shrink-0
                            ${isActive 
                              ? 'bg-white/25 text-white' 
                              : 'bg-gray-200 text-gray-600 dark:bg-sport-green/20 dark:text-sport-green'
                            }
                            min-w-[18px] text-center
                          `}>
                            {subCategories[category.id]?.length || 0}
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                    
                      <DropdownMenuContent 
                        className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 w-[85vw] max-w-[300px] shadow-2xl z-50 rounded-lg backdrop-blur-md"
                        align="center"
                        sideOffset={6}
                      >
                        {/* En-tête mobile stylé */}
                        <div className={`px-3 py-2 border-b border-gray-200 dark:border-slate-600/30 bg-gradient-to-r ${category.lightColor} dark:${category.darkColor} rounded-t-lg`}>
                          <h4 className="text-white font-bold text-xs text-center">
                            {currentLanguage === 'ar' ? category.name_ar : category.name}
                          </h4>
                        </div>
                        
                        {/* Option "Tous" mobile */}
                        <DropdownMenuItem
                          className="text-gray-700 dark:text-sport-green hover:bg-gray-100 dark:hover:bg-sport-green hover:text-sport-green dark:hover:text-white cursor-pointer px-3 py-2.5 font-semibold transition-all duration-200"
                          onClick={() => {
                            setSelectedHeaderCategory(category.id);
                            setSelectedSubCategory(null);
                          }}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <div className="w-2 h-2 bg-sport-green rounded-full flex-shrink-0"></div>
                            <span className="text-xs flex-1">
                              {currentLanguage === 'ar' ? `جميع ${category.name_ar}` : `Toutes ${category.name}`}
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-100 dark:bg-slate-700 px-1 py-0.5 rounded-full font-medium">
                              {subCategories[category.id]?.length || 0}
                            </span>
                          </div>
                        </DropdownMenuItem>
                        
                        {/* Sous-catégories */}
                        <div className="max-h-40 overflow-y-auto scrollbar-hide">
                          {subCategories[category.id]?.map((subCat, index) => (
                            <DropdownMenuItem
                              key={subCat.id}
                              className="text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-sport-green cursor-pointer px-3 py-2 transition-all duration-200"
                              onClick={() => {
                                setSelectedHeaderCategory(category.id);
                                setSelectedSubCategory(subCat.id);
                              }}
                            >
                              <div className="flex items-center gap-2 w-full">
                                <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-slate-400 rounded-full flex-shrink-0"></div>
                                <span className="text-xs flex-1 truncate">{subCat.nom}</span>
                                <span className="text-xs text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-slate-800 px-1 py-0.5 rounded-full flex-shrink-0">
                                  #{index + 1}
                                </span>
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </div>
                        
                        {/* Message vide mobile */}
                        {(!subCategories[category.id] || subCategories[category.id].length === 0) && (
                          <div className="px-3 py-4 text-center text-gray-400 dark:text-slate-400">
                            <div className="text-xs">
                              {currentLanguage === 'ar' ? 'لا توجد عناصر' : 'Aucun élément'}
                            </div>
                          </div>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
          </div>          {/* Indicateur de filtre actif - Version améliorée */}
          {selectedHeaderCategory && (
            <div className="flex justify-center pb-4 px-4">
              <div className="flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-sport-green/10 dark:to-green-500/10 px-4 py-2.5 rounded-full border border-gray-300 dark:border-sport-green/30 backdrop-blur-sm shadow-lg max-w-[95%] lg:max-w-none">
                <div className="w-2 h-2 bg-sport-green rounded-full animate-pulse flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <span className="text-gray-700 dark:text-sport-green text-xs lg:text-sm font-semibold truncate block">
                    {currentLanguage === 'ar' ? 'فلتر نشط' : 'Filtre actif'}: {
                      headerCategories.find(c => c.id === selectedHeaderCategory)?.[
                        currentLanguage === 'ar' ? 'name_ar' : 'name'
                      ]
                    }
                    {selectedSubCategory && subCategories[selectedHeaderCategory] && (
                      <span className="font-normal text-gray-600 dark:text-sport-green/80 hidden sm:inline"> → {
                        subCategories[selectedHeaderCategory].find(s => s.id === selectedSubCategory)?.nom
                      }</span>
                    )}
                  </span>
                  {/* Version mobile pour sous-catégorie */}
                  {selectedSubCategory && subCategories[selectedHeaderCategory] && (
                    <span className="text-gray-600 dark:text-sport-green/80 text-xs block sm:hidden truncate">
                      → {subCategories[selectedHeaderCategory].find(s => s.id === selectedSubCategory)?.nom}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedHeaderCategory(null);
                    setSelectedSubCategory(null);
                  }}
                  className="text-gray-600 dark:text-sport-green hover:text-white hover:bg-red-500 dark:hover:bg-sport-green/20 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 text-lg leading-none flex-shrink-0 active:scale-90"
                  title={currentLanguage === 'ar' ? 'إلغاء الفلتر' : 'Supprimer le filtre'}
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CategoryFilterHeader;