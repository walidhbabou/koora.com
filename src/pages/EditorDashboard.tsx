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
  Camera,
  Lock,
  Save,
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
import AuthorProfileTab from './author/AuthorProfileTab';
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

const EditorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
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

  // New Article (Editor) state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategoryId, setNewCategoryId] = useState<number | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);
  const [categories, setCategories] = useState<{id:number,name:string,name_ar:string}[]>([]);
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

  // Profile editing state
  const [myProfile, setMyProfile] = useState<Record<string, any> | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

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

  useEffect(() => {
    fetchArticles();
  }, []);

  // Refetch when page changes on Articles tab
  useEffect(() => {
    if (activeTab === 'articles') {
      fetchArticles();
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
  useEffect(() => { fetchCategories(); }, []);

  useEffect(() => {
    const loadProfile = async () => {
      if (activeTab !== 'profile' || !user?.id) return;
      setLoadingProfile(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, email, name, first_name, last_name, role, status, created_at, avatar_url')
          .eq('id', user.id)
          .maybeSingle();
        if (!error && data) {
          setMyProfile(data);
          setProfileForm({
            name: data.name || '',
            firstName: data.first_name || (data as any).firstName || '',
            lastName: data.last_name || (data as any).lastName || '',
            email: data.email || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
        } else {
          const minimal = {
            id: user.id,
            email: user.email,
            name: user.name ?? [user.firstName, user.lastName].filter(Boolean).join(' '),
            first_name: user.firstName ?? null,
            last_name: user.lastName ?? null,
            role: (user as any).role,
            status: (user as any).status,
            avatar_url: null as string | null,
          };
          const { data: inserted, error: upErr } = await supabase
            .from('users')
            .upsert(minimal, { onConflict: 'id' })
            .select('id, email, name, first_name, last_name, role, status, created_at, avatar_url')
            .single();
          if (!upErr && inserted) {
            setMyProfile(inserted);
            setProfileForm({
              name: inserted.name || '',
              firstName: inserted.first_name || '',
              lastName: inserted.last_name || '',
              email: inserted.email || '',
              currentPassword: '',
              newPassword: '',
              confirmPassword: ''
            });
          }
        }
      } finally {
        setLoadingProfile(false);
      }
    };
    loadProfile();
  }, [activeTab, user?.id]);

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
    setNewImageFile(null);
    setCreateError('');
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
      const imageUrl = await uploadNewImageIfAny();
      const payload: any = {
        title: newTitle,
        content: newContent,
        status: 'published',
        image_url: imageUrl ?? null,
        category_id: newCategoryId,
      };
      console.debug('Editor create news payload (no user_id):', payload);
      const { error } = await supabase.from('news').insert(payload).select();
      if (error) throw error;
      setIsCreateOpen(false);
      resetCreateForm();
      await fetchArticles();
      setActiveTab('articles');
      toast({ title: currentLanguage === 'ar' ? 'تم النشر' : 'Publié', description: currentLanguage === 'ar' ? 'تم إضافة مقال جديد' : 'Nouvel article publié' });
    } catch (e: any) {
      setCreateError(e?.message || (currentLanguage === 'ar' ? 'فشل الإنشاء' : 'Échec de la création'));
    } finally {
      setCreating(false);
    }
  };

  // Profile update functions
  const handleProfileUpdate = async () => {
    setProfileError('');
    setProfileSuccess('');
    setEditingProfile(true);
    
    try {
      if (!user?.id) {
        setProfileError(currentLanguage === 'ar' ? 'جلسة غير صالحة' : 'Session invalide');
        return;
      }

      // Validate password change if requested
      if (profileForm.newPassword) {
        if (profileForm.newPassword !== profileForm.confirmPassword) {
          setProfileError(currentLanguage === 'ar' ? 'كلمات المرور غير متطابقة' : 'Les mots de passe ne correspondent pas');
          return;
        }
        if (profileForm.newPassword.length < 6) {
          setProfileError(currentLanguage === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Le mot de passe doit contenir au moins 6 caractères');
          return;
        }
      }

      let avatarUrl = myProfile?.avatar_url;
      
      // Upload new profile image if provided
      if (profileImageFile) {
        const ext = profileImageFile.name.split('.').pop();
        const filePath = `users/${user.id}/avatar_${Date.now()}.${ext}`;
        const bucket = (import.meta as any).env?.VITE_SUPABASE_AVATAR_BUCKET || 'avatars';
        const { error: upErr } = await supabase
          .storage
          .from(bucket)
          .upload(filePath, profileImageFile, { upsert: true, cacheControl: '3600' });
        if (upErr) {
          const msg = String(upErr.message || '');
          if (msg.toLowerCase().includes('bucket not found')) {
            throw new Error(currentLanguage === 'ar'
              ? 'لم يتم العثور على حاوية الصور "avatars". أنشئها واجعلها عامة أو حدّد VITE_SUPABASE_AVATAR_BUCKET.'
              : "Bucket de stockage 'avatars' introuvable. Créez-le (public) ou définissez VITE_SUPABASE_AVATAR_BUCKET.");
          }
          throw upErr;
        }
        const { data: pub } = supabase.storage.from(bucket).getPublicUrl(filePath);
        avatarUrl = pub?.publicUrl;
      }

      // Update profile information
      const updateData: any = {
        name: profileForm.name,
        first_name: profileForm.firstName,
        last_name: profileForm.lastName,
      };
      
      if (avatarUrl !== myProfile?.avatar_url) {
        updateData.avatar_url = avatarUrl;
      }

      // Try update; if name is immutable (generated), retry without name; if RLS/session issue, use RPC fallback
      let { error: updateErr } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id);
      if (updateErr) {
        const msg = String(updateErr.message || '');
        const immutableName = msg.includes('can only be updated to DEFAULT') || msg.toLowerCase().includes('generated');
        if (immutableName) {
          const { name, ...rest } = updateData;
          const { error: e2 } = await supabase
            .from('users')
            .update(rest)
            .eq('id', user.id);
          if (e2) {
            updateErr = e2;
          } else {
            updateErr = null as any;
          }
        }
      }
      if (updateErr) {
        // RPC fallback when no auth session or RLS blocks
        try {
          const { data: sessionRes } = await supabase.auth.getSession();
          const hasAuthSession = !!sessionRes?.session;
          const msg = String(updateErr.message || '').toLowerCase();
          const rlsViolation = msg.includes('row-level security') || msg.includes('rls');
          if (!hasAuthSession || rlsViolation) {
            const email = myProfile?.email || (user as any)?.email;
            const { error: rpcErr } = await supabase.rpc('app_update_user_profile', {
              p_email: email,
              p_password: profileForm.currentPassword || null,
              p_name: updateData.name ?? null,
              p_first_name: updateData.first_name ?? null,
              p_last_name: updateData.last_name ?? null,
              p_avatar_url: updateData.avatar_url ?? null,
            });
            if (rpcErr) throw rpcErr;
          } else {
            throw updateErr;
          }
        } catch (e: any) {
          const hint = String(e?.message || '').includes('function app_update_user_profile')
            ? (currentLanguage === 'ar' ? 'أنشئ دالة RPC app_update_user_profile في Supabase' : 'Créez la fonction RPC app_update_user_profile dans Supabase')
            : '';
          throw new Error(`${e?.message || updateErr?.message || ''} ${hint}`.trim());
        }
      }

      // Update password if requested
      if (profileForm.newPassword) {
        const { data: sessionRes } = await supabase.auth.getSession();
        const hasAuthSession = !!sessionRes?.session;
        if (hasAuthSession) {
          const { error: pwErr } = await supabase.auth.updateUser({ password: profileForm.newPassword });
          if (pwErr) throw pwErr;
        } else {
          const email = myProfile?.email || (user as any)?.email;
          const { error: pwRpcErr } = await supabase.rpc('app_change_password', {
            p_email: email,
            p_current_password: profileForm.currentPassword,
            p_new_password: profileForm.newPassword,
          });
          if (pwRpcErr) throw pwRpcErr;
        }
      }

      setProfileSuccess(currentLanguage === 'ar' ? 'تم تحديث الملف الشخصي بنجاح' : 'Profil mis à jour avec succès');
      setProfileForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      setProfileImageFile(null);
      
      // Refresh profile data
      if (activeTab === 'profile') {
        const { data } = await supabase
          .from('users')
          .select('id, email, name, first_name, last_name, role, status, created_at, avatar_url')
          .eq('id', user.id)
          .maybeSingle();
        if (data) setMyProfile(data);
      }
      
    } catch (e: any) {
      setProfileError(e?.message || (currentLanguage === 'ar' ? 'فشل في تحديث الملف الشخصي' : 'Échec de mise à jour du profil'));
    } finally {
      setEditingProfile(false);
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
            <EditorOverviewTab articles={articles} currentLanguage={currentLanguage} isRTL={isRTL} />
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
                    <div
                      className="prose max-w-none leading-7 text-slate-800 dark:text-slate-200"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(art.content) }}
                    />
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
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{currentLanguage === 'ar' ? 'مقال جديد' : 'Nouvel Article'}</DialogTitle>
                  <DialogDescription>
                    {currentLanguage === 'ar' ? 'أنشئ مقالك وانشره مباشرة' : 'Créez votre article et publiez-le immédiatement'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-1">{currentLanguage === 'ar' ? 'العنوان' : 'Titre'}</label>
                    <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">{currentLanguage === 'ar' ? 'الفئة' : 'Catégorie'}</label>
                    <select
                      value={newCategoryId ?? ''}
                      onChange={(e) => setNewCategoryId(e.target.value ? Number(e.target.value) : null)}
                      className="w-full border rounded-md p-2 bg-white"
                    >
                      <option value="">{currentLanguage === 'ar' ? 'اختر فئة' : 'Choisir une catégorie'}</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{currentLanguage === 'ar' ? (c.name_ar || c.name) : c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">{currentLanguage === 'ar' ? 'الصورة' : 'Image'}</label>
                    <input type="file" accept="image/*" onChange={(e) => setNewImageFile(e.target.files?.[0] || null)} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">{currentLanguage === 'ar' ? 'المحتوى' : 'Contenu'}</label>
                    <div className="border rounded-md">
                      <ReactQuill
                        ref={newQuillRef as any}
                        theme="snow"
                        value={newContent}
                        onChange={setNewContent}
                        placeholder={currentLanguage === 'ar' ? 'اكتب المحتوى هنا...' : 'Écrivez le contenu ici...'}
                        modules={newModules}
                        className={isRTL ? 'rtl' : 'ltr'}
                      />
                    </div>
                  </div>
                  {createError && <p className="text-sm text-red-600">{createError}</p>}
                  <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} gap-2`}>
                    <Button variant="outline" onClick={() => { setIsCreateOpen(false); }}>{currentLanguage === 'ar' ? 'إلغاء' : 'Annuler'}</Button>
                    <Button className="bg-blue-600 hover:bg-blue-700" disabled={creating} onClick={handleCreate}>
                      {creating ? (currentLanguage === 'ar' ? 'نشر...' : 'Publication...') : (currentLanguage === 'ar' ? 'نشر' : 'Publier')}
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

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <AuthorProfileTab />
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
              <Card className="hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-blue-900/20 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <span>{currentLanguage === 'ar' ? 'المعلومات الشخصية' : 'Informations Personnelles'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {user?.name?.charAt(0) || 'E'}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{user?.name || 'Éditeur'}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{user?.email}</p>
                        <Badge variant="outline" className="mt-1">{user?.role || 'editor'}</Badge>
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
                        <Edit className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {currentLanguage === 'ar' ? 'مقالات معدلة' : 'Articles édités'}: {articles.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Editor Settings */}
              <Card className="hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-white to-indigo-50 dark:from-slate-800 dark:to-indigo-900/20 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-indigo-600" />
                    <span>{currentLanguage === 'ar' ? 'إعدادات المحرر' : 'Paramètres Éditeur'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                      <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                        {currentLanguage === 'ar' ? 'إحصائيات المحرر' : 'Statistiques Éditeur'}
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{articles.filter(a => a.status === 'published').length}</div>
                          <div className="text-xs text-slate-500">{currentLanguage === 'ar' ? 'منشور' : 'Publiés'}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{articles.filter(a => a.status === 'submitted').length}</div>
                          <div className="text-xs text-slate-500">{currentLanguage === 'ar' ? 'قيد المراجعة' : 'En attente'}</div>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      {currentLanguage === 'ar' ? 'تعديل الملف الشخصي' : 'Modifier le Profil'}
                    </Button>
                    <Button variant="outline" className="w-full">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      {currentLanguage === 'ar' ? 'إعدادات المراجعة' : 'Paramètres de Révision'}
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

export default EditorDashboard;
