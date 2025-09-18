import React, { useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Filter, Edit, Trash2, Eye, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import NewsEditor from '../../components/NewsEditor';
import DOMPurify from 'dompurify';
import type { CategoryRow, ChampionRow, NewsItem as News, NewsTabCommentRow } from '@/types/admin';

// Using shared types from '@/types/admin'

interface NewsTabProps {
  // search/filter
  searchTerm: string;
  onSearchTermChange: (v: string) => void;

  // create dialog state
  isCreateNewsOpen: boolean;
  onChangeCreateNewsOpen: (open: boolean) => void;

  // create form fields
  newNewsTitle: string;
  setNewNewsTitle: (v: string) => void;
  newNewsContent: string;
  setNewNewsContent: (v: string) => void;
  newNewsCategoryId: number | null;
  setNewNewsCategoryId: (v: number | null) => void;
  newNewsChampionId: number | null;
  setNewNewsChampionId: (v: number | null) => void;
  newNewsImageFile: File | null;
  setNewNewsImageFile: (f: File | null) => void;
  newNewsStatus: string; // kept for compatibility though unused here
  setNewNewsStatus: (v: string) => void;
  newNewsImageUrl: string; // kept for compatibility though unused here
  setNewNewsImageUrl: (v: string) => void;
  newNewsCreatedAt: string; // kept for compatibility though unused here
  setNewNewsCreatedAt: (v: string) => void;
  newNewsUpdatedAt: string; // kept for compatibility though unused here
  setNewNewsUpdatedAt: (v: string) => void;
  categories: CategoryRow[];
  champions: ChampionRow[];

  // **NOUVEAUX CHAMPS POUR LES COMPÉTITIONS**
  competitionsInternationales: {id:number,nom:string}[];
  competitionsMondiales: {id:number,nom:string}[];
  competitionsContinentales: {id:number,nom:string}[];
  competitionsLocales: {id:number,nom:string}[];
  transfertsNews: {id:number,nom:string}[];

  // Nouveaux états pour les formulaires de création
  newCompetitionInternationaleId: number | null;
  setNewCompetitionInternationaleId: (v: number | null) => void;
  newCompetitionMondialeId: number | null;
  setNewCompetitionMondialeId: (v: number | null) => void;
  newCompetitionContinentaleId: number | null;
  setNewCompetitionContinentaleId: (v: number | null) => void;
  newCompetitionLocaleId: number | null;
  setNewCompetitionLocaleId: (v: number | null) => void;
  newTransfertNewsId: number | null;
  setNewTransfertNewsId: (v: number | null) => void;

  // create form status/messages
  creatingNews: boolean;
  createNewsError: string;
  createNewsInfo: string;
  onCreateNewsSubmit: () => Promise<void> | void;

  // listing and pagination
  news: News[];
  loadingNews: boolean;
  newsPage: number;
  newsTotal: number;
  pageSize: number;
  onPrevPage: () => void;
  onNextPage: () => void;

  // actions
  onEditNews: (item: News) => void;
  onDeleteNews: (id: string) => void;
  onOpenDetails: (item: News) => void;

  // selected news details/comments
  selectedNews: News | null;
  loadingSelectedNews: boolean;
  selectedNewsComments: NewsTabCommentRow[];
  loadingSelectedComments: boolean;
  onDeleteComment: (commentId: number) => void;
}

const NewsTab: React.FC<NewsTabProps> = (props) => {
  // Ajout de l'état pour le step du formulaire
  const [createStep, setCreateStep] = React.useState(1);
  const { currentLanguage, isRTL } = useLanguage();
  
  const {
    searchTerm, onSearchTermChange,
    isCreateNewsOpen, onChangeCreateNewsOpen,
    newNewsTitle, setNewNewsTitle,
    newNewsContent, setNewNewsContent,
    newNewsImageFile, setNewNewsImageFile,
    competitionsInternationales, competitionsMondiales, competitionsContinentales,
    competitionsLocales, transfertsNews,
    newCompetitionInternationaleId, setNewCompetitionInternationaleId,
    newCompetitionMondialeId, setNewCompetitionMondialeId,
    newCompetitionContinentaleId, setNewCompetitionContinentaleId,
    newCompetitionLocaleId, setNewCompetitionLocaleId,
    newTransfertNewsId, setNewTransfertNewsId,
    creatingNews, createNewsError, createNewsInfo, onCreateNewsSubmit,
    news, loadingNews, newsPage, newsTotal, pageSize, onPrevPage, onNextPage,
    onEditNews, onDeleteNews, onOpenDetails,
    selectedNews, loadingSelectedNews, selectedNewsComments, loadingSelectedComments, onDeleteComment,
  } = props;

  // helpers
  const statusLabel = (s?: News['status']) => {
    if (s === 'published') return currentLanguage === 'ar' ? 'منشور' : 'published';
    if (s === 'draft') return currentLanguage === 'ar' ? 'مسودة' : 'draft';
    if (s === 'archived') return currentLanguage === 'ar' ? 'مؤرشف' : 'archived';
    return '-';
  };

  return (
    <TabsContentWrapper>
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-4'}`}>
          <Input
            placeholder={currentLanguage === 'ar' ? 'البحث في الأخبار...' : 'Rechercher des news...'}
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="w-64"
          />
          <Button variant="outline" size="sm">
            <Filter className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {currentLanguage === 'ar' ? 'تصفية' : 'Filtrer'}
          </Button>
        </div>
        <Dialog open={isCreateNewsOpen} onOpenChange={onChangeCreateNewsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => { setCreateStep(1); }}>
              <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {currentLanguage === 'ar' ? 'إنشاء خبر جديد' : 'Créer une News'}
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
            <DialogHeader className="flex-shrink-0 px-6 py-4 border-b bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-slate-800 dark:to-slate-700">
              <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {currentLanguage === 'ar' ? 'إنشاء خبر جديد' : 'Créer une nouvelle news'}
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-600 dark:text-slate-400">
                {currentLanguage === 'ar' ? 'املأ المعلومات لإنشاء خبر جديد' : 'Remplissez les informations pour créer une nouvelle news'}
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
              {createStep === 1 && (
                <>
                  {/* Title Section */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {currentLanguage === 'ar' ? 'العنوان' : 'Titre'} <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      value={newNewsTitle} 
                      onChange={(e) => setNewNewsTitle(e.target.value)} 
                      placeholder={currentLanguage === 'ar' ? 'عنوان الخبر' : 'Titre de la news'}
                      className="w-full text-base h-12 border-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                    />
                  </div>
                  {/* Competitions Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 border-b pb-2">
                      {currentLanguage === 'ar' ? 'المسابقات' : 'Compétitions'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Competitions Internationales */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {currentLanguage === 'ar' ? 'المسابقات الدولية' : 'Compétitions Internationales'}
                        </label>
                        <Select value={newCompetitionInternationaleId !== null ? String(newCompetitionInternationaleId) : undefined} onValueChange={(v) => setNewCompetitionInternationaleId(v === 'none' ? null : Number(v))}>
                          <SelectTrigger className="h-12 border-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200">
                            <SelectValue placeholder={currentLanguage === 'ar' ? 'اختر مسابقة دولية (اختياري)' : 'Choisir une compétition internationale (optionnel)'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">{currentLanguage === 'ar' ? 'لا شيء' : 'Aucun'}</SelectItem>
                            {competitionsInternationales.map((c) => (
                              <SelectItem key={c.id} value={String(c.id)}>{c.nom}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {/* Competitions Mondiales */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {currentLanguage === 'ar' ? 'المسابقات العالمية' : 'Compétitions Mondiales'}
                        </label>
                        <Select value={newCompetitionMondialeId !== null ? String(newCompetitionMondialeId) : undefined} onValueChange={(v) => setNewCompetitionMondialeId(v === 'none' ? null : Number(v))}>
                          <SelectTrigger className="h-12 border-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200">
                            <SelectValue placeholder={currentLanguage === 'ar' ? 'اختر مسابقة عالمية (اختياري)' : 'Choisir une compétition mondiale (optionnel)'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">{currentLanguage === 'ar' ? 'لا شيء' : 'Aucun'}</SelectItem>
                            {competitionsMondiales.map((c) => (
                              <SelectItem key={c.id} value={String(c.id)}>{c.nom}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {/* Competitions Continentales */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {currentLanguage === 'ar' ? 'المسابقات القارية' : 'Compétitions Continentales'}
                        </label>
                        <Select value={newCompetitionContinentaleId !== null ? String(newCompetitionContinentaleId) : undefined} onValueChange={(v) => setNewCompetitionContinentaleId(v === 'none' ? null : Number(v))}>
                          <SelectTrigger className="h-12 border-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200">
                            <SelectValue placeholder={currentLanguage === 'ar' ? 'اختر مسابقة قارية (اختياري)' : 'Choisir une compétition continentale (optionnel)'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">{currentLanguage === 'ar' ? 'لا شيء' : 'Aucun'}</SelectItem>
                            {competitionsContinentales.map((c) => (
                              <SelectItem key={c.id} value={String(c.id)}>{c.nom}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {/* Competitions Locales */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {currentLanguage === 'ar' ? 'المسابقات المحلية' : 'Compétitions Locales'}
                        </label>
                        <Select value={newCompetitionLocaleId !== null ? String(newCompetitionLocaleId) : undefined} onValueChange={(v) => setNewCompetitionLocaleId(v === 'none' ? null : Number(v))}>
                          <SelectTrigger className="h-12 border-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200">
                            <SelectValue placeholder={currentLanguage === 'ar' ? 'اختر مسابقة محلية (اختياري)' : 'Choisir une compétition locale (optionnel)'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">{currentLanguage === 'ar' ? 'لا شيء' : 'Aucun'}</SelectItem>
                            {competitionsLocales.map((c) => (
                              <SelectItem key={c.id} value={String(c.id)}>{c.nom}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {/* Transferts News */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {currentLanguage === 'ar' ? 'أخبار الانتقالات' : 'News Transferts'}
                        </label>
                        <Select value={newTransfertNewsId !== null ? String(newTransfertNewsId) : undefined} onValueChange={(v) => setNewTransfertNewsId(v === 'none' ? null : Number(v))}>
                          <SelectTrigger className="h-12 border-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200">
                            <SelectValue placeholder={currentLanguage === 'ar' ? 'اختر نوع الانتقال (اختياري)' : 'Choisir un type de transfert (optionnel)'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">{currentLanguage === 'ar' ? 'لا شيء' : 'Aucun'}</SelectItem>
                            {transfertsNews.map((c) => (
                              <SelectItem key={c.id} value={String(c.id)}>{c.nom}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  {/* Image Upload Section */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {currentLanguage === 'ar' ? 'صورة' : 'Image'}
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all duration-200">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => setNewNewsImageFile(e.target.files?.[0] ?? null)}
                        className="hidden"
                        id="admin-image-upload"
                      />
                      <label htmlFor="admin-image-upload" className="cursor-pointer block">
                        <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-400 hover:text-teal-500 transition-colors" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {newNewsImageFile ? newNewsImageFile.name : (currentLanguage === 'ar' ? 'انقر لاختيار صورة' : 'Cliquez pour choisir une image')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {currentLanguage === 'ar' ? 'PNG, JPG, GIF حتى 10MB' : 'PNG, JPG, GIF up to 10MB'}
                        </p>
                      </label>
                    </div>
                  </div>
                  {/* Error and Info Messages */}
                  {createNewsError && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-600 font-medium">{createNewsError}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {createNewsInfo && (
                    <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-emerald-600 font-medium">{createNewsInfo}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              {createStep === 2 && (
                <>
                  {/* Content Editor Section */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {currentLanguage === 'ar' ? 'المحتوى' : 'Contenu'} <span className="text-red-500">*</span>
                    </label>
                    <div className="border rounded-md">
                      <NewsEditor
                        initialData={newNewsContent ? JSON.parse(newNewsContent) : undefined}
                        onSave={data => setNewNewsContent(JSON.stringify(data))}
                        placeholder={currentLanguage === 'ar' ? 'اكتب محتوى الخبر هنا...' : 'Écrivez le contenu de la news ici...'}
                      />
                    </div>
                  </div>
                  {/* Error and Info Messages */}
                  {createNewsError && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-600 font-medium">{createNewsError}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {createNewsInfo && (
                    <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-emerald-600 font-medium">{createNewsInfo}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            {/* Action Buttons */}
            <div className={`flex-shrink-0 flex ${isRTL ? 'justify-start' : 'justify-end'} gap-3 px-6 py-4 border-t bg-gray-50 dark:bg-slate-800`}>
              <Button 
                variant="outline" 
                onClick={() => { onChangeCreateNewsOpen(false); setCreateStep(1); }}
                className="min-w-[120px] h-11 text-base font-medium"
              >
                {currentLanguage === 'ar' ? 'إلغاء' : 'Annuler'}
              </Button>
              {createStep === 1 ? (
                <Button
                  className="bg-teal-600 hover:bg-teal-700 min-w-[120px] h-11 text-base font-medium"
                  onClick={() => setCreateStep(2)}
                  disabled={!newNewsTitle.trim()}
                >
                  {currentLanguage === 'ar' ? 'التالي' : 'Suivant'}
                </Button>
              ) : (
                <Button
                  className="bg-teal-600 hover:bg-teal-700 min-w-[120px] h-11 text-base font-medium"
                  disabled={creatingNews}
                  onClick={() => onCreateNewsSubmit()}
                >
                  {creatingNews ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {currentLanguage === 'ar' ? 'جاري الإنشاء...' : 'Création...'}
                    </div>
                  ) : (
                    currentLanguage === 'ar' ? 'إنشاء' : 'Créer'
                  )}
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{currentLanguage === 'ar' ? 'إدارة الأخبار' : 'Gestion des News'}</CardTitle>
          <CardDescription>
            {currentLanguage === 'ar' ? 'إدارة جميع الأخبار المنشورة على المنصة' : 'Gérez toutes les news publiées sur la plateforme'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">{currentLanguage === 'ar' ? 'صورة' : 'Image'}</TableHead>
                <TableHead>{currentLanguage === 'ar' ? 'العنوان' : 'Titre'}</TableHead>
                <TableHead className="w-[140px]">{currentLanguage === 'ar' ? 'الحالة' : 'Statut'}</TableHead>
                <TableHead className="w-[140px]">{currentLanguage === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                <TableHead className="w-[120px] text-right">{currentLanguage === 'ar' ? 'إجراءات' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {news
                .filter(n => {
                  if (!searchTerm) return true;
                  const q = searchTerm.toLowerCase();
                  return (
                    (n.title || '').toLowerCase().includes(q) ||
                    (n.content || '').toLowerCase().includes(q) ||
                    (n.status || '').toLowerCase().includes(q) ||
                    (n.date || '').toLowerCase().includes(q)
                  );
                })
                .map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} className="w-12 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-slate-500" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>
                    {item.status && (
                      <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>
                        {statusLabel(item.status)}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{item.date ?? '-'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onEditNews(item);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteNews(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenDetails(item)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* News pagination */}
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''} pt-3`}>
            <div className="text-xs text-slate-500">
              {currentLanguage === 'ar' ? `صفحة ${newsPage}` : `Page ${newsPage}`} · {currentLanguage === 'ar' ? `${newsTotal} إجمالي` : `${newsTotal} au total`}
            </div>
            <div className={`flex ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
              <Button variant="outline" size="sm" disabled={newsPage <= 1 || loadingNews} onClick={onPrevPage}>
                {currentLanguage === 'ar' ? 'السابق' : 'Précédent'}
              </Button>
              <Button variant="outline" size="sm" disabled={loadingNews || (newsPage * pageSize >= newsTotal)} onClick={onNextPage}>
                {currentLanguage === 'ar' ? 'التالي' : 'Suivant'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected News Details with Comments */}
      {selectedNews && (
       <Card className="mt-4">
  <CardHeader>
    <CardTitle>{currentLanguage === 'ar' ? 'تفاصيل الخبر' : 'Détails de la News'}</CardTitle>
    <CardDescription>
      {currentLanguage === 'ar' ? 'عرض الخبر والتعليقات' : 'Afficher la news et ses commentaires'}
    </CardDescription>
  </CardHeader>
  <CardContent>
    {/* News content */}
    <div className="space-y-3">
      <div className="flex items-start gap-4">
        {selectedNews.imageUrl && (
          <img src={selectedNews.imageUrl} alt={selectedNews.title} className="w-24 h-24 object-cover rounded" />
        )}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{selectedNews.title}</h3>
            {selectedNews.status && (
              <Badge variant={selectedNews.status === 'published' ? 'default' : 'secondary'}>
                {statusLabel(selectedNews.status)}
              </Badge>
            )}
          </div>
          <div className="text-xs text-slate-500">{selectedNews.date ?? '-'}</div>
        </div>
      </div>
      <div 
        className="prose dark:prose-invert max-w-none text-sm text-slate-800 dark:text-slate-200"
      >
        {loadingSelectedNews ? (
          <span>{currentLanguage === 'ar' ? 'جاري التحميل...' : 'Chargement...'}</span>
        ) : (
          (() => {
            let html = '';
            let embeds: React.ReactNode[] = [];
            const links: string[] = [];
            
            try {
              const data = typeof selectedNews.content === 'string' ? JSON.parse(selectedNews.content) : selectedNews.content;
              if (data && data.blocks) {
                html = data.blocks.map((block: { type: string; data: Record<string, unknown>; }, index: number) => {
                  // Gestion améliorée des embeds Twitter/X
                  if (block.type === 'embed' && block.data?.service === 'twitter') {
                    const source = block.data.source as string;
                    const embed = block.data.embed as string;
                    const caption = block.data.caption as string;
                    
                    // Extraire l'ID du tweet
                    const tweetId = source?.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/)?.[1];
                    const username = source?.match(/(?:twitter\.com|x\.com)\/(\w+)\/status\/\d+/)?.[1];
                    
                    if (tweetId) {
                      // Affichage avec iframe Twitter optimisé
                      embeds.push(
                        <div key={`twitter-${index}-${tweetId}`} className="my-6 flex justify-center">
                          <div className="w-full max-w-lg">
                            <iframe
                              src={embed || `https://platform.twitter.com/embed/Tweet.html?id=${tweetId}&theme=light&width=550&dnt=true&chrome=nofooter`}
                              width="100%"
                              height="400"
                              frameBorder="0"
                              scrolling="no"
                              allowFullScreen
                              className="border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm"
                              title={`Tweet ${tweetId}`}
                              onError={(e) => {
                                // Fallback en cas d'erreur d'iframe
                                const fallbackDiv = e.currentTarget.parentElement;
                                if (fallbackDiv) {
                                  fallbackDiv.innerHTML = `
                                    <div class="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
                                      <div class="flex items-center justify-center gap-2 mb-3">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#1da1f2">
                                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                        </svg>
                                        <span class="font-medium text-blue-600 dark:text-blue-400">
                                          ${currentLanguage === 'ar' ? 'منشور من X (تويتر)' : 'Post X (Twitter)'}
                                        </span>
                                      </div>
                                      ${username ? `<p class="text-sm text-gray-600 dark:text-gray-400 mb-2">@${username}</p>` : ''}
                                      <a href="${source}" target="_blank" rel="noopener noreferrer" 
                                         class="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors text-sm font-medium">
                                        ${currentLanguage === 'ar' ? 'عرض المنشور' : 'Voir le post'}
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                          <path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7Z"/>
                                        </svg>
                                      </a>
                                      ${caption ? `<p class="text-xs text-gray-500 mt-2 italic">${caption}</p>` : ''}
                                    </div>
                                  `;
                                }
                              }}
                            />
                            {caption && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center italic">
                                {caption}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    } else {
                      // Fallback si pas d'ID trouvé
                      embeds.push(
                        <div key={`twitter-fallback-${index}`} className="my-4">
                          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
                            <div className="flex items-center justify-center gap-2 mb-3">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1da1f2">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                              </svg>
                              <span className="font-medium text-blue-600 dark:text-blue-400">
                                {currentLanguage === 'ar' ? 'منشور من X (تويتر)' : 'Post X (Twitter)'}
                              </span>
                            </div>
                            <a 
                              href={source} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors text-sm font-medium"
                            >
                              {currentLanguage === 'ar' ? 'عرض المنشور' : 'Voir le post'}
                              <ExternalLink size={16} />
                            </a>
                            {caption && (
                              <p className="text-xs text-gray-500 mt-2 italic">{caption}</p>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return ''; // Ne pas inclure dans le HTML
                  }
                  
                  // Gestion des autres types d'embeds
                  if (block.type === 'embed' && block.data?.service === 'youtube') {
                    const source = block.data.source as string;
                    const videoId = source?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
                    
                    if (videoId) {
                      embeds.push(
                        <div key={`youtube-${index}-${videoId}`} className="my-6 flex justify-center">
                          <div className="w-full max-w-2xl">
                            <iframe
                              src={`https://www.youtube.com/embed/${videoId}`}
                              width="100%"
                              height="315"
                              frameBorder="0"
                              allowFullScreen
                              className="rounded-xl shadow-sm"
                              title={`YouTube video ${videoId}`}
                            />
                          </div>
                        </div>
                      );
                    }
                    return '';
                  }
                  
                  // Gestion des autres types de blocs...
                  switch (block.type) {
                    case 'paragraph': {
                      return `<p>${block.data.text || ''}</p>`;
                    }
                    case 'header': {
                      const level = block.data.level || 2;
                      return `<h${level}>${block.data.text || ''}</h${level}>`;
                    }
                    case 'list': {
                      const tag = block.data.style === 'ordered' ? 'ol' : 'ul';
                      const items = Array.isArray(block.data.items) ? block.data.items : [];
                      return `<${tag}>${items.map((item: string) => `<li>${item}</li>`).join('')}</${tag}>`;
                    }
                    case 'image': {
                      const url = (block.data.file as any)?.url || block.data.url;
                      const caption = block.data.caption || '';
                      return url ? `
                        <div class="my-4 text-center">
                          <img src='${url}' alt='${caption}' class="max-w-full h-auto rounded-lg shadow-sm mx-auto" />
                          ${caption ? `<p class="text-xs text-gray-500 mt-2 italic">${caption}</p>` : ''}
                        </div>
                      ` : '';
                    }
                    case 'quote': {
                      return `
                        <blockquote class="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-gray-50 dark:bg-gray-800 rounded-r">
                          <p class="mb-2">${block.data.text || ''}</p>
                          ${block.data.caption ? `<cite class="text-sm text-gray-600 dark:text-gray-400">— ${block.data.caption}</cite>` : ''}
                        </blockquote>
                      `;
                    }
                    case 'code': {
                      return `
                        <pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto my-4">
                          <code>${block.data.code || ''}</code>
                        </pre>
                      `;
                    }
                    case 'delimiter': {
                      return `<hr class="my-6 border-gray-300 dark:border-gray-600" />`;
                    }
                    case 'table': {
                      const content = Array.isArray(block.data.content) ? block.data.content : [];
                      return `
                        <div class="overflow-x-auto my-4">
                          <table class="min-w-full border border-gray-300 dark:border-gray-600">
                            ${content.map((row: string[]) => `
                              <tr class="border-b border-gray-300 dark:border-gray-600">
                                ${row.map(cell => `<td class="px-4 py-2 border-r border-gray-300 dark:border-gray-600">${cell}</td>`).join('')}
                              </tr>
                            `).join('')}
                          </table>
                        </div>
                      `;
                    }
                    case 'warning': {
                      return `
                        <div class="bg-yellow-100 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 my-4 rounded-r">
                          <div class="flex items-start">
                            <svg class="w-5 h-5 text-yellow-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                            </svg>
                            <div>
                              <strong class="text-yellow-800 dark:text-yellow-200">${block.data.title || 'Attention'}</strong>
                              <p class="text-yellow-700 dark:text-yellow-300 mt-1">${block.data.message || ''}</p>
                            </div>
                          </div>
                        </div>
                      `;
                    }
                    case 'raw': {
                      return block.data.html as string || '';
                    }
                    default: {
                      return '';
                    }
                  }
                }).join('');
              } else {
                html = DOMPurify.sanitize(selectedNews.content || '-');
              }
            } catch (error) {
              console.error('Error parsing content:', error);
              html = DOMPurify.sanitize(selectedNews.content || '-');
            }
            
            return (
              <>
                {embeds}
                <div dangerouslySetInnerHTML={{__html: html}} />
                {links.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-base mb-2 text-blue-700 dark:text-blue-300">
                      {currentLanguage === 'ar' ? 'روابط مرفقة' : 'Liens associés'}
                    </h4>
                    <ul className="space-y-2">
                      {links.map((url, idx) => (
                        <li key={url+idx}>
                          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">
                            {url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            );
          })()
        )}
      </div>
    </div>
    
    {/* Comments list */}
    <div className="mt-6">
      <h4 className="font-medium mb-2">{currentLanguage === 'ar' ? 'التعليقات' : 'Commentaires'}</h4>
      {loadingSelectedComments && (
        <div className="text-sm text-slate-500">{currentLanguage === 'ar' ? 'جاري التحميل...' : 'Chargement...'}</div>
      )}
      {!loadingSelectedComments && selectedNewsComments.length === 0 && (
        <div className="text-sm text-slate-500">{currentLanguage === 'ar' ? 'لا توجد تعليقات' : 'Aucun commentaire'}</div>
      )}
      <div className="space-y-2">
        {selectedNewsComments.map((cm) => (
          <div key={cm.id} className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg flex items-start justify-between">
            <div className="pr-4">
              <div className="text-sm text-slate-800 dark:text-slate-200" dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(cm.content || '-') }} />
              <div className="text-xs text-slate-500 mt-1">{cm.created_at ? new Date(cm.created_at).toISOString().slice(0,16).replace('T',' ') : '-'}</div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => onDeleteComment(cm.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </CardContent>
</Card>
      )}
    </TabsContentWrapper>
  );
};

// A minimal wrapper to preserve TabsContent spacing without directly importing TabsContent here
const TabsContentWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="space-y-6">{children}</div>
);

export default NewsTab;
