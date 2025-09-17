import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/use-toast';
import NewsEditor from './NewsEditor';
import { 
  Calendar, 
  FileText, 
  ExternalLink, 
  Clock,
  Edit,
  Save,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Helper to build a public URL to an article; adjust the path to match your router
const getPublicArticleUrl = (id: string) => `${window.location.origin}/news/${id}`;

interface EditorBlock {
  type: string;
  data: {
    text?: string;
    level?: number;
    style?: string;
    items?: string[];
  };
}

interface EditorContent {
  blocks: EditorBlock[];
  version?: string;
}

interface PublishedNews {
  id: string;
  title: string;
  title_ar?: string;
  content: string;
  content_ar?: string;
  status: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
}

interface PublishedNewsViewerProps {
  authorId?: string;
  onEditArticle?: (article: PublishedNews) => void;
}

const PublishedNewsViewer: React.FC<PublishedNewsViewerProps> = ({ 
  authorId,
  onEditArticle
}) => {
  const [publishedNews, setPublishedNews] = useState<PublishedNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [editStep, setEditStep] = useState<1 | 2>(1);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTitleAr, setEditTitleAr] = useState('');
  const [editContentAr, setEditContentAr] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  
  // États pour la nouvelle édition
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<PublishedNews | null>(null);
  const [updating, setUpdating] = useState(false);
  
  // États pour les compétitions
  const [competitionsInternationales, setCompetitionsInternationales] = useState<{id:number,nom:string}[]>([]);
  const [competitionsMondiales, setCompetitionsMondiales] = useState<{id:number,nom:string}[]>([]);
  const [competitionsContinentales, setCompetitionsContinentales] = useState<{id:number,nom:string}[]>([]);
  const [competitionsLocales, setCompetitionsLocales] = useState<{id:number,nom:string}[]>([]);
  const [transfertsNews, setTransfertsNews] = useState<{id:number,nom:string}[]>([]);

  // États pour les sélections de compétitions
  const [selectedCompetitionInternationale, setSelectedCompetitionInternationale] = useState('');
  const [selectedCompetitionMondiale, setSelectedCompetitionMondiale] = useState('');
  const [selectedCompetitionContinentale, setSelectedCompetitionContinentale] = useState('');
  const [selectedCompetitionLocale, setSelectedCompetitionLocale] = useState('');
  const [selectedTransfertNews, setSelectedTransfertNews] = useState('');
  
  const { currentLanguage } = useLanguage();
  const { toast } = useToast();

  const fetchPublishedNews = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('news')
        .select('id, title, title_ar, content, content_ar, status, image_url, created_at, updated_at, user_id')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (authorId) {
        query = query.eq('user_id', authorId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setPublishedNews(data || []);
    } catch (error) {
      console.error('Error fetching published news:', error);
      toast({
        title: currentLanguage === 'ar' ? 'خطأ' : 'Erreur',
        description: currentLanguage === 'ar' ? 'فشل في تحميل الأخبار المنشورة' : 'Échec du chargement des actualités publiées',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [authorId, currentLanguage, toast]);

  // Fonctions pour charger les données des compétitions
  const fetchCompetitionsInternationales = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('competitions_internationales')
        .select('id, nom')
        .order('id');
      if (error) throw error;
      setCompetitionsInternationales(data || []);
    } catch(e) { 
      console.error('load competitions internationales failed', e); 
    }
  }, []);

  const fetchCompetitionsMondiales = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('competitions_mondiales')
        .select('id, nom')
        .order('id');
      if (error) throw error;
      setCompetitionsMondiales(data || []);
    } catch(e) { 
      console.error('load competitions mondiales failed', e); 
    }
  }, []);

  const fetchCompetitionsContinentales = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('competitions_continentales')
        .select('id, nom')
        .order('id');
      if (error) throw error;
      setCompetitionsContinentales(data || []);
    } catch(e) { 
      console.error('load competitions continentales failed', e); 
    }
  }, []);

  const fetchCompetitionsLocales = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('competitions_locales')
        .select('id, nom')
        .order('id');
      if (error) throw error;
      setCompetitionsLocales(data || []);
    } catch(e) { 
      console.error('load competitions locales failed', e); 
    }
  }, []);

  const fetchTransfertsNews = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('transferts_news')
        .select('id, nom')
        .order('id');
      if (error) throw error;
      setTransfertsNews(data || []);
    } catch(e) { 
      console.error('load transferts news failed', e); 
    }
  }, []);

  useEffect(() => {
    fetchPublishedNews();
    fetchCompetitionsInternationales();
    fetchCompetitionsMondiales();
    fetchCompetitionsContinentales();
    fetchCompetitionsLocales();
    fetchTransfertsNews();
  }, [fetchPublishedNews, fetchCompetitionsInternationales, fetchCompetitionsMondiales, fetchCompetitionsContinentales, fetchCompetitionsLocales, fetchTransfertsNews]);

  // Améliorer le focus dans le dialog d'édition
  useEffect(() => {
    if (isEditDialogOpen && editStep === 1) {
      // Petit délai pour laisser le dialog s'ouvrir complètement
      const timer = setTimeout(() => {
        const titleInput = document.querySelector('input[placeholder*="titre"], input[placeholder*="Entrez le titre"]') as HTMLInputElement;
        if (titleInput) {
          titleInput.focus();
          titleInput.select();
        }
        
        // Essayer de donner le focus au NewsEditor aussi
        const editorElement = document.querySelector('[data-cy="codex-editor"]') as HTMLElement;
        if (editorElement) {
          editorElement.click();
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isEditDialogOpen, editStep]);

  // Améliorer le focus pour l'étape 2 aussi
  useEffect(() => {
    if (isEditDialogOpen && editStep === 2) {
      const timer = setTimeout(() => {
        const imageInput = document.querySelector('input[placeholder*="image"], input[placeholder*="URL"]') as HTMLInputElement;
        if (imageInput) {
          imageInput.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isEditDialogOpen, editStep]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Fonctions de gestion pour l'édition
  const handleEditClick = (news: PublishedNews) => {
    setEditingNews(news);
    setEditTitle(news.title || '');
    setEditTitleAr(news.title_ar || '');
    setEditContent(news.content || '');
    setEditContentAr(news.content_ar || '');
    setEditImageUrl(news.image_url || '');
    setEditStep(1);
    
    // Réinitialiser les sélections de compétitions
    setSelectedCompetitionInternationale('none');
    setSelectedCompetitionMondiale('none');
    setSelectedCompetitionContinentale('none');
    setSelectedCompetitionLocale('none');
    setSelectedTransfertNews('none');
    
    // Ouvrir le dialog
    setIsEditDialogOpen(true);
    
    // Force un petit délai pour que tout se charge bien
    setTimeout(() => {
      // Essayer de donner le focus au premier champ
      const firstInput = document.querySelector('input[placeholder*="titre"], input[placeholder*="Entrez le titre"]') as HTMLInputElement;
      if (firstInput) {
        firstInput.focus();
        firstInput.select();
      }
    }, 300);
  };

  const handleEditCancel = () => {
    setIsEditDialogOpen(false);
    setEditingNews(null);
    setEditStep(1);
    setEditTitle('');
    setEditTitleAr('');
    setEditContent('');
    setEditContentAr('');
    setEditImageUrl('');
    setSelectedCompetitionInternationale('none');
    setSelectedCompetitionMondiale('none');
    setSelectedCompetitionContinentale('none');
    setSelectedCompetitionLocale('none');
    setSelectedTransfertNews('none');
  };

  const handleEditNext = () => {
    if (editStep === 1) {
      setEditStep(2);
    }
  };

  const handleEditPrevious = () => {
    if (editStep === 2) {
      setEditStep(1);
    }
  };

  const handleEditSubmit = async () => {
    if (!editingNews) return;

    try {
      setUpdating(true);

      const updateData: Record<string, unknown> = {
        title: editTitle.trim(),
        title_ar: editTitleAr.trim(),
        content: editContent,
        content_ar: editContentAr,
        image_url: editImageUrl.trim() || null,
        updated_at: new Date().toISOString(),
      };

      // Ajouter les compétitions sélectionnées
      if (selectedCompetitionInternationale && selectedCompetitionInternationale !== 'none') {
        updateData.competition_internationale_id = parseInt(selectedCompetitionInternationale);
      }
      if (selectedCompetitionMondiale && selectedCompetitionMondiale !== 'none') {
        updateData.competition_mondiale_id = parseInt(selectedCompetitionMondiale);
      }
      if (selectedCompetitionContinentale && selectedCompetitionContinentale !== 'none') {
        updateData.competition_continentale_id = parseInt(selectedCompetitionContinentale);
      }
      if (selectedCompetitionLocale && selectedCompetitionLocale !== 'none') {
        updateData.competition_locale_id = parseInt(selectedCompetitionLocale);
      }
      if (selectedTransfertNews && selectedTransfertNews !== 'none') {
        updateData.transfert_news_id = parseInt(selectedTransfertNews);
      }

      const { error } = await supabase
        .from('news')
        .update(updateData)
        .eq('id', editingNews.id);

      if (error) throw error;

      toast({
        title: currentLanguage === 'ar' ? 'تم التحديث' : 'Mis à jour',
        description: currentLanguage === 'ar' ? 'تم تحديث المقال بنجاح' : 'Article mis à jour avec succès',
      });

      handleEditCancel();
      fetchPublishedNews();
    } catch (error) {
      console.error('Error updating news:', error);
      toast({
        title: currentLanguage === 'ar' ? 'خطأ' : 'Erreur',
        description: currentLanguage === 'ar' ? 'فشل في تحديث المقال' : 'Échec de la mise à jour de l\'article',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteNews = async (newsId: string) => {
    if (!window.confirm(currentLanguage === 'ar' ? 'هل أنت متأكد من حذف هذا المقال؟' : 'Êtes-vous sûr de vouloir supprimer cet article ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', newsId);

      if (error) throw error;

      toast({
        title: currentLanguage === 'ar' ? 'تم الحذف' : 'Supprimé',
        description: currentLanguage === 'ar' ? 'تم حذف المقال بنجاح' : 'Article supprimé avec succès',
      });

      fetchPublishedNews();
    } catch (error) {
      console.error('Error deleting news:', error);
      toast({
        title: currentLanguage === 'ar' ? 'خطأ' : 'Erreur',
        description: currentLanguage === 'ar' ? 'فشل في حذف المقال' : 'Échec de la suppression de l\'article',
        variant: 'destructive',
      });
    }
  };

  const openArticle = (articleId: string) => {
    window.open('/news/' + articleId, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p className="text-slate-600 dark:text-slate-400">
            {currentLanguage === 'ar' ? 'جاري التحميل...' : 'Chargement...'}
          </p>
        </div>
      </div>
    );
  }

  if (publishedNews.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400">
          {currentLanguage === 'ar' ? 'لا توجد أخبار منشورة' : 'Aucune actualité publiée'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {publishedNews.map((article) => {
          const title = currentLanguage === 'ar' ? (article.title_ar || article.title) : article.title;
          const content = currentLanguage === 'ar' ? (article.content_ar || article.content) : article.content;
          
          // Améliorer l'affichage du contenu
          const displayContent = (() => {
            try {
              // Essayer de parser comme JSON d'abord
              const parsed: EditorContent = JSON.parse(content);
              if (parsed.blocks && Array.isArray(parsed.blocks)) {
                // C'est du contenu NewsEditor
                const textContent = parsed.blocks
                  .filter((block: EditorBlock) => block.type === 'paragraph' && block.data && block.data.text)
                  .map((block: EditorBlock) => block.data.text || '')
                  .join(' ')
                  .replace(/<[^>]*>/g, '') // Supprimer les balises HTML
                  .trim();
                return textContent.length > 0 
                  ? textContent.substring(0, 150) + (textContent.length > 150 ? '...' : '')
                  : (currentLanguage === 'ar' ? 'لا يوجد محتوى نصي' : 'Pas de contenu texte');
              }
              return String(parsed).replace(/<[^>]*>/g, '').substring(0, 150) + '...';
            } catch {
              // Si ce n'est pas du JSON, traiter comme du texte brut
              const cleanText = content.replace(/<[^>]*>/g, '').trim();
              return cleanText.length > 0 
                ? cleanText.substring(0, 150) + (cleanText.length > 150 ? '...' : '')
                : (currentLanguage === 'ar' ? 'لا يوجد محتوى' : 'Pas de contenu');
            }
          })();
          
          return (
            <Card key={article.id} className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="relative h-48 rounded-t-lg overflow-hidden">
                {article.image_url ? (
                  <img 
                    src={article.image_url} 
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center">
                    <FileText className="w-12 h-12 text-slate-600 dark:text-slate-400" />
                  </div>
                )}
                
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {currentLanguage === 'ar' ? 'منشور' : 'Publié'}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2 line-clamp-2">
                  {title}
                </h3>
                
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                  {displayContent}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(article.created_at)}
                  </div>
                  
                  {article.updated_at !== article.created_at && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(article.updated_at)}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(article)}
                    className="flex-1 flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3" />
                    {currentLanguage === 'ar' ? 'تعديل' : 'Modifier'}
                  </Button>
                  
                  <Button
                    variant="outline" 
                    size="sm"
                    onClick={() => openArticle(article.id)}
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {currentLanguage === 'ar' ? 'فتح' : 'Voir'}
                  </Button>

                  
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialog de modification avec système à deux étapes */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { if (!open) handleEditCancel(); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              {currentLanguage === 'ar' ? 'تعديل المقال' : 'Modifier l\'article'}
              <Badge variant="outline" className="ml-2">
                {currentLanguage === 'ar' ? `الخطوة ${editStep} من 2` : `Étape ${editStep} de 2`}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              {editStep === 1 
                ? (currentLanguage === 'ar' ? 'تحديث العنوان والمحتوى' : 'Mise à jour du titre et du contenu')
                : (currentLanguage === 'ar' ? 'إعدادات الصورة والمنافسات' : 'Paramètres de l\'image et des compétitions')
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {editStep === 1 && (
              <>
                {/* Étape 1: Titre et Contenu */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      {currentLanguage === 'ar' ? 'العنوان (فرنسي/إنجليزي)' : 'Titre (FR/EN)'}
                      <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder={currentLanguage === 'ar' ? 'أدخل العنوان...' : 'Entrez le titre...'}
                      className="text-base"
                      autoFocus={editStep === 1}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      {currentLanguage === 'ar' ? 'العنوان (عربي)' : 'Titre (AR)'}
                      <span className="text-xs text-slate-500 ml-1">
                        {currentLanguage === 'ar' ? '(اختياري)' : '(optionnel)'}
                      </span>
                    </label>
                    <Input
                      value={editTitleAr}
                      onChange={(e) => setEditTitleAr(e.target.value)}
                      placeholder={currentLanguage === 'ar' ? 'أدخل العنوان بالعربية...' : 'Entrez le titre en arabe...'}
                      className="text-base"
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      {currentLanguage === 'ar' ? 'المحتوى (فرنسي/إنجليزي)' : 'Contenu (FR/EN)'}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="border rounded-md min-h-[300px]">
                      <NewsEditor
                        key={`content-editor-${editingNews?.id || 'new'}`}
                        initialData={(() => {
                          if (!editContent) return undefined;
                          try {
                            return JSON.parse(editContent);
                          } catch {
                            return {
                              blocks: [{
                                type: 'paragraph',
                                data: { text: editContent }
                              }],
                              version: '2.31.0'
                            };
                          }
                        })()}
                        onSave={data => setEditContent(JSON.stringify(data))}
                        placeholder={currentLanguage === 'ar' ? 'اكتب المحتوى هنا...' : 'Écrivez le contenu ici...'}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      {currentLanguage === 'ar' ? 'المحتوى (عربي)' : 'Contenu (AR)'}
                      <span className="text-xs text-slate-500 ml-1">
                        {currentLanguage === 'ar' ? '(اختياري)' : '(optionnel)'}
                      </span>
                    </label>
                    <div className="border rounded-md min-h-[300px]">
                      <NewsEditor
                        key={`content-ar-editor-${editingNews?.id || 'new'}`}
                        initialData={(() => {
                          if (!editContentAr) return undefined;
                          try {
                            return JSON.parse(editContentAr);
                          } catch {
                            return {
                              blocks: [{
                                type: 'paragraph',
                                data: { text: editContentAr }
                              }],
                              version: '2.31.0'
                            };
                          }
                        })()}
                        onSave={data => setEditContentAr(JSON.stringify(data))}
                        placeholder={currentLanguage === 'ar' ? 'اكتب المحتوى بالعربية هنا...' : 'Écrivez le contenu en arabe ici...'}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {editStep === 2 && (
              <>
                {/* Étape 2: Image et Compétitions */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      {currentLanguage === 'ar' ? 'رابط الصورة' : 'URL de l\'image'}
                      <span className="text-xs text-slate-500 ml-1">
                        {currentLanguage === 'ar' ? '(اختياري)' : '(optionnel)'}
                      </span>
                    </label>
                    <Input
                      value={editImageUrl}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                      placeholder={currentLanguage === 'ar' ? 'أدخل رابط الصورة...' : 'Entrez l\'URL de l\'image...'}
                      className="text-base"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        {currentLanguage === 'ar' ? 'منافسة دولية' : 'Compétition Internationale'}
                      </label>
                      <Select
                        value={selectedCompetitionInternationale}
                        onValueChange={setSelectedCompetitionInternationale}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={currentLanguage === 'ar' ? 'اختر منافسة...' : 'Sélectionner une compétition...'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            {currentLanguage === 'ar' ? 'بدون منافسة' : 'Aucune compétition'}
                          </SelectItem>
                          {competitionsInternationales.map((comp) => (
                            <SelectItem key={comp.id} value={comp.id.toString()}>
                              {comp.nom}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        {currentLanguage === 'ar' ? 'منافسة عالمية' : 'Compétition Mondiale'}
                      </label>
                      <Select
                        value={selectedCompetitionMondiale}
                        onValueChange={setSelectedCompetitionMondiale}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={currentLanguage === 'ar' ? 'اختر منافسة...' : 'Sélectionner une compétition...'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            {currentLanguage === 'ar' ? 'بدون منافسة' : 'Aucune compétition'}
                          </SelectItem>
                          {competitionsMondiales.map((comp) => (
                            <SelectItem key={comp.id} value={comp.id.toString()}>
                              {comp.nom}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        {currentLanguage === 'ar' ? 'منافسة قارية' : 'Compétition Continentale'}
                      </label>
                      <Select
                        value={selectedCompetitionContinentale}
                        onValueChange={setSelectedCompetitionContinentale}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={currentLanguage === 'ar' ? 'اختر منافسة...' : 'Sélectionner une compétition...'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            {currentLanguage === 'ar' ? 'بدون منافسة' : 'Aucune compétition'}
                          </SelectItem>
                          {competitionsContinentales.map((comp) => (
                            <SelectItem key={comp.id} value={comp.id.toString()}>
                              {comp.nom}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        {currentLanguage === 'ar' ? 'منافسة محلية' : 'Compétition Locale'}
                      </label>
                      <Select
                        value={selectedCompetitionLocale}
                        onValueChange={setSelectedCompetitionLocale}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={currentLanguage === 'ar' ? 'اختر منافسة...' : 'Sélectionner une compétition...'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            {currentLanguage === 'ar' ? 'بدون منافسة' : 'Aucune compétition'}
                          </SelectItem>
                          {competitionsLocales.map((comp) => (
                            <SelectItem key={comp.id} value={comp.id.toString()}>
                              {comp.nom}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      {currentLanguage === 'ar' ? 'أخبار انتقالات' : 'Actualités Transferts'}
                    </label>
                    <Select
                      value={selectedTransfertNews}
                      onValueChange={setSelectedTransfertNews}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={currentLanguage === 'ar' ? 'اختر فئة انتقالات...' : 'Sélectionner une catégorie de transferts...'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          {currentLanguage === 'ar' ? 'بدون فئة انتقالات' : 'Aucune catégorie de transferts'}
                        </SelectItem>
                        {transfertsNews.map((transfert) => (
                          <SelectItem key={transfert.id} value={transfert.id.toString()}>
                            {transfert.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {/* Navigation des étapes */}
            <div className="flex justify-between items-center pt-6 border-t">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleEditCancel}
                >
                  {currentLanguage === 'ar' ? 'إلغاء' : 'Annuler'}
                </Button>
                
                {editStep === 2 && (
                  <Button
                    variant="outline"
                    onClick={handleEditPrevious}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    {currentLanguage === 'ar' ? 'السابق' : 'Précédent'}
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                {editStep === 1 && (
                  <Button
                    onClick={handleEditNext}
                    disabled={!editTitle.trim() || !editContent.trim()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {currentLanguage === 'ar' ? 'التالي' : 'Suivant'}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
                
                {editStep === 2 && (
                  <Button
                    onClick={handleEditSubmit}
                    disabled={updating}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updating
                      ? (currentLanguage === 'ar' ? 'جاري الحفظ...' : 'Enregistrement...')
                      : (currentLanguage === 'ar' ? 'حفظ التغييرات' : 'Enregistrer les modifications')
                    }
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PublishedNewsViewer;
