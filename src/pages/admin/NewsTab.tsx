import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Filter, Edit, Trash2, Eye, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export interface CategoryRow {
  id: number;
  name: string;
  name_ar?: string | null;
  description?: string | null;
  created_at?: string | null;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  category?: string;
  author?: string;
  date?: string;
  status?: 'published' | 'draft' | 'archived';
  imageUrl?: string;
}

export interface CommentRow {
  id: number;
  content: string;
  user_id: string | null;
  news_id: string | null;
  created_at?: string | null;
}

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
  newNewsImageFile: File | null;
  setNewNewsImageFile: (f: File | null) => void;
  categories: CategoryRow[];

  // create form status/messages
  creatingNews: boolean;
  createNewsError: string;
  createNewsInfo: string;
  onCreateNewsSubmit: () => Promise<void> | void;

  // listing and pagination
  news: NewsItem[];
  loadingNews: boolean;
  newsPage: number;
  newsTotal: number;
  pageSize: number;
  onPrevPage: () => void;
  onNextPage: () => void;

  // actions
  onEditNews: (item: NewsItem) => void;
  onDeleteNews: (id: string) => void;
  onOpenDetails: (item: NewsItem) => void;

  // selected news details/comments
  selectedNews: NewsItem | null;
  loadingSelectedNews: boolean;
  selectedNewsComments: CommentRow[];
  loadingSelectedComments: boolean;
  onDeleteComment: (commentId: number) => void;
}

const NewsTab: React.FC<NewsTabProps> = (props) => {
  const { t, currentLanguage, isRTL } = useLanguage();
  const {
    searchTerm, onSearchTermChange,
    isCreateNewsOpen, onChangeCreateNewsOpen,
    newNewsTitle, setNewNewsTitle,
    newNewsContent, setNewNewsContent,
    newNewsCategoryId, setNewNewsCategoryId,
    newNewsImageFile, setNewNewsImageFile,
    categories,
    creatingNews, createNewsError, createNewsInfo, onCreateNewsSubmit,
    news, loadingNews, newsPage, newsTotal, pageSize, onPrevPage, onNextPage,
    onEditNews, onDeleteNews, onOpenDetails,
    selectedNews, loadingSelectedNews, selectedNewsComments, loadingSelectedComments, onDeleteComment,
  } = props;

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
            <Button className="bg-teal-600 hover:bg-teal-700">
              <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {currentLanguage === 'ar' ? 'إنشاء خبر جديد' : 'Créer une News'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{currentLanguage === 'ar' ? 'إنشاء خبر جديد' : 'Créer une nouvelle news'}</DialogTitle>
              <DialogDescription>
                {currentLanguage === 'ar' ? 'املأ المعلومات لإنشاء خبر جديد' : 'Remplissez les informations pour créer une nouvelle news'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {currentLanguage === 'ar' ? 'العنوان' : 'Titre'}
                </label>
                <Input value={newNewsTitle} onChange={(e) => setNewNewsTitle(e.target.value)} placeholder={currentLanguage === 'ar' ? 'عنوان الخبر' : 'Titre de la news'} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {currentLanguage === 'ar' ? 'المحتوى' : 'Contenu'}
                </label>
                <Textarea value={newNewsContent} onChange={(e) => setNewNewsContent(e.target.value)} placeholder={currentLanguage === 'ar' ? 'محتوى الخبر' : 'Contenu de la news'} rows={6} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {currentLanguage === 'ar' ? 'القسم' : 'Catégorie'}
                </label>
                <Select value={newNewsCategoryId !== null ? String(newNewsCategoryId) : undefined} onValueChange={(v) => setNewNewsCategoryId(Number(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder={currentLanguage === 'ar' ? 'اختر القسم' : 'Choisir une catégorie'} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}{c.name_ar ? ` • ${c.name_ar}` : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {currentLanguage === 'ar' ? 'صورة' : 'Image'}
                </label>
                <Input type="file" accept="image/*" onChange={(e) => setNewNewsImageFile(e.target.files?.[0] ?? null)} />
                {newNewsImageFile && (
                  <p className="text-xs text-slate-500 mt-1">{currentLanguage === 'ar' ? 'سيتم تحميل:' : 'À téléverser:'} {newNewsImageFile.name}</p>
                )}
              </div>

              {createNewsError && <p className="text-sm text-red-600">{createNewsError}</p>}
              {createNewsInfo && <p className="text-sm text-emerald-600">{createNewsInfo}</p>}

              <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} gap-2`}>
                <Button variant="outline" onClick={() => onChangeCreateNewsOpen(false)}>
                  {currentLanguage === 'ar' ? 'إلغاء' : 'Annuler'}
                </Button>
                <Button
                  className="bg-teal-600 hover:bg-teal-700"
                  disabled={creatingNews}
                  onClick={() => onCreateNewsSubmit()}
                >
                  {creatingNews ? (currentLanguage === 'ar' ? 'جاري الإنشاء...' : 'Création...') : (currentLanguage === 'ar' ? 'إنشاء' : 'Créer')}
                </Button>
              </div>
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
                        {item.status === 'published' ? (currentLanguage === 'ar' ? 'منشور' : 'published') : 
                         item.status === 'draft' ? (currentLanguage === 'ar' ? 'مسودة' : 'draft') : 
                         currentLanguage === 'ar' ? 'مؤرشف' : 'archived'}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{item.date ?? '-'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditNews(item)}
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
                        {selectedNews.status === 'published' ? (currentLanguage === 'ar' ? 'منشور' : 'published') : 
                         selectedNews.status === 'draft' ? (currentLanguage === 'ar' ? 'مسودة' : 'draft') : 
                         currentLanguage === 'ar' ? 'مؤرشف' : 'archived'}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">{selectedNews.date ?? '-'}</div>
                </div>
              </div>
              <div className="prose dark:prose-invert max-w-none text-sm text-slate-800 dark:text-slate-200">
                {loadingSelectedNews ? (currentLanguage === 'ar' ? 'جاري التحميل...' : 'Chargement...') : (selectedNews.content || '-')}
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
                      <div className="text-sm text-slate-800 dark:text-slate-200">{cm.content || '-'}</div>
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
