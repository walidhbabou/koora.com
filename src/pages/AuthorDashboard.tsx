import React, { useState, useEffect } from 'react';
import { 
  PenTool, 
  FileText, 
  Plus, 
  Eye, 
  Edit, 
  Calendar,
  TrendingUp,
  Search,
  Clock,
  CheckCircle,
  Send,
  BookOpen,
  Image as ImageIcon,
  User,
  Mail,
  MapPin,
  Phone,
  Globe,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  date: string;
  status: 'draft' | 'submitted' | 'published' | 'rejected';
  imageUrl?: string;
  views?: number;
  feedback?: string;
}

const AuthorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { currentLanguage, isRTL, direction } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');
  const [categories, setCategories] = useState<{id:number,name:string,name_ar:string}[]>([]);
  const [newCategoryId, setNewCategoryId] = useState<number | null>(null);
  const [editCategoryId, setEditCategoryId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  // Writing tab state
  const [writingTitle, setWritingTitle] = useState('');
  const [writingContent, setWritingContent] = useState('');
  const [writingCategoryId, setWritingCategoryId] = useState<number | null>(null);
  const [writingImageFile, setWritingImageFile] = useState<File | null>(null);
  const [writingError, setWritingError] = useState('');
  const [savingDraft, setSavingDraft] = useState(false);
  const [submittingWriting, setSubmittingWriting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const fetchArticles = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('news_submissions')
        .select('id, title, content, created_at, status, image_url, category_id, categories(name, name_ar)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const mapped: Article[] = (data || []).map((n: any) => ({
        id: String(n.id),
        title: n.title || '-',
        content: n.content || '',
        category: n.categories ? (currentLanguage === 'ar' ? n.categories.name_ar || n.categories.name : n.categories.name) : '-',
        date: n.created_at ? new Date(n.created_at).toISOString().slice(0,10) : '-',
        status: (n.status as any) || 'draft',
        imageUrl: n.image_url || undefined,
      }));
      setArticles(mapped);
    } catch (e) {
      console.error('Failed to load author articles:', e);
    } finally {
      setLoading(false);
    }
  };

  // Helpers for Writing tab actions
  const uploadWritingImageIfAny = async (): Promise<string | undefined> => {
    if (!writingImageFile || !user?.id) return undefined;
    const ext = writingImageFile.name.split('.').pop();
    const filePath = `${user.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('news-images')
      .upload(filePath, writingImageFile, { upsert: false });
    if (upErr) throw upErr;
    const { data: pub } = supabase.storage.from('news-images').getPublicUrl(filePath);
    return pub?.publicUrl;
  };

  const resetWritingForm = () => {
    setWritingTitle('');
    setWritingContent('');
    setWritingCategoryId(null);
    setWritingImageFile(null);
    setWritingError('');
  };

  const handleSaveDraftWriting = async () => {
    if (!user?.id) return;
    setWritingError('');
    if (!writingTitle || !writingContent) {
      setWritingError(currentLanguage === 'ar' ? 'العنوان والمحتوى إجباريان' : 'Titre et contenu requis');
      return;
    }
    if (!writingCategoryId) {
      setWritingError(currentLanguage === 'ar' ? 'اختر الفئة' : 'Choisissez une catégorie');
      return;
    }
    setSavingDraft(true);
    try {
      const imageUrl = await uploadWritingImageIfAny();
      const { error } = await supabase.from('news_submissions').insert({
        user_id: user.id,
        title: writingTitle,
        content: writingContent,
        status: 'draft',
        image_url: imageUrl ?? null,
        category_id: writingCategoryId,
      });
      if (error) throw error;
      resetWritingForm();
      await fetchArticles();
      setActiveTab('articles');
      toast({ title: currentLanguage === 'ar' ? 'تم الحفظ' : 'Enregistré', description: currentLanguage === 'ar' ? 'تم حفظ المسودة' : 'Brouillon enregistré' });
    } catch (e: any) {
      setWritingError(e?.message || 'Failed to save draft');
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSubmitWriting = async () => {
    if (!user?.id) return;
    setWritingError('');
    if (!writingTitle || !writingContent) {
      setWritingError(currentLanguage === 'ar' ? 'العنوان والمحتوى إجباريان' : 'Titre et contenu requis');
      return;
    }
    if (!writingCategoryId) {
      setWritingError(currentLanguage === 'ar' ? 'اختر الفئة' : 'Choisissez une catégorie');
      return;
    }
    setSubmittingWriting(true);
    try {
      const imageUrl = await uploadWritingImageIfAny();
      const { error } = await supabase.from('news_submissions').insert({
        user_id: user.id,
        title: writingTitle,
        content: writingContent,
        status: 'submitted',
        image_url: imageUrl ?? null,
        category_id: writingCategoryId,
      });
      if (error) throw error;
      resetWritingForm();
      await fetchArticles();
      setActiveTab('articles');
      toast({ title: currentLanguage === 'ar' ? 'تم الإرسال' : 'Soumis', description: currentLanguage === 'ar' ? 'تم إرسال المقال للمراجعة' : 'Article envoyé en révision' });
    } catch (e: any) {
      setWritingError(e?.message || 'Failed to submit');
    } finally {
      setSubmittingWriting(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('categories').select('id, name, name_ar').order('id');
      if (error) throw error;
      setCategories(data || []);
    } catch(e) { console.error('load categories failed', e); }
  };

  useEffect(() => {
    fetchArticles();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const stats = [
    { 
      title: currentLanguage === 'ar' ? 'المقالات المنشورة' : 'Articles Publiés', 
      value: articles.filter(a => a.status === 'published').length, 
      icon: CheckCircle, 
      change: '+2', 
      color: 'text-green-600' 
    },
    { 
      title: currentLanguage === 'ar' ? 'قيد المراجعة' : 'En Révision', 
      value: articles.filter(a => a.status === 'submitted').length, 
      icon: Send, 
      change: '+1', 
      color: 'text-blue-600' 
    },
    { 
      title: currentLanguage === 'ar' ? 'المسودات' : 'Brouillons', 
      value: articles.filter(a => a.status === 'draft').length, 
      icon: FileText, 
      change: '0', 
      color: 'text-orange-600' 
    },
    { 
      title: currentLanguage === 'ar' ? 'إجمالي المشاهدات' : 'Total Vues', 
      value: articles.reduce((sum, a) => sum + (a.views || 0), 0).toLocaleString(), 
      icon: Eye, 
      change: '+12%', 
      color: 'text-purple-600' 
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { 
        label: currentLanguage === 'ar' ? 'منشور' : 'Publié', 
        variant: 'default' as const,
        color: 'bg-green-100 text-green-800'
      },
      submitted: { 
        label: currentLanguage === 'ar' ? 'مرسل' : 'Soumis', 
        variant: 'secondary' as const,
        color: 'bg-blue-100 text-blue-800'
      },
      draft: { 
        label: currentLanguage === 'ar' ? 'مسودة' : 'Brouillon', 
        variant: 'outline' as const,
        color: 'bg-orange-100 text-orange-800'
      },
      rejected: { 
        label: currentLanguage === 'ar' ? 'مرفوض' : 'Rejeté', 
        variant: 'destructive' as const,
        color: 'bg-red-100 text-red-800'
      }
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
  };

  const handleCreate = async () => {
    if (!user?.id) return;
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
      let imageUrl: string | undefined;
      if (newImageFile) {
        const ext = newImageFile.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('news-images').upload(filePath, newImageFile, { upsert: false });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from('news-images').getPublicUrl(filePath);
        imageUrl = pub?.publicUrl;
      }
      const { error } = await supabase.from('news_submissions').insert({
        user_id: user.id,
        title: newTitle,
        content: newContent,
        status: 'draft',
        image_url: imageUrl ?? null,
        category_id: newCategoryId,
      });
      if (error) throw error;
      setIsCreateOpen(false);
      setNewTitle('');
      setNewContent('');
      setNewImageFile(null);
      setNewCategoryId(null);
      await fetchArticles();
      setActiveTab('articles');
    } catch (e: any) {
      setCreateError(e?.message || 'Failed to create');
    } finally {
      setCreating(false);
    }
  };

  const updateStatus = async (id: string, status: Article['status']) => {
    try {
      const { error } = await supabase.from('news_submissions').update({ status }).eq('id', Number(id)).eq('user_id', user?.id || '');
      if (error) throw error;
      await fetchArticles();
    } catch (e) { console.error(e); }
  };

  const openEdit = (a: Article) => {
    setEditingId(a.id);
    setEditTitle(a.title);
    setEditContent(a.content);
    setEditError('');
    // Try to find current category id by refetching single submission to be accurate
    (async () => {
      try {
        const { data } = await supabase
          .from('news_submissions')
          .select('category_id')
          .eq('id', Number(a.id))
          .eq('user_id', user?.id || '')
          .single();
        setEditCategoryId(data?.category_id ?? null);
      } catch { setEditCategoryId(null); }
    })();
  };

  const saveEdit = async () => {
    if (!editingId) return;
    if (!editTitle || !editContent) {
      setEditError(currentLanguage === 'ar' ? 'العنوان والمحتوى إجباريان' : 'Titre et contenu requis');
      return;
    }
    setSavingEdit(true);
    try {
      const { error } = await supabase
        .from('news_submissions')
        .update({ title: editTitle, content: editContent, category_id: editCategoryId })
        .eq('id', Number(editingId))
        .eq('user_id', user?.id || '');
      if (error) throw error;
      setEditingId(null);
      await fetchArticles();
    } catch (e: any) {
      setEditError(e?.message || 'Failed to save');
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteSubmission = async (id: string) => {
    try {
      // 1) Try RPC (SECURITY DEFINER) to avoid RLS issues
      if (user?.id) {
        const { data: rpcRes, error: rpcErr } = await supabase.rpc('delete_news_submission', {
          submission_id: Number(id),
          current_user_id: user.id,
          current_user_role: (user as any)?.role || 'author'
        });
        if (!rpcErr) {
          const ok = Boolean(rpcRes);
          if (!ok) throw new Error(currentLanguage === 'ar' ? 'غير مصرح بالحذف أو السجل غير موجود' : 'Suppression non autorisée ou enregistrement introuvable');
          await fetchArticles();
          toast({ title: currentLanguage === 'ar' ? 'تم الحذف' : 'Supprimé', description: currentLanguage === 'ar' ? 'تم حذف المقال بنجاح' : 'Article supprimé avec succès' });
          return;
        }
        // If function missing, fallback to direct delete below
      }

      // 2) Fallback: direct delete under RLS (only own draft/rejected)
      const { error, data } = await supabase
        .from('news_submissions')
        .delete()
        .eq('id', Number(id))
        .eq('user_id', user?.id || '')
        .in('status', ['draft','rejected'])
        .select();
      if (error) throw error;
      const rows = (data as any[]) || [];
      if (rows.length === 0) throw new Error(currentLanguage === 'ar' ? 'لم يتم العثور على السجل أو رُفِض بواسطة RLS' : 'Aucune ligne supprimée ou refusée par RLS');
      await fetchArticles();
      toast({ title: currentLanguage === 'ar' ? 'تم الحذف' : 'Supprimé', description: currentLanguage === 'ar' ? 'تم حذف المقال بنجاح' : 'Article supprimé avec succès' });
    } catch (e: any) {
      console.error('delete failed', e);
      const msg = e?.message || '';
      const friendly = msg.includes('PGRST116')
        ? (currentLanguage === 'ar' ? 'رفض RLS: تحقق من الأذونات والجلسة' : 'Refus RLS: vérifiez permissions et session')
        : msg;
      toast({ title: currentLanguage === 'ar' ? 'فشل الحذف' : 'Échec de suppression', description: friendly, variant: 'destructive' });
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 ${isRTL ? 'rtl' : 'ltr'}`} dir={direction}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-4'}`}>
              <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg transform hover:scale-110 transition-all duration-300">
                  <PenTool className="w-6 h-6 text-white" />
                </div>
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {currentLanguage === 'ar' ? 'لوحة تحكم الكاتب' : 'Dashboard Auteur'}
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
              className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-0 shadow-md hover:shadow-purple-200/50 dark:hover:shadow-purple-900/30"
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
                  <div className={`p-3 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/50 dark:to-indigo-900/50 group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
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
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg">
              {currentLanguage === 'ar' ? 'نظرة عامة' : 'Vue d\'ensemble'}
            </TabsTrigger>
            <TabsTrigger value="articles" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg">
              {currentLanguage === 'ar' ? 'مقالاتي' : 'Mes Articles'}
            </TabsTrigger>
            <TabsTrigger value="writing" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg">
              {currentLanguage === 'ar' ? 'الكتابة' : 'Écriture'}
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg">
              {currentLanguage === 'ar' ? 'الملف الشخصي' : 'Profil'}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Stats */}
              <Card className="hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Send className="w-5 h-5 text-blue-600" />
                    <span>{currentLanguage === 'ar' ? 'قيد المراجعة' : 'En Attente de Révision'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {articles.filter(a => a.status === 'submitted').slice(0, 3).map((article) => (
                      <div key={article.id} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-white hover:to-purple-50 dark:hover:from-slate-700 dark:hover:to-purple-900/20 transition-all duration-300 hover:shadow-md hover:scale-[1.02] bg-white/60 dark:bg-slate-800/60">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-md">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900 dark:text-white text-sm">{article.title}</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{article.category}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {currentLanguage === 'ar' ? 'مرسل' : 'Soumis'}
                        </Badge>
                      </div>
                    ))}
                    {articles.filter(a => a.status === 'submitted').length === 0 && (
                      <div className="text-sm text-slate-500 text-center py-4">
                        {currentLanguage === 'ar' ? 'لا توجد مقالات قيد المراجعة' : 'Aucun article en attente'}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    <span>{currentLanguage === 'ar' ? 'إحصائيات الكتابة' : 'Statistiques d\'Écriture'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {currentLanguage === 'ar' ? 'مقالات هذا الشهر' : 'Articles ce mois'}
                      </span>
                      <span className="font-semibold text-purple-600">4</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {currentLanguage === 'ar' ? 'معدل القبول' : 'Taux d\'acceptation'}
                      </span>
                      <span className="font-semibold text-green-600">75%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {currentLanguage === 'ar' ? 'متوسط المشاهدات' : 'Vues moyennes'}
                      </span>
                      <span className="font-semibold text-blue-600">850</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Feedback */}
            {articles.some(a => a.feedback) && (
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Edit className="w-5 h-5 text-orange-600" />
                    <span>{currentLanguage === 'ar' ? 'ملاحظات حديثة' : 'Commentaires Récents'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {articles.filter(a => a.feedback).map((article) => (
                      <div key={article.id} className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
                        <h4 className="font-medium text-slate-900 dark:text-white mb-2">{article.title}</h4>
                        <p className="text-sm text-red-700 dark:text-red-300">{article.feedback}</p>
                        <Badge variant="destructive" className="mt-2">
                          {currentLanguage === 'ar' ? 'مرفوض' : 'Rejeté'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Articles Tab */}
          <TabsContent value="articles" className="space-y-6">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-4'}`}>
                <Input
                  placeholder={currentLanguage === 'ar' ? 'البحث في مقالاتي...' : 'Rechercher mes articles...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {currentLanguage === 'ar' ? 'مقال جديد' : 'Nouvel Article'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{currentLanguage === 'ar' ? 'إنشاء مقال' : 'Créer un article'}</DialogTitle>
                    <DialogDescription>
                      {currentLanguage === 'ar' ? 'املأ التفاصيل لإنشاء مقال' : 'Renseignez les détails pour créer un article'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm mb-1">{currentLanguage === 'ar' ? 'العنوان' : 'Titre'}</label>
                      <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">{currentLanguage === 'ar' ? 'المحتوى' : 'Contenu'}</label>
                      <Textarea rows={6} value={newContent} onChange={(e) => setNewContent(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">{currentLanguage === 'ar' ? 'الفئة' : 'Catégorie'}</label>
                      <select className="w-full border rounded-md h-10 px-2" value={newCategoryId ?? ''} onChange={(e) => setNewCategoryId(e.target.value ? Number(e.target.value) : null)}>
                        <option value="">{currentLanguage === 'ar' ? 'اختر الفئة' : 'Choisir une catégorie'}</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{currentLanguage === 'ar' ? (c.name_ar || c.name) : c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">{currentLanguage === 'ar' ? 'الصورة' : 'Image'}</label>
                      <Input type="file" accept="image/*" onChange={(e) => setNewImageFile(e.target.files?.[0] ?? null)} />
                      {!newImageFile && (
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1"><ImageIcon className="w-3 h-3" />{currentLanguage === 'ar' ? 'اختياري' : 'Optionnel'}</div>
                      )}
                    </div>
                    {createError && <p className="text-sm text-red-600">{createError}</p>}
                    <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} gap-2`}>
                      <Button variant="outline" onClick={() => setIsCreateOpen(false)}>{currentLanguage === 'ar' ? 'إلغاء' : 'Annuler'}</Button>
                      <Button className="bg-purple-600 hover:bg-purple-700" disabled={creating} onClick={handleCreate}>
                        {creating ? (currentLanguage === 'ar' ? 'جاري الإنشاء...' : 'Création...') : (currentLanguage === 'ar' ? 'إنشاء' : 'Créer')}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-0 shadow-xl">
              <CardHeader>
                <CardTitle>{currentLanguage === 'ar' ? 'مقالاتي' : 'Mes Articles'}</CardTitle>
                <CardDescription>
                  {currentLanguage === 'ar' ? 'إدارة جميع مقالاتك ومحتواك' : 'Gérez tous vos articles et contenus'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading && (
                    <div className="text-sm text-slate-500">{currentLanguage === 'ar' ? 'جاري التحميل...' : 'Chargement...'}</div>
                  )}
                  {articles
                    .filter(a => !searchTerm || a.title.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((article) => (
                    <div key={article.id} className="flex items-center justify-between p-4 border-0 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 dark:hover:from-slate-700 dark:hover:to-purple-900/20 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] bg-white dark:bg-slate-800/50 shadow-md mb-3">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center overflow-hidden shadow-inner">
                          {article.imageUrl ? (
                            <img src={article.imageUrl} alt={article.title} className="w-16 h-16 object-cover" />
                          ) : (
                            <FileText className="w-8 h-8 text-slate-600 dark:text-slate-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white">{article.title}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{article.category}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-500">{article.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStatusBadge(article.status).variant}>
                          {getStatusBadge(article.status).label}
                        </Badge>
                        {article.status === 'draft' && (
                          <Button variant="outline" size="sm" onClick={() => updateStatus(article.id, 'submitted')}>
                            {currentLanguage === 'ar' ? 'إرسال' : 'Soumettre'}
                          </Button>
                        )}
                        {article.status === 'submitted' && (
                          <Button variant="outline" size="sm" onClick={() => updateStatus(article.id, 'draft')}>
                            {currentLanguage === 'ar' ? 'إلغاء الإرسال' : 'Annuler'}
                          </Button>
                        )}
                        {(article.status === 'draft' || article.status === 'rejected') && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => openEdit(article)}>
                              {currentLanguage === 'ar' ? 'تعديل' : 'Modifier'}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setConfirmDeleteId(article.id)}>
                              {currentLanguage === 'ar' ? 'حذف' : 'Supprimer'}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Dialog open={!!editingId} onOpenChange={(open) => { if (!open) setEditingId(null); }}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{currentLanguage === 'ar' ? 'تعديل المقال' : 'Modifier l\'article'}</DialogTitle>
                  <DialogDescription>
                    {currentLanguage === 'ar' ? 'قم بتحديث العنوان والمحتوى' : 'Mettez à jour le titre et le contenu'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-1">{currentLanguage === 'ar' ? 'العنوان' : 'Titre'}</label>
                    <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">{currentLanguage === 'ar' ? 'المحتوى' : 'Contenu'}</label>
                    <Textarea rows={6} value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">{currentLanguage === 'ar' ? 'الفئة' : 'Catégorie'}</label>
                    <select className="w-full border rounded-md h-10 px-2" value={editCategoryId ?? ''} onChange={(e) => setEditCategoryId(e.target.value ? Number(e.target.value) : null)}>
                      <option value="">{currentLanguage === 'ar' ? 'اختر الفئة' : 'Choisir une catégorie'}</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{currentLanguage === 'ar' ? (c.name_ar || c.name) : c.name}</option>
                      ))}
                    </select>
                  </div>
                  {editError && <p className="text-sm text-red-600">{editError}</p>}
                  <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} gap-2`}>
                    <Button variant="outline" onClick={() => setEditingId(null)}>{currentLanguage === 'ar' ? 'إلغاء' : 'Annuler'}</Button>
                    <Button className="bg-purple-600 hover:bg-purple-700" disabled={savingEdit} onClick={saveEdit}>
                      {savingEdit ? (currentLanguage === 'ar' ? 'حفظ...' : 'Enregistrement...') : (currentLanguage === 'ar' ? 'حفظ' : 'Enregistrer')}
                    </Button>
                  </div>
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
                  <Button className="bg-red-600 hover:bg-red-700" onClick={async () => { const id = confirmDeleteId!; setConfirmDeleteId(null); await deleteSubmission(id); }}>
                    {currentLanguage === 'ar' ? 'حذف' : 'Supprimer'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Writing Tab */}
          <TabsContent value="writing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 bg-gradient-to-br from-white to-purple-50 dark:from-slate-800 dark:to-purple-900/20 border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PenTool className="w-5 h-5 text-purple-600" />
                    <span>{currentLanguage === 'ar' ? 'مساحة الكتابة' : 'Espace d\'Écriture'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Input
                      placeholder={currentLanguage === 'ar' ? 'عنوان المقال...' : 'Titre de l\'article...'}
                      className="text-lg font-medium"
                      value={writingTitle}
                      onChange={(e) => setWritingTitle(e.target.value)}
                    />
                    <textarea
                      placeholder={currentLanguage === 'ar' ? 'ابدأ الكتابة هنا...' : 'Commencez à écrire ici...'}
                      className="w-full h-64 p-4 border border-slate-200 dark:border-slate-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={writingContent}
                      onChange={(e) => setWritingContent(e.target.value)}
                    />
                    <div>
                      <label className="block text-sm mb-1">{currentLanguage === 'ar' ? 'الفئة' : 'Catégorie'}</label>
                      <select
                        className="w-full border rounded-md h-10 px-2"
                        value={writingCategoryId ?? ''}
                        onChange={(e) => setWritingCategoryId(e.target.value ? Number(e.target.value) : null)}
                      >
                        <option value="">{currentLanguage === 'ar' ? 'اختر الفئة' : 'Choisir une catégorie'}</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{currentLanguage === 'ar' ? (c.name_ar || c.name) : c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">{currentLanguage === 'ar' ? 'الصورة' : 'Image'}</label>
                      <Input type="file" accept="image/*" onChange={(e) => setWritingImageFile(e.target.files?.[0] ?? null)} />
                      {!writingImageFile && (
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1"><ImageIcon className="w-3 h-3" />{currentLanguage === 'ar' ? 'اختياري' : 'Optionnel'}</div>
                      )}
                    </div>
                    {writingError && <p className="text-sm text-red-600">{writingError}</p>}
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" disabled={savingDraft} onClick={handleSaveDraftWriting}>
                          {savingDraft ? (currentLanguage === 'ar' ? 'حفظ...' : 'Enregistrement...') : (currentLanguage === 'ar' ? 'حفظ كمسودة' : 'Sauvegarder')}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(true)}>
                          {currentLanguage === 'ar' ? 'معاينة' : 'Aperçu'}
                        </Button>
                      </div>
                      <Button className="bg-purple-600 hover:bg-purple-700" disabled={submittingWriting} onClick={handleSubmitWriting}>
                        <Send className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {submittingWriting ? (currentLanguage === 'ar' ? 'جارٍ الإرسال...' : 'Envoi...') : (currentLanguage === 'ar' ? 'إرسال للمراجعة' : 'Soumettre')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Preview Dialog */}
              <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{currentLanguage === 'ar' ? 'معاينة المقال' : 'Aperçu de l\'article'}</DialogTitle>
                    <DialogDescription>
                      {currentLanguage === 'ar' ? 'هذه معاينة للمقال قبل الحفظ أو الإرسال' : 'Aperçu avant enregistrement ou soumission'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold">{writingTitle || (currentLanguage === 'ar' ? 'بدون عنوان' : 'Sans titre')}</h3>
                    <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">{writingContent || (currentLanguage === 'ar' ? 'لا يوجد محتوى' : 'Pas de contenu')}</div>
                  </div>
                </DialogContent>
              </Dialog>

              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-sm">
                    {currentLanguage === 'ar' ? 'إرشادات الكتابة' : 'Guide d\'Écriture'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                        {currentLanguage === 'ar' ? 'نصائح' : 'Conseils'}
                      </h4>
                      <ul className="text-blue-700 dark:text-blue-300 space-y-1">
                        <li>• {currentLanguage === 'ar' ? 'استخدم عناوين واضحة' : 'Utilisez des titres clairs'}</li>
                        <li>• {currentLanguage === 'ar' ? 'أضف مصادر موثوقة' : 'Ajoutez des sources fiables'}</li>
                        <li>• {currentLanguage === 'ar' ? 'راجع الإملاء' : 'Vérifiez l\'orthographe'}</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">
                        {currentLanguage === 'ar' ? 'الفئات المطلوبة' : 'Catégories Demandées'}
                      </h4>
                      <ul className="text-green-700 dark:text-green-300 space-y-1">
                        <li>• {currentLanguage === 'ar' ? 'تقارير المباريات' : 'Rapports de matchs'}</li>
                        <li>• {currentLanguage === 'ar' ? 'مقابلات' : 'Interviews'}</li>
                        <li>• {currentLanguage === 'ar' ? 'تحليلات تكتيكية' : 'Analyses tactiques'}</li>
                      </ul>
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
              <Card className="hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-white to-purple-50 dark:from-slate-800 dark:to-purple-900/20 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-purple-600" />
                    <span>{currentLanguage === 'ar' ? 'المعلومات الشخصية' : 'Informations Personnelles'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {user?.name?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{user?.name || 'Auteur'}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{user?.email}</p>
                        <Badge variant="outline" className="mt-1">{user?.role || 'author'}</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                        <Mail className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{user?.email || 'Non renseigné'}</span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {currentLanguage === 'ar' ? 'عضو منذ' : 'Membre depuis'} {new Date().getFullYear()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                        <Globe className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {currentLanguage === 'ar' ? 'اللغة' : 'Langue'}: {currentLanguage === 'ar' ? 'العربية' : 'Français'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Settings */}
              <Card className="hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-white to-indigo-50 dark:from-slate-800 dark:to-indigo-900/20 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-indigo-600" />
                    <span>{currentLanguage === 'ar' ? 'إعدادات الحساب' : 'Paramètres du Compte'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
                      <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                        {currentLanguage === 'ar' ? 'إحصائيات الكاتب' : 'Statistiques Auteur'}
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{articles.length}</div>
                          <div className="text-xs text-slate-500">{currentLanguage === 'ar' ? 'مقالات' : 'Articles'}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{articles.filter(a => a.status === 'published').length}</div>
                          <div className="text-xs text-slate-500">{currentLanguage === 'ar' ? 'منشور' : 'Publiés'}</div>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      {currentLanguage === 'ar' ? 'تعديل الملف الشخصي' : 'Modifier le Profil'}
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Mail className="w-4 h-4 mr-2" />
                      {currentLanguage === 'ar' ? 'تغيير كلمة المرور' : 'Changer le Mot de Passe'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AuthorDashboard;
