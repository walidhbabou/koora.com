import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  FileText, 
  MessageSquare, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  TrendingUp,
  Search,
  Filter,
  MoreVertical,
  Upload,
  Image,
  User,
  Mail,
  Globe,
  Settings,
  Crown,
  Database,
  Shield,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/contexts/LanguageContext';
import '../styles/admin-dashboard.css';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProfileTab from './admin/ProfileTab';
import NewsTab from './admin/NewsTab';
import CategoriesTab from './admin/CategoriesTab';
import CommentsTab from './admin/CommentsTab';
import UsersTab from './admin/UsersTab';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DOMPurify from 'dompurify';

interface News {
  id: string;
  title: string;
  content: string;
  category?: string;
  author?: string;
  date?: string;
  status?: 'published' | 'draft' | 'archived';
  imageUrl?: string;
  imageFile?: File;
}

interface CategoryRow {
  id: number;
  name: string;
  name_ar?: string | null;
  description?: string | null;
  created_at?: string | null;
}


interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'author' | 'moderator';
  status: 'active' | 'inactive' | 'banned';
  joinDate: string;
  lastLogin: string;
  avatar?: string;
}

// Types locaux pour éviter les conflits d'import
interface LocalCommentRow {
  id: number;
  content: string;
  user_id: string | null;
  news_id: string | null;
  created_at?: string | null;
}

interface LocalNewsTabCommentRow {
  id: number;
  content: string;
  user_id: string | null;
  news_id: number | null;
  created_at?: string | null;
}

