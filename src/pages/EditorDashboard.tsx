import React, { useState, useEffect } from 'react';
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
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

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

const EditorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { currentLanguage, isRTL, direction } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      // Fetch submissions queue for editors
      const { data, error } = await supabase
        .from('news_submissions')
        .select('id, title, content, created_at, status, image_url, user_id, category_id, categories(name, name_ar), users(name)')
        .in('status', ['submitted', 'draft', 'rejected', 'published'])
        .order('created_at', { ascending: false });
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
    } catch (e) {
      console.error('Failed to load editor articles:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

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
        user_id: sub?.user_id,
        category_id: sub?.category_id ?? null,
      });
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

  const deleteArticle = async (id: string) => {
    try {
      // S'assurer que l'utilisateur est connecté
      if (!user?.id) {
        throw new Error(currentLanguage === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'Vous devez être connecté');
      }

      console.log('Tentative de suppression:', { articleId: id, userId: user.id, userRole: (user as any)?.role });

      // 1) Essayer via RPC (SECURITY DEFINER) pour éviter les rejets RLS côté client
      const { data: rpcRes, error: rpcErr } = await supabase.rpc('delete_news_submission', {
        submission_id: Number(id),
        current_user_id: user.id,
        current_user_role: (user as any)?.role || 'editor'
      });
      if (!rpcErr) {
        const ok = Boolean(rpcRes);
        if (!ok) throw new Error(currentLanguage === 'ar' ? 'غير مصرح بالحذف أو السجل غير موجود' : 'Suppression non autorisée ou enregistrement introuvable');
        await fetchArticles();
        toast({ 
          title: currentLanguage === 'ar' ? 'تم الحذف' : 'Supprimé', 
          description: currentLanguage === 'ar' ? 'تم حذف المقال بنجاح' : 'Article supprimé avec succès' 
        });
        return;
      }

      // 2) Repli: suppression directe (RLS) si RPC indisponible
      const { data, error } = await supabase
        .from('news_submissions')
        .delete()
        .eq('id', Number(id))
        .select();

      if (error) {
        console.error('Delete error:', error);
        throw new Error(error.message);
      }

      if (!data || data.length === 0) {
        throw new Error(currentLanguage === 'ar' ? 'لم يتم العثور على المقال أو ليس لديك صلاحية لحذفه' : 'Article introuvable ou permissions insuffisantes');
      }
      
      await fetchArticles();
      toast({ 
        title: currentLanguage === 'ar' ? 'تم الحذف' : 'Supprimé', 
        description: currentLanguage === 'ar' ? 'تم حذف المقال بنجاح' : 'Article supprimé avec succès' 
      });
    } catch (e: any) {
      console.error('delete failed', e);
      const msg = e?.message || '';
      const errorMessage = msg.includes('PGRST116')
        ? (currentLanguage === 'ar' ? 'رفض RLS: تحقق من الأذونات والجلسة' : 'Refus RLS: vérifiez permissions et session')
        : (msg || (currentLanguage === 'ar' ? 'فشل في حذف المقال' : 'Échec de la suppression'));
      toast({ 
        title: currentLanguage === 'ar' ? 'فشل الحذف' : 'Échec de suppression', 
        description: errorMessage, 
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
          <TabsList className="grid w-full grid-cols-3 bg-white/90 backdrop-blur-sm dark:bg-slate-900/90 border border-slate-200/50 dark:border-slate-700/50 shadow-lg rounded-xl p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg">
              {currentLanguage === 'ar' ? 'نظرة عامة' : 'Vue d\'ensemble'}
            </TabsTrigger>
            <TabsTrigger value="articles" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg">
              {currentLanguage === 'ar' ? 'إدارة المقالات' : 'Gestion Articles'}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg">
              {currentLanguage === 'ar' ? 'التحليلات' : 'Analytics'}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <span>{currentLanguage === 'ar' ? 'قيد المراجعة' : 'En Attente de Révision'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {articles.filter(a => a.status === 'review').map((article) => (
                      <div key={article.id} className="flex items-center space-x-3 p-4 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 dark:hover:from-slate-700 dark:hover:to-orange-900/20 transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900 dark:text-white">{article.title}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{article.author}</p>
                        </div>
                        <Badge variant="secondary">
                          {currentLanguage === 'ar' ? 'مراجعة' : 'Révision'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span>{currentLanguage === 'ar' ? 'الأداء' : 'Performance'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {currentLanguage === 'ar' ? 'مقالات هذا الشهر' : 'Articles ce mois'}
                      </span>
                      <span className="font-semibold text-green-600">12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {currentLanguage === 'ar' ? 'متوسط المشاهدات' : 'Vues moyennes'}
                      </span>
                      <span className="font-semibold text-blue-600">1,450</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {currentLanguage === 'ar' ? 'معدل النشر' : 'Taux de publication'}
                      </span>
                      <span className="font-semibold text-purple-600">85%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          {/* Preview Dialog */}
          <Dialog open={!!previewId} onOpenChange={(open) => { if (!open) setPreviewId(null); }}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{currentLanguage === 'ar' ? 'معاينة المقال' : 'Aperçu de l\'article'}</DialogTitle>
              </DialogHeader>
              {(() => {
                const art = articles.find(a => a.id === previewId);
                if (!art) return <div className="text-sm text-slate-500">{currentLanguage === 'ar' ? 'لا يوجد محتوى' : 'Aucun contenu'}</div>;
                return (
                  <div className="space-y-4">
                    {art.imageUrl && (
                      <img src={art.imageUrl} alt={art.title} className="w-full h-64 object-cover rounded" />
                    )}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-bold">{art.title}</h2>
                        <div className="text-xs text-slate-500">{art.author} • {art.date}</div>
                        {art.category && <div className="text-xs text-slate-500 mt-1">{art.category}</div>}
                      </div>
                      <Badge variant={getStatusBadge(art.status).variant}>{getStatusBadge(art.status).label}</Badge>
                    </div>
                    <div className="whitespace-pre-wrap leading-7 text-slate-800 dark:text-slate-200">
                      {art.content}
                    </div>
                    <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} gap-2`}>
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
                    </div>
                  </div>
                );
              })()}
            </DialogContent>
          </Dialog>

          {/* Articles Management Tab */}
          <TabsContent value="articles" className="space-y-6">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-4'}`}>
                <Input
                  placeholder={currentLanguage === 'ar' ? 'البحث في المقالات...' : 'Rechercher des articles...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <Button variant="outline" size="sm">
                  <Filter className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {currentLanguage === 'ar' ? 'تصفية' : 'Filtrer'}
                </Button>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {currentLanguage === 'ar' ? 'مقال جديد' : 'Nouvel Article'}
              </Button>
            </div>

            <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-0 shadow-xl">
              <CardHeader>
                <CardTitle>{currentLanguage === 'ar' ? 'إدارة المقالات' : 'Gestion des Articles'}</CardTitle>
                <CardDescription>
                  {currentLanguage === 'ar' ? 'إدارة جميع المقالات والمحتوى' : 'Gérez tous vos articles et contenus'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading && <div className="text-sm text-slate-500">{currentLanguage === 'ar' ? 'جاري التحميل...' : 'Chargement...'}</div>}
                  {articles
                    .filter(a => !searchTerm || a.title.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((article) => (
                    <div key={article.id} className="flex items-center justify-between p-4 border-0 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-slate-700 dark:hover:to-blue-900/20 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] bg-white dark:bg-slate-800/50 shadow-md mb-3">
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
                          <p className="text-sm text-slate-600 dark:text-slate-400">{article.category} • {article.author}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-500">
                            {currentLanguage === 'ar' ? 'آخر تعديل:' : 'Modifié:'} {article.lastModified}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStatusBadge(article.status).variant}>
                          {getStatusBadge(article.status).label}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => setPreviewId(article.id)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {article.status === 'submitted' && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => approveArticle(article.id)}>
                              {currentLanguage === 'ar' ? 'نشر' : 'Publier'}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => rejectArticle(article.id)}>
                              {currentLanguage === 'ar' ? 'رفض' : 'Rejeter'}
                            </Button>
                          </>
                        )}
                        <Button variant="outline" size="sm" onClick={() => openEdit(article)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setConfirmDeleteId(article.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        {article.status === 'rejected' && (
                          <Badge variant="destructive">{currentLanguage === 'ar' ? 'مرفوض' : 'Rejeté'}</Badge>
                        )}
                        {article.status === 'published' && (
                          <Badge>{currentLanguage === 'ar' ? 'منشور' : 'Publié'}</Badge>
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
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-1">{currentLanguage === 'ar' ? 'العنوان' : 'Titre'}</label>
                    <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">{currentLanguage === 'ar' ? 'المحتوى' : 'Contenu'}</label>
                    <textarea className="w-full h-60 p-3 border rounded-md" value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                  </div>
                  {editError && <p className="text-sm text-red-600">{editError}</p>}
                  <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} gap-2`}>
                    <Button variant="outline" onClick={() => setEditingId(null)}>{currentLanguage === 'ar' ? 'إلغاء' : 'Annuler'}</Button>
                    <Button className="bg-blue-600 hover:bg-blue-700" disabled={savingEdit} onClick={saveEdit}>
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
                  <Button className="bg-red-600 hover:bg-red-700" onClick={async () => { const id = confirmDeleteId!; setConfirmDeleteId(null); await deleteArticle(id); }}>
                    {currentLanguage === 'ar' ? 'حذف' : 'Supprimer'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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
        </Tabs>
      </div>
    </div>
  );
};

export default EditorDashboard;
