import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  MessageSquare, 
  Flag, 
  Eye, 
  Ban, 
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Search,
  Filter,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';

interface Report {
  id: string;
  type: 'comment' | 'user' | 'content';
  reportedBy: string;
  target: string;
  reason: string;
  description: string;
  date: string;
  status: 'pending' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high';
}

interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
  status: 'approved' | 'pending' | 'rejected';
  reports: number;
}

const ModeratorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { currentLanguage, isRTL, direction } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [reports, setReports] = useState<Report[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setReports([
      {
        id: '1',
        type: 'comment',
        reportedBy: 'User123',
        target: 'Commentaire offensant sur Messi',
        reason: currentLanguage === 'ar' ? 'محتوى مسيء' : 'Contenu offensant',
        description: currentLanguage === 'ar' ? 'تعليق يحتوي على إهانات' : 'Commentaire contenant des insultes',
        date: '2024-01-15',
        status: 'pending',
        priority: 'high'
      },
      {
        id: '2',
        type: 'user',
        reportedBy: 'User456',
        target: 'SpamUser99',
        reason: currentLanguage === 'ar' ? 'رسائل مزعجة' : 'Spam',
        description: currentLanguage === 'ar' ? 'ينشر روابط مشبوهة' : 'Publie des liens suspects',
        date: '2024-01-14',
        status: 'pending',
        priority: 'medium'
      },
      {
        id: '3',
        type: 'content',
        reportedBy: 'User789',
        target: 'Article sur les transferts',
        reason: currentLanguage === 'ar' ? 'معلومات خاطئة' : 'Fausses informations',
        description: currentLanguage === 'ar' ? 'معلومات غير صحيحة عن الانتقالات' : 'Informations incorrectes sur les transferts',
        date: '2024-01-13',
        status: 'resolved',
        priority: 'low'
      }
    ]);

    setComments([
      {
        id: '1',
        author: 'FootballFan2024',
        content: currentLanguage === 'ar' ? 'مباراة رائعة! أداء ممتاز من الفريق' : 'Match fantastique! Performance excellente de l\'équipe',
        date: '2024-01-15 14:30',
        status: 'pending',
        reports: 0
      },
      {
        id: '2',
        author: 'CritiqueUser',
        content: currentLanguage === 'ar' ? 'الحكم كان منحازاً بشكل واضح' : 'L\'arbitre était clairement partial',
        date: '2024-01-15 13:45',
        status: 'pending',
        reports: 2
      },
      {
        id: '3',
        author: 'AnalystPro',
        content: currentLanguage === 'ar' ? 'تحليل تكتيكي ممتاز للمباراة' : 'Excellente analyse tactique du match',
        date: '2024-01-15 12:20',
        status: 'approved',
        reports: 0
      }
    ]);
  }, [currentLanguage]);

  const stats = [
    { 
      title: currentLanguage === 'ar' ? 'البلاغات المعلقة' : 'Signalements en Attente', 
      value: reports.filter(r => r.status === 'pending').length, 
      icon: Flag, 
      change: '+3', 
      color: 'text-red-600' 
    },
    { 
      title: currentLanguage === 'ar' ? 'التعليقات للمراجعة' : 'Commentaires à Réviser', 
      value: comments.filter(c => c.status === 'pending').length, 
      icon: MessageSquare, 
      change: '+5', 
      color: 'text-orange-600' 
    },
    { 
      title: currentLanguage === 'ar' ? 'المستخدمين المحظورين' : 'Utilisateurs Bannis', 
      value: 12, 
      icon: Ban, 
      change: '+2', 
      color: 'text-purple-600' 
    },
    { 
      title: currentLanguage === 'ar' ? 'الإجراءات اليوم' : 'Actions Aujourd\'hui', 
      value: 8, 
      icon: CheckCircle, 
      change: '+8', 
      color: 'text-green-600' 
    }
  ];

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      high: { 
        label: currentLanguage === 'ar' ? 'عالية' : 'Haute', 
        variant: 'destructive' as const 
      },
      medium: { 
        label: currentLanguage === 'ar' ? 'متوسطة' : 'Moyenne', 
        variant: 'secondary' as const 
      },
      low: { 
        label: currentLanguage === 'ar' ? 'منخفضة' : 'Basse', 
        variant: 'outline' as const 
      }
    };
    
    return priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.low;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { 
        label: currentLanguage === 'ar' ? 'معلق' : 'En attente', 
        variant: 'secondary' as const 
      },
      resolved: { 
        label: currentLanguage === 'ar' ? 'محلول' : 'Résolu', 
        variant: 'default' as const 
      },
      dismissed: { 
        label: currentLanguage === 'ar' ? 'مرفوض' : 'Rejeté', 
        variant: 'outline' as const 
      },
      approved: { 
        label: currentLanguage === 'ar' ? 'موافق عليه' : 'Approuvé', 
        variant: 'default' as const 
      },
      rejected: { 
        label: currentLanguage === 'ar' ? 'مرفوض' : 'Rejeté', 
        variant: 'destructive' as const 
      }
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 ${isRTL ? 'rtl' : 'ltr'}`} dir={direction}>
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-4'}`}>
              <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Shield className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {currentLanguage === 'ar' ? 'لوحة تحكم المشرف' : 'Dashboard Modérateur'}
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
          <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-900 dark:data-[state=active]:bg-orange-900 dark:data-[state=active]:text-orange-100">
              {currentLanguage === 'ar' ? 'نظرة عامة' : 'Vue d\'ensemble'}
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-900 dark:data-[state=active]:bg-orange-900 dark:data-[state=active]:text-orange-100">
              {currentLanguage === 'ar' ? 'البلاغات' : 'Signalements'}
            </TabsTrigger>
            <TabsTrigger value="comments" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-900 dark:data-[state=active]:bg-orange-900 dark:data-[state=active]:text-orange-100">
              {currentLanguage === 'ar' ? 'التعليقات' : 'Commentaires'}
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-900 dark:data-[state=active]:bg-orange-900 dark:data-[state=active]:text-orange-100">
              {currentLanguage === 'ar' ? 'المستخدمين' : 'Utilisateurs'}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span>{currentLanguage === 'ar' ? 'بلاغات عاجلة' : 'Signalements Urgents'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reports.filter(r => r.priority === 'high' && r.status === 'pending').map((report) => (
                      <div key={report.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border border-red-200 dark:border-red-800">
                        <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
                          <Flag className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900 dark:text-white">{report.target}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{report.reason}</p>
                        </div>
                        <Badge variant="destructive">
                          {currentLanguage === 'ar' ? 'عاجل' : 'Urgent'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <span>{currentLanguage === 'ar' ? 'تعليقات للمراجعة' : 'Commentaires à Réviser'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {comments.filter(c => c.status === 'pending').slice(0, 3).map((comment) => (
                      <div key={comment.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900 dark:text-white text-sm">{comment.author}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{comment.content}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {currentLanguage === 'ar' ? 'موافقة' : 'Approuver'}
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                              <XCircle className="w-3 h-3 mr-1" />
                              {currentLanguage === 'ar' ? 'رفض' : 'Rejeter'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-4'}`}>
                <Input
                  placeholder={currentLanguage === 'ar' ? 'البحث في البلاغات...' : 'Rechercher des signalements...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                <CardTitle>{currentLanguage === 'ar' ? 'إدارة البلاغات' : 'Gestion des Signalements'}</CardTitle>
                <CardDescription>
                  {currentLanguage === 'ar' ? 'مراجعة ومعالجة جميع البلاغات' : 'Examinez et traitez tous les signalements'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                          <Flag className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white">{report.target}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{report.reason}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-500">
                            {currentLanguage === 'ar' ? 'بلغ من قبل:' : 'Signalé par:'} {report.reportedBy} • {report.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getPriorityBadge(report.priority).variant}>
                          {getPriorityBadge(report.priority).label}
                        </Badge>
                        <Badge variant={getStatusBadge(report.status).variant}>
                          {getStatusBadge(report.status).label}
                        </Badge>
                        {report.status === 'pending' && (
                          <>
                            <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50">
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
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
                <CardTitle>{currentLanguage === 'ar' ? 'مراجعة التعليقات' : 'Modération des Commentaires'}</CardTitle>
                <CardDescription>
                  {currentLanguage === 'ar' ? 'مراجعة وموافقة على التعليقات' : 'Examinez et approuvez les commentaires'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex items-start justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200">
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900 dark:text-white">{comment.author}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{comment.content}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">{comment.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {comment.reports > 0 && (
                          <Badge variant="destructive">
                            {comment.reports} {currentLanguage === 'ar' ? 'بلاغ' : 'signalement(s)'}
                          </Badge>
                        )}
                        <Badge variant={getStatusBadge(comment.status).variant}>
                          {getStatusBadge(comment.status).label}
                        </Badge>
                        {comment.status === 'pending' && (
                          <>
                            <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50">
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{currentLanguage === 'ar' ? 'إدارة المستخدمين' : 'Gestion des Utilisateurs'}</CardTitle>
                <CardDescription>
                  {currentLanguage === 'ar' ? 'مراقبة ومعالجة المستخدمين المخالفين' : 'Surveillez et gérez les utilisateurs problématiques'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback>SU</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-white">SpamUser99</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">spam@example.com</p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          {currentLanguage === 'ar' ? '3 بلاغات' : '3 signalements'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="destructive">
                        {currentLanguage === 'ar' ? 'مشكوك فيه' : 'Suspect'}
                      </Badge>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                        <Ban className="w-4 h-4 mr-1" />
                        {currentLanguage === 'ar' ? 'حظر' : 'Bannir'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ModeratorDashboard;
