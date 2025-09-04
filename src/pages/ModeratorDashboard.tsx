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
  Activity,
  Trash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
  // Keep the original row to display any extra fields without schema assumptions
  raw?: Record<string, any>;
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
  // Default to only showing regular users
  const [roleFilter, setRoleFilter] = useState<string>('user');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserComments, setSelectedUserComments] = useState<Comment[]>([]);
  const [loadingUserComments, setLoadingUserComments] = useState(false);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  // Profile details
  const [myProfile, setMyProfile] = useState<Record<string, any> | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  // Enrichment maps and dialog state
  const [userNameMap, setUserNameMap] = useState<Record<string, string>>({});
  const [newsTitleMap, setNewsTitleMap] = useState<Record<string, string>>({});
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewPayload, setViewPayload] = useState<{
    title: string;
    subtitle?: string;
    content?: string;
    targetKind?: 'news' | 'comment' | 'user' | 'unknown';
    targetId?: string;
    imageUrl?: string | null;
    createdAt?: string | null;
  } | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [pendingAction, setPendingAction] = useState<null | 'resolve' | 'dismiss' | 'delete'>(null);
  // Pagination state
  const pageSize = 10;
  const [reportsPage, setReportsPage] = useState(1);
  const [reportsHasNext, setReportsHasNext] = useState(false);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsHasNext, setCommentsHasNext] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  const [usersHasNext, setUsersHasNext] = useState(false);

  useEffect(() => {
    // Initial fetches
    fetchReports();
    fetchComments();
    fetchUsers();
  }, [currentLanguage]);

  // Reset pages when search term changes
  useEffect(() => {
    setReportsPage(1);
    setCommentsPage(1);
    setUsersPage(1);
  }, [searchTerm]);

  // Debounced refresh for reports when searching or switching tab
  useEffect(() => {
    if (activeTab !== 'reports') return;
    const t = setTimeout(() => {
      fetchReports();
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm, activeTab]);

  // Refetch when reports page changes
  useEffect(() => {
    if (activeTab === 'reports') fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportsPage]);

  // Fetch reports dynamically (RPC first, fallback to table)
  const fetchReports = async () => {
    try {
      // RPC preferred: moderation_list_reports(p_search, p_status, p_limit, p_offset)
      let mapped: Report[] | null = null;
      try {
        const { data, error } = await supabase.rpc('moderation_list_reports', {
          p_search: searchTerm || null,
          p_status: null,
          p_limit: pageSize,
          p_offset: (reportsPage - 1) * pageSize,
        });
        if (error) throw error;
        const rows = (data || []) as any[];
        mapped = rows.map((r) => ({
          id: String(r.id),
          type: (r.type ?? 'content') as any,
          reportedBy: r.reported_by ?? r.reportedBy ?? '—',
          target: r.target ?? '—',
          reason: r.reason ?? '—',
          description: r.description ?? '',
          date: r.created_at ?? r.date ?? '',
          status: (r.status ?? 'pending') as any,
          priority: (r.priority ?? 'low') as any,
        }));
      } catch (_) {
        mapped = null;
      }

      if (!mapped) {
        // Fallback to a public table `reports` if it exists
        const { data: tdata, error: terr } = await supabase
          .from('reports')
          .select('id, type, reported_by, target, reason, description, created_at, status, priority')
          .order('created_at', { ascending: false })
          .range((reportsPage - 1) * pageSize, reportsPage * pageSize - 1);
        if (terr) throw terr;
        mapped = (tdata || []).map((r: any) => ({
          id: String(r.id),
          type: (r.type ?? 'content'),
          reportedBy: r.reported_by ?? '—',
          target: r.target ?? '—',
          reason: r.reason ?? '—',
          description: r.description ?? '',
          date: r.created_at ?? '',
          status: r.status ?? 'pending',
          priority: r.priority ?? 'low',
        }));
      }
      setReports(mapped);
      setReportsHasNext((mapped?.length || 0) === pageSize);
      // Enrich display: load reporter names and news titles if needed
      await enrichReportsForDisplay(mapped || []);
    } catch (e: any) {
      console.error('Failed to load reports', e);
      setReports([]);
      const msg = e?.message || '';
      const hint = msg.includes('relation "reports"') || msg.includes('function moderation_list_reports')
        ? (currentLanguage === 'ar' ? 'أنشئ دالة RPC moderation_list_reports أو جدول reports في Supabase' : 'Créez la RPC moderation_list_reports ou la table reports dans Supabase')
        : '';
      toast({ title: currentLanguage === 'ar' ? 'خطأ' : 'Erreur', description: `${msg || (currentLanguage === 'ar' ? 'تعذر تحميل البلاغات' : 'Impossible de charger les signalements')} ${hint}`.trim(), variant: 'destructive' });
    }
  };

  // Helpers to extract target info, enrich names and titles
  const parseTarget = (target: string): { kind: 'news' | 'comment' | 'user' | 'unknown'; id?: string } => {
    if (!target) return { kind: 'unknown' };
    // Patterns we try to support: "news:123", "news#123", "news 123", or just numeric when type is content
    const lower = String(target).toLowerCase();
    const m = lower.match(/news[:#\s-]?(\d+)/);
    if (m) return { kind: 'news', id: m[1] };
    return { kind: 'unknown' };
  };

  const enrichReportsForDisplay = async (rows: Report[]) => {
    try {
      // Collect unknown reporter ids that look like UUIDs
      const reporterIds = Array.from(new Set(rows
        .map(r => r.reportedBy)
        .filter((v): v is string => !!v && !userNameMap[v])
      ));
      if (reporterIds.length) {
        const { data: usersData } = await supabase
          .from('users')
          .select('id, name, first_name, last_name')
          .in('id', reporterIds as any);
        const map: Record<string, string> = { ...userNameMap };
        (usersData || []).forEach((u: any) => {
          const display = [u.first_name, u.last_name].filter(Boolean).join(' ') || u.name || u.id;
          map[u.id] = display;
        });
        setUserNameMap(map);
      }

      // Collect news ids
      const newsIds = Array.from(new Set(rows
        .map(r => parseTarget(r.target).id)
        .filter((v): v is string => !!v && !newsTitleMap[v!])
      ));
      if (newsIds.length) {
        const { data: newsRows } = await supabase
          .from('news')
          .select('id, title')
          .in('id', newsIds.map(n => Number(n)) as any);
        const map: Record<string, string> = { ...newsTitleMap };
        (newsRows || []).forEach((n: any) => {
          map[String(n.id)] = n.title || `news:${n.id}`;
        });
        setNewsTitleMap(map);
      }
    } catch (_) {
      // best-effort enrichment
    }
  };

  const openViewReported = async (rep: Report) => {
    // Ensure reporter display name (avoid showing UUID)
    let reporter = userNameMap[rep.reportedBy];
    if (!reporter && rep.reportedBy) {
      try {
        const { data: u } = await supabase
          .from('users')
          .select('id, name, first_name, last_name')
          .eq('id', rep.reportedBy)
          .maybeSingle();
        if (u) {
          reporter = [u.first_name, u.last_name].filter(Boolean).join(' ') || u.name || u.id;
          setUserNameMap((m) => ({ ...m, [u.id]: reporter! }));
        }
      } catch (_) {
        // ignore, fallback below
      }
    }
    reporter = reporter || rep.reportedBy || '—';

    const tgt = parseTarget(rep.target);

    // If target is a news item, fetch and preview the post content inside the dialog (no navigation)
    if (tgt.kind === 'news' && tgt.id) {
      let title = newsTitleMap[tgt.id] || `news:${tgt.id}`;
      let content: string | undefined = undefined;
      let imageUrl: string | null | undefined = undefined;
      let createdAt: string | null | undefined = undefined;
      try {
        const { data: newsRow } = await supabase
          .from('news')
          .select('id, title, content, content_ar, image_url, created_at')
          .eq('id', Number(tgt.id))
          .maybeSingle();
        if (newsRow) {
          title = newsRow.title || title;
          content = (currentLanguage === 'ar' ? newsRow.content_ar : newsRow.content) || undefined;
          imageUrl = newsRow.image_url ?? null;
          createdAt = newsRow.created_at ?? null;
        }
      } catch (_) {
        // best-effort
      }
      setViewPayload({
        title,
        subtitle: (currentLanguage === 'ar' ? 'مُبلّغ من ' : 'Signalé par ') + reporter,
        content,
        targetKind: 'news',
        targetId: tgt.id,
        imageUrl,
        createdAt,
      });
    } else {
      // Generic readable title instead of raw identifiers like "comment:3"
      const genericTitle = currentLanguage === 'ar' ? 'بلاغ/تصريح' : 'Signalement / Déclaration';
      setViewPayload({
        title: genericTitle,
        subtitle: (currentLanguage === 'ar' ? 'مُبلّغ من ' : 'Signalé par ') + reporter,
        content: rep.description,
        targetKind: tgt.kind,
        targetId: tgt.id,
      });
    }
    setSelectedReport(rep);
    setIsViewOpen(true);
  };

  const handleResolveReport = async (reportId: string) => {
    const prev = [...reports];
    setReports(rs => rs.map(r => r.id === reportId ? { ...r, status: 'resolved' } : r));
    try {
      try {
        const { error } = await supabase.rpc('resolve_report', { p_report_id: Number(reportId) });
        if (error) throw error;
      } catch (_) {
        const { error } = await supabase.from('reports').update({ status: 'resolved' }).eq('id', reportId);
        if (error) throw error;
      }
      toast({ description: currentLanguage === 'ar' ? 'تم حل البلاغ' : 'Signalement résolu' });
    } catch (e:any) {
      setReports(prev);
      toast({ title: currentLanguage === 'ar' ? 'خطأ' : 'Erreur', description: e?.message || (currentLanguage === 'ar' ? 'تعذر الحل' : 'Impossible de résoudre'), variant: 'destructive' });
    } finally {
      setIsViewOpen(false);
      setPendingAction(null);
      setSelectedReport(null);
    }
  };

  const handleDismissReport = async (reportId: string) => {
    const prev = [...reports];
    setReports(rs => rs.map(r => r.id === reportId ? { ...r, status: 'dismissed' } : r));
    try {
      try {
        const { error } = await supabase.rpc('dismiss_report', { p_report_id: Number(reportId) });
        if (error) throw error;
      } catch (_) {
        const { error } = await supabase.from('reports').update({ status: 'dismissed' }).eq('id', reportId);
        if (error) throw error;
      }
      toast({ description: currentLanguage === 'ar' ? 'تم رفض البلاغ' : 'Signalement rejeté' });
    } catch (e:any) {
      setReports(prev);
      toast({ title: currentLanguage === 'ar' ? 'خطأ' : 'Erreur', description: e?.message || (currentLanguage === 'ar' ? 'تعذر الرفض' : 'Impossible de rejeter'), variant: 'destructive' });
    } finally {
      setIsViewOpen(false);
      setPendingAction(null);
      setSelectedReport(null);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    const prev = [...reports];
    setReports(rs => rs.filter(r => r.id !== reportId));
    try {
      try {
        const { error } = await supabase.rpc('delete_report', { p_report_id: Number(reportId) });
        if (error) throw error;
      } catch (_) {
        const { error } = await supabase.from('reports').delete().eq('id', reportId);
        if (error) throw error;
      }
      toast({ description: currentLanguage === 'ar' ? 'تم حذف البلاغ' : 'Signalement supprimé' });
    } catch (e:any) {
      setReports(prev);
      toast({ title: currentLanguage === 'ar' ? 'خطأ' : 'Erreur', description: e?.message || (currentLanguage === 'ar' ? 'تعذر الحذف' : 'Impossible de supprimer'), variant: 'destructive' });
    } finally {
      setIsViewOpen(false);
      setPendingAction(null);
      setSelectedReport(null);
    }
  };

  // Fetch comments for moderation via RPC (security definer recommended)
  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      // Expecting RPC to return: id, content, status, created_at, user_name, avatar_url, reports(optional)
      const { data, error } = await supabase.rpc('moderation_list_comments', {
        p_search: searchTerm || null,
        p_status: 'pending',
        p_limit: pageSize,
        p_offset: (commentsPage - 1) * pageSize,
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
      setCommentsHasNext(rows.length === pageSize);
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

  // Refetch when comments page changes
  useEffect(() => {
    if (activeTab === 'comments') fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentsPage]);

  // Users: fetch list via RPC
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      // Try RPC first
      let mapped: ModerationUser[] | null = null;
      try {
        const { data, error } = await supabase.rpc('moderation_list_users', {
          p_search: searchTerm || null,
          p_limit: pageSize,
          p_offset: (usersPage - 1) * pageSize,
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
          raw: r,
        }));
        setUsersHasNext((rows.length || 0) === pageSize);
      } catch (rpcErr) {
        // swallow and fallback
        mapped = null;
      }

      if (!mapped || mapped.length === 0) {
        // Fallback: direct table query on public.users with role filter
        let q = supabase
          .from('users')
          .select('id, name, email, avatar_url, role, status, created_at, first_name, last_name');
        if (roleFilter && roleFilter !== 'all') {
          q = q.eq('role', roleFilter);
        }
        if (searchTerm) {
          // Basic search on name or email
          q = q.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
        }
        const { data: tdata, error: terr } = await q
          .order('created_at', { ascending: false })
          .range((usersPage - 1) * pageSize, usersPage * pageSize - 1);
        if (terr) throw terr;
        mapped = (tdata || []).map((r: any) => ({
          id: String(r.id),
          name: r.name ?? '—',
          email: r.email ?? '',
          avatar_url: r.avatar_url ?? null,
          role: (r.role ?? 'user'),
          status: r.status ?? 'active',
          reports: 0,
          raw: r,
        }));
        setUsersHasNext(((tdata || []).length) === pageSize);
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

  // Refetch when users page changes
  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usersPage]);

  // Load full profile when Profile tab is active
  useEffect(() => {
    const run = async () => {
      if (activeTab !== 'profile' || !user?.id) return;
      setLoadingProfile(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, email, name, first_name, last_name, role, status, created_at')
          .eq('id', user.id)
          .maybeSingle();
        if (!error) setMyProfile(data as any);
      } finally {
        setLoadingProfile(false);
      }
    };
    run();
  }, [activeTab, user?.id]);

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
                            <Button size="sm" variant="outline" onClick={() => handleApprove(comment.id)} className="text-green-600 border-green-200 hover:bg-green-50">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {currentLanguage === 'ar' ? 'موافقة' : 'Approuver'}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleReject(comment.id)} className="text-red-600 border-red-200 hover:bg-red-50">
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
                          <h4 className="font-medium text-slate-900 dark:text-white cursor-pointer hover:underline" onClick={() => openViewReported(report)}>
                            {/* Prefer pretty title for news targets */}
                            {(() => {
                              const t = parseTarget(report.target);
                              if (t.kind === 'news' && t.id) return newsTitleMap[t.id] || report.target;
                              return report.target;
                            })()}
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{report.reason}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-500">
                            {currentLanguage === 'ar' ? 'بلغ من قبل:' : 'Signalé par:'} {userNameMap[report.reportedBy] || report.reportedBy} • {report.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" onClick={() => openViewReported(report)} className="text-slate-700 border-slate-200 hover:bg-slate-50">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Badge variant={getPriorityBadge(report.priority).variant}>
                          {getPriorityBadge(report.priority).label}
                        </Badge>
                        <Badge variant={getStatusBadge(report.status).variant}>
                          {getStatusBadge(report.status).label}
                        </Badge>
                        {report.status === 'pending' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => { setPendingAction('resolve'); openViewReported(report); }} className="text-green-600 border-green-200 hover:bg-green-50">
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => { setPendingAction('dismiss'); openViewReported(report); }} className="text-red-600 border-red-200 hover:bg-red-50">
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Reports pagination */}
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''} pt-2`}>
                  <div className="text-xs text-slate-500">
                    {currentLanguage === 'ar' ? `صفحة ${reportsPage}` : `Page ${reportsPage}`}
                  </div>
                  <div className={`flex ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={reportsPage <= 1}
                      onClick={() => setReportsPage(p => Math.max(1, p - 1))}
                    >
                      {currentLanguage === 'ar' ? 'السابق' : 'Précédent'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!reportsHasNext}
                      onClick={() => setReportsPage(p => p + 1)}
                    >
                      {currentLanguage === 'ar' ? 'التالي' : 'Suivant'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="space-y-6">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-4'}`}>
                <Input
                  placeholder={currentLanguage === 'ar' ? 'ابحث في التعليقات...' : 'Rechercher des commentaires...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>{currentLanguage === 'ar' ? 'التعليقات للمراجعة' : 'Commentaires à modérer'}</CardTitle>
                <CardDescription>{currentLanguage === 'ar' ? 'راجع التعليقات ووافق/ارفض' : 'Passez en revue et approuvez/rejetez'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loadingComments && (
                    <div className="animate-pulse space-y-3">
                      <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded" />
                    </div>
                  )}
                  {!loadingComments && comments.map((c) => (
                    <div key={c.id} className="group flex items-start justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white/70 dark:bg-slate-900/70 hover:shadow-md transition-all duration-200">
                      <div className={`flex items-start ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>{(c.author || '—').charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-slate-900 dark:text-white">{c.author || '—'}</h4>
                            <Badge variant={getStatusBadge(c.status).variant}>{getStatusBadge(c.status).label}</Badge>
                            {c.reports > 0 && <Badge variant="destructive">{c.reports}</Badge>}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 whitespace-pre-wrap">{c.content}</p>
                        </div>
                      </div>
                      <div className={`flex ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                        <Button size="sm" variant="outline" onClick={() => handleApprove(c.id)} className="text-green-600 border-green-200 hover:bg-green-50">
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleReject(c.id)} className="text-red-600 border-red-200 hover:bg-red-50">
                          <XCircle className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteComment(c.id)} className="text-slate-700 border-slate-200 hover:bg-slate-50">
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {!loadingComments && comments.length === 0 && (
                    <div className="text-sm text-slate-500">{currentLanguage === 'ar' ? 'لا توجد تعليقات' : 'Aucun commentaire'}</div>
                  )}
                </div>
                {/* Comments pagination */}
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''} pt-2`}>
                  <div className="text-xs text-slate-500">{currentLanguage === 'ar' ? `صفحة ${commentsPage}` : `Page ${commentsPage}`}</div>
                  <div className={`flex ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                    <Button variant="outline" size="sm" disabled={commentsPage <= 1} onClick={() => setCommentsPage((p) => Math.max(1, p - 1))}>{currentLanguage === 'ar' ? 'السابق' : 'Précédent'}</Button>
                    <Button variant="outline" size="sm" disabled={!commentsHasNext} onClick={() => setCommentsPage((p) => p + 1)}>{currentLanguage === 'ar' ? 'التالي' : 'Suivant'}</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-4'}`}>
                <Input
                  placeholder={currentLanguage === 'ar' ? 'ابحث عن المستخدمين...' : 'Rechercher des utilisateurs...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-900"
                >
                  <option value="all">{currentLanguage === 'ar' ? 'الكل' : 'Tous'}</option>
                  <option value="user">{currentLanguage === 'ar' ? 'مستخدم' : 'Utilisateur'}</option>
                  <option value="author">{currentLanguage === 'ar' ? 'كاتب' : 'Auteur'}</option>
                  <option value="editor">{currentLanguage === 'ar' ? 'محرر' : 'Éditeur'}</option>
                  <option value="moderator">{currentLanguage === 'ar' ? 'مشرف' : 'Modérateur'}</option>
                  <option value="admin">{currentLanguage === 'ar' ? 'مدير' : 'Admin'}</option>
                </select>
              </div>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>{currentLanguage === 'ar' ? 'قائمة المستخدمين' : 'Liste des utilisateurs'}</CardTitle>
                <CardDescription>{currentLanguage === 'ar' ? 'عرض المعلومات الشخصية واتخاذ الإجراءات' : 'Afficher les infos personnelles et gérer les actions'}</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingUsers && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-40 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                    ))}
                  </div>
                )}
                {!loadingUsers && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-slate-200 dark:border-slate-700 rounded-md bg-white/70 dark:bg-slate-900/70">
                      <thead className="bg-slate-50 dark:bg-slate-800">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">{currentLanguage === 'ar' ? 'المستخدم' : 'Utilisateur'}</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">Email</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">{currentLanguage === 'ar' ? 'الدور' : 'Rôle'}</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">{currentLanguage === 'ar' ? 'الحالة' : 'Statut'}</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">{currentLanguage === 'ar' ? 'أنشئ في' : 'Créé le'}</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">{currentLanguage === 'ar' ? 'إجراءات' : 'Actions'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <React.Fragment key={u.id}>
                            <tr className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-8 h-8">
                                    <AvatarFallback>{(u.name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium truncate max-w-[200px]">{u.name || '—'}</span>
                                </div>
                              </td>
                              <td className="px-3 py-2 text-xs text-slate-600 dark:text-slate-300 truncate max-w-[220px]">{u.email || '—'}</td>
                              <td className="px-3 py-2"><Badge variant="outline">{u.role}</Badge></td>
                              <td className="px-3 py-2"><Badge variant={u.status === 'banned' ? 'destructive' : 'secondary'}>{u.status}</Badge></td>
                              <td className="px-3 py-2 text-xs text-slate-500">{u.raw?.created_at ? new Date(u.raw.created_at).toISOString().slice(0,10) : '—'}</td>
                              <td className="px-3 py-2">
                                <div className={`flex ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                                  {u.status === 'banned' ? (
                                    <Button size="sm" variant="outline" onClick={() => handleUnblock(u.id)} className="text-green-600 border-green-200 hover:bg-green-50">
                                      <CheckCircle className="w-4 h-4" />
                                    </Button>
                                  ) : (
                                    <Button size="sm" variant="outline" onClick={() => handleBlock(u.id)} className="text-red-600 border-red-200 hover:bg-red-50">
                                      <Ban className="w-4 h-4" />
                                    </Button>
                                  )}
                                  <Button size="sm" variant="outline" onClick={() => { setSelectedUserId(u.id); fetchCommentsForUser(u.id); }} className="text-slate-700 border-slate-200 hover:bg-slate-50">
                                    <MessageSquare className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => setExpandedUserId(expandedUserId === u.id ? null : u.id)} className="text-slate-700 border-slate-200 hover:bg-slate-50">
                                    {currentLanguage === 'ar' ? 'تفاصيل' : 'Détails'}
                                  </Button>
                                </div>
                              </td>
                            </tr>
                            {expandedUserId === u.id && (
                              <tr className="bg-slate-50/60 dark:bg-slate-800/60">
                                <td colSpan={6} className="px-3 py-3">
                                  {u.raw ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                                      {Object.entries(u.raw)
                                        .filter(([_, v]) => v !== null && typeof v !== 'undefined' && String(v).trim() !== '')
                                        .map(([k, v]) => (
                                          <div key={k} className="flex items-center justify-between rounded bg-white dark:bg-slate-900 px-2 py-1 border border-slate-200 dark:border-slate-700">
                                            <span className="font-medium text-slate-700 dark:text-slate-200">{k}</span>
                                            <span className="truncate ml-2 text-slate-600 dark:text-slate-300">{String(v)}</span>
                                          </div>
                                        ))}
                                    </div>
                                  ) : (
                                    <div className="text-xs text-slate-500">{currentLanguage === 'ar' ? 'لا توجد تفاصيل' : 'Aucun détail'}</div>
                                  )}
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                        {users.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-3 py-4 text-sm text-slate-500">{currentLanguage === 'ar' ? 'لا يوجد مستخدمون' : 'Aucun utilisateur'}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
                {/* Users pagination */}
                <div className={`mt-4 flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="text-xs text-slate-500">{currentLanguage === 'ar' ? `صفحة ${usersPage}` : `Page ${usersPage}`}</div>
                  <div className={`flex ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                    <Button variant="outline" size="sm" disabled={usersPage <= 1} onClick={() => setUsersPage((p) => Math.max(1, p - 1))}>{currentLanguage === 'ar' ? 'السابق' : 'Précédent'}</Button>
                    <Button variant="outline" size="sm" disabled={!usersHasNext} onClick={() => setUsersPage((p) => p + 1)}>{currentLanguage === 'ar' ? 'التالي' : 'Suivant'}</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>{currentLanguage === 'ar' ? 'الملف الشخصي' : 'Profil'}</CardTitle>
                <CardDescription>{currentLanguage === 'ar' ? 'معلومات حسابك' : 'Informations de votre compte'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={user?.avatar_url || undefined} onError={(e)=>{(e.target as HTMLImageElement).style.display='none';}} />
                    <AvatarFallback>{(user?.name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold text-lg">{user?.name || '—'}</div>
                    <div className="text-sm text-slate-500">{user?.email || '—'}</div>
                  </div>
                </div>
                {/* Full details */}
                <div className="mt-4">
                  {loadingProfile && (
                    <div className="text-sm text-slate-500">{currentLanguage === 'ar' ? 'جارِ التحميل…' : 'Chargement…'}</div>
                  )}
                  {!loadingProfile && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {(() => {
                        const base: Record<string, any> = {
                          id: user?.id,
                          email: user?.email,
                          name: user?.name,
                          first_name: (user as any)?.firstName,
                          last_name: (user as any)?.lastName,
                          role: user?.role,
                          status: user?.status,
                        };
                        const extra = myProfile || {};
                        const primaryKeys = ['id','email','name','first_name','last_name','role','status','created_at','phone','country','city'];
                        const primaryNodes = primaryKeys
                          .filter(k => typeof (extra[k] ?? base[k]) !== 'undefined' && (extra[k] ?? base[k]) !== null && String(extra[k] ?? base[k]).trim() !== '')
                          .map(k => (
                            <div key={k} className="flex items-center justify-between rounded bg-slate-50 dark:bg-slate-800 px-3 py-2">
                              <span className="font-medium text-slate-700 dark:text-slate-200">{k}</span>
                              <span className="truncate ml-2 text-slate-600 dark:text-slate-300">{String((extra[k] ?? base[k]))}</span>
                            </div>
                          ));
                        const extraNodes = Object.entries(extra)
                          .filter(([k]) => !primaryKeys.includes(k))
                          .filter(([, v]) => v !== null && typeof v !== 'undefined' && String(v).trim() !== '')
                          .map(([k, v]) => (
                            <div key={k} className="flex items-center justify-between rounded bg-slate-50 dark:bg-slate-800 px-3 py-2">
                              <span className="font-medium text-slate-700 dark:text-slate-200">{k}</span>
                              <span className="truncate ml-2 text-slate-600 dark:text-slate-300">{String(v)}</span>
                            </div>
                          ));
                        return [...primaryNodes, ...extraNodes];
                      })()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Preview Reported Item Dialog */}
        <Dialog open={isViewOpen} onOpenChange={(open) => { setIsViewOpen(open); if (!open) { setPendingAction(null); setSelectedReport(null); } }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{viewPayload?.title || (currentLanguage === 'ar' ? 'معاينة' : 'Aperçu')}</DialogTitle>
              {viewPayload?.subtitle && (
                <DialogDescription>{viewPayload.subtitle}</DialogDescription>
              )}
            </DialogHeader>
            {/* News preview (image + date) */}
            {viewPayload?.imageUrl && (
              <img
                src={viewPayload.imageUrl}
                alt={viewPayload.title}
                className="w-full h-56 md:h-72 object-cover rounded-md"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            {viewPayload?.createdAt && (
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                <Clock className="w-4 h-4" />
                <span>{new Date(viewPayload.createdAt).toISOString().slice(0,10)}</span>
              </div>
            )}
            {viewPayload?.content && (
              <div className="prose prose-slate dark:prose-invert max-w-none leading-relaxed whitespace-pre-wrap mt-3 text-sm">
                {viewPayload.content}
              </div>
            )}
            {/* We purposely avoid navigating away; content is shown inline above if available */}
            {/* Confirm actions */}
            {selectedReport && (
              <div className={`mt-4 flex ${isRTL ? 'justify-start space-x-reverse space-x-2' : 'justify-end space-x-2'}`}>
                <Button variant="outline" onClick={() => { setIsViewOpen(false); setPendingAction(null); setSelectedReport(null); }}>
                  {currentLanguage === 'ar' ? 'إلغاء' : 'Annuler'}
                </Button>
                {pendingAction === 'resolve' && (
                  <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleResolveReport(selectedReport.id)}>
                    {currentLanguage === 'ar' ? 'تأكيد الحل' : 'Confirmer la résolution'}
                  </Button>
                )}
                {pendingAction === 'dismiss' && (
                  <Button className="bg-red-600 hover:bg-red-700" onClick={() => handleDismissReport(selectedReport.id)}>
                    {currentLanguage === 'ar' ? 'تأكيد الرفض' : 'Confirmer le rejet'}
                  </Button>
                )}
                {pendingAction === 'delete' && (
                  <Button className="bg-red-600 hover:bg-red-700" onClick={() => handleDeleteReport(selectedReport.id)}>
                    {currentLanguage === 'ar' ? 'تأكيد الحذف' : 'Confirmer la suppression'}
                  </Button>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
    
  );
};

export default ModeratorDashboard;
