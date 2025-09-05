import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';

export interface CategoryRow {
  id: number;
  name: string;
  name_ar?: string | null;
  description?: string | null;
  created_at?: string | null;
}

interface CategoriesTabProps {
  categories: CategoryRow[];
  loadingCategories: boolean;
  categoriesPage: number;
  categoriesTotal: number;
  pageSize: number;
  onPrevPage: () => void;
  onNextPage: () => void;
}

const CategoriesTab: React.FC<CategoriesTabProps> = ({
  categories,
  loadingCategories,
  categoriesPage,
  categoriesTotal,
  pageSize,
  onPrevPage,
  onNextPage,
}) => {
  const { currentLanguage, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) =>
      (c.name || '').toLowerCase().includes(q) ||
      (c.name_ar || '').toLowerCase().includes(q) ||
      (c.description || '').toLowerCase().includes(q)
    );
  }, [categories, searchQuery]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{currentLanguage === 'ar' ? 'الأقسام' : 'Catégories'}</CardTitle>
          <CardDescription>
            {currentLanguage === 'ar' ? 'قائمة الأقسام من قاعدة البيانات' : 'Liste des catégories depuis la base de données'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`mb-4 flex ${isRTL ? 'flex-row-reverse' : ''} items-center gap-3`}>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={currentLanguage === 'ar' ? 'ابحث في الأقسام...' : 'Rechercher des catégories...'}
              className="max-w-md"
            />
            {searchQuery && (
              <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
                {currentLanguage === 'ar' ? 'مسح' : 'Effacer'}
              </Button>
            )}
          </div>
          {loadingCategories && (
            <div className="text-sm text-slate-500">{currentLanguage === 'ar' ? 'جاري التحميل...' : 'Chargement...'}</div>
          )}
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredCategories.map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">{c.name} {c.name_ar ? `• ${c.name_ar}` : ''}</div>
                  {c.description && (
                    <div className="text-sm text-slate-600 dark:text-slate-400">{c.description}</div>
                  )}
                </div>
                <div className="text-xs text-slate-500">{c.created_at ? new Date(c.created_at).toISOString().slice(0,10) : '-'}</div>
              </div>
            ))}
          </div>
          {/* Categories pagination */}
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''} pt-3`}>
            <div className="text-xs text-slate-500">
              {currentLanguage === 'ar' ? `صفحة ${categoriesPage}` : `Page ${categoriesPage}`} · {currentLanguage === 'ar' ? `${categoriesTotal} إجمالي` : `${categoriesTotal} au total`}
            </div>
            <div className={`flex ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
              <Button variant="outline" size="sm" disabled={categoriesPage <= 1 || loadingCategories} onClick={onPrevPage}>
                {currentLanguage === 'ar' ? 'السابق' : 'Précédent'}
              </Button>
              <Button variant="outline" size="sm" disabled={loadingCategories || (categoriesPage * pageSize >= categoriesTotal)} onClick={onNextPage}>
                {currentLanguage === 'ar' ? 'التالي' : 'Suivant'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoriesTab;
