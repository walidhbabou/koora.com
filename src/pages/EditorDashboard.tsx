import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Edit, 
  FileText, 
  Plus, 
  Eye, 
  Trash2, 
  Calendar,
  TrendingUp,
  Search,
  Filter,
  MoreVertical,
  Upload,
  Image,
  Clock,
  CheckCircle,
  User,
  Mail,
  Globe,
  Settings,
  MessageSquare,
  Shield,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import EditorOverviewTab from './editor/EditorOverviewTab';
import EditorArticlesTab from './editor/EditorArticlesTab';
import EditorProfileTab from './editor/EditorProfileTab';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DOMPurify from 'dompurify';

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  date: string;
  status: 'published' | 'draft' | 'review' | 'scheduled' | 'submitted' | 'rejected' | 'approved';
  imageUrl?: string;
  views?: number;
  lastModified: string;
}

interface Last24NewsRow {
  id: number | string;
  title: string;
  created_at: string;
  status: string | null;
  author?: string | null;
  image_url?: string | null;
  content?: string;
}

const EditorDashboard: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const { currentLanguage, isRTL, direction } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  // Pagination state for Articles tab
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  // Last 24h published news
  const [last24News, setLast24News] = useState<Last24NewsRow[]>([]);
  const [loadingLast24, setLoadingLast24] = useState(false);

  // New Article (Editor) state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategoryId, setNewCategoryId] = useState<number | null>(null);
  const [newChampionId, setNewChampionId] = useState<number | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);
  const [categories, setCategories] = useState<{id:number,name:string,name_ar:string}[]>([]);
  const [champions, setChampions] = useState<{id:number,nom:string,nom_ar:string}[]>([]);
  const newQuillRef = useRef<ReactQuill | null>(null);
  const buildModules = (ref: React.RefObject<ReactQuill>) => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ script: 'sub' }, { script: 'super' }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ align: [] }, { direction: isRTL ? 'rtl' : 'ltr' }],
        ['blockquote', 'code-block', 'link', 'image'],
        ['clean'],
      ],
    },
  });
  const newModules = useMemo(() => buildModules(newQuillRef), [isRTL, currentLanguage]);


  const fetchArticles = async () => {
    setLoading(true);
    try {
      // Fetch submissions queue for editors
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await supabase
        .from('news_submissions')
        .select('id, title, content, created_at, status, image_url, user_id, category_id, categories(name, name_ar), users(name)', { count: 'exact' })
        .in('status', ['submitted', 'draft', 'rejected', 'published'])
        .order('created_at', { ascending: false })
        .range(from, to);
      if (error) throw error;
      const mapped: Article[] = (data || []).map((n: any) => ({
        id: String(n.id),
        title: n.title || '-',
        content: n.content || '',
        category: n.categories ? (currentLanguage === 'ar' ? n.categories.name_ar || n.categories.name : n.categories.name) : '-',
        author: n.users?.name || '-',
        date: n.created_at ? new Date(n.created_at).toISOString().slice(0,10) : '-',
        status: (n.status as Article['status']) || 'draft',
        imageUrl: n.image_url || undefined,
        views: undefined,
        lastModified: n.created_at ? new Date(n.created_at).toLocaleString() : '-',
      }));
      setArticles(mapped);
      setTotalCount(count || 0);
    } catch (e) {
      console.error('Failed to load editor articles:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchLast24News = async () => {
    setLoadingLast24(true);
    try {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('news')
        .select('id, title, created_at, status, image_url, content, users(name)')
        .eq('status', 'published')
        .gte('created_at', since)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const mapped: Last24NewsRow[] = (data || []).map((n: any) => ({
        id: n.id,
        title: n.title || '-',
        created_at: n.created_at,
        status: n.status || 'published',
        author: n.users?.name || null,
        image_url: n.image_url || null,
        content: n.content || '',
      }));
      setLast24News(mapped);
    } catch (e) {
      console.error('Failed to load last 24h news:', e);
      setLast24News([]);
    } finally {
      setLoadingLast24(false);
    }
  };

  useEffect(() => {
    fetchArticles();
    fetchLast24News();
  }, []);

  // Refetch when page changes on Articles tab
  useEffect(() => {
    if (activeTab === 'articles') {
      fetchArticles();
    }
    if (activeTab === 'overview') {
      fetchLast24News();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, activeTab]);

  // Load categories for creation form
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('categories').select('id, name, name_ar').order('id');
      if (error) throw error;
      setCategories(data || []);
    } catch (e) { console.error('load categories failed', e); }
  };

  const fetchChampions = async () => {
    try {
      const { data, error } = await supabase.from('champions').select('id, nom, nom_ar').order('id');
      if (error) throw error;
      setChampions(data || []);
    } catch (e) { console.error('load champions failed', e); }
  };

  useEffect(() => { 
    fetchCategories(); 
    fetchChampions();
  }, []);


  useEffect(() => {
    fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const stats = [
    { 
      title: currentLanguage === 'ar' ? 'المقالات المنشورة' : 'Articles Publiés', 
      value: articles.filter(a => a.status === 'published').length, 
      icon: CheckCircle, 
      change: '+5%', 
      color: 'text-green-600' 
    },
    { 
      title: currentLanguage === 'ar' ? 'قيد المراجعة' : 'En Révision', 
      value: articles.filter(a => a.status === 'review').length, 
      icon: Clock, 
      change: '+2', 
      color: 'text-orange-600' 
    },
    { 
      title: currentLanguage === 'ar' ? 'المسودات' : 'Brouillons', 
      value: articles.filter(a => a.status === 'draft').length, 
      icon: FileText, 
      change: '+3', 
      color: 'text-blue-600' 
    },
    { 
      title: currentLanguage === 'ar' ? 'إجمالي المشاهدات' : 'Total Vues', 
      value: articles.reduce((sum, a) => sum + (a.views || 0), 0).toLocaleString(), 
      icon: Eye, 
      change: '+15%', 
      color: 'text-purple-600' 
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { 
        label: currentLanguage === 'ar' ? 'منشور' : 'Publié', 
        variant: 'default' as const 
      },
      review: { 
        label: currentLanguage === 'ar' ? 'مراجعة' : 'Révision', 
        variant: 'secondary' as const 
      },
      submitted: {
        label: currentLanguage === 'ar' ? 'مرسل' : 'Soumis',
        variant: 'secondary' as const
      },
      draft: { 
        label: currentLanguage === 'ar' ? 'مسودة' : 'Brouillon', 
        variant: 'outline' as const 
      },
      rejected: {
        label: currentLanguage === 'ar' ? 'مرفوض' : 'Rejeté',
        variant: 'destructive' as const
      },
      scheduled: { 
        label: currentLanguage === 'ar' ? 'مجدول' : 'Programmé', 
        variant: 'secondary' as const 
      }
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
  };

  const approveArticle = async (id: string) => {
    try {
      // Load the submission
      const { data: sub, error: loadErr } = await supabase
        .from('news_submissions')
        .select('id, title, content, image_url, user_id, category_id')
        .eq('id', Number(id))
        .single();
      if (loadErr) throw loadErr;
      // Insert into news as published
      const { error: insErr } = await supabase.from('news').insert({
        title: sub?.title,
        content: sub?.content,
        image_url: sub?.image_url || null,
        status: 'published',
        // IMPORTANT: do not send user_id; let DB default auth.uid() satisfy RLS
        category_id: sub?.category_id ?? null,
      }).select();
      if (insErr) throw insErr;
      // Mark submission as published
      const { error: upErr } = await supabase.from('news_submissions').update({ status: 'published' }).eq('id', Number(id));
      if (upErr) throw upErr;
      await fetchArticles();
    } catch (e) {
      console.error('approve failed', e);
    }
  };

  const rejectArticle = async (id: string) => {
    try {
      const { error } = await supabase.from('news_submissions').update({ status: 'rejected' }).eq('id', Number(id));
      if (error) throw error;
      await fetchArticles();
    } catch (e) {
      console.error('reject failed', e);
    }
  };

  const openEdit = (article: Article) => {
    setEditingId(article.id);
    setEditTitle(article.title);
    setEditContent(article.content);
    setEditError('');
  };

  const saveEdit = async () => {
    if (!editingId) return;
    if (!editTitle || !editContent) {
      setEditError(currentLanguage === 'ar' ? 'العنوان والمحتوى إجباريان' : 'Titre et contenu requis');
      return;
    }
    setSavingEdit(true);
    try {
      const { error } = await supabase.from('news_submissions').update({ title: editTitle, content: editContent }).eq('id', Number(editingId));
      if (error) throw error;
      setEditingId(null);
      await fetchArticles();
    } catch (e: any) {
      setEditError(e?.message || 'Failed to save');
    } finally {
      setSavingEdit(false);
    }
  };

  // --- Create Article Helpers (Editor) ---
  const uploadNewImageIfAny = async (): Promise<string | undefined> => {
    if (!newImageFile || !user?.id) return undefined;
    const ext = newImageFile.name.split('.').pop();
    const filePath = `${user.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('news-images')
      .upload(filePath, newImageFile, { upsert: false });
    if (upErr) throw upErr;
    const { data: pub } = supabase.storage.from('news-images').getPublicUrl(filePath);
    return pub?.publicUrl;
  };

  const resetCreateForm = () => {
    setNewTitle('');
    setNewContent('');
    setNewCategoryId(null);
    setNewChampionId(null);
    setNewImageFile(null);
    setCreateError('');
  };

  const handleCreate = async () => {
    if (!user?.id) {
      setCreateError(currentLanguage === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'Vous devez être connecté');
      return;
    }
    setCreateError('');
    if (!newTitle || !newContent) {
      setCreateError(currentLanguage === 'ar' ? 'أدخل العنوان والمحتوى' : 'Entrez le titre et le contenu');
      return;
    }
    if (!newCategoryId) {
      setCreateError(currentLanguage === 'ar' ? 'اختر الفئة' : 'Choisissez une catégorie');
      return;
    }
    setCreating(true);
    try {
      const imageUrl = await uploadNewImageIfAny();
      
      // Essayer d'abord la fonction RPC create_news
      try {
        const { error } = await supabase.rpc('create_news', {
          p_user_id: user.id,
          p_title: newTitle,
          p_content: newContent,
          p_status: 'published',
          p_image_url: imageUrl ?? null,
          p_category_id: newCategoryId,
          p_champion_id: newChampionId,
        });
        
        if (error) {
          console.error('Supabase RPC error details:', error);
          throw error;
        }
      } catch (rpcErr: any) {
        // Si la fonction RPC n'existe pas ou échoue, utiliser l'insertion directe avec user_id
        console.log('RPC failed, trying direct insert:', rpcErr);
        const { error } = await supabase.from('news').insert({
          title: newTitle,
          content: newContent,
          status: 'published',
          image_url: imageUrl ?? null,
          category_id: newCategoryId,
          champion_id: newChampionId,
          user_id: user.id, // Inclure explicitement user_id
        }).select();
        
        if (error) {
          console.error('Direct insert error details:', error);
          throw error;
        }
      }
      
      setIsCreateOpen(false);
      resetCreateForm();
      await fetchArticles();
      setActiveTab('articles');
      toast({ title: currentLanguage === 'ar' ? 'تم النشر' : 'Publié', description: currentLanguage === 'ar' ? 'تم إضافة مقال جديد' : 'Nouvel article publié' });
    } catch (e: any) {
      console.error('Erreur lors de la création:', e);
      setCreateError(e?.message || (currentLanguage === 'ar' ? 'فشل الإنشاء' : 'Échec de la création'));
    } finally {
      setCreating(false);
    }
  };



  const deleteArticle = async (id: string) => {
    try {
      console.log('🔍 Tentative de suppression - ID:', id);
  
      // Supprimer d'abord de news_submissions (table principale)
      const { error: subError, count: subCount } = await supabase
        .from('news_submissions')
        .delete({ count: 'exact' })
        .eq('id', Number(id));
  
      if (subError) {
        console.log('❌ Erreur news_submissions:', subError);
        // Essayer news si news_submissions échoue
        const { error: newsError, count: newsCount } = await supabase
          .from('news')
          .delete({ count: 'exact' })
          .eq('id', Number(id));
  
        if (newsError) throw newsError;
        if (!newsCount || newsCount === 0) {
          throw new Error(currentLanguage === 'ar' ? 
            'لم يتم العثور على المقال' : 
            'Article non trouvé');
        }
      }
  
      await fetchArticles();
      toast({ 
        title: currentLanguage === 'ar' ? 'تم الحذف' : 'Supprimé', 
        description: currentLanguage === 'ar' ? 'تم حذف المقال بنجاح' : 'Article supprimé avec succès' 
      });
  
    } catch (e: any) {
      console.error('❌ Échec suppression:', e);
      toast({ 
        title: currentLanguage === 'ar' ? 'فشل الحذف' : 'Échec de suppression', 
        description: e?.message || (currentLanguage === 'ar' ? 'فشل في حذف المقال' : 'Échec de la suppression'), 
        variant: 'destructive' 
      });
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900 ${isRTL ? 'rtl' : 'ltr'}`} dir={direction}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-4'}`}>
              <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg transform hover:scale-110 transition-all duration-300">
                  <Edit className="w-6 h-6 text-white" />
                </div>
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {currentLanguage === 'ar' ? 'لوحة تحكم المحرر' : 'Dashboard Éditeur'}
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {currentLanguage === 'ar' ? `مرحباً ${user?.name}` : `Bienvenue ${user?.name}`}
                  </p>
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={async () => { try { await logout(); } finally { navigate('/'); } }}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              {currentLanguage === 'ar' ? 'تسجيل الخروج' : 'Déconnexion'}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
          {stats.map((stat, index) => (
            <Card 
              key={stat.title}
              className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-0 shadow-md hover:shadow-blue-200/50 dark:hover:shadow-blue-900/30"
            >
              <CardContent className="p-6 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/90 backdrop-blur-sm dark:bg-slate-900/90 border border-slate-200/50 dark:border-slate-700/50 shadow-lg rounded-xl p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg">
              {currentLanguage === 'ar' ? 'نظرة عامة' : 'Vue d\'ensemble'}
            </TabsTrigger>
            <TabsTrigger value="articles" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg">
              {currentLanguage === 'ar' ? 'إدارة المقالات' : 'Gestion Articles'}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg">
              {currentLanguage === 'ar' ? 'التحليلات' : 'Analytics'}
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg">
              {currentLanguage === 'ar' ? 'الملف الشخصي' : 'Profil'}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Last 24 hours published news */}
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>{currentLanguage === 'ar' ? 'الأخبار خلال آخر 24 ساعة' : 'Actus des dernières 24h'}</CardTitle>
                <CardDescription>
                  {currentLanguage === 'ar' ? 'قائمة المقالات المنشورة خلال 24 ساعة الماضية' : 'Articles publiés dans les dernières 24 heures'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingLast24 ? (
                  <div className="text-sm text-muted-foreground">{currentLanguage === 'ar' ? 'جار التحميل…' : 'Chargement…'}</div>
                ) : last24News.length === 0 ? (
                  <div className="text-sm text-muted-foreground">{currentLanguage === 'ar' ? 'لا توجد أخبار حديثة' : 'Aucune actualité récente'}</div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {last24News.map((n, index) => {
                      // Créer un résumé du contenu
                      const stripHtml = (html: string) =>
                        html
                          .replace(/<[^>]*>/g, ' ')
                          .replace(/&nbsp;/gi, ' ')
                          .replace(/&amp;/gi, '&')
                          .replace(/&lt;/gi, '<')
                          .replace(/&gt;/gi, '>')
                          .replace(/\s+/g, ' ')
                          .trim();
                      
                      const summary = stripHtml(n.content || '').slice(0, 120) + (stripHtml(n.content || '').length > 120 ? '...' : '');
                      
                      return (
                        <div key={String(n.id)} className="bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group">
                          {/* Image */}
                          <div className="relative h-48 overflow-hidden">
                            {n.image_url ? (
                              <img 
                                src={n.image_url} 
                                alt={n.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                                <Image className="w-16 h-16 text-gray-400" />
                              </div>
                            )}
                            <div className="absolute top-3 left-3">
                              <Badge variant="secondary" className="bg-white/90 text-slate-700">
                                {n.created_at ? new Date(n.created_at).toLocaleDateString('ar-SA') : ''}
                              </Badge>
                            </div>
                          </div>
                          
                          {/* Content */}
                          <div className="p-4">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {n.title}
                            </h3>
                            
                            {summary && (
                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-3">
                                {summary}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <User className="w-4 h-4" />
                                <span>{n.author || 'غير محدد'}</span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => navigate(`/news/${n.id}`)}
                                  className="text-xs"
                                >
                                  {currentLanguage === 'ar' ? 'عرض' : 'Voir'}
                                </Button>
                                {(['moderator','admin'].includes(String((user as any)?.role || ''))) && (
                                  <Button 
                                    variant="destructive" 
                                    size="sm" 
                                    onClick={() => deleteArticle(String(n.id))}
                                    className="text-xs"
                                  >
                                    {currentLanguage === 'ar' ? 'حذف' : 'Supprimer'}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          {/* Preview Dialog */}
          <Dialog open={!!previewId} onOpenChange={(open) => { if (!open) setPreviewId(null); }}>
            <DialogContent className="w-[96vw] sm:w-[90vw] max-w-5xl p-0 overflow-hidden">
              <DialogHeader className="px-4 sm:px-6 pt-4 pb-2 border-b">
                <DialogTitle className="text-base sm:text-lg">{currentLanguage === 'ar' ? 'معاينة المقال' : 'Aperçu de l\'article'}</DialogTitle>
              </DialogHeader>
              {(() => {
                const art = articles.find(a => a.id === previewId);
                if (!art) return <div className="p-4 text-sm text-slate-500">{currentLanguage === 'ar' ? 'لا يوجد محتوى' : 'Aucun contenu'}</div>;
                return (
                  <div className="flex flex-col max-h-[82vh]">
                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4" dir={direction}>
                      {art.imageUrl && (
                        <img src={art.imageUrl} alt={art.title} className="w-full h-48 sm:h-64 md:h-72 object-cover rounded-md mb-4" />
                      )}
                      <div className={`flex items-start justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={isRTL ? 'text-right' : 'text-left'}>
                          <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold leading-snug mb-1">{art.title}</h2>
                          <div className="text-[11px] sm:text-xs text-slate-500">{art.author} • {art.date}{art.category ? ` • ${art.category}` : ''}</div>
                        </div>
                        <Badge variant={getStatusBadge(art.status).variant}>{getStatusBadge(art.status).label}</Badge>
                      </div>
                      <div
                        className="prose prose-slate dark:prose-invert max-w-none leading-7 sm:leading-8 mt-4 text-[0.95rem] sm:text-base"
                        dir="auto"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(art.content) }}
                      />
                    </div>
                    {/* Sticky actions bar */}
                    <div className={`border-t bg-white/80 dark:bg-slate-900/80 backdrop-blur px-4 sm:px-6 py-3 flex flex-wrap gap-2 ${isRTL ? 'justify-start' : 'justify-end'}`}>
                      {(['submitted','draft','review'] as const).includes(art.status as any) && (
                        <>
                          <Button className="bg-green-600 hover:bg-green-700" onClick={() => { setPreviewId(null); approveArticle(art.id); }}>
                            {currentLanguage === 'ar' ? 'قبول ونشر' : 'Accepter & Publier'}
                          </Button>
                          <Button variant="outline" onClick={() => { setPreviewId(null); rejectArticle(art.id); }}>
                            {currentLanguage === 'ar' ? 'رفض' : 'Rejeter'}
                          </Button>
                        </>
                      )}
                      {art.status === 'published' && (
                        <Button variant="outline" onClick={() => { setPreviewId(null); navigate(`/news/${art.id}`); }}>
                          {currentLanguage === 'ar' ? 'فتح الرابط' : 'Ouvrir'}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </DialogContent>
          </Dialog>

          {/* Articles Tab */}
          <TabsContent value="articles" className="space-y-6">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-4'}`}>
                <Input
                  placeholder={currentLanguage === 'ar' ? '...ابحث في المقالات' : 'Rechercher...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {currentLanguage === 'ar' ? 'مقال جديد' : 'Nouvel Article'}
              </Button>
            </div>
            <EditorArticlesTab
              articles={articles as any}
              loading={loading}
              searchTerm={searchTerm}
              setSearchTerm={(v: string) => setSearchTerm(v)}
              isRTL={isRTL}
              currentLanguage={currentLanguage as any}
              getStatusBadge={getStatusBadge}
              setPreviewId={(id: string) => setPreviewId(id)}
              approveArticle={approveArticle}
              rejectArticle={rejectArticle}
              openEdit={openEdit as any}
              setConfirmDeleteId={(id: string) => setConfirmDeleteId(id)}
            />

            {/* Create Article Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={(open) => { if (!open) { setIsCreateOpen(false); } }}>
              <DialogContent className="w-[98vw] sm:w-[95vw] md:w-[85vw] lg:w-[75vw] xl:w-[65vw] 2xl:w-[55vw] max-w-6xl max-h-[95vh] overflow-hidden flex flex-col p-0">
                <DialogHeader className="flex-shrink-0 px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700">
                  <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    {currentLanguage === 'ar' ? 'مقال جديد' : 'Nouvel Article'}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-slate-600 dark:text-slate-400">
                    {currentLanguage === 'ar' ? 'أنشئ مقالك وانشره مباشرة' : 'Créez votre article et publiez-le immédiatement'}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                  {/* Title Section */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {currentLanguage === 'ar' ? 'العنوان' : 'Titre'} <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      value={newTitle} 
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder={currentLanguage === 'ar' ? 'أدخل عنوان المقال...' : 'Entrez le titre de l\'article...'}
                      className="w-full text-base h-12 border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>

                  {/* Category and Championship Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {currentLanguage === 'ar' ? 'الفئة' : 'Catégorie'} <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newCategoryId ?? ''}
                        onChange={(e) => setNewCategoryId(e.target.value ? Number(e.target.value) : null)}
                        className="w-full h-12 border-2 border-gray-300 rounded-lg px-3 bg-white dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                      >
                        <option value="">{currentLanguage === 'ar' ? 'اختر فئة' : 'Choisir une catégorie'}</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{currentLanguage === 'ar' ? (c.name_ar || c.name) : c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {currentLanguage === 'ar' ? 'البطولة' : 'Championnat'}
                      </label>
                      <select
                        value={newChampionId ?? ''}
                        onChange={(e) => setNewChampionId(e.target.value ? Number(e.target.value) : null)}
                        className="w-full h-12 border-2 border-gray-300 rounded-lg px-3 bg-white dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                      >
                        <option value="">{currentLanguage === 'ar' ? 'اختر البطولة (اختياري)' : 'Choisir un championnat (optionnel)'}</option>
                        {champions.map(c => (
                          <option key={c.id} value={c.id}>{currentLanguage === 'ar' ? (c.nom_ar || c.nom) : c.nom}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Image Upload Section */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {currentLanguage === 'ar' ? 'الصورة' : 'Image'}
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => setNewImageFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer block">
                        <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400 hover:text-blue-500 transition-colors" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {newImageFile ? newImageFile.name : (currentLanguage === 'ar' ? 'انقر لاختيار صورة' : 'Cliquez pour choisir une image')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {currentLanguage === 'ar' ? 'PNG, JPG, GIF jusqu\'à 10MB' : 'PNG, JPG, GIF up to 10MB'}
                        </p>
                      </label>
                    </div>
                  </div>

                  {/* Content Editor Section */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {currentLanguage === 'ar' ? 'المحتوى' : 'Contenu'} <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-gray-300 rounded-lg overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
                      <ReactQuill
                        ref={newQuillRef as any}
                        theme="snow"
                        value={newContent}
                        onChange={setNewContent}
                        placeholder={currentLanguage === 'ar' ? 'اكتب المحتوى هنا...' : 'Écrivez le contenu ici...'}
                        modules={newModules}
                        className={`${isRTL ? 'rtl' : 'ltr'} min-h-[300px]`}
                        style={{ height: '300px' }}
                      />
                    </div>
                  </div>

                  {/* Error Message */}
                  {createError && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-600 font-medium">{createError}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className={`flex-shrink-0 flex ${isRTL ? 'justify-start' : 'justify-end'} gap-3 px-6 py-4 border-t bg-gray-50 dark:bg-slate-800`}>
                  <Button 
                    variant="outline" 
                    onClick={() => { setIsCreateOpen(false); }}
                    className="min-w-[120px] h-11 text-base font-medium"
                  >
                    {currentLanguage === 'ar' ? 'إلغاء' : 'Annuler'}
                  </Button>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 min-w-[120px] h-11 text-base font-medium" 
                    disabled={creating} 
                    onClick={handleCreate}
                  >
                    {creating ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {currentLanguage === 'ar' ? 'نشر...' : 'Publication...'}
                      </div>
                    ) : (
                      currentLanguage === 'ar' ? 'نشر' : 'Publier'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            {/* Delete Confirm Dialog */}
            <Dialog open={!!confirmDeleteId} onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{currentLanguage === 'ar' ? 'تأكيد الحذف' : 'Confirmer la suppression'}</DialogTitle>
                  <DialogDescription>
                    {currentLanguage === 'ar' ? 'هل أنت متأكد من حذف هذا المقال؟ لا يمكن التراجع.' : 'Êtes-vous sûr de supprimer cet article ? Cette action est irréversible.'}
                  </DialogDescription>
                </DialogHeader>
                <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} gap-2`}>
                  <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>{currentLanguage === 'ar' ? 'إلغاء' : 'Annuler'}</Button>
                  <Button className="bg-red-600 hover:bg-red-700" onClick={async () => { const id = confirmDeleteId!; setConfirmDeleteId(null); await deleteArticle(id); }}>
                    {currentLanguage === 'ar' ? 'حذف' : 'Supprimer'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <EditorProfileTab />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle>{currentLanguage === 'ar' ? 'إحصائيات المقالات' : 'Statistiques Articles'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {currentLanguage === 'ar' ? 'منشورة' : 'Publiés'}
                      </span>
                      <span className="font-semibold text-green-600">
                        {articles.filter(a => a.status === 'published').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {currentLanguage === 'ar' ? 'قيد المراجعة' : 'En révision'}
                      </span>
                      <span className="font-semibold text-orange-600">
                        {articles.filter(a => a.status === 'review').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {currentLanguage === 'ar' ? 'مسودات' : 'Brouillons'}
                      </span>
                      <span className="font-semibold text-blue-600">
                        {articles.filter(a => a.status === 'draft').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle>{currentLanguage === 'ar' ? 'الأداء الشهري' : 'Performance Mensuelle'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {currentLanguage === 'ar' ? 'إجمالي المشاهدات' : 'Total vues'}
                      </span>
                      <span className="font-semibold text-purple-600">
                        {articles.reduce((sum, a) => sum + (a.views || 0), 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {currentLanguage === 'ar' ? 'متوسط المشاهدات' : 'Vues moyennes'}
                      </span>
                      <span className="font-semibold text-blue-600">
                        {Math.round(articles.reduce((sum, a) => sum + (a.views || 0), 0) / articles.length)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {currentLanguage === 'ar' ? 'نمو هذا الشهر' : 'Croissance ce mois'}
                      </span>
                      <span className="font-semibold text-green-600">+15%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
            
              {/* Editor Settings */}
             
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EditorDashboard;
