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
  Database
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
import { useTranslation } from '../hooks/useTranslation';
import '../styles/admin-dashboard.css';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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

interface CommentRow {
  id: number;
  news_id: number | null;
  user_id: string | null;
  content: string | null;
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

const AdminDashboard: React.FC = () => {
  const { t, currentLanguage, isRTL, direction } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [news, setNews] = useState<News[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [loadingSelectedNews, setLoadingSelectedNews] = useState(false);
  const [selectedNewsComments, setSelectedNewsComments] = useState<CommentRow[]>([]);
  const [loadingSelectedComments, setLoadingSelectedComments] = useState(false);

  const [isCreateNewsOpen, setIsCreateNewsOpen] = useState(false);
  const [isEditNewsOpen, setIsEditNewsOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [creatingNews, setCreatingNews] = useState(false);
  const [newNewsTitle, setNewNewsTitle] = useState('');
  const [newNewsContent, setNewNewsContent] = useState('');
  const [newNewsCategoryId, setNewNewsCategoryId] = useState<number | null>(null);
  const [createNewsError, setCreateNewsError] = useState('');
  const [createNewsInfo, setCreateNewsInfo] = useState('');
  const [newNewsImageFile, setNewNewsImageFile] = useState<File | null>(null);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'editor' | 'author' | 'moderator'>('author');
  const [createUserError, setCreateUserError] = useState('');
  const [createUserInfo, setCreateUserInfo] = useState('');

  // Load news from Supabase
  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('id, title, status, created_at, image_url')
        .order('created_at', { ascending: false });
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
    } catch (e) {
      console.error('Failed to load news:', e);
    }
  };

  // Load a single news with full content
  const fetchNewsById = async (newsId: string) => {
    setLoadingSelectedNews(true);
    try {
      const { data, error } = await supabase
        .from('news')
        .select('id, title, content, status, created_at, image_url')
        .eq('id', Number(newsId))
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
        .eq('news_id', Number(newsId))
        .order('created_at', { ascending: false });
      if (error) throw error;
      setSelectedNewsComments((data || []) as CommentRow[]);
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

  // Load categories from Supabase
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, name_ar, description, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCategories((data || []) as CategoryRow[]);
    } catch (e) {
      console.error('Failed to load categories:', e);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Load comments from Supabase
  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('id, news_id, user_id, content, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setComments((data || []) as CommentRow[]);
    } catch (e) {
      console.error('Failed to load comments:', e);
    } finally {
      setLoadingComments(false);
    }
  };

  // Load users from Supabase
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, name, role, status, last_login, created_at, avatar_url')
        .order('created_at', { ascending: false });
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
    } catch (e) {
      console.error('Failed to load users:', e);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCategories();
    fetchNews();
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    { 
      title: currentLanguage === 'ar' ? 'إجمالي المشاهدات' : 'Total Views', 
      value: '45.2K', 
      icon: Eye, 
      change: '+23%', 
      color: 'text-orange-600' 
    }
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

  const handleEditNews = (newsData: Partial<News>) => {
    if (editingNews) {
      setNews(news.map(n => n.id === editingNews.id ? { ...n, ...newsData } : n));
      setEditingNews(null);
      setIsEditNewsOpen(false);
    }
  };

  const handleDeleteNews = (id: string) => {
    setNews(news.filter(n => n.id !== id));
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
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
              {currentLanguage === 'ar' ? 'نظرة عامة' : 'Vue d\'ensemble'}
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
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-4'}`}>
                <Input
                  placeholder={currentLanguage === 'ar' ? 'البحث في الأخبار...' : 'Rechercher des news...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <Button variant="outline" size="sm">
                  <Filter className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {currentLanguage === 'ar' ? 'تصفية' : 'Filtrer'}
                </Button>
              </div>
              <Dialog open={isCreateNewsOpen} onOpenChange={setIsCreateNewsOpen}>
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
                      <Button variant="outline" onClick={() => setIsCreateNewsOpen(false)}>
                        {currentLanguage === 'ar' ? 'إلغاء' : 'Annuler'}
                      </Button>
                      <Button
                        className="bg-teal-600 hover:bg-teal-700"
                        disabled={creatingNews}
                        onClick={async () => {
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

                            // Use SECURITY DEFINER RPC to bypass RLS with internal role checks
                            const { error } = await supabase.rpc('create_news', {
                              p_user_id: user.id,
                              p_title: newNewsTitle,
                              p_content: newNewsContent,
                              p_status: 'draft',
                              p_image_url: imageUrl ?? null,
                              p_category_id: newNewsCategoryId ?? null,
                            });
                            if (error) throw error;
                            setCreateNewsInfo(currentLanguage === 'ar' ? 'تم إنشاء الخبر' : 'News créée');
                            await fetchNews();
                            setIsCreateNewsOpen(false);
                            setNewNewsTitle('');
                            setNewNewsContent('');
                            setNewNewsCategoryId(null);
                            setNewNewsImageFile(null);
                          } catch (e: any) {
                            setCreateNewsError(e.message || (currentLanguage === 'ar' ? 'فشل إنشاء الخبر' : 'Échec de création de la news'));
                          } finally {
                            setCreatingNews(false);
                          }
                        }}
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
                      .filter(n => !searchTerm || n.title.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.title} className="w-12 h-12 object-cover rounded" />
                          ) : (
                            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center">
                              <Image className="w-5 h-5 text-slate-500" />
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
                            onClick={() => { setEditingNews(item); setIsEditNewsOpen(true); }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteNews(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openNewsDetails(item)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                            <Button variant="outline" size="sm" onClick={() => handleDeleteComment(cm.id)}>
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
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{currentLanguage === 'ar' ? 'الأقسام' : 'Catégories'}</CardTitle>
                <CardDescription>
                  {currentLanguage === 'ar' ? 'قائمة الأقسام من قاعدة البيانات' : 'Liste des catégories depuis la base de données'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingCategories && (
                  <div className="text-sm text-slate-500">{currentLanguage === 'ar' ? 'جاري التحميل...' : 'Chargement...'}</div>
                )}
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {categories.map((c) => (
                    <div key={c.id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{c.name} {c.name_ar ? `• ${c.name_ar}` : ''}</div>
                        {c.description && (
                          <div className="text-sm text-slate-600 dark:text-slate-400">{c.description}</div>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">{c.created_at ? new Date(c.created_at).toISOString().slice(0,10) : '-'}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{currentLanguage === 'ar' ? 'التعليقات' : 'Commentaires'}</CardTitle>
                <CardDescription>
                  {currentLanguage === 'ar' ? 'قائمة التعليقات من قاعدة البيانات' : 'Liste des commentaires depuis la base de données'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingComments && (
                  <div className="text-sm text-slate-500">{currentLanguage === 'ar' ? 'جاري التحميل...' : 'Chargement...'}</div>
                )}
                <div className="space-y-3">
                  {comments.map((cm) => (
                    <div key={cm.id} className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <div className="text-sm text-slate-700 dark:text-slate-300">{cm.content || '-'}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {currentLanguage === 'ar' ? 'خبر' : 'News'}: {cm.news_id ?? '-'} • {currentLanguage === 'ar' ? 'مستخدم' : 'Utilisateur'}: {cm.user_id ?? '-'} • {cm.created_at ? new Date(cm.created_at).toISOString().slice(0,16).replace('T',' ') : '-'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            {/* Top actions row */}
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-4'}`}>
                <Input
                  placeholder={currentLanguage === 'ar' ? 'البحث في المستخدمين...' : 'Rechercher des utilisateurs...'}
                  className="w-64"
                />
                <Button variant="outline" size="sm">
                  <Filter className={`${isRTL ? 'ml-2' : 'mr-2'} w-4 h-4`} />
                  {currentLanguage === 'ar' ? 'تصفية' : 'Filtrer'}
                </Button>
              </div>
              {/* Create User Dialog Trigger */}
              <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-teal-600 hover:bg-teal-700">
                    <Plus className={`${isRTL ? 'ml-2' : 'mr-2'} w-4 h-4`} />
                    {currentLanguage === 'ar' ? 'إنشاء مستخدم' : 'Créer un utilisateur'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{currentLanguage === 'ar' ? 'إنشاء مستخدم جديد' : 'Créer un nouvel utilisateur'}</DialogTitle>
                    <DialogDescription>
                      {currentLanguage === 'ar' ? 'يدعم الإنشاء بواسطة المدير فقط' : 'Disponible pour les administrateurs uniquement'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        {currentLanguage === 'ar' ? 'الاسم' : 'Nom'}
                      </label>
                      <Input value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder={currentLanguage === 'ar' ? 'اسم المستخدم' : "Nom de l'utilisateur"} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        {currentLanguage === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                      </label>
                      <Input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="email@example.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        {currentLanguage === 'ar' ? 'كلمة المرور المؤقتة' : 'Mot de passe temporaire'}
                      </label>
                      <Input type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} placeholder={currentLanguage === 'ar' ? 'كلمة مرور مؤقتة' : 'Mot de passe temporaire'} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        {currentLanguage === 'ar' ? 'الدور' : 'Rôle'}
                      </label>
                      <Select value={newUserRole} onValueChange={(v) => setNewUserRole(v as any)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="author">Author</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {createUserError && (
                      <p className="text-sm text-red-600">{createUserError}</p>
                    )}
                    {createUserInfo && (
                      <p className="text-sm text-emerald-600">{createUserInfo}</p>
                    )}

                    <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} gap-2`}>
                      <Button variant="outline" onClick={() => setIsCreateUserOpen(false)}>
                        {currentLanguage === 'ar' ? 'إلغاء' : 'Annuler'}
                      </Button>
                      <Button
                        className="bg-teal-600 hover:bg-teal-700"
                        disabled={creatingUser}
                        onClick={async () => {
                          setCreateUserError('');
                          setCreateUserInfo('');
                          if (!newUserEmail || !newUserPassword) {
                            setCreateUserError(currentLanguage === 'ar' ? 'أدخل البريد وكلمة المرور' : 'Entrez email et mot de passe');
                            return;
                          }
                          setCreatingUser(true);
                          try {
                            const { error } = await supabase.rpc('register_user', {
                              p_email: newUserEmail,
                              p_password: newUserPassword,
                              p_first_name: newUserName,
                              p_last_name: '',
                              p_role: newUserRole,
                            });
                            if (error) {
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
                            setCreateUserError(err.message || (currentLanguage === 'ar' ? 'فشل إنشاء المستخدم' : "Échec de création d'utilisateur"));
                          } finally {
                            setCreatingUser(false);
                          }
                        }}
                      >
                        {creatingUser ? (currentLanguage === 'ar' ? 'جاري الإنشاء...' : 'Création...') : (currentLanguage === 'ar' ? 'إنشاء' : 'Créer')}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Users list */}
            <Card>
              <CardHeader>
                <CardTitle>{currentLanguage === 'ar' ? 'إدارة المستخدمين' : 'Gestion des Utilisateurs'}</CardTitle>
                <CardDescription>
                  {currentLanguage === 'ar' ? 'إدارة جميع مستخدمي المنصة' : 'Gérez tous les utilisateurs de la plateforme'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingUsers && (
                  <div className="text-sm text-slate-500">{currentLanguage === 'ar' ? 'جاري تحميل المستخدمين...' : 'Chargement des utilisateurs...'}</div>
                )}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{currentLanguage === 'ar' ? 'الاسم' : 'Nom'}</TableHead>
                      <TableHead>{currentLanguage === 'ar' ? 'البريد' : 'Email'}</TableHead>
                      <TableHead className="w-[120px]">{currentLanguage === 'ar' ? 'الدور' : 'Rôle'}</TableHead>
                      <TableHead className="w-[120px]">{currentLanguage === 'ar' ? 'الحالة' : 'Statut'}</TableHead>
                      <TableHead className="w-[140px]">{currentLanguage === 'ar' ? 'مسجل في' : 'Inscrit le'}</TableHead>
                      <TableHead className="w-[160px] text-right">{currentLanguage === 'ar' ? 'إجراءات' : 'Actions'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium flex items-center gap-2">
                          <Avatar className="w-7 h-7">
                            <AvatarImage src={u.avatar} />
                            <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {u.name}
                        </TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Select
                            value={u.role}
                            onValueChange={async (newRole) => {
                              try {
                                const { error } = await supabase.from('users').update({ role: newRole }).eq('id', u.id);
                                if (error) throw error;
                                await fetchUsers();
                              } catch (e:any) { console.error(e); }
                            }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">admin</SelectItem>
                              <SelectItem value="editor">editor</SelectItem>
                              <SelectItem value="author">author</SelectItem>
                              <SelectItem value="moderator">moderator</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={u.status}
                            onValueChange={async (newStatus) => {
                              try {
                                const { error } = await supabase.from('users').update({ status: newStatus }).eq('id', u.id);
                                if (error) throw error;
                                await fetchUsers();
                              } catch (e:any) { console.error(e); }
                            }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">active</SelectItem>
                              <SelectItem value="inactive">inactive</SelectItem>
                              <SelectItem value="banned">banned</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{u.joinDate}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              if (!window.confirm(currentLanguage === 'ar' ? 'حذف هذا المستخدم؟' : 'Supprimer cet utilisateur ?')) return;
                              try {
                                const { error } = await supabase.from('users').delete().eq('id', u.id);
                                if (error) throw error;
                                setUsers((prev) => prev.filter((x) => x.id !== u.id));
                              } catch (e:any) { console.error(e); }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
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
      <Dialog open={isEditNewsOpen} onOpenChange={setIsEditNewsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{currentLanguage === 'ar' ? 'تعديل الخبر' : 'Modifier la news'}</DialogTitle>
            <DialogDescription>
              {currentLanguage === 'ar' ? 'عدل معلومات الخبر' : 'Modifiez les informations de la news'}
            </DialogDescription>
          </DialogHeader>
          {editingNews && (
            <EditNewsForm news={editingNews} onSubmit={handleEditNews} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Form Components
const CreateNewsForm: React.FC<{ onSubmit: (data: Partial<News>) => void }> = ({ onSubmit }) => {
  const { currentLanguage } = useTranslation();
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
        <Textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder={currentLanguage === 'ar' ? 'محتوى الخبر' : 'Contenu de la news'}
          rows={6}
          required
        />
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

const EditNewsForm: React.FC<{ news: News; onSubmit: (data: Partial<News>) => void }> = ({ news, onSubmit }) => {
  const { currentLanguage } = useTranslation();
  const [formData, setFormData] = useState({
    title: news.title,
    content: news.content,
    category: news.category,
    status: news.status
  });

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
        <Textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder={currentLanguage === 'ar' ? 'محتوى الخبر' : 'Contenu de la news'}
          rows={6}
          required
        />
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
