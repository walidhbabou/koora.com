import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Newspaper, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  BarChart3, 
  Calendar,
  TrendingUp,
  UserCheck,
  Shield,
  Settings,
  LogOut,
  Search,
  Filter,
  MoreVertical,
  Upload,
  Image
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
import { useTranslation } from '../hooks/useTranslation';
import '../styles/admin-dashboard.css';

interface News {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  date: string;
  status: 'published' | 'draft' | 'archived';
  imageUrl?: string;
  imageFile?: File;
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
  const [activeTab, setActiveTab] = useState('overview');
  const [news, setNews] = useState<News[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isCreateNewsOpen, setIsCreateNewsOpen] = useState(false);
  const [isEditNewsOpen, setIsEditNewsOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  useEffect(() => {
    setNews([
      {
        id: '1',
        title: currentLanguage === 'ar' ? 'انتقال كبير في الدوري الإنجليزي' : 'Transfert majeur en Premier League',
        content: currentLanguage === 'ar' ? 'تم الإعلان عن انتقال قياسي...' : 'Un transfert record a été annoncé...',
        category: currentLanguage === 'ar' ? 'انتقالات' : 'Transfers',
        author: 'Admin',
        date: '2024-01-15',
        status: 'published',
        imageUrl: '/placeholder.svg'
      },
      {
        id: '2',
        title: currentLanguage === 'ar' ? 'ملعب جديد لمانشستر سيتي' : 'Nouveau stade pour Manchester City',
        content: currentLanguage === 'ar' ? 'النادي يعلن عن البناء...' : 'Le club annonce la construction...',
        category: currentLanguage === 'ar' ? 'بنية تحتية' : 'Infrastructure',
        author: 'Admin',
        date: '2024-01-14',
        status: 'draft',
        imageUrl: '/placeholder.svg'
      }
    ]);

    setUsers([
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin',
        status: 'active',
        joinDate: '2023-01-01',
        lastLogin: '2024-01-15',
        avatar: '/placeholder.svg'
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'editor',
        status: 'active',
        joinDate: '2023-02-01',
        lastLogin: '2024-01-14',
        avatar: '/placeholder.svg'
      },
      {
        id: '3',
        name: 'Ahmed Hassan',
        email: 'ahmed@example.com',
        role: 'author',
        status: 'active',
        joinDate: '2023-03-15',
        lastLogin: '2024-01-13',
        avatar: '/placeholder.svg'
      },
      {
        id: '4',
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        role: 'moderator',
        status: 'active',
        joinDate: '2023-04-10',
        lastLogin: '2024-01-12',
        avatar: '/placeholder.svg'
      }
    ]);
  }, [currentLanguage]);

