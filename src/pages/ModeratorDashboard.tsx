import React, { useState, useEffect } from 'react';
import { Shield, Clock, TrendingUp, Flag, MessageSquare, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import ModeratorProfileTab from './moderator/ModeratorProfileTab';
import ModeratorOverviewTab from './moderator/ModeratorOverviewTab';
import ModeratorReportsTab from './moderator/ModeratorReportsTab';
import ModeratorCommentsTab from './moderator/ModeratorCommentsTab';
import ModeratorUsersTab from './moderator/ModeratorUsersTab';

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
  const { currentLanguage, isRTL, direction } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [reports, setReports] = useState<Report[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const { toast } = useToast();
  const [users, setUsers] = useState<ModerationUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  // Always filter to show only regular users
  const roleFilter = 'user';
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserComments, setSelectedUserComments] = useState<Comment[]>([]);
  const [loadingUserComments, setLoadingUserComments] = useState(false);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  // Profile details
  const [myProfile, setMyProfile] = useState<Record<string, any> | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  // Profile edit states
  const [profileForm, setProfileForm] = useState<{ first_name: string; last_name: string; name: string } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [passwordForm, setPasswordForm] = useState<{ currentPassword?: string; newPassword: string; confirmPassword: string }>({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPassword, setChangingPassword] = useState(false);
  // Enrichment maps and dialog state
  const [userNameMap, setUserNameMap] = useState<Record<string, string>>({});
  const [newsTitleMap, setNewsTitleMap] = useState<Record<string, string>>({});
  const [commentTextMap, setCommentTextMap] = useState<Record<string, string>>({});
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

  // Utility: extract UUID from any string like "user:uuid" or raw uuid
  const extractUUID = (val?: string | null): string | null => {
    if (!val) return null;
    const m = String(val).match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
    return m ? m[0] : null;
  };

  // Utility: format a user full name from row (supports snake_case and camelCase)
  const formatUserName = (row?: any, fallback?: string) => {
    if (!row) return fallback || '—';
    const fn = row.first_name ?? row.firstName ?? '';
    const ln = row.last_name ?? row.lastName ?? '';
    const full = [fn, ln].filter(Boolean).join(' ');
    return full || row.name || fallback || '—';
  };

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
    // comment targets: comment:UUID or comment:123
    const uuid = lower.match(/comment[:#\s-]?([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    if (uuid) return { kind: 'comment', id: uuid[1] };
    const num = lower.match(/comment[:#\s-]?(\d+)/);
    if (num) return { kind: 'comment', id: num[1] };
    return { kind: 'unknown' };
  };

  const enrichReportsForDisplay = async (rows: Report[]) => {
    try {
      // Collect unknown reporter ids that look like UUIDs
      const reporterIds = Array.from(new Set(rows
        .map(r => extractUUID(r.reportedBy) || '')
        .filter((v): v is string => !!v && !userNameMap[v])
      ));
      if (reporterIds.length) {
        const { data: usersData } = await supabase
          .from('users')
          .select('id, name, first_name, last_name, firstName, lastName, email')
          .in('id', reporterIds as any);
        const map: Record<string, string> = { ...userNameMap };
        (usersData || []).forEach((u: any) => {
          const fn = u.first_name ?? u.firstName;
          const ln = u.last_name ?? u.lastName;
          const display = [fn, ln].filter(Boolean).join(' ') || u.name || u.email || '';
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

      // Collect comment ids to hydrate comment content preview
      const commentIds = Array.from(new Set(rows
        .map(r => parseTarget(r.target))
        .filter((t): t is { kind: 'comment'; id: string } => !!t.id && t.kind === 'comment')
        .map(t => t.id!)
        .filter((cid) => !commentTextMap[cid])
      ));
      if (commentIds.length) {
        // Try to fetch comments by id; support numeric and uuid
        // If some ids are numeric, the cast will still work as text comparison
        const { data: commentsData } = await supabase
          .from('comments')
          .select('id, content, created_at')
          .in('id', commentIds as any);
        const cmap: Record<string, string> = { ...commentTextMap };
        (commentsData || []).forEach((c: any) => {
          cmap[String(c.id)] = c.content || '';
        });
        setCommentTextMap(cmap);
      }
    } catch (_) {
      // best-effort enrichment
    }
  };

  const openViewReported = async (rep: Report) => {
    // Ensure reporter display name (avoid showing UUID)
    const rid = extractUUID(rep.reportedBy) || rep.reportedBy;
    let reporter = userNameMap[rid];
    if (!reporter && rid) {
      try {
        const { data: u } = await supabase
          .from('users')
          .select('id, name, first_name, last_name, firstName, lastName, email')
          .eq('id', rid)
          .maybeSingle();
        if (u) {
          const fn = (u as any).first_name ?? (u as any).firstName;
          const ln = (u as any).last_name ?? (u as any).lastName;
          reporter = [fn, ln].filter(Boolean).join(' ') || (u as any).name || (u as any).email || '—';
          setUserNameMap((m) => ({ ...m, [u.id]: reporter! }));
        }
      } catch (_) {
        // ignore, fallback below
      }
    }
    // Do not show raw ID; if not found, show placeholder
    reporter = reporter || '—';

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
    } else if (tgt.kind === 'comment' && tgt.id) {
      // Load the comment content and show in dialog
      let content: string | undefined = commentTextMap[tgt.id];
      let createdAt: string | null | undefined = undefined;
      try {
        if (!content) {
          const { data: c } = await supabase
            .from('comments')
            .select('id, content, created_at')
            .eq('id', tgt.id)
            .maybeSingle();
          if (c) {
            content = c.content || undefined;
            createdAt = c.created_at ?? null;
            setCommentTextMap((m) => ({ ...m, [String(c.id)]: c.content || '' }));
          }
        }
      } catch (_) {}
      setViewPayload({
        title: currentLanguage === 'ar' ? 'تعليق مُبلَّغ' : 'Commentaire signalé',
        subtitle: (currentLanguage === 'ar' ? 'مُبلّغ من ' : 'Signalé par ') + reporter,
        content,
        targetKind: 'comment',
        targetId: tgt.id,
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
          name: formatUserName(r, r.name ?? '—'),
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
        // Fallback: direct table query on public.users with role filter for 'user' only
        let q = supabase
          .from('users')
          .select('id, name, email, avatar_url, role, status, created_at, first_name, last_name')
          .eq('role', 'user');
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
          name: formatUserName(r, r.name ?? '—'),
          email: r.email ?? '',
          avatar_url: r.avatar_url ?? null,
          role: (r.role ?? 'user'),
          status: r.status ?? 'active',
          reports: 0,
          raw: r,
        }));
        setUsersHasNext(((tdata || []).length) === pageSize);
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

  // Refetch users when active tab changes to users
  useEffect(() => {
    if (activeTab !== 'users') return;
    fetchUsers();
  }, [activeTab]);

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
          .select('id, email, name, first_name, last_name, role, status, created_at, avatar_url')
          .eq('id', user.id)
          .maybeSingle();
        if (!error && data) {
          setMyProfile(data as any);
        } else if (!data) {
          // Upsert a minimal profile to avoid empty UI when row doesn't exist
          const minimal: any = {
            id: user.id,
            email: (user as any).email ?? null,
            name: (user as any).name ?? [
              (user as any).first_name ?? (user as any).firstName,
              (user as any).last_name ?? (user as any).lastName,
            ]
              .filter(Boolean)
              .join(' '),
            first_name: (user as any).first_name ?? (user as any).firstName ?? null,
            last_name: (user as any).last_name ?? (user as any).lastName ?? null,
            role: (user as any).role ?? 'moderator',
            status: (user as any).status ?? 'active',
            avatar_url: null,
          };
          const { data: up, error: upErr } = await supabase
            .from('users')
            .upsert(minimal, { onConflict: 'id' })
            .select('id, email, name, first_name, last_name, role, status, created_at, avatar_url')
            .maybeSingle();
          if (upErr) throw upErr;
          setMyProfile(up as any);
        }
      } finally {
        setLoadingProfile(false);
      }
    };
    run();
  }, [activeTab, user?.id]);

  // Initialize profile form when myProfile changes
  useEffect(() => {
    if (!myProfile) return;
    setProfileForm({
      first_name: myProfile.first_name ?? myProfile.firstName ?? '',
      last_name: myProfile.last_name ?? myProfile.lastName ?? '',
      name: myProfile.name ?? '',
    });
  }, [myProfile]);

  const handleProfileChange = (field: 'first_name' | 'last_name' | 'name', value: string) => {
    setProfileForm((prev) => (prev ? { ...prev, [field]: value } : { first_name: '', last_name: '', name: '' }));
  };

  const handleSaveProfile = async () => {
    if (!user?.id || !profileForm) return;
    setSavingProfile(true);
    try {
      // Attempt to update including name; if DB forbids updating name (generated column), retry without it
      const basePayload: Record<string, any> = {
        first_name: profileForm.first_name || null,
        last_name: profileForm.last_name || null,
      };
      let triedWithName = false;
      let updateErr: any = null;
      // First try with name if provided
      if (typeof profileForm.name !== 'undefined') {
        triedWithName = true;
        const { error } = await supabase
          .from('users')
          .update({ ...basePayload, name: profileForm.name || null })
          .eq('id', user.id);
        updateErr = error;
      }
      if (updateErr) {
        const msg = String(updateErr.message || '');
        const immutableName = msg.includes('can only be updated to DEFAULT') || msg.toLowerCase().includes('generated');
        if (immutableName) {
          // Retry without name
          const { error: e2 } = await supabase
            .from('users')
            .update(basePayload)
            .eq('id', user.id);
          if (e2) throw e2;
          toast({ description: currentLanguage === 'ar' ? 'تم تحديث الملف الشخصي' : 'Profil mis à jour' });
        } else {
          // If we have no auth session or RLS blocks the update, try RPC fallback that authenticates with email+password
          try {
            const { data: sessionRes } = await supabase.auth.getSession();
            const hasAuthSession = !!sessionRes?.session;
            const rlsViolation = msg.toLowerCase().includes('row-level security') || msg.toLowerCase().includes('rls');
            if (!hasAuthSession || rlsViolation) {
              const email = (myProfile as any)?.email || (user as any)?.email;
              const payload: any = {
                p_email: email,
                p_password: passwordForm.currentPassword || null,
                p_name: typeof profileForm.name !== 'undefined' ? (profileForm.name || null) : null,
                p_first_name: profileForm.first_name || null,
                p_last_name: profileForm.last_name || null,
                p_avatar_url: null,
              };
              const { error: rpcErr } = await supabase.rpc('app_update_user_profile', payload);
              if (rpcErr) throw rpcErr;
              toast({ description: currentLanguage === 'ar' ? 'تم تحديث الملف الشخصي' : 'Profil mis à jour' });
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
      } else if (!triedWithName) {
        const { error } = await supabase
          .from('users')
          .update(basePayload)
          .eq('id', user.id);
        if (error) throw error;
        toast({ description: currentLanguage === 'ar' ? 'تم تحديث الملف الشخصي' : 'Profil mis à jour' });
      } else {
        toast({ description: currentLanguage === 'ar' ? 'تم تحديث الملف الشخصي' : 'Profil mis à jour' });
      }
      // Refresh from DB to ensure UI is in sync
      const { data: fresh } = await supabase
        .from('users')
        .select('id, email, name, first_name, last_name, role, status, created_at, avatar_url')
        .eq('id', user.id)
        .maybeSingle();
      if (fresh) setMyProfile(fresh as any);
    } catch (e: any) {
      toast({ title: currentLanguage === 'ar' ? 'خطأ' : 'Erreur', description: e?.message || (currentLanguage === 'ar' ? 'تعذر تحديث الملف الشخصي' : 'Échec de la mise à jour du profil'), variant: 'destructive' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user?.id || !file) return;
    setAvatarUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `users/${user.id}/avatar_${Date.now()}.${ext}`;
      const bucket = (import.meta as any).env?.VITE_SUPABASE_AVATAR_BUCKET || 'avatars';
      const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, { upsert: true, cacheControl: '3600' });
      if (upErr) {
        const msg = String(upErr.message || '');
        if (msg.toLowerCase().includes('bucket not found')) {
          throw new Error((currentLanguage === 'ar'
            ? 'لم يتم العثور على حاوية الصور "avatars". أنشئها واجعلها عامة أو حدّد VITE_SUPABASE_AVATAR_BUCKET.'
            : "Bucket de stockage 'avatars' introuvable. Créez-le (public) ou définissez VITE_SUPABASE_AVATAR_BUCKET."));
        }
        throw upErr;
      }
      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
      const publicUrl = pub?.publicUrl;
      if (!publicUrl) throw new Error('No public URL');
      const { error: updErr } = await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', user.id);
      if (updErr) throw updErr;
      toast({ description: currentLanguage === 'ar' ? 'تم تحديث الصورة' : 'Avatar mis à jour' });
      setMyProfile((p) => (p ? { ...p, avatar_url: publicUrl } : p));
    } catch (e: any) {
      toast({ title: currentLanguage === 'ar' ? 'خطأ' : 'Erreur', description: e?.message || (currentLanguage === 'ar' ? 'تعذر رفع الصورة' : "Échec du téléversement de l'avatar"), variant: 'destructive' });
    } finally {
      setAvatarUploading(false);
    }
  };

  // Clear local state on logout and reload on login
  useEffect(() => {
    if (!user?.id) {
      setMyProfile(null);
      setProfileForm(null);
      setPasswordForm({ newPassword: '', confirmPassword: '' });
    }
  }, [user?.id]);

  const handleChangePassword = async () => {
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      toast({ title: currentLanguage === 'ar' ? 'تحقق' : 'Validation', description: currentLanguage === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Le mot de passe doit contenir au moins 6 caractères', variant: 'destructive' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: currentLanguage === 'ar' ? 'تحقق' : 'Validation', description: currentLanguage === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Les mots de passe ne correspondent pas', variant: 'destructive' });
      return;
    }
    setChangingPassword(true);
    try {
      const { data: sessionRes } = await supabase.auth.getSession();
      const hasAuthSession = !!sessionRes?.session;
      if (hasAuthSession) {
        const { error } = await supabase.auth.updateUser({ password: passwordForm.newPassword });
        if (error) throw error;
      } else {
        const email = (myProfile as any)?.email || (user as any)?.email;
        const { error } = await supabase.rpc('app_change_password', {
          p_email: email,
          p_current_password: passwordForm.currentPassword,
          p_new_password: passwordForm.newPassword,
        });
        if (error) throw error;
      }
      toast({ description: currentLanguage === 'ar' ? 'تم تغيير كلمة المرور' : 'Mot de passe modifié' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e: any) {
      const hint = String(e?.message || '').includes('function app_change_password')
        ? (currentLanguage === 'ar' ? 'أنشئ دالة RPC app_change_password في Supabase' : 'Créez la fonction RPC app_change_password dans Supabase')
        : '';
      toast({ title: currentLanguage === 'ar' ? 'خطأ' : 'Erreur', description: `${e?.message || (currentLanguage === 'ar' ? 'تعذر تغيير كلمة المرور' : 'Échec de la modification du mot de passe')} ${hint}`.trim(), variant: 'destructive' });
    } finally {
      setChangingPassword(false);
    }
  };

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

  const handleDeleteUser = async (uid: string) => {
    const prev = users;
    setUsers(us => us.filter(u => u.id !== uid));
    try {
      const { error } = await supabase.rpc('delete_user', { p_user_id: uid });
      if (error) throw error;
      toast({ description: currentLanguage === 'ar' ? 'تم حذف المستخدم' : 'Utilisateur supprimé' });
    } catch (e: any) {
      setUsers(prev);
      const msg = e?.message || '';
      const hint = msg.includes('function delete_user') ? (currentLanguage === 'ar' ? 'أنشئ دالة RPC delete_user في Supabase' : 'Créez la fonction RPC delete_user dans Supabase') : '';
      toast({ title: currentLanguage === 'ar' ? 'خطأ' : 'Erreur', description: `${msg || (currentLanguage === 'ar' ? 'تعذر الحذف' : 'Impossible de supprimer')} ${hint}`.trim(), variant: 'destructive' });
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-8 mb-10">
          {stats.map((stat, index) => (
            <Card 
              key={stat.title}
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-4 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`w-7 h-7 ${stat.color}`} />
                  </div>
                </div>
                <div className="flex items-center mt-3">
                  <TrendingUp className="w-5 h-5 text-green-600 mr-1" />
                  <span className="text-base text-green-600 font-medium">{stat.change}</span>
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
            <ModeratorOverviewTab
              reports={reports as any}
              comments={comments as any}
              currentLanguage={currentLanguage as any}
              isRTL={isRTL}
              onApproveComment={handleApprove}
              onRejectComment={handleReject}
              getStatusBadge={getStatusBadge as any}
            />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <ModeratorReportsTab
              currentLanguage={currentLanguage as any}
              isRTL={isRTL}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              reports={reports as any}
              userNameMap={userNameMap}
              extractUUID={extractUUID}
              newsTitleMap={newsTitleMap}
              commentTextMap={commentTextMap}
              openViewReported={openViewReported as any}
              getPriorityBadge={getPriorityBadge as any}
              getStatusBadge={getStatusBadge as any}
              reportsPage={reportsPage}
              setReportsPage={setReportsPage}
              reportsHasNext={reportsHasNext}
            />
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="space-y-6">
            <ModeratorCommentsTab
              currentLanguage={currentLanguage as any}
              isRTL={isRTL}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              loadingComments={loadingComments}
              comments={comments as any}
              getStatusBadge={getStatusBadge as any}
              onApprove={handleApprove}
              onReject={handleReject}
              onDelete={(id: string) => handleDeleteComment(id)}
              commentsPage={commentsPage}
              setCommentsPage={setCommentsPage}
              commentsHasNext={commentsHasNext}
            />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <ModeratorUsersTab
              currentLanguage={currentLanguage as any}
              isRTL={isRTL}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              loadingUsers={loadingUsers}
              users={users as any}
              onBlock={handleBlock}
              onUnblock={handleUnblock}
              onDelete={handleDeleteUser}
              onSelectUserComments={(id: string) => { setSelectedUserId(id); fetchCommentsForUser(id); }}
              expandedUserId={expandedUserId}
              setExpandedUserId={setExpandedUserId}
              usersPage={usersPage}
              setUsersPage={setUsersPage}
              usersHasNext={usersHasNext}
            />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <ModeratorProfileTab />
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
