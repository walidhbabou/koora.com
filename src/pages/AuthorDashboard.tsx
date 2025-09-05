import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Settings,
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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import AuthorProfileTab from './author/AuthorProfileTab';
import AuthorOverviewTab from './author/AuthorOverviewTab';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DOMPurify from 'dompurify';

// Helper to build a public URL to an article; adjust the path to match your router
const getPublicArticleUrl = (id: string) => `${window.location.origin}/news/${id}`;

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
  const { currentLanguage, isRTL, direction } = useLanguage();
  const { toast } = useToast();

  // Quill refs for custom handlers
  const newQuillRef = useRef<ReactQuill | null>(null);
  const editQuillRef = useRef<ReactQuill | null>(null);
  const writingQuillRef = useRef<ReactQuill | null>(null);

  // Insert a simple HTML table via clipboard API
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
        ['clean', 'table'],
      ],
      handlers: {
        table: () => {
          const editor: any = ref.current?.getEditor?.();
          if (!editor) return;
          const range = editor.getSelection(true) || { index: editor.getLength(), length: 0 };
          const rtlStyle = isRTL ? 'direction:rtl;text-align:right;' : '';
          const tableHtml = `
            <table border="1" style="border-collapse:collapse;width:100%;${rtlStyle}">
              <thead>
                <tr>
                  <th>${currentLanguage === 'ar' ? 'عمود 1' : 'Col 1'}</th>
                  <th>${currentLanguage === 'ar' ? 'عمود 2' : 'Col 2'}</th>
                  <th>${currentLanguage === 'ar' ? 'عمود 3' : 'Col 3'}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${currentLanguage === 'ar' ? 'نص' : 'Texte'}</td>
                  <td>${currentLanguage === 'ar' ? 'نص' : 'Texte'}</td>
                  <td>${currentLanguage === 'ar' ? 'نص' : 'Texte'}</td>
                </tr>
              </tbody>
            </table>`;
          editor.clipboard.dangerouslyPasteHTML(range.index, tableHtml);
          editor.setSelection(range.index + 1, 0);
        },
      },
    },
  });
  const newModules = useMemo(() => buildModules(newQuillRef), [isRTL, currentLanguage]);
  const editModules = useMemo(() => buildModules(editQuillRef), [isRTL, currentLanguage]);
  const writingModules = useMemo(() => buildModules(writingQuillRef), [isRTL, currentLanguage]);
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
  const [submittingWriting, setSubmittingWriting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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

  // Publish to public news and provide a shareable link
  const shareArticle = async (article: Article) => {
    try {
      const now = new Date().toISOString();
      const idValue: any = !isNaN(Number(article.id)) && String(article.id).trim() !== '' ? Number(article.id) : article.id;
      const category_id = (articles.find(a => a.id === article.id) as any)?.category_id
        ?? categories.find(c => c.name === article.category || c.name_ar === article.category)?.id
        ?? null;
      const payload: any = {
        id: idValue,
        title: (article as any).title_fr ?? article.title ?? '',
        title_ar: (article as any).title_ar ?? article.title ?? '',
        content: DOMPurify.sanitize(((article as any).content_fr ?? article.content ?? '')),
        content_ar: DOMPurify.sanitize(((article as any).content_ar ?? article.content ?? '')),
        status: 'published',
        image_url: (article as any).imageUrl ?? (article as any).image_url ?? null,
        category_id,
        // Do NOT send user_id to satisfy RLS WITH CHECK (user_id = auth.uid()) via column default
        // Let database default set user_id = auth.uid()
        created_at: (article as any).created_at ?? now,
        updated_at: now,
      };
      // Debug payload (without sensitive fields) to help diagnose RLS issues if any persist
      console.debug('shareArticle upsert payload (no user_id):', { ...payload, user_id: undefined });
      const { data, error: upsertErr } = await supabase
        .from('news')
        .upsert(payload, { onConflict: 'id' })
        .select();
      if (upsertErr) throw upsertErr;
      if (!data || data.length === 0) {
        throw new Error(currentLanguage === 'ar'
          ? 'لم يتم إدراج السجل (قد تمنع سياسات RLS العملية)'
          : "Aucun enregistrement renvoyé (les politiques RLS peuvent bloquer l'opération)");
      }

      // Optionally reflect status locally
      if (article.status !== 'published') {
        try { await updateStatus(article.id, 'published'); } catch {}
      }

      const url = getPublicArticleUrl(String(article.id));
      if ((navigator as any).share) {
        try { await (navigator as any).share({ title: article.title, url }); } catch {}
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: currentLanguage === 'ar' ? 'تم نسخ الرابط' : 'Lien copié', description: url });
      }
      toast({
        title: currentLanguage === 'ar' ? 'تم النشر والمشاركة' : 'Publication partagée',
        description: url,
      });
    } catch (e: any) {
      console.error('Share upsert error:', e);
      toast({
        title: currentLanguage === 'ar' ? 'فشل المشاركة' : 'Échec du partage',
        description: `${e?.code ? `[${e.code}] ` : ''}${e?.message || (currentLanguage === 'ar' ? 'تحقق من الاتصال والصلاحيات' : 'Vérifiez la connexion et les permissions')}`,
        variant: 'destructive',
      });
    }
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
    if (!user?.id || !editingId) return;
    setEditError('');
    if (!editTitle || !editContent) {
      setEditError(currentLanguage === 'ar' ? 'العنوان والمحتوى إجباريان' : 'Titre et contenu requis');
      return;
    }
    if (!editCategoryId) {
      setEditError(currentLanguage === 'ar' ? 'اختر الفئة' : 'Choisissez une catégorie');
      return;
    }
    setSavingEdit(true);
    try {
      const { error } = await supabase
        .from('news_submissions')
        .update({ title: editTitle, content: editContent, category_id: editCategoryId })
        .eq('id', Number(editingId))
        .eq('user_id', user.id);
      if (error) throw error;
      setEditingId(null);
      await fetchArticles();
      toast({ title: currentLanguage === 'ar' ? 'تم الحفظ' : 'Enregistré', description: currentLanguage === 'ar' ? 'تم تحديث المقال' : 'Article mis à jour' });
    } catch (e: any) {
      setEditError(e?.message || (currentLanguage === 'ar' ? 'فشل الحفظ' : "Échec de l'enregistrement"));
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete a draft/rejected submission
  const deleteSubmission = async (id: string) => {
    try {
      const { data, error } = await supabase
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

  // Load full profile when Profile tab is active
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
        const { error: upErr } = await supabase.storage
          .from('avatars')
          .upload(filePath, profileImageFile, { upsert: false });
        if (upErr) {
          if ((upErr as any)?.message?.toLowerCase?.().includes('bucket') && (upErr as any)?.message?.toLowerCase?.().includes('not found')) {
            setProfileError(currentLanguage === 'ar' ? 'حاوية الصور غير موجودة: avatars' : "Bucket d'avatars introuvable: avatars");
            throw upErr;
          }
          throw upErr;
        }
        const { data: pub } = supabase.storage.from('avatars').getPublicUrl(filePath);
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

      // Attempt update, retry without name if the DB forbids updating it
      let updateErr: any | null = null;
      const doUpdate = async (payload: any) => supabase
        .from('users')
        .update(payload)
        .eq('id', user.id);

      {
        const { error } = await doUpdate(updateData);
        updateErr = error;
      }
      if (updateErr) {
        const msg = String(updateErr.message || '').toLowerCase();
        if (msg.includes("column") && msg.includes("name") && msg.includes("default")) {
          const { name, ...withoutName } = updateData;
          const { error: retryErr } = await doUpdate(withoutName);
          if (retryErr) throw retryErr;
        } else {
          throw updateErr;
        }
      }

      // Update password if requested
      if (profileForm.newPassword) {
        const { error: pwErr } = await supabase.auth.updateUser({
          password: profileForm.newPassword
        });
        if (pwErr) throw pwErr;
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

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 ${isRTL ? 'rtl' : 'ltr'}`} dir={direction}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
              <div className="p-3 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl shadow-lg transform hover:scale-110 transition-all duration-300">
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
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg">
              {currentLanguage === 'ar' ? 'نظرة عامة' : 'Vue d\'ensemble'}
            </TabsTrigger>
            <TabsTrigger value="articles" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg">
              {currentLanguage === 'ar' ? 'مقالاتي' : 'Mes Articles'}
            </TabsTrigger>
            <TabsTrigger value="writing" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg">
              {currentLanguage === 'ar' ? 'الكتابة' : 'Écriture'}
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg">
              {currentLanguage === 'ar' ? 'الملف الشخصي' : 'Profil'}
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <AuthorProfileTab />
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <AuthorOverviewTab articles={articles} />
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
                      <div className="border rounded-md">
                        <ReactQuill
                          ref={newQuillRef}
                          theme="snow"
                          value={newContent}
                          onChange={setNewContent}
                          placeholder={currentLanguage === 'ar' ? 'اكتب المحتوى هنا...' : 'Écrivez le contenu ici...'}
                          modules={newModules}
                          className={isRTL ? 'rtl' : 'ltr'}
                        />
                      </div>
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => shareArticle(article)}
                        >
                          {currentLanguage === 'ar' ? 'مشاركة' : 'Partager'}
                        </Button>
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
                    <div className="border rounded-md">
                      <ReactQuill
                        ref={editQuillRef}
                        theme="snow"
                        value={editContent}
                        onChange={setEditContent}
                        placeholder={currentLanguage === 'ar' ? 'اكتب المحتوى هنا...' : 'Écrivez le contenu ici...'}
                        modules={editModules}
                        className={isRTL ? 'rtl' : 'ltr'}
                      />
                    </div>
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
                    
                    <div className="border rounded-md">
                      <ReactQuill
                        ref={writingQuillRef}
                        theme="snow"
                        value={writingContent}
                        onChange={setWritingContent}
                        placeholder={currentLanguage === 'ar' ? 'ابدأ الكتابة هنا...' : 'Commencez à écrire ici...'}
                        modules={writingModules}
                        className={isRTL ? 'rtl' : 'ltr'}
                      />
                    </div>
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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className={`flex ${isRTL ? 'space-x-reverse' : ''} space-x-2 flex-wrap`}>
                        <Button variant="outline" size="sm" disabled={savingDraft} onClick={handleSaveDraftWriting}>
                          {savingDraft ? (currentLanguage === 'ar' ? 'حفظ...' : 'Enregistrement...') : (currentLanguage === 'ar' ? 'حفظ كمسودة' : 'Sauvegarder')}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(true)}>
                          {currentLanguage === 'ar' ? 'معاينة' : 'Aperçu'}
                        </Button>
                      </div>
                      <Button className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto" disabled={submittingWriting} onClick={handleSubmitWriting}>
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
                    <div
                      className="prose dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(writingContent || (currentLanguage === 'ar' ? 'لا يوجد محتوى' : 'Pas de contenu')) }}
                    />
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

        </Tabs>
      </div>
    </div>
  );
};

export default AuthorDashboard;
