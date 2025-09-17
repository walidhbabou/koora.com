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
import NewsEditor from '@/components/NewsEditor';
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
  const [createStep, setCreateStep] = useState(1);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);
  
  // Nouveaux états pour les compétitions
  const [newCompetitionInternationaleId, setNewCompetitionInternationaleId] = useState<number | null>(null);
  const [newCompetitionMondialeId, setNewCompetitionMondialeId] = useState<number | null>(null);
  const [newCompetitionContinentaleId, setNewCompetitionContinentaleId] = useState<number | null>(null);
  const [newCompetitionLocaleId, setNewCompetitionLocaleId] = useState<number | null>(null);
  const [newTransfertNewsId, setNewTransfertNewsId] = useState<number | null>(null);
  
  // États pour stocker les options des compétitions
  const [competitionsInternationales, setCompetitionsInternationales] = useState<{id:number,nom:string}[]>([]);
  const [competitionsMondiales, setCompetitionsMondiales] = useState<{id:number,nom:string}[]>([]);
  const [competitionsContinentales, setCompetitionsContinentales] = useState<{id:number,nom:string}[]>([]);
  const [competitionsLocales, setCompetitionsLocales] = useState<{id:number,nom:string}[]>([]);
  const [transfertsNews, setTransfertsNews] = useState<{id:number,nom:string}[]>([]);
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

  // Fonctions pour charger les nouvelles compétitions
  const fetchCompetitionsInternationales = async () => {
    try {
      const { data, error } = await supabase.from('competitions_internationales').select('id, nom').order('id');
      if (error) throw error;
      setCompetitionsInternationales(data || []);
    } catch (e) { console.error('load competitions internationales failed', e); }
  };

  const fetchCompetitionsMondiales = async () => {
    try {
      const { data, error } = await supabase.from('competitions_mondiales').select('id, nom').order('id');
      if (error) throw error;
      setCompetitionsMondiales(data || []);
    } catch (e) { console.error('load competitions mondiales failed', e); }
  };

  const fetchCompetitionsContinentales = async () => {
    try {
      const { data, error } = await supabase.from('competitions_continentales').select('id, nom').order('id');
      if (error) throw error;
      setCompetitionsContinentales(data || []);
    } catch (e) { console.error('load competitions continentales failed', e); }
  };

  const fetchCompetitionsLocales = async () => {
    try {
      const { data, error } = await supabase.from('competitions_locales').select('id, nom').order('id');
      if (error) throw error;
      setCompetitionsLocales(data || []);
    } catch (e) { console.error('load competitions locales failed', e); }
  };

  const fetchTransfertsNews = async () => {
    try {
      const { data, error } = await supabase.from('transferts_news').select('id, nom').order('id');
      if (error) throw error;
      setTransfertsNews(data || []);
    } catch (e) { console.error('load transferts news failed', e); }
  };

  useEffect(() => { 
    fetchCompetitionsInternationales();
    fetchCompetitionsMondiales();
    fetchCompetitionsContinentales();
    fetchCompetitionsLocales();
    fetchTransfertsNews();
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
    setCreateStep(1);
    setNewTitle('');
    setNewContent('');
    setNewImageFile(null);
    setNewCompetitionInternationaleId(null);
    setNewCompetitionMondialeId(null);
    setNewCompetitionContinentaleId(null);
    setNewCompetitionLocaleId(null);
    setNewTransfertNewsId(null);
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
    setCreating(true);
    try {
      const imageUrl = await uploadNewImageIfAny();
      
      // Utiliser l'insertion directe avec tous les nouveaux champs
      const { error } = await supabase.from('news').insert({
        title: newTitle,
        content: newContent,
        status: 'published',
        image_url: imageUrl ?? null,
        user_id: user.id,
        // Nouveaux champs de compétitions
        competition_internationale_id: newCompetitionInternationaleId,
        competition_mondiale_id: newCompetitionMondialeId,
        competition_continentale_id: newCompetitionContinentaleId,
        competition_locale_id: newCompetitionLocaleId,
        transfert_news_id: newTransfertNewsId,
      }).select();
      
      if (error) {
        console.error('Direct insert error details:', error);
        throw error;
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
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className={`text-left p-4 font-semibold text-gray-700 dark:text-gray-300 ${isRTL ? 'text-right' : 'text-left'}`}>
                            {currentLanguage === 'ar' ? 'الصورة' : 'Image'}
                          </th>
                          <th className={`text-left p-4 font-semibold text-gray-700 dark:text-gray-300 ${isRTL ? 'text-right' : 'text-left'}`}>
                            {currentLanguage === 'ar' ? 'العنوان' : 'Titre'}
                          </th>
                          <th className={`text-left p-4 font-semibold text-gray-700 dark:text-gray-300 ${isRTL ? 'text-right' : 'text-left'}`}>
                            {currentLanguage === 'ar' ? 'الوصف' : 'Description'}
                          </th>
                          <th className={`text-left p-4 font-semibold text-gray-700 dark:text-gray-300 ${isRTL ? 'text-right' : 'text-left'}`}>
                            {currentLanguage === 'ar' ? 'المؤلف' : 'Auteur'}
                          </th>
                          <th className={`text-left p-4 font-semibold text-gray-700 dark:text-gray-300 ${isRTL ? 'text-right' : 'text-left'}`}>
                            {currentLanguage === 'ar' ? 'التاريخ' : 'Date'}
                          </th>
                          <th className={`text-center p-4 font-semibold text-gray-700 dark:text-gray-300`}>
                            {currentLanguage === 'ar' ? 'الإجراءات' : 'Actions'}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {last24News.map((n, index) => {
                          // Fonction pour extraire le contenu textuel depuis le JSON Editor.js
                          const extractTextFromEditorJs = (content: string) => {
                            try {
                              const parsed = JSON.parse(content);
                              if (parsed.blocks && Array.isArray(parsed.blocks)) {
                                return parsed.blocks
                                  .map((block: any) => {
                                    if (block.type === 'paragraph' && block.data?.text) {
                                      return block.data.text;
                                    }
                                    if (block.type === 'header' && block.data?.text) {
                                      return block.data.text;
                                    }
                                    if (block.type === 'list' && block.data?.items) {
                                      return block.data.items.join(' ');
                                    }
                                    return '';
                                  })
                                  .filter(text => text.length > 0)
                                  .join(' ');
                              }
                              return content;
                            } catch {
                              return content;
                            }
                          };

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
                          
                          const textContent = extractTextFromEditorJs(n.content || '');
                          const cleanText = stripHtml(textContent);
                          const summary = cleanText.slice(0, 150) + (cleanText.length > 150 ? '...' : '');
                          
                          return (
                            <tr 
                              key={String(n.id)} 
                              className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200"
                            >
                              {/* Image */}
                              <td className="p-4">
                                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                  {n.image_url ? (
                                    <img 
                                      src={n.image_url} 
                                      alt={n.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                                      <Image className="w-6 h-6 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                              </td>
                              
                              {/* Title */}
                              <td className="p-4">
                                <h3 className={`font-semibold text-gray-900 dark:text-white line-clamp-2 max-w-xs ${isRTL ? 'text-right' : 'text-left'}`}>
                                  {n.title}
                                </h3>
                              </td>
                              
                              {/* Description */}
                              <td className="p-4">
                                <p className={`text-sm text-gray-600 dark:text-gray-400 line-clamp-3 max-w-md ${isRTL ? 'text-right' : 'text-left'}`}>
                                  {summary || (currentLanguage === 'ar' ? 'لا يوجد محتوى' : 'Pas de contenu')}
                                </p>
                              </td>
                              
                              {/* Author */}
                              <td className="p-4">
                                <div className={`flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                  <User className="w-4 h-4" />
                                  <span>{n.author || (currentLanguage === 'ar' ? 'غير محدد' : 'Non défini')}</span>
                                </div>
                              </td>
                              
                              {/* Date */}
                              <td className="p-4">
                                <Badge variant="secondary" className="text-xs">
                                  {n.created_at ? new Date(n.created_at).toLocaleDateString(
                                    currentLanguage === 'ar' ? 'ar-SA' : 'fr-FR',
                                    { 
                                      year: 'numeric', 
                                      month: 'short', 
                                      day: 'numeric' 
                                    }
                                  ) : ''}
                                </Badge>
                              </td>
                              
                              {/* Actions */}
                              <td className="p-4">
                                <div className="flex items-center justify-center gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => navigate(`/news/${n.id}`)}
                                    className="text-xs h-8 px-3"
                                  >
                                    {currentLanguage === 'ar' ? 'عرض' : 'Voir'}
                                  </Button>
                                  {(['moderator','admin'].includes(String((user as any)?.role || ''))) && (
                                    <Button 
                                      variant="destructive" 
                                      size="sm" 
                                      onClick={() => deleteArticle(String(n.id))}
                                      className="text-xs h-8 px-3"
                                    >
                                      {currentLanguage === 'ar' ? 'حذف' : 'Supprimer'}
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
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
            <Dialog open={isCreateOpen} onOpenChange={(open) => { if (!open) { setIsCreateOpen(false); setCreateStep(1); } }}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{currentLanguage === 'ar' ? 'إنشاء مقال' : 'Créer un article'}</DialogTitle>
                  <DialogDescription>
                    {currentLanguage === 'ar' ? 'املأ التفاصيل لإنشاء مقال' : 'Renseignez les détails pour créer un article'}
                  </DialogDescription>
                </DialogHeader>
                {createStep === 1 ? (
                  <div className="space-y-4">
                    {/* Step indicator */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-white ${createStep === 1 ? 'bg-purple-600' : 'bg-slate-300'}`}>1</div>
                      <span className={`font-semibold ${createStep === 1 ? 'text-purple-700' : 'text-slate-500'}`}>{currentLanguage === 'ar' ? 'العنوان والمحتوى' : 'Titre & Contenu'}</span>
                      <div className="w-8 h-1 bg-slate-300 mx-2 rounded" />
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-white ${createStep === 2 ? 'bg-purple-600' : 'bg-slate-300'}`}>2</div>
                      <span className={`font-semibold ${createStep === 2 ? 'text-purple-700' : 'text-slate-500'}`}>{currentLanguage === 'ar' ? 'تفاصيل أخرى' : 'Autres détails'}</span>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">{currentLanguage === 'ar' ? 'العنوان' : 'Titre'}</label>
                      <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">{currentLanguage === 'ar' ? 'المحتوى' : 'Contenu'}</label>
                      <div className="border rounded-md">
                        <NewsEditor
                          initialData={newContent ? JSON.parse(newContent) : undefined}
                          onSave={data => setNewContent(JSON.stringify(data))}
                          placeholder={currentLanguage === 'ar' ? 'اكتب المحتوى هنا...' : 'Écrivez le contenu ici...'}
                        />
                      </div>
                    </div>
                    {createError && <p className="text-sm text-red-600">{createError}</p>}
                    <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} gap-2`}>
                      <Button variant="outline" onClick={() => { setIsCreateOpen(false); setCreateStep(1); }}>{currentLanguage === 'ar' ? 'إلغاء' : 'Annuler'}</Button>
                      <Button
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={() => {
                          if (!newTitle || !newContent) {
                            setCreateError(currentLanguage === 'ar' ? 'أدخل العنوان والمحتوى' : 'Entrez le titre et le contenu');
                            return;
                          }
                          setCreateError('');
                          setCreateStep(2);
                        }}
                      >
                        {currentLanguage === 'ar' ? 'التالي' : 'Suivant'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Step indicator */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-white ${createStep === 1 ? 'bg-purple-600' : 'bg-slate-300'}`}>1</div>
                      <span className={`font-semibold ${createStep === 1 ? 'text-purple-700' : 'text-slate-500'}`}>{currentLanguage === 'ar' ? 'العنوان والمحتوى' : 'Titre & Contenu'}</span>
                      <div className="w-8 h-1 bg-slate-300 mx-2 rounded" />
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-white ${createStep === 2 ? 'bg-purple-600' : 'bg-slate-300'}`}>2</div>
                      <span className={`font-semibold ${createStep === 2 ? 'text-purple-700' : 'text-slate-500'}`}>{currentLanguage === 'ar' ? 'تفاصيل أخرى' : 'Autres détails'}</span>
                    </div>

                    {/* **NOUVEAUX CHAMPS POUR LES COMPÉTITIONS** */}
                    <div className="border-t pt-4">
                      <h3 className="text-sm font-semibold mb-3 text-purple-700">
                        {currentLanguage === 'ar' ? 'تفاصيل الكوئتيشن (اختياري)' : 'Détails des compétitions (optionnel)'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm mb-1">{currentLanguage === 'ar' ? 'المسابقات الدولية' : 'Compétitions Internationales'}</label>
                          <select className="w-full border rounded-md h-10 px-2" value={newCompetitionInternationaleId ?? ''} onChange={(e) => setNewCompetitionInternationaleId(e.target.value ? Number(e.target.value) : null)}>
                            <option value="">{currentLanguage === 'ar' ? 'اختياري' : 'Optionnel'}</option>
                            {competitionsInternationales.map(c => (
                              <option key={c.id} value={c.id}>{c.nom}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm mb-1">{currentLanguage === 'ar' ? 'المسابقات العالمية' : 'Compétitions Mondiales'}</label>
                          <select className="w-full border rounded-md h-10 px-2" value={newCompetitionMondialeId ?? ''} onChange={(e) => setNewCompetitionMondialeId(e.target.value ? Number(e.target.value) : null)}>
                            <option value="">{currentLanguage === 'ar' ? 'اختياري' : 'Optionnel'}</option>
                            {competitionsMondiales.map(c => (
                              <option key={c.id} value={c.id}>{c.nom}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm mb-1">{currentLanguage === 'ar' ? 'المسابقات القارية' : 'Compétitions Continentales'}</label>
                          <select className="w-full border rounded-md h-10 px-2" value={newCompetitionContinentaleId ?? ''} onChange={(e) => setNewCompetitionContinentaleId(e.target.value ? Number(e.target.value) : null)}>
                            <option value="">{currentLanguage === 'ar' ? 'اختياري' : 'Optionnel'}</option>
                            {competitionsContinentales.map(c => (
                              <option key={c.id} value={c.id}>{c.nom}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm mb-1">{currentLanguage === 'ar' ? 'المسابقات المحلية' : 'Compétitions Locales'}</label>
                          <select className="w-full border rounded-md h-10 px-2" value={newCompetitionLocaleId ?? ''} onChange={(e) => setNewCompetitionLocaleId(e.target.value ? Number(e.target.value) : null)}>
                            <option value="">{currentLanguage === 'ar' ? 'اختياري' : 'Optionnel'}</option>
                            {competitionsLocales.map(c => (
                              <option key={c.id} value={c.id}>{c.nom}</option>
                            ))}
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm mb-1">{currentLanguage === 'ar' ? 'أخبار الانتقالات' : 'Actualités Transferts'}</label>
                          <select className="w-full border rounded-md h-10 px-2" value={newTransfertNewsId ?? ''} onChange={(e) => setNewTransfertNewsId(e.target.value ? Number(e.target.value) : null)}>
                            <option value="">{currentLanguage === 'ar' ? 'اختياري' : 'Optionnel'}</option>
                            {transfertsNews.map(c => (
                              <option key={c.id} value={c.id}>{c.nom}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm mb-1">{currentLanguage === 'ar' ? 'الصورة' : 'Image'}</label>
                      <Input type="file" accept="image/*" onChange={(e) => setNewImageFile(e.target.files?.[0] ?? null)} />
                      {!newImageFile && (
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Image className="w-3 h-3" />{currentLanguage === 'ar' ? 'اختياري' : 'Optionnel'}</div>
                      )}
                    </div>
                    {createError && <p className="text-sm text-red-600">{createError}</p>}
                    <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} gap-2`}>
                      <Button variant="outline" onClick={() => setCreateStep(1)}>{currentLanguage === 'ar' ? 'السابق' : 'Précédent'}</Button>
                      <Button className="bg-purple-600 hover:bg-purple-700" disabled={creating} onClick={handleCreate}>
                        {creating ? (currentLanguage === 'ar' ? 'جاري الإنشاء...' : 'Création...') : (currentLanguage === 'ar' ? 'إنشاء' : 'Créer')}
                      </Button>
                    </div>
                  </div>
                )}
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
