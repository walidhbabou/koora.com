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
  AlertTriangle,
  User,
  Mail,
  Globe,
  Settings,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

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

interface ModerationUser {
  id: string;
  name: string;
  email?: string;
  avatar_url?: string | null;
  role: 'admin' | 'editor' | 'author' | 'moderator' | 'user' | string;
  status: 'active' | 'inactive' | 'banned' | string;
  reports?: number;
}

const ModeratorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { currentLanguage, isRTL, direction } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [reports, setReports] = useState<Report[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const { toast } = useToast();
  const [users, setUsers] = useState<ModerationUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>('user');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserComments, setSelectedUserComments] = useState<Comment[]>([]);
  const [loadingUserComments, setLoadingUserComments] = useState(false);

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

    // Initial fetch of comments pending moderation
    fetchComments();
    // Initial fetch of users
    fetchUsers();
  }, [currentLanguage]);

  // Fetch comments for moderation via RPC (security definer recommended)
  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      // Expecting RPC to return: id, content, status, created_at, user_name, avatar_url, reports(optional)
      const { data, error } = await supabase.rpc('moderation_list_comments', {
        p_search: searchTerm || null,
        p_status: 'pending',
        p_limit: 50,
        p_offset: 0,
        p_user_id: null,
      });
      if (error) throw error;
      const rows = (data || []) as any[];
      setComments(rows.map((r) => ({
        id: String(r.id),
        author: r.user_name ?? '—',
        content: r.content,
        date: r.created_at,
        status: r.status,
        reports: r.reports ?? 0,
      })));
    } catch (e: any) {
      console.error('Failed to load moderation comments', e);
      setComments([]);
      const msg = e?.message || '';
      const hint = msg.includes('function moderation_list_comments') ? (currentLanguage === 'ar' ? 'أنشئ دالة RPC moderation_list_comments في Supabase' : 'Créez la fonction RPC moderation_list_comments dans Supabase') : '';
      toast({ title: currentLanguage === 'ar' ? 'خطأ' : 'Erreur', description: `${msg || (currentLanguage === 'ar' ? 'تعذر تحميل التعليقات' : 'Impossible de charger les commentaires')} ${hint}`.trim(), variant: 'destructive' });
    } finally {
      setLoadingComments(false);
    }
  };

  // Load comments for a specific user (right panel in Users tab)
  const fetchCommentsForUser = async (uid: string) => {
    setLoadingUserComments(true);
    try {
      const { data, error } = await supabase.rpc('moderation_list_comments', {
        p_search: null,
        p_status: null,
        p_limit: 50,
        p_offset: 0,
        p_user_id: uid,
      });
      if (error) throw error;
      const rows = (data || []) as any[];
      setSelectedUserComments(rows.map((r) => ({
        id: String(r.id),
        author: r.user_name ?? '—',
        content: r.content,
        date: r.created_at,
        status: r.status,
        reports: r.reports ?? 0,
      })));
    } catch (e: any) {
      setSelectedUserComments([]);
      const msg = e?.message || '';
      const hint = msg.includes('function moderation_list_comments') ? (currentLanguage === 'ar' ? 'أنشئ دالة RPC moderation_list_comments في Supabase' : 'Créez la fonction RPC moderation_list_comments dans Supabase') : '';
      toast({ title: currentLanguage === 'ar' ? 'خطأ' : 'Erreur', description: `${msg || (currentLanguage === 'ar' ? 'تعذر تحميل التعليقات' : 'Impossible de charger les commentaires')} ${hint}`.trim(), variant: 'destructive' });
    } finally {
      setLoadingUserComments(false);
    }
  };

  // Debounced search and tab change refresh
  useEffect(() => {
    if (activeTab !== 'comments') return;
    const t = setTimeout(() => {
      fetchComments();
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm, activeTab]);

  // Users: fetch list via RPC
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      // Try RPC first
      let mapped: ModerationUser[] | null = null;
      try {
        const { data, error } = await supabase.rpc('moderation_list_users', {
          p_search: searchTerm || null,
          p_limit: 50,
          p_offset: 0,
        });
        if (error) throw error;
        const rows = (data || []) as any[];
        mapped = rows.map(r => ({
          id: String(r.id),
          name: r.name ?? '—',
          email: r.email ?? '',
          avatar_url: r.avatar_url ?? null,
          role: (r.role ?? 'user'),
          status: r.status ?? 'active',
          reports: r.reports ?? 0,
        }));
      } catch (rpcErr) {
        // swallow and fallback
        mapped = null;
      }

      if (!mapped || mapped.length === 0) {
        // Fallback: direct table query on public.users with role filter
        let q = supabase.from('users').select('id, name, email, avatar_url, role, status');
        if (roleFilter && roleFilter !== 'all') {
          q = q.eq('role', roleFilter);
        }
        if (searchTerm) {
          // Basic search on name or email
          q = q.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
        }
        const { data: tdata, error: terr } = await q.limit(50);
        if (terr) throw terr;
        mapped = (tdata || []).map((r: any) => ({
          id: String(r.id),
          name: r.name ?? '—',
          email: r.email ?? '',
          avatar_url: r.avatar_url ?? null,
          role: (r.role ?? 'user'),
          status: r.status ?? 'active',
          reports: 0,
        }));
      }

      if (roleFilter !== 'all') {
        mapped = mapped.filter(u => (u.role || '').toLowerCase() === roleFilter);
      }
      setUsers(mapped);
    } catch (e: any) {
      console.error('Failed to load users', e);
      setUsers([]);
      const msg = e?.message || '';
      const hint = msg.includes('function moderation_list_users') ? (currentLanguage === 'ar' ? 'أنشئ دالة RPC moderation_list_users في Supabase' : 'Créez la fonction RPC moderation_list_users dans Supabase') : '';
      toast({ title: currentLanguage === 'ar' ? 'خطأ' : 'Erreur', description: `${msg || (currentLanguage === 'ar' ? 'تعذر تحميل المستخدمين' : 'Impossible de charger les utilisateurs')} ${hint}`.trim(), variant: 'destructive' });
    } finally {
      setLoadingUsers(false);
    }
  };

  // Refresh users on search/tab
  useEffect(() => {
    if (activeTab !== 'users') return;
    const t = setTimeout(() => {
      fetchUsers();
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm, activeTab]);

  // Refetch users when role filter changes
  useEffect(() => {
    if (activeTab !== 'users') return;
    fetchUsers();
  }, [roleFilter, activeTab]);

  const handleBlock = async (uid: string) => {
    const prev = users;
    setUsers(us => us.map(u => u.id === uid ? { ...u, status: 'banned' } : u));
    try {
      const { error } = await supabase.rpc('block_user', { p_user_id: uid });
      if (error) throw error;
      toast({ description: currentLanguage === 'ar' ? 'تم حظر المستخدم' : 'Utilisateur bloqué' });
    } catch (e: any) {
      setUsers(prev);
      const msg = e?.message || '';
      const hint = msg.includes('function block_user') ? (currentLanguage === 'ar' ? 'أنشئ دالة RPC block_user في Supabase' : 'Créez la fonction RPC block_user dans Supabase') : '';
      toast({ title: currentLanguage === 'ar' ? 'خطأ' : 'Erreur', description: `${msg || (currentLanguage === 'ar' ? 'تعذر الحظر' : 'Impossible de bloquer')} ${hint}`.trim(), variant: 'destructive' });
    }
  };

  const handleUnblock = async (uid: string) => {
    const prev = users;
    setUsers(us => us.map(u => u.id === uid ? { ...u, status: 'active' } : u));
    try {
      const { error } = await supabase.rpc('unblock_user', { p_user_id: uid });
      if (error) throw error;
      toast({ description: currentLanguage === 'ar' ? 'تم إلغاء الحظر' : 'Utilisateur débloqué' });
    } catch (e: any) {
      setUsers(prev);
      const msg = e?.message || '';
      const hint = msg.includes('function unblock_user') ? (currentLanguage === 'ar' ? 'أنشئ دالة RPC unblock_user في Supabase' : 'Créez la fonction RPC unblock_user dans Supabase') : '';
      toast({ title: currentLanguage === 'ar' ? 'خطأ' : 'Erreur', description: `${msg || (currentLanguage === 'ar' ? 'تعذر إلغاء الحظر' : 'Impossible de débloquer')} ${hint}`.trim(), variant: 'destructive' });
    }
  };

  // Approve comment
  const handleApprove = async (commentId: string) => {
    const prev = comments;
    setComments((cs) => cs.map(c => c.id === commentId ? { ...c, status: 'approved' } : c));
    try {
      const { error } = await supabase.rpc('approve_comment', { p_comment_id: Number(commentId) });
      if (error) throw error;
      toast({ description: currentLanguage === 'ar' ? 'تمت الموافقة على التعليق' : 'Commentaire approuvé' });
    } catch (e: any) {
      setComments(prev);
      const msg = e?.message || '';
      const hint = msg.includes('function approve_comment') ? (currentLanguage === 'ar' ? 'أنشئ دالة RPC approve_comment في Supabase' : 'Créez la fonction RPC approve_comment dans Supabase') : '';
      toast({ title: currentLanguage === 'ar' ? 'خطأ' : 'Erreur', description: `${msg || (currentLanguage === 'ar' ? 'تعذر الموافقة' : 'Impossible d\'approuver')} ${hint}`.trim(), variant: 'destructive' });
    }
  };

  // Reject comment
  const handleReject = async (commentId: string) => {
    const prev = comments;
    setComments((cs) => cs.map(c => c.id === commentId ? { ...c, status: 'rejected' } : c));
    try {
      const { error } = await supabase.rpc('reject_comment', { p_comment_id: Number(commentId) });
      if (error) throw error;
      toast({ description: currentLanguage === 'ar' ? 'تم رفض التعليق' : 'Commentaire rejeté' });
    } catch (e: any) {
      setComments(prev);
      const msg = e?.message || '';
      const hint = msg.includes('function reject_comment') ? (currentLanguage === 'ar' ? 'أنشئ دالة RPC reject_comment في Supabase' : 'Créez la fonction RPC reject_comment dans Supabase') : '';
      toast({ title: currentLanguage === 'ar' ? 'خطأ' : 'Erreur', description: `${msg || (currentLanguage === 'ar' ? 'تعذر الرفض' : 'Impossible de rejeter')} ${hint}`.trim(), variant: 'destructive' });
    }
  };

  // Delete comment (permanent)
  const handleDeleteComment = async (commentId: string, fromUserPanel?: boolean) => {
    const restore = fromUserPanel
      ? [...selectedUserComments]
      : [...comments];
    if (fromUserPanel) {
      setSelectedUserComments(cs => cs.filter(c => c.id !== commentId));
    } else {
      setComments(cs => cs.filter(c => c.id !== commentId));
    }
    try {
      const { error } = await supabase.rpc('delete_comment', { p_comment_id: Number(commentId) });
      if (error) throw error;
      toast({ description: currentLanguage === 'ar' ? 'تم حذف التعليق' : 'Commentaire supprimé' });
    } catch (e: any) {
      if (fromUserPanel) setSelectedUserComments(restore as any);
      else setComments(restore as any);
      const msg = e?.message || '';
      const hint = msg.includes('function delete_comment') ? (currentLanguage === 'ar' ? 'أنشئ دالة RPC delete_comment في Supabase' : 'Créez la fonction RPC delete_comment dans Supabase') : '';
      toast({ title: currentLanguage === 'ar' ? 'خطأ' : 'Erreur', description: `${msg || (currentLanguage === 'ar' ? 'تعذر الحذف' : 'Impossible de supprimer')} ${hint}`.trim(), variant: 'destructive' });
    }
  };

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
      <div className="bg-white/80 backdrop-blur-lg dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-4'}`}>
              <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg transform hover:scale-110 transition-all duration-300">
                  <Shield className="w-6 h-6 text-white" />
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
          <TabsList className="grid w-full grid-cols-5 bg-white/90 backdrop-blur-sm dark:bg-slate-900/90 border border-slate-200/50 dark:border-slate-700/50 shadow-lg rounded-xl p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg">
              {currentLanguage === 'ar' ? 'نظرة عامة' : 'Vue d\'ensemble'}
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg">
              {currentLanguage === 'ar' ? 'البلاغات' : 'Signalements'}
            </TabsTrigger>
            <TabsTrigger value="comments" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg">
              {currentLanguage === 'ar' ? 'التعليقات' : 'Commentaires'}
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg">
              {currentLanguage === 'ar' ? 'المستخدمين' : 'Utilisateurs'}
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg">
              {currentLanguage === 'ar' ? 'الملف الشخصي' : 'Profil'}
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
                  {loadingComments && (
                    <div className="text-sm text-slate-500">
                      {currentLanguage === 'ar' ? 'جار التحميل…' : 'Chargement…'}
                    </div>
                  )}
                  {!loadingComments && comments.length === 0 && (
                    <div className="text-sm text-slate-500">
                      {currentLanguage === 'ar' ? 'لا توجد تعليقات للمراجعة' : 'Aucun commentaire à modérer'}
                    </div>
                  )}
                  {!loadingComments && comments.map((comment) => (
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
                            <Button size="sm" variant="outline" onClick={() => handleApprove(comment.id)} className="text-green-600 border-green-200 hover:bg-green-50">
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleReject(comment.id)} className="text-red-600 border-red-200 hover:bg-red-50">
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
                  {/* Filters */}
                  <div className={`flex items-center ${isRTL ? 'justify-end' : ''}`}>
                    <Input
                      placeholder={currentLanguage === 'ar' ? 'ابحث عن مستخدم...' : 'Rechercher un utilisateur...'}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>

                  {loadingUsers && (
                    <div className="text-sm text-slate-500">
                      {currentLanguage === 'ar' ? 'جار التحميل…' : 'Chargement…'}
                    </div>
                  )}
                  {!loadingUsers && users.length === 0 && (
                    <div className="text-sm text-slate-500">
                      {currentLanguage === 'ar' ? 'لا يوجد مستخدمون' : 'Aucun utilisateur'}
                    </div>
                  )}
                  {!loadingUsers && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        {users.map((u) => (
                          <div key={u.id} className={`flex items-center justify-between p-4 border rounded-lg ${selectedUserId === u.id ? 'bg-slate-50 dark:bg-slate-800' : ''}`}>
                            <div className="flex items-center space-x-4">
                              <Avatar className="w-12 h-12">
                                {u.avatar_url ? (
                                  <AvatarImage src={u.avatar_url} alt={u.name} />
                                ) : (
                                  <AvatarFallback>{(u.name || 'U').charAt(0)}</AvatarFallback>
                                )}
                              </Avatar>
                              <div>
                                <h4 className="font-medium text-slate-900 dark:text-white">{u.name}</h4>
                                {u.email && <p className="text-sm text-slate-600 dark:text-slate-400">{u.email}</p>}
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline">{u.role}</Badge>
                                  <Badge variant={u.status === 'banned' ? 'destructive' : u.status === 'inactive' ? 'secondary' : 'default'}>
                                    {u.status}
                                  </Badge>
                                  {typeof u.reports === 'number' && u.reports > 0 && (
                                    <Badge variant="destructive">{u.reports} {currentLanguage === 'ar' ? 'بلاغ' : 'signalement(s)'}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {u.status !== 'banned' ? (
                                <Button size="sm" variant="outline" onClick={() => handleBlock(u.id)} className="text-red-600 border-red-200 hover:bg-red-50">
                                  <Ban className="w-4 h-4 mr-1" />
                                  {currentLanguage === 'ar' ? 'حظر' : 'Bannir'}
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline" onClick={() => handleUnblock(u.id)} className="text-green-600 border-green-200 hover:bg-green-50">
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  {currentLanguage === 'ar' ? 'إلغاء الحظر' : 'Débloquer'}
                                </Button>
                              )}
                              <Button size="sm" variant="outline" onClick={() => { setSelectedUserId(u.id); fetchCommentsForUser(u.id); }} className="text-blue-600 border-blue-200 hover:bg-blue-50">
                                <Eye className="w-4 h-4 mr-1" />
                                {currentLanguage === 'ar' ? 'تعليقات المستخدم' : "Commentaires de l'utilisateur"}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Right panel: selected user's comments */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-slate-900 dark:text-white">
                          {currentLanguage === 'ar' ? 'تعليقات المستخدم المحدد' : "Commentaires de l'utilisateur sélectionné"}
                        </h4>
                        {!selectedUserId && (
                          <div className="text-sm text-slate-500">{currentLanguage === 'ar' ? 'اختر مستخدماً لعرض تعليقاته' : 'Sélectionnez un utilisateur pour voir ses commentaires'}</div>
                        )}
                        {selectedUserId && (
                          <div className="space-y-2">
                            {loadingUserComments && (<div className="text-sm text-slate-500">{currentLanguage === 'ar' ? 'جار التحميل…' : 'Chargement…'}</div>)}
                            {!loadingUserComments && selectedUserComments.length === 0 && (<div className="text-sm text-slate-500">{currentLanguage === 'ar' ? 'لا توجد تعليقات' : 'Aucun commentaire'}</div>)}
                            {!loadingUserComments && selectedUserComments.map((c) => (
                              <div key={c.id} className="flex items-start justify-between p-3 border rounded-lg">
                                <div className="pr-4">
                                  <div className="text-sm font-medium">{c.author}</div>
                                  <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">{c.content}</div>
                                  <div className="text-xs text-slate-500 mt-1">{c.date}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={getStatusBadge(c.status).variant}>{getStatusBadge(c.status).label}</Badge>
                                  {c.status === 'pending' && (
                                    <>
                                      <Button size="sm" variant="outline" onClick={() => handleApprove(c.id)} className="text-green-600 border-green-200 hover:bg-green-50">
                                        <CheckCircle className="w-4 h-4" />
                                      </Button>
                                      <Button size="sm" variant="outline" onClick={() => handleReject(c.id)} className="text-red-600 border-red-200 hover:bg-red-50">
                                        <XCircle className="w-4 h-4" />
                                      </Button>
                                    </>
                                  )}
                                  <Button size="sm" variant="outline" onClick={() => handleDeleteComment(c.id, true)} className="text-red-600 border-red-200 hover:bg-red-50">
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card className="hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-white to-orange-50 dark:from-slate-800 dark:to-orange-900/20 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-orange-600" />
                    <span>{currentLanguage === 'ar' ? 'المعلومات الشخصية' : 'Informations Personnelles'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {user?.name?.charAt(0) || 'M'}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{user?.name || 'Modérateur'}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{user?.email}</p>
                        <Badge variant="outline" className="mt-1">{user?.role || 'moderator'}</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                        <Mail className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{user?.email || 'Non renseigné'}</span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                        <Shield className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {currentLanguage === 'ar' ? 'مشرف منذ' : 'Modérateur depuis'} {new Date().getFullYear()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                        <Activity className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {currentLanguage === 'ar' ? 'تعليقات معالجة' : 'Commentaires traités'}: {comments.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Moderation Settings */}
              <Card className="hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-white to-red-50 dark:from-slate-800 dark:to-red-900/20 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-red-600" />
                    <span>{currentLanguage === 'ar' ? 'إعدادات الإشراف' : 'Paramètres de Modération'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
                      <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                        {currentLanguage === 'ar' ? 'إحصائيات الإشراف' : 'Statistiques de Modération'}
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{comments.filter(c => c.status === 'pending').length}</div>
                          <div className="text-xs text-slate-500">{currentLanguage === 'ar' ? 'قيد الانتظار' : 'En attente'}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{comments.filter(c => c.status === 'approved').length}</div>
                          <div className="text-xs text-slate-500">{currentLanguage === 'ar' ? 'موافق عليها' : 'Approuvés'}</div>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      {currentLanguage === 'ar' ? 'تعديل الملف الشخصي' : 'Modifier le Profil'}
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Shield className="w-4 h-4 mr-2" />
                      {currentLanguage === 'ar' ? 'إعدادات الإشراف' : 'Paramètres de Modération'}
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

export default ModeratorDashboard;
