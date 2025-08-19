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
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';

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
  const { user } = useAuth();
  const { currentLanguage, isRTL, direction } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setArticles([
      {
        id: '1',
        title: currentLanguage === 'ar' ? 'تقرير مباراة ريال مدريد' : 'Rapport match Real Madrid',
        content: currentLanguage === 'ar' ? 'تقرير مفصل عن المباراة...' : 'Rapport détaillé du match...',
        category: currentLanguage === 'ar' ? 'تقارير' : 'Rapports',
        date: '2024-01-15',
        status: 'published',
        imageUrl: '/placeholder.svg',
        views: 850
      },
      {
        id: '2',
        title: currentLanguage === 'ar' ? 'مقابلة مع لاعب برشلونة' : 'Interview joueur Barcelone',
        content: currentLanguage === 'ar' ? 'مقابلة حصرية...' : 'Interview exclusive...',
        category: currentLanguage === 'ar' ? 'مقابلات' : 'Interviews',
        date: '2024-01-14',
        status: 'submitted',
        imageUrl: '/placeholder.svg'
      },
      {
        id: '3',
        title: currentLanguage === 'ar' ? 'تحليل تكتيكي للدوري' : 'Analyse tactique championnat',
        content: currentLanguage === 'ar' ? 'تحليل تكتيكي شامل...' : 'Analyse tactique complète...',
        category: currentLanguage === 'ar' ? 'تحليلات' : 'Analyses',
        date: '2024-01-13',
        status: 'draft',
        imageUrl: '/placeholder.svg'
      },
      {
        id: '4',
        title: currentLanguage === 'ar' ? 'أخبار الانتقالات' : 'News transferts',
        content: currentLanguage === 'ar' ? 'آخر أخبار الانتقالات...' : 'Dernières news transferts...',
        category: currentLanguage === 'ar' ? 'انتقالات' : 'Transferts',
        date: '2024-01-12',
        status: 'rejected',
        imageUrl: '/placeholder.svg',
        feedback: currentLanguage === 'ar' ? 'يحتاج إلى مزيد من المصادر' : 'Nécessite plus de sources'
      }
    ]);
  }, [currentLanguage]);

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

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 ${isRTL ? 'rtl' : 'ltr'}`} dir={direction}>
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-4'}`}>
              <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <PenTool className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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
              onClick={() => window.location.href = '/login'}
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
          <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 dark:data-[state=active]:bg-purple-900 dark:data-[state=active]:text-purple-100">
              {currentLanguage === 'ar' ? 'نظرة عامة' : 'Vue d\'ensemble'}
            </TabsTrigger>
            <TabsTrigger value="articles" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 dark:data-[state=active]:bg-purple-900 dark:data-[state=active]:text-purple-100">
              {currentLanguage === 'ar' ? 'مقالاتي' : 'Mes Articles'}
            </TabsTrigger>
            <TabsTrigger value="writing" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 dark:data-[state=active]:bg-purple-900 dark:data-[state=active]:text-purple-100">
              {currentLanguage === 'ar' ? 'الكتابة' : 'Écriture'}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Send className="w-5 h-5 text-blue-600" />
                    <span>{currentLanguage === 'ar' ? 'قيد المراجعة' : 'En Attente de Révision'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {articles.filter(a => a.status === 'submitted').map((article) => (
                      <div key={article.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900 dark:text-white">{article.title}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{article.category}</p>
                        </div>
                        <Badge variant="secondary">
                          {currentLanguage === 'ar' ? 'مرسل' : 'Soumis'}
                        </Badge>
                      </div>
                    ))}
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
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {currentLanguage === 'ar' ? 'مقال جديد' : 'Nouvel Article'}
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{currentLanguage === 'ar' ? 'مقالاتي' : 'Mes Articles'}</CardTitle>
                <CardDescription>
                  {currentLanguage === 'ar' ? 'إدارة جميع مقالاتك ومحتواك' : 'Gérez tous vos articles et contenus'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {articles.map((article) => (
                    <div key={article.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                          <FileText className="w-8 h-8 text-slate-600 dark:text-slate-400" />
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
                        {article.views !== undefined && (
                          <div className="flex items-center text-sm text-slate-500">
                            <Eye className="w-4 h-4 mr-1" />
                            {article.views}
                          </div>
                        )}
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Writing Tab */}
          <TabsContent value="writing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 hover:shadow-lg transition-all duration-300">
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
                    />
                    <textarea
                      placeholder={currentLanguage === 'ar' ? 'ابدأ الكتابة هنا...' : 'Commencez à écrire ici...'}
                      className="w-full h-64 p-4 border border-slate-200 dark:border-slate-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          {currentLanguage === 'ar' ? 'حفظ كمسودة' : 'Sauvegarder'}
                        </Button>
                        <Button variant="outline" size="sm">
                          {currentLanguage === 'ar' ? 'معاينة' : 'Aperçu'}
                        </Button>
                      </div>
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        <Send className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {currentLanguage === 'ar' ? 'إرسال للمراجعة' : 'Soumettre'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

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