  const stats = [
    { 
      title: currentLanguage === 'ar' ? 'إجمالي المستخدمين' : 'Total Users', 
      value: users.length, 
      icon: Users, 
      change: '+12%', 
      color: 'text-blue-600' 
    },
    { 
      title: currentLanguage === 'ar' ? 'الأخبار المنشورة' : 'Published News', 
      value: news.filter(n => n.status === 'published').length, 
      icon: Newspaper, 
      change: '+5%', 
      color: 'text-green-600' 
    },
    { 
      title: currentLanguage === 'ar' ? 'المستخدمين النشطين' : 'Active Users', 
      value: users.filter(u => u.status === 'active').length, 
      icon: UserCheck, 
      change: '+8%', 
      color: 'text-purple-600' 
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
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-4'}`}>
              <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg">
                  <Shield className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {currentLanguage === 'ar' ? 'لوحة تحكم المدير' : 'Admin Dashboard'}
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {currentLanguage === 'ar' ? 'إدارة المحتوى والمستخدمين' : 'Gestion du contenu et des utilisateurs'}
                  </p>
                </div>
              </div>
            </div>
            <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-4'}`}>
              <Button variant="outline" size="sm">
                <Settings className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {currentLanguage === 'ar' ? 'الإعدادات' : 'Paramètres'}
              </Button>
              <Button variant="outline" size="sm">
                <LogOut className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {currentLanguage === 'ar' ? 'تسجيل الخروج' : 'Déconnexion'}
              </Button>
            </div>
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
          <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-900 dark:data-[state=active]:bg-teal-900 dark:data-[state=active]:text-teal-100">
              {currentLanguage === 'ar' ? 'نظرة عامة' : 'Vue d\'ensemble'}
            </TabsTrigger>
            <TabsTrigger value="news" className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-900 dark:data-[state=active]:bg-teal-900 dark:data-[state=active]:text-teal-100">
              {currentLanguage === 'ar' ? 'إدارة الأخبار' : 'Gestion News'}
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-900 dark:data-[state=active]:bg-teal-900 dark:data-[state=active]:text-teal-100">
              {currentLanguage === 'ar' ? 'المستخدمين' : 'Utilisateurs'}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-900 dark:data-[state=active]:bg-teal-900 dark:data-[state=active]:text-teal-100">
              {currentLanguage === 'ar' ? 'التحليلات' : 'Analytics'}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Newspaper className="w-5 h-5 text-teal-600" />
                    <span>{currentLanguage === 'ar' ? 'أحدث الأخبار' : 'News Récentes'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {news.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                          <Newspaper className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900 dark:text-white">{item.title}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{item.category}</p>
                        </div>
                        <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>
                          {item.status === 'published' ? (currentLanguage === 'ar' ? 'منشور' : 'published') : 
                           item.status === 'draft' ? (currentLanguage === 'ar' ? 'مسودة' : 'draft') : 
                           currentLanguage === 'ar' ? 'مؤرشف' : 'archived'}
                        </Badge>
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
                  <CreateNewsForm onSubmit={handleCreateNews} />
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
                <div className="space-y-4">
                  {news.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                          <Newspaper className="w-8 h-8 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white">{item.title}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{item.category} • {item.author}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-500">{item.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>
                          {item.status === 'published' ? (currentLanguage === 'ar' ? 'منشور' : 'published') : 
                           item.status === 'draft' ? (currentLanguage === 'ar' ? 'مسودة' : 'draft') : 
                           currentLanguage === 'ar' ? 'مؤرشف' : 'archived'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingNews(item);
                            setIsEditNewsOpen(true);
                          }}
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
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-4'}`}>
                <Input
                  placeholder={currentLanguage === 'ar' ? 'البحث في المستخدمين...' : 'Rechercher des utilisateurs...'}
                  className="w-64"
                />
                <Button variant="outline" size="sm">
                  <Filter className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {currentLanguage === 'ar' ? 'تصفية' : 'Filtrer'}
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{currentLanguage === 'ar' ? 'إدارة المستخدمين' : 'Gestion des Utilisateurs'}</CardTitle>
                <CardDescription>
                  {currentLanguage === 'ar' ? 'إدارة جميع مستخدمي المنصة' : 'Gérez tous les utilisateurs de la plateforme'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white">{user.name}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{user.email}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-500">
                            {currentLanguage === 'ar' ? 'مسجل في' : 'Inscrit le'} {user.joinDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role === 'admin' ? (currentLanguage === 'ar' ? 'مدير' : 'admin') : 
                           user.role === 'editor' ? (currentLanguage === 'ar' ? 'محرر' : 'editor') : 
                           user.role === 'author' ? (currentLanguage === 'ar' ? 'كاتب' : 'author') : 
                           user.role === 'moderator' ? (currentLanguage === 'ar' ? 'مشرف' : 'moderator') : 
                           currentLanguage === 'ar' ? 'مستخدم' : 'user'}
                        </Badge>
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                          {user.status === 'active' ? (currentLanguage === 'ar' ? 'نشط' : 'active') : 
                           user.status === 'inactive' ? (currentLanguage === 'ar' ? 'غير نشط' : 'inactive') : 
                           currentLanguage === 'ar' ? 'محظور' : 'banned'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
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
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    status: 'draft',
    imageFile: undefined as File | undefined
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

export default AdminDashboard;