const AdminDashboard: React.FC = () => {
  const { t, currentLanguage, isRTL, direction } = useLanguage();
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  
  // ReactQuill modules
  const quillModules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ script: 'sub' }, { script: 'super' }],
        ['blockquote', 'code-block'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ direction: isRTL ? 'rtl' : 'ltr' }, { align: [] }],
        ['link', 'image'],
        ['clean'],
      ],
    },
  };
  const [activeTab, setActiveTab] = useState('overview');
  const [news, setNews] = useState<News[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [comments, setComments] = useState<LocalCommentRow[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [loadingSelectedNews, setLoadingSelectedNews] = useState(false);
  const [selectedNewsComments, setSelectedNewsComments] = useState<LocalNewsTabCommentRow[]>([]);
  const [loadingSelectedComments, setLoadingSelectedComments] = useState(false);

  const [isCreateNewsOpen, setIsCreateNewsOpen] = useState(false);
  const [isEditNewsOpen, setIsEditNewsOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [creatingNews, setCreatingNews] = useState(false);
  const [newNewsTitle, setNewNewsTitle] = useState('');
  const [newNewsContent, setNewNewsContent] = useState('');
  const [newNewsCategoryId, setNewNewsCategoryId] = useState<number | null>(null);
  const [newNewsChampionId, setNewNewsChampionId] = useState<number | null>(null);
  const [createNewsError, setCreateNewsError] = useState('');
  const [createNewsInfo, setCreateNewsInfo] = useState('');
  const [publishMessage, setPublishMessage] = useState('');
  const [newNewsImageFile, setNewNewsImageFile] = useState<File | null>(null);
  const [champions, setChampions] = useState<{id:number,nom:string,nom_ar:string}[]>([]);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'editor' | 'author' | 'moderator'>('author');
  const [createUserError, setCreateUserError] = useState('');
  const [createUserInfo, setCreateUserInfo] = useState('');
  const [newNewsStatus, setNewNewsStatus] = useState<string>('');
  const [newNewsImageUrl, setNewNewsImageUrl] = useState<string>('');
  const [newNewsCreatedAt, setNewNewsCreatedAt] = useState<string>('');
  const [newNewsUpdatedAt, setNewNewsUpdatedAt] = useState<string>('');
  // Pagination state (10 per page)
  const pageSize = 10;
  const [newsPage, setNewsPage] = useState(1);
  const [newsTotal, setNewsTotal] = useState(0);
  const [loadingNews, setLoadingNews] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);
  const [categoriesPage, setCategoriesPage] = useState(1);
  const [categoriesTotal, setCategoriesTotal] = useState(0);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsTotal, setCommentsTotal] = useState(0);

  // Profile state moved to ProfileTab component

  // Load news from Supabase (paged)
  const fetchNews = async () => {
    setLoadingNews(true);
    try {
      const from = (newsPage - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await supabase
        .from('news')
        .select('id, title, status, created_at, image_url', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);
      if (error) throw error;
      const mapped: News[] = (data || []).map((n: any) => ({
        id: String(n.id),
        title: n.title || '-',
        content: '',
        status: (n.status as any) || 'draft',
        date: n.created_at ? new Date(n.created_at).toISOString().slice(0,10) : '-',
        imageUrl: n.image_url || undefined,
      }));
      setNews(mapped);
      setNewsTotal(count || 0);
    } catch (e) {
      console.error('Failed to load news:', e);
      setNews([]);
      setNewsTotal(0);
    } finally {
      setLoadingNews(false);
    }
  };

  // Users handlers extracted from inline JSX
const submitCreateUser = async () => {
    setCreateUserError('');
    setCreateUserInfo('');
    if (!newUserEmail || !newUserPassword || !newUserName) {
        setCreateUserError(currentLanguage === 'ar' ? 'أدخل البريد وكلمة المرور والاسم' : 'Entrez email, mot de passe et nom');
        return;
    }
    setCreatingUser(true);
    try {
        const { error } = await supabase.rpc('insert_user_with_hashed_password', {
            email: newUserEmail,
            first_name: newUserName,
            last_name: '',
            role: newUserRole,
            status: 'active',
            password: newUserPassword, // Raw password to be hashed in the database
        });
        if (error) {
            console.error('Insert Error:', error);
            setCreateUserError(error.message || (currentLanguage === 'ar' ? 'فشل إنشاء المستخدم' : "Échec de création d'utilisateur"));
            return;
        }
        setCreateUserInfo(currentLanguage === 'ar' ? 'تم إنشاء المستخدم بنجاح' : 'Utilisateur créé avec succès');
        await fetchUsers();
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserName('');
        setNewUserRole('author');
    } catch (err: any) {
        console.error('Unexpected Error:', err);
        setCreateUserError(err.message || (currentLanguage === 'ar' ? 'فشل إنشاء المستخدم' : "Échec de création d'utilisateur"));
    } finally {
        setCreatingUser(false);
    }
};
// Fonction pour hasher le mot de passe avec bcryptjs
const hashPassword = async (password: string): Promise<string> => {
    // Utilisation de bcryptjs pour hasher le mot de passe
    const bcrypt = await import('bcryptjs');
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
};

  const changeUserRole = async (id: string, newRole: string) => {
    try {
      const { error } = await supabase.from('users').update({ role: newRole }).eq('id', id);
      if (error) throw error;
      await fetchUsers();
    } catch (e:any) { console.error(e); }
  };

  const changeUserStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('users').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      await fetchUsers();
    } catch (e:any) { console.error(e); }
  };

  const deleteUser = async (id: string) => {
    if (!window.confirm(currentLanguage === 'ar' ? 'حذف هذا المستخدم؟' : 'Supprimer cet utilisateur ?')) return;
    try {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
      setUsers((prev) => prev.filter((x) => x.id !== id));
    } catch (e:any) { console.error(e); }
  };

  // Load a single news with full content
  const fetchNewsById = async (newsId: string) => {
    setLoadingSelectedNews(true);
    try {
      const { data, error } = await supabase
        .from('news')
        .select('id, title, content, status, created_at, image_url')
        .eq('id', newsId)
        .single();
      if (error) throw error;
      const n = data as any;
      const mapped: News = {
        id: String(n.id),
        title: n.title || '-',
        content: n.content || '',
        status: (n.status as any) || 'draft',
        date: n.created_at ? new Date(n.created_at).toISOString().slice(0,10) : '-',
        imageUrl: n.image_url || undefined,
      };
      setSelectedNews(mapped);
    } catch (e) {
      console.error('Failed to load news by id:', e);
      setSelectedNews(null);
    } finally {
      setLoadingSelectedNews(false);
    }
  };

  // Load comments for a specific news
  const fetchCommentsForNews = async (newsId: string) => {
    setLoadingSelectedComments(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('id, news_id, user_id, content, created_at')
        .eq('news_id', newsId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setSelectedNewsComments((data || []) as LocalNewsTabCommentRow[]);
    } catch (e) {
      console.error('Failed to load comments for news:', e);
      setSelectedNewsComments([]);
    } finally {
      setLoadingSelectedComments(false);
    }
  };

  const openNewsDetails = async (item: News) => {
    await fetchNewsById(item.id);
    await fetchCommentsForNews(item.id);
  };

  const handleDeleteComment = async (commentId: number) => {
    const prev = selectedNewsComments;
    setSelectedNewsComments(prev.filter(c => c.id !== commentId));
    try {
      const { error } = await supabase.rpc('delete_comment', { p_comment_id: commentId });
      if (error) throw error;
    } catch (e: any) {
      console.error('Failed to delete comment:', e);
      // revert
      setSelectedNewsComments(prev);
    }
  };

  // Load categories from Supabase (paged)
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const from = (categoriesPage - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await supabase
        .from('categories')
        .select('id, name, name_ar, description, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);
      if (error) throw error;
      setCategories((data || []) as CategoryRow[]);
      setCategoriesTotal(count || 0);
    } catch (e) {
      console.error('Failed to load categories:', e);
      setCategories([]);
      setCategoriesTotal(0);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Load champions from Supabase
  const fetchChampions = async () => {
    try {
      const { data, error } = await supabase.from('champions').select('id, nom, nom_ar').order('id');
      if (error) throw error;
      setChampions(data || []);
    } catch (e) { console.error('load champions failed', e); }
  };

  // Load comments from Supabase (paged)
  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const from = (commentsPage - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await supabase
        .from('comments')
        .select('id, news_id, user_id, content, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);
      if (error) throw error;
      setComments((data || []).map((c: any) => ({ ...c, news_id: c.news_id ? String(c.news_id) : null })) as LocalCommentRow[]);
      setCommentsTotal(count || 0);
    } catch (e) {
      console.error('Failed to load comments:', e);
      setComments([]);
      setCommentsTotal(0);
    } finally {
      setLoadingComments(false);
    }
  };

  // Load users from Supabase (paged)
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const from = (usersPage - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, name, role, status, last_login, created_at, avatar_url', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);
      if (error) throw error;
      const mapped: User[] = (data || []).map((u: any) => ({
        id: u.id,
        name: u.name || [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email.split('@')[0],
        email: u.email,
        role: u.role,
        status: u.status,
        joinDate: (u.created_at ? new Date(u.created_at).toISOString().slice(0,10) : '-'),
        lastLogin: (u.last_login ? new Date(u.last_login).toISOString().slice(0,19).replace('T',' ') : '-'),
        avatar: u.avatar_url || '/placeholder.svg',
      }));
      setUsers(mapped);
      setUsersTotal(count || 0);
    } catch (e) {
      console.error('Failed to load users:', e);
      setUsers([]);
      setUsersTotal(0);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Profile loading moved to ProfileTab

  useEffect(() => {
    fetchUsers();
    fetchCategories();
    fetchChampions();
    fetchNews();
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch on page changes
  useEffect(() => { fetchNews(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [newsPage]);
  useEffect(() => { fetchUsers(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [usersPage]);
  useEffect(() => { fetchCategories(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [categoriesPage]);
  useEffect(() => { fetchComments(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [commentsPage]);

  // Reset news page when search term changes (client-side filter)
  useEffect(() => { setNewsPage(1); }, [searchTerm]);

  const stats = [
    { 
      title: currentLanguage === 'ar' ? 'إجمالي المستخدمين' : 'Total Users', 
      value: users.length, 
      icon: Users, 
      change: '+12%', 
      color: 'text-blue-600' 
    },
    { 
      title: currentLanguage === 'ar' ? 'إجمالي الأخبار' : 'Total News', 
      value: news.length, 
      icon: FileText, 
      change: '+5%', 
      color: 'text-green-600' 
    },
    { 
      title: currentLanguage === 'ar' ? 'المستخدمين النشطين' : 'Active Users', 
      value: users.filter(u => u.status === 'active').length, 
      icon: User, 
      change: '+8%', 
      color: 'text-purple-600' 
    },
    {
      title: currentLanguage === 'ar' ? 'الأقسام' : 'Categories',
      value: categories.length,
      icon: Calendar,
      change: '+0%',
      color: 'text-emerald-600'
    },
   
  ];

  const handleCreateNews = (newsData: Partial<News>) => {
    const newNews: News = {
      id: Date.now().toString(),
      title: newsData.title || '',
      content: newsData.content || '',
      category: newsData.category || 'General',
      author: 'Admin',
      date: new Date().toISOString().split('T')[0],
      status: 'draft',
      ...newsData
    };
    setNews([newNews, ...news]);
    setIsCreateNewsOpen(false);
  };

  const handleEditNews = async (newsData: any) => {
    if (editingNews) {
      try {
        const { error } = await supabase
          .from('news')
          .update({
            title: newsData.title,
            content: newsData.content,
            status: newsData.status,
            category_id: newsData.categoryId || null,
            champion_id: newsData.championId || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingNews.id);
        if (error) throw error;
        // Mettre à jour l'état local
        setNews(news.map(n => n.id === editingNews.id ? { ...n, ...newsData } : n));
        setEditingNews(null);
        setIsEditNewsOpen(false);
        // Rafraîchir la liste des news
        await fetchNews();
      } catch (e) {
        console.error('Failed to update news:', e);
      }
    }
  };

const handlePublishNews = async (id: string | number) => {
  try {
    console.log('ID passed to handlePublishNews:', id);
    
    // D'abord, vérifier si la news existe
    const newsId = typeof id === 'string' ? parseInt(id, 10) : id;
    console.log('ID converti:', newsId);

    const { data: existingNews, error: checkError } = await supabase
      .from('news')
      .select('id, status')
      .eq('id', newsId)
      .single();

    if (checkError || !existingNews) {
      console.error('News non trouvée:', checkError);
      throw new Error('News non trouvée');
    }

    console.log('News existante:', existingNews);

    // Ensuite, faire la mise à jour
    const { data, error } = await supabase
      .from('news')
      .update({
        status: 'published',
        updated_at: new Date().toISOString(),
      })
      .eq('id', newsId)
      .select();

    console.log('Réponse Supabase:', { data, error });

    if (error) {
      console.error('Erreur Supabase détaillée:', error);
      throw error;
    }

    if (data && data.length === 0) {
      console.warn('Aucune ligne mise à jour - vérifier les politiques RLS');
      
      // Essayer une autre approche
      await testDirectUpdate(newsId);
    }

    console.log('Mise à jour réussie');
    await fetchNews();
    
  } catch (e) {
    console.error('Échec de la publication:', e);
  }
};

// Fonction de test alternative
const testDirectUpdate = async (newsId: number) => {
  try {
    // Essayer avec une requête SQL directe via RPC
    const { error } = await supabase.rpc('update_news_status', {
      p_news_id: newsId,
      p_status: 'published'
    });
    
    if (error) throw error;
    console.log('Mise à jour via RPC réussie');
  } catch (rpcError) {
    console.error('Échec de la mise à jour via RPC:', rpcError);
  }
};
  const handleDeleteNews = (id: string) => {
    setNews(news.filter(n => n.id !== id));
  };

  // Create News submit handler (extracted from inline onClick)
  const handleCreateNewsSubmit = async () => {
    setCreateNewsError('');
    setCreateNewsInfo('');
    if (!newNewsTitle || !newNewsContent) {
      setCreateNewsError(currentLanguage === 'ar' ? 'أدخل العنوان والمحتوى' : 'Entrez le titre et le contenu');
      return;
    }
    setCreatingNews(true);
    try {
      if (!user?.id) {
        setCreateNewsError(currentLanguage === 'ar' ? 'جلسة غير صالحة: المعرّف غير موجود' : 'Session invalide: user id manquant');
        return;
      }
      let imageUrl: string | undefined = undefined;
      // Upload image if provided
      if (newNewsImageFile) {
        const ext = newNewsImageFile.name.split('.').pop();
        const filePath = `${user?.id ?? 'anon'}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase
          .storage
          .from('news-images')
          .upload(filePath, newNewsImageFile, { upsert: false });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from('news-images').getPublicUrl(filePath);
        imageUrl = pub?.publicUrl;
      }

      // Essayer d'abord la fonction RPC create_news
      try {
        const { error } = await supabase.rpc('create_news', {
          p_user_id: user.id,
          p_title: newNewsTitle,
          p_content: newNewsContent,
          p_status: 'draft',
          p_image_url: imageUrl ?? null,
          p_category_id: newNewsCategoryId ?? null,
          p_champion_id: newNewsChampionId ?? null,
        });
        
        if (error) {
          console.error('Supabase RPC error details:', error);
          throw error;
        }
      } catch (rpcErr: any) {
        // Si la fonction RPC n'existe pas ou échoue, utiliser l'insertion directe avec user_id
        console.log('RPC failed, trying direct insert:', rpcErr);
        const { error } = await supabase.from('news').insert({
          title: newNewsTitle,
          content: newNewsContent,
          status: 'draft',
          image_url: imageUrl ?? null,
          category_id: newNewsCategoryId,
          champion_id: newNewsChampionId,
          user_id: user.id, // Inclure explicitement user_id
        }).select();
        
        if (error) {
          console.error('Direct insert error details:', error);
          throw error;
        }
      }
      setCreateNewsInfo(currentLanguage === 'ar' ? 'تم إنشاء الخبر' : 'News créée');
      await fetchNews();
      setIsCreateNewsOpen(false);
      setNewNewsTitle('');
      setNewNewsContent('');
      setNewNewsCategoryId(null);
      setNewNewsChampionId(null);
      setNewNewsImageFile(null);
    } catch (e: any) {
      setCreateNewsError(e.message || (currentLanguage === 'ar' ? 'فشل إنشاء الخبر' : 'Échec de création de la news'));
    } finally {
      setCreatingNews(false);
    }
  };


  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 ${isRTL ? 'rtl' : 'ltr'}`} dir={direction}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-4'}`}>
              <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg transform hover:scale-110 transition-all duration-300">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {currentLanguage === 'ar' ? 'لوحة تحكم المدير' : 'Dashboard Admin'}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card 
              key={stat.title}
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:scale-110 transition-transform duration-300`}>
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
          <TabsList className="grid w-full grid-cols-7 bg-white/90 backdrop-blur-sm dark:bg-slate-900/90 border border-slate-200/50 dark:border-slate-700/50 shadow-lg rounded-xl p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg">
              {currentLanguage === 'ar' ? 'نظرة عامة' : 'Dashboard'}
            </TabsTrigger>
            <TabsTrigger value="news" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg">
              {currentLanguage === 'ar' ? 'إدارة الأخبار' : 'Gestion des News'}
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg">
              {currentLanguage === 'ar' ? 'الأقسام' : 'Catégories'}
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg">
              {currentLanguage === 'ar' ? 'المستخدمين' : 'Utilisateurs'}
            </TabsTrigger>
            <TabsTrigger value="comments" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg">
              {currentLanguage === 'ar' ? 'التعليقات' : 'Commentaires'}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg">
              {currentLanguage === 'ar' ? 'التحليلات' : 'Analytics'}
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg">
              {currentLanguage === 'ar' ? 'الملف الشخصي' : 'Profil'}
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <ProfileTab />
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-blue-900/20 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-teal-600" />
                    <span>{currentLanguage === 'ar' ? 'أحدث الأخبار' : 'News Récentes'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {news.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-teal-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900 dark:text-white">{item.title}</h4>
                          {item.date && (
                            <p className="text-sm text-slate-600 dark:text-slate-400">{item.date}</p>
                          )}
                        </div>
                        {item.status && (
                          <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>
                            {item.status === 'published' ? (currentLanguage === 'ar' ? 'منشور' : 'published') : 
                             item.status === 'draft' ? (currentLanguage === 'ar' ? 'مسودة' : 'draft') : 
                             currentLanguage === 'ar' ? 'مؤرشف' : 'archived'}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-teal-600" />
                    <span>{currentLanguage === 'ar' ? 'المستخدمين النشطين' : 'Utilisateurs Actifs'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.slice(0, 3).map((user) => (
                      <div key={user.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900 dark:text-white">{user.name}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{user.role}</p>
                        </div>
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                          {user.status === 'active' ? (currentLanguage === 'ar' ? 'نشط' : 'active') : 
                           user.status === 'inactive' ? (currentLanguage === 'ar' ? 'غير نشط' : 'inactive') : 
                           currentLanguage === 'ar' ? 'محظور' : 'banned'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* News Management Tab */}
          <TabsContent value="news" className="space-y-6">
            <NewsTab
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              isCreateNewsOpen={isCreateNewsOpen}
              onChangeCreateNewsOpen={setIsCreateNewsOpen}
              newNewsTitle={newNewsTitle}
              setNewNewsTitle={setNewNewsTitle}
              newNewsContent={newNewsContent}
              setNewNewsContent={setNewNewsContent}
              newNewsCategoryId={newNewsCategoryId}
              setNewNewsCategoryId={setNewNewsCategoryId}
              newNewsChampionId={newNewsChampionId}
              setNewNewsChampionId={setNewNewsChampionId}
              newNewsImageFile={newNewsImageFile}
              setNewNewsImageFile={setNewNewsImageFile}
              newNewsStatus={newNewsStatus}
              setNewNewsStatus={setNewNewsStatus}
              newNewsImageUrl={newNewsImageUrl}
              setNewNewsImageUrl={setNewNewsImageUrl}
              newNewsCreatedAt={newNewsCreatedAt}
              setNewNewsCreatedAt={setNewNewsCreatedAt}
              newNewsUpdatedAt={newNewsUpdatedAt}
              setNewNewsUpdatedAt={setNewNewsUpdatedAt}
              categories={categories}
              champions={champions}
              creatingNews={creatingNews}
              createNewsError={createNewsError}
              createNewsInfo={createNewsInfo}
              onCreateNewsSubmit={handleCreateNewsSubmit}
              news={news}
              loadingNews={loadingNews}
              newsPage={newsPage}
              newsTotal={newsTotal}
              pageSize={pageSize}
              onPrevPage={() => setNewsPage(p => Math.max(1, p - 1))}
              onNextPage={() => setNewsPage(p => p + 1)}
              onEditNews={async (item) => {
                setLoadingSelectedNews(true);
                try {
                  const { data, error } = await supabase
                    .from('news')
                    .select('id, title, title_ar, content, content_ar, status, image_url, category_id, champion_id, created_at, updated_at')
                    .eq('id', item.id)
                    .single();
                  if (error) throw error;
                  setEditingNews({
                    id: String(data.id),
                    title: data.title || '',
                    titleAr: data.title_ar || '',
                    content: data.content || '',
                    contentAr: data.content_ar || '',
                    status: data.status || 'draft',
                    categoryId: data.category_id || '',
                    championId: data.champion_id || null,
                    imageUrl: data.image_url || undefined,
                    createdAt: data.created_at ? new Date(data.created_at).toISOString().slice(0,10) : '',
                    updatedAt: data.updated_at ? new Date(data.updated_at).toISOString().slice(0,10) : '',
                  });
                  setIsEditNewsOpen(true);
                } catch (e) {
                  setEditingNews(null);
                  setIsEditNewsOpen(false);
                } finally {
                  setLoadingSelectedNews(false);
                }
              }}
              onDeleteNews={handleDeleteNews}
              onOpenDetails={openNewsDetails}
              selectedNews={selectedNews}
              loadingSelectedNews={loadingSelectedNews}
              selectedNewsComments={selectedNewsComments as any}
              loadingSelectedComments={loadingSelectedComments}
              onDeleteComment={handleDeleteComment}
            />
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <CategoriesTab
              categories={categories}
              loadingCategories={loadingCategories}
              categoriesPage={categoriesPage}
              categoriesTotal={categoriesTotal}
              pageSize={pageSize}
              onPrevPage={() => setCategoriesPage(p => Math.max(1, p - 1))}
              onNextPage={() => setCategoriesPage(p => p + 1)}
            />
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="space-y-6">
            <CommentsTab
              comments={comments as any}
              loadingComments={loadingComments}
              commentsPage={commentsPage}
              commentsTotal={commentsTotal}
              pageSize={pageSize}
              onPrevPage={() => setCommentsPage(p => Math.max(1, p - 1))}
              onNextPage={() => setCommentsPage(p => p + 1)}
            />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <UsersTab
              isCreateUserOpen={isCreateUserOpen}
              onChangeCreateUserOpen={setIsCreateUserOpen}
              newUserName={newUserName}
              setNewUserName={setNewUserName}
              newUserEmail={newUserEmail}
              setNewUserEmail={setNewUserEmail}
              newUserPassword={newUserPassword}
              setNewUserPassword={setNewUserPassword}
              newUserRole={newUserRole}
              setNewUserRole={setNewUserRole}
              creatingUser={creatingUser}
              createUserError={createUserError}
              createUserInfo={createUserInfo}
              onSubmitCreateUser={submitCreateUser}
              users={users}
              loadingUsers={loadingUsers}
              onChangeUserRole={changeUserRole}
              onChangeUserStatus={changeUserStatus}
              onDeleteUser={deleteUser}
              usersPage={usersPage}
              usersTotal={usersTotal}
              pageSize={pageSize}
              onPrevPage={() => setUsersPage(p => Math.max(1, p - 1))}
              onNextPage={() => setUsersPage(p => p + 1)}
            />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle>{currentLanguage === 'ar' ? 'إحصائيات الأخبار' : 'Statistiques des News'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {currentLanguage === 'ar' ? 'منشورة' : 'Publiées'}
                      </span>
                      <span className="font-semibold text-green-600">
                        {news.filter(n => n.status === 'published').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {currentLanguage === 'ar' ? 'مسودات' : 'Brouillons'}
                      </span>
                      <span className="font-semibold text-yellow-600">
                        {news.filter(n => n.status === 'draft').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {currentLanguage === 'ar' ? 'مؤرشفة' : 'Archivées'}
                      </span>
                      <span className="font-semibold text-gray-600">
                        {news.filter(n => n.status === 'archived').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle>{currentLanguage === 'ar' ? 'إحصائيات المستخدمين' : 'Statistiques des Utilisateurs'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {currentLanguage === 'ar' ? 'المجموع' : 'Total'}
                      </span>
                      <span className="font-semibold text-blue-600">{users.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {currentLanguage === 'ar' ? 'مديرين' : 'Admins'}
                      </span>
                      <span className="font-semibold text-purple-600">
                        {users.filter(u => u.role === 'admin').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {currentLanguage === 'ar' ? 'محررين' : 'Éditeurs'}
                      </span>
                      <span className="font-semibold text-green-600">
                        {users.filter(u => u.role === 'editor').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {currentLanguage === 'ar' ? 'كتاب' : 'Auteurs'}
                      </span>
                      <span className="font-semibold text-yellow-600">
                        {users.filter(u => u.role === 'author').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {currentLanguage === 'ar' ? 'مشرفين' : 'Modérateurs'}
                      </span>
                      <span className="font-semibold text-orange-600">
                        {users.filter(u => u.role === 'moderator').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit News Dialog */}
      <Dialog open={isEditNewsOpen && !!editingNews} onOpenChange={setIsEditNewsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{currentLanguage === 'ar' ? 'تعديل الخبر' : 'Modifier la news'}</DialogTitle>
            <DialogDescription>
              {currentLanguage === 'ar' ? 'عدل معلومات الخبر' : 'Modifiez les informations de la news'}
            </DialogDescription>
          </DialogHeader>
          {publishMessage && (
            <div className={`p-3 rounded-md text-sm ${
              publishMessage.includes('نجاح') || publishMessage.includes('succès') 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {publishMessage}
            </div>
          )}
          {editingNews && (
            <div className="flex-1 overflow-y-auto pr-2">
              <EditNewsForm news={editingNews} champions={champions} onSubmit={handleEditNews} onPublish={handlePublishNews} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const CreateNewsForm: React.FC<{ onSubmit: (data: Partial<News>) => void }> = ({ onSubmit }) => {
  const { currentLanguage, isRTL } = useLanguage();
  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    category: string;
    status: News['status'];
    imageFile: File | undefined;
  }>({
    title: '',
    content: '',
    category: 'General',
    status: 'draft',
    imageFile: undefined,
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  
  // ReactQuill modules
  const quillModules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ script: 'sub' }, { script: 'super' }],
        ['blockquote', 'code-block'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ direction: isRTL ? 'rtl' : 'ltr' }, { align: [] }],
        ['link', 'image'],
        ['clean'],
      ],
    },
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, imageFile: file });
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {currentLanguage === 'ar' ? 'العنوان' : 'Titre'}
        </label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder={currentLanguage === 'ar' ? 'عنوان الخبر' : 'Titre de la news'}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {currentLanguage === 'ar' ? 'المحتوى' : 'Contenu'}
        </label>
        <div className="border rounded-md">
          <ReactQuill
            theme="snow"
            value={formData.content}
            onChange={(content) => setFormData({ ...formData, content })}
            placeholder={currentLanguage === 'ar' ? 'محتوى الخبر' : 'Contenu de la news'}
            modules={quillModules}
            className={isRTL ? 'rtl' : 'ltr'}
          />
        </div>
      </div>
      
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {currentLanguage === 'ar' ? 'صورة الخبر' : 'Image de la news'}
        </label>
        <div className="space-y-3">
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="cursor-pointer"
          />
          {imagePreview && (
            <div className="relative w-32 h-32">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg border"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                onClick={() => {
                  setImagePreview('');
                  setFormData({ ...formData, imageFile: undefined });
                }}
              >
                ×
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {currentLanguage === 'ar' ? 'الفئة' : 'Catégorie'}
          </label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="General">{currentLanguage === 'ar' ? 'عام' : 'Général'}</SelectItem>
              <SelectItem value="Transfers">{currentLanguage === 'ar' ? 'انتقالات' : 'Transferts'}</SelectItem>
              <SelectItem value="Matches">{currentLanguage === 'ar' ? 'مباريات' : 'Matchs'}</SelectItem>
              <SelectItem value="Infrastructure">{currentLanguage === 'ar' ? 'بنية تحتية' : 'Infrastructure'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {currentLanguage === 'ar' ? 'الحالة' : 'Statut'}
          </label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">{currentLanguage === 'ar' ? 'مسودة' : 'Brouillon'}</SelectItem>
              <SelectItem value="published">{currentLanguage === 'ar' ? 'منشور' : 'Publié'}</SelectItem>
              <SelectItem value="archived">{currentLanguage === 'ar' ? 'مؤرشف' : 'Archivé'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
          {currentLanguage === 'ar' ? 'إنشاء الخبر' : 'Créer la News'}
        </Button>
      </div>
    </form>
  );
};

const EditNewsForm: React.FC<{ 
  news: any; 
  champions: {id:number,nom:string,nom_ar:string}[];
  onSubmit: (data: Partial<News>) => void;
  onPublish?: (id: string | number) => void; // Change this line
}> = ({ news, champions, onSubmit, onPublish }) => {
  const { currentLanguage, isRTL } = useLanguage();
  const [formData, setFormData] = useState({
    title: news.title,
    content: news.content,
    category: news.category,
    status: news.status,
    championId: news.championId || null
  });
  
  // ReactQuill modules
  const quillModules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ script: 'sub' }, { script: 'super' }],
        ['blockquote', 'code-block'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ direction: isRTL ? 'rtl' : 'ltr' }, { align: [] }],
        ['link', 'image'],
        ['clean'],
      ],
    },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {currentLanguage === 'ar' ? 'العنوان' : 'Titre'}
        </label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder={currentLanguage === 'ar' ? 'عنوان الخبر' : 'Titre de la news'}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {currentLanguage === 'ar' ? 'المحتوى' : 'Contenu'}
        </label>
        <div className="border rounded-md">
          <ReactQuill
            theme="snow"
            value={formData.content}
            onChange={(content) => setFormData({ ...formData, content })}
            placeholder={currentLanguage === 'ar' ? 'محتوى الخبر' : 'Contenu de la news'}
            modules={quillModules}
            className={isRTL ? 'rtl' : 'ltr'}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {currentLanguage === 'ar' ? 'الفئة' : 'Catégorie'}
          </label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="General">{currentLanguage === 'ar' ? 'عام' : 'Général'}</SelectItem>
              <SelectItem value="Transfers">{currentLanguage === 'ar' ? 'انتقالات' : 'Transferts'}</SelectItem>
              <SelectItem value="Matches">{currentLanguage === 'ar' ? 'مباريات' : 'Matchs'}</SelectItem>
              <SelectItem value="Infrastructure">{currentLanguage === 'ar' ? 'بنية تحتية' : 'Infrastructure'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {currentLanguage === 'ar' ? 'الحالة' : 'Statut'}
          </label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">{currentLanguage === 'ar' ? 'مسودة' : 'Brouillon'}</SelectItem>
              <SelectItem value="published">{currentLanguage === 'ar' ? 'منشور' : 'Publié'}</SelectItem>
              <SelectItem value="archived">{currentLanguage === 'ar' ? 'مؤرشف' : 'Archivé'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {currentLanguage === 'ar' ? 'البطولة' : 'Championnat'} <span className="text-red-500">*</span>
          </label>
          <Select 
            value={formData.championId !== null ? String(formData.championId) : undefined} 
            onValueChange={(value) => setFormData({ ...formData, championId: value === 'none' ? null : Number(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder={currentLanguage === 'ar' ? 'اختر البطولة (اختياري)' : 'Choisir un championnat (optionnel)'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{currentLanguage === 'ar' ? 'لا شيء' : 'Aucun'}</SelectItem>
              {champions.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.nom}{c.nom_ar ? ` • ${c.nom_ar}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
        <Button 
          type="button" 
          variant="outline"
          onClick={(e) => {
            e.preventDefault();
            if (onPublish) {
              onPublish(news.id); // Pass the ID instead of form data
            }
          }}
          className="w-full sm:w-auto"
        >
          {currentLanguage === 'ar' ? 'نشر' : 'Publier'}
        </Button>
        <Button type="submit" className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto">
          {currentLanguage === 'ar' ? 'تحديث' : 'Mettre à jour'}
        </Button>
      </div>
    </form>
  );
};

const NewsForm: React.FC<{
  formData: { title: string; content: string; category: string; status: string; imageUrl?: string };
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
  currentLanguage: string;
  isRTL: boolean;
}> = ({ formData, setFormData, onSubmit, isEditing, currentLanguage, isRTL }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {currentLanguage === 'ar' ? 'العنوان' : 'Titre'}
          </label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder={currentLanguage === 'ar' ? 'أدخل العنوان' : 'Entrez le titre'}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {currentLanguage === 'ar' ? 'الفئة' : 'Catégorie'}
          </label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue placeholder={currentLanguage === 'ar' ? 'اختر الفئة' : 'Choisir une catégorie'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Football">{currentLanguage === 'ar' ? 'كرة القدم' : 'Football'}</SelectItem>
              <SelectItem value="Basketball">{currentLanguage === 'ar' ? 'كرة السلة' : 'Basketball'}</SelectItem>
              <SelectItem value="Tennis">{currentLanguage === 'ar' ? 'تنس' : 'Tennis'}</SelectItem>
              <SelectItem value="Transfers">{currentLanguage === 'ar' ? 'انتقالات' : 'Transferts'}</SelectItem>
              <SelectItem value="Matches">{currentLanguage === 'ar' ? 'مباريات' : 'Matchs'}</SelectItem>
              <SelectItem value="Infrastructure">{currentLanguage === 'ar' ? 'بنية تحتية' : 'Infrastructure'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {currentLanguage === 'ar' ? 'المحتوى' : 'Contenu'}
        </label>
        <textarea
          className="w-full h-40 p-3 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder={currentLanguage === 'ar' ? 'أدخل المحتوى' : 'Entrez le contenu'}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {currentLanguage === 'ar' ? 'رابط الصورة' : 'URL de l\'image'}
          </label>
          <Input
            value={formData.imageUrl || ''}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder={currentLanguage === 'ar' ? 'رابط الصورة (اختياري)' : 'URL de l\'image (optionnel)'}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {currentLanguage === 'ar' ? 'الحالة' : 'Statut'}
          </label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">{currentLanguage === 'ar' ? 'مسودة' : 'Brouillon'}</SelectItem>
              <SelectItem value="published">{currentLanguage === 'ar' ? 'منشور' : 'Publié'}</SelectItem>
              <SelectItem value="archived">{currentLanguage === 'ar' ? 'مؤرشف' : 'Archivé'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
          {currentLanguage === 'ar' ? 'تحديث' : 'Mettre à jour'}
        </Button>
      </div>
    </form>
  );
};

export default AdminDashboard;
