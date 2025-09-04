import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ThumbsUp, ThumbsDown, ChevronLeft, MoreHorizontal, MessageSquare, Flag } from "lucide-react";

interface CommentRow {
  id: string;
  user_id: string;
  user_name?: string | null;
  avatar_url?: string | null;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  likes?: number;
  dislikes?: number;
  my_reaction?: 'like' | 'dislike' | null;
  parent_id?: string | null;
}

const CommentsSection: React.FC<{ newsId: number }> = ({ newsId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [newComment, setNewComment] = useState("");
  // reporting state for comments
  const [reportOpenId, setReportOpenId] = useState<string | null>(null);
  const [reportDesc, setReportDesc] = useState("");
  const [reportingId, setReportingId] = useState<string | null>(null);
  // reply state
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>("");
  // expand/collapse replies per root comment
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const timeAgo = (iso?: string) => {
    if (!iso) return "";
    const diff = Math.max(0, Date.now() - new Date(iso).getTime());
    const h = Math.floor(diff / (1000 * 60 * 60));
    const d = Math.floor(h / 24);
    if (d > 0) return `منذ ${d} يوم${d > 1 ? 'ًا' : ''}`;
    if (h > 0) return `منذ ${h} ساعة`;
    const m = Math.floor(diff / (1000 * 60));
    if (m > 0) return `منذ ${m} دقيقة`;
    return 'الآن';
  };

  const submitReply = async (parentId: string) => {
    if (!user?.id) {
      toast({ title: 'Connexion requise', description: 'Veuillez vous connecter pour الرد', variant: 'destructive' });
      return;
    }
    const content = replyText.trim();
    if (!content) return;
    // optimistic UI (optional): add a temp child below parent later when we support nesting fetch
    try {
      const { error } = await supabase.rpc('add_comment', {
        p_news_id: newsId,
        p_user_id: user.id,
        p_content: content,
        p_parent_id: parentId,
      });
      if (error) throw error;
      toast({ description: 'تم إرسال ردك' });
      setReplyingId(null);
      setReplyText("");
      // refresh list to show reply (requires backend to include children in list_comments)
      fetchComments();
    } catch (e: any) {
      const msg = e?.message || '';
      const hint = msg.includes('function add_comment') ? 'أنشئ RPC add_comment بدعم p_parent_id كخيار.' : '';
      toast({ title: 'Erreur', description: `${msg || 'تعذر إرسال الرد'} ${hint}`.trim(), variant: 'destructive' });
    }
  };

  const reportComment = async (commentId: string, description: string) => {
    if (reportingId) return;
    if (!user?.id) {
      toast({ title: 'Connexion requise', description: 'Veuillez vous connecter pour signaler', variant: 'destructive' });
      return;
    }
    setReportingId(commentId);
    try {
      try {
        const { error } = await supabase.rpc('create_report', {
          p_type: 'content',
          p_target: `comment:${commentId}`,
          p_reason: 'inappropriate',
          p_description: description,
          p_reported_by: user.id
        });
        if (error) throw error;
      } catch (rpcErr: any) {
        const msg: string = rpcErr?.message || '';
        const code: string | undefined = rpcErr?.code;
        const fnMissing = (code === '42883') || /function\s+create_report\s*\(.*\)\s+does not exist/i.test(msg) || /does not exist/i.test(msg);
        if (!fnMissing) throw rpcErr; // avoid fallback on RLS/permission errors
        const { error: insErr } = await supabase.from('reports').insert({
          type: 'content',
          target: `comment:${commentId}`,
          reason: 'inappropriate',
          description,
          reported_by: user.id
        });
        if (insErr) throw insErr;
      }
      toast({ description: 'تم إرسال البلاغ' });
      setReportOpenId(null);
      setReportDesc('');
    } catch (e: any) {
      toast({ title: 'Erreur', description: e?.message || 'تعذر إرسال البلاغ', variant: 'destructive' });
    } finally {
      setReportingId(null);
    }
  };

  const fetchComments = async () => {
    setLoading(true);
    try {
      // Use RPC that returns approved comments for everyone and
      // includes the caller's own comments when p_user_id is provided
      const { data, error } = await supabase.rpc('list_comments', {
        p_news_id: newsId,
        p_user_id: user?.id || null
      });
      if (error) throw error;
      const mapped: CommentRow[] = (data || []).map((c: any) => ({
        id: String(c.id),
        user_id: c.user_id,
        user_name: c.user_name,
        avatar_url: c.avatar_url,
        content: c.content,
        status: c.status,
        created_at: c.created_at,
        likes: typeof c.likes === 'number' ? c.likes : 0,
        dislikes: typeof c.dislikes === 'number' ? c.dislikes : 0,
        my_reaction: c.my_reaction ?? null,
        parent_id: c.parent_id ? String(c.parent_id) : null,
      }));
      setComments(mapped);

      // If RPC didn't include reactions, try to hydrate via summary RPC or table fallback
      if (!(data && data.length && (data[0] as any).likes !== undefined)) {
        const ids = mapped.map(c => c.id);
        if (ids.length > 0) await hydrateReactions(ids);
      }
    } catch (e) {
      console.error('load comments failed', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComments(); }, [newsId, user?.id]);

  const hydrateReactions = async (ids: string[]) => {
    try {
      // Try RPC summary first: comment_reactions_summary(p_comment_ids uuid[])
      let rows: any[] | null = null;
      try {
        const { data, error } = await supabase.rpc('comment_reactions_summary', { p_comment_ids: ids });
        if (error) throw error;
        rows = data || [];
      } catch (_) {
        rows = null;
      }
      if (!rows) {
        // Fallback to table aggregation: comment_reactions(comment_id, user_id, type)
        const { data: agg, error: aggErr } = await supabase
          .from('comment_reactions')
          .select('comment_id, type')
          .in('comment_id', ids as any);
        if (aggErr) throw aggErr;
        const counts: Record<string, { like: number; dislike: number }> = {};
        (agg || []).forEach((r: any) => {
          const cid = String(r.comment_id);
          counts[cid] = counts[cid] || { like: 0, dislike: 0 };
          if (r.type === 'like') counts[cid].like++;
          else if (r.type === 'dislike') counts[cid].dislike++;
        });
        setComments(prev => prev.map(c => ({
          ...c,
          likes: counts[c.id]?.like ?? 0,
          dislikes: counts[c.id]?.dislike ?? 0,
        })));
        return;
      }
      // rows expected: [{ comment_id, likes, dislikes, my_reaction }]
      const byId: Record<string, any> = {};
      rows.forEach(r => { byId[String(r.comment_id)] = r; });
      setComments(prev => prev.map(c => ({
        ...c,
        likes: typeof byId[c.id]?.likes === 'number' ? byId[c.id].likes : c.likes ?? 0,
        dislikes: typeof byId[c.id]?.dislikes === 'number' ? byId[c.id].dislikes : c.dislikes ?? 0,
        my_reaction: byId[c.id]?.my_reaction ?? c.my_reaction ?? null,
      })));
    } catch (e) {
      // silent fallback
    }
  };

  const react = async (commentId: string, next: 'like' | 'dislike') => {
    if (!user?.id) {
      toast({ title: 'Connexion requise', description: 'Veuillez vous connecter pour réagir', variant: 'destructive' });
      return;
    }
    setComments(prev => prev.map(c => {
      if (c.id !== commentId) return c;
      const current = c.my_reaction;
      let likes = c.likes ?? 0;
      let dislikes = c.dislikes ?? 0;
      // remove previous
      if (current === 'like') likes = Math.max(0, likes - 1);
      if (current === 'dislike') dislikes = Math.max(0, dislikes - 1);
      // toggle
      if (current !== next) {
        if (next === 'like') likes += 1; else dislikes += 1;
        return { ...c, likes, dislikes, my_reaction: next };
      }
      // undo if same
      return { ...c, likes, dislikes, my_reaction: null };
    }));
    try {
      // RPC to register reaction; sending 'none' to remove
      const current = comments.find(c => c.id === commentId)?.my_reaction;
      const desired = current === next ? 'none' : next;
      const { error } = await supabase.rpc('react_to_comment', {
        p_comment_id: commentId,
        p_user_id: user.id,
        p_reaction: desired,
      });
      if (error) throw error;
    } catch (e: any) {
      // revert by reloading reactions for this comment
      await hydrateReactions([commentId]);
      const msg = e?.message || '';
      const hint = msg.includes('function react_to_comment') ? 'Créez la fonction RPC react_to_comment dans Supabase.' : '';
      toast({ title: 'Erreur', description: `${msg || 'Impossible de réagir'} ${hint}`.trim(), variant: 'destructive' });
    }
  };

  const submit = async () => {
    if (!user?.id) {
      toast({ title: 'Connexion requise', description: 'Veuillez vous connecter pour commenter', variant: 'destructive' });
      return;
    }
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      // Use SECURITY DEFINER RPC to bypass RLS with server-side checks
      const { data: rpcData, error: rpcErr } = await supabase.rpc('add_comment', {
        p_news_id: newsId,
        p_user_id: user.id,
        p_content: newComment.trim()
      });
      if (rpcErr) throw rpcErr;
      // Optimistic UI: show the comment immediately in the list
      const nowIso = new Date().toISOString();
      const optimistic: CommentRow = {
        id: (rpcData?.id ? String(rpcData.id) : `temp-${Date.now()}`),
        user_id: user.id,
        user_name: user.name || null,
        avatar_url: null,
        content: newComment.trim(),
        status: 'pending',
        created_at: nowIso,
      };
      setComments((prev) => [optimistic, ...prev]);
      setNewComment("");
      // Optional light feedback without moderation mention
      toast({ description: 'تم إرسال تعليقك', });
      // Background refresh to sync real status/id (non-blocking)
      fetchComments();
    } catch (e: any) {
      const msg = e?.message || '';
      const hint = msg.includes('function add_comment') ? 'Créez la fonction RPC add_comment côté Supabase.' : '';
      toast({ title: 'Erreur', description: `${msg || "Impossible d'envoyer le commentaire"} ${hint}`.trim(), variant: 'destructive' });
    } finally {
      setPosting(false);
    }
  };

  // Realtime: refresh when a new comment is inserted for this news
  useEffect(() => {
    if (!newsId) return;
    const channel = supabase
      .channel(`comments-news-${newsId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments', filter: `news_id=eq.${newsId}` },
        (payload: any) => {
          const row = payload?.new;
          if (!row) return;
          if (row.status === 'approved' || row.user_id === user?.id) {
            // Refetch to enrich with user_name/avatar_url provided by RPC
            fetchComments();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [newsId, user?.id]);

  // Build tree, reply counts, and flattened descendants per root
  const tree = useMemo(() => {
    const byId: Record<string, CommentRow & { children: string[] }> = {};
    const roots: string[] = [];
    comments.forEach((c) => { (byId[c.id] = { ...c, children: [] }); });
    comments.forEach((c) => {
      const pid = c.parent_id ? String(c.parent_id) : null;
      if (pid && byId[pid]) byId[pid].children.push(c.id); else roots.push(c.id);
    });
    const counts: Record<string, number> = {};
    const flatDesc: Record<string, Array<{ c: CommentRow; depth: number }>> = {};
    const countDesc = (id: string): number => {
      let n = 0;
      const node = byId[id];
      if (!node) return 0;
      for (const ch of node.children) {
        n += 1 + countDesc(ch);
      }
      return n;
    };
    const build = (id: string, depth: number, acc: Array<{ c: CommentRow; depth: number }>) => {
      const node = byId[id];
      if (!node) return;
      for (const ch of node.children) {
        acc.push({ c: byId[ch], depth });
        build(ch, Math.min(depth + 1, 5), acc);
      }
    };
    roots.forEach((id) => {
      counts[id] = countDesc(id);
      const acc: Array<{ c: CommentRow; depth: number }> = [];
      build(id, 1, acc);
      flatDesc[id] = acc;
    });
    return { byId, roots, counts, flatDesc };
  }, [comments]);

  return (
    <>
    <div className="mt-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-0 overflow-hidden">
      <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-base sm:text-lg font-semibold">التعليقات</div>
          {loading && <div className="text-xs text-muted-foreground">جار التحميل…</div>}
        </div>
        <MoreHorizontal className="w-5 h-5 text-slate-400" />
      </div>

      <div className="px-4 sm:px-6 py-4">
        <div className="mb-4">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-full px-3 py-2">
            <Input
              className="bg-transparent border-none focus-visible:ring-0 text-sm"
              placeholder="اكتب تعليقك هنا"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button size="sm" className="rounded-full" onClick={submit} disabled={posting || !newComment.trim()}>
              {posting ? '...' : 'إرسال'}
            </Button>
          </div>
        </div>

        {comments.length === 0 && !loading && (
          <div className="text-sm text-muted-foreground mb-3">لا توجد تعليقات بعد</div>
        )}

        <div className="space-y-6">
          {tree.roots.map((rootId) => {
            const c = tree.byId[rootId];
            const depth = 0;
            return (
              <div key={c.id} className="">
                <div className="flex items-start gap-3" style={{ marginInlineStart: depth * 20 }}>
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-sport-green/15 flex items-center justify-center">
                    {c.avatar_url
                      ? <img src={c.avatar_url} alt={c.user_name ?? ''} className="w-full h-full object-cover" />
                      : <span className="text-sport-green font-bold">{(c.user_name ?? c.user_id).charAt(0).toUpperCase()}</span>
                    }
                  </div>
                  <div className={`flex-1`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold">{c.user_name ?? `${c.user_id.slice(0,8)}…`}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">{timeAgo(c.created_at)}</span>
                      </div>
                      {c.status !== 'approved' && c.user_id !== user?.id && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${c.status==='pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {c.status === 'pending' ? 'قيد المراجعة' : 'مرفوض'}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-sm leading-relaxed">
                      {c.content}
                    </div>

                    <div className="mt-3 flex items-center gap-6 text-xs text-slate-600 dark:text-slate-300">
                      <button
                        className={`flex items-center gap-1 hover:text-sport-green ${c.my_reaction==='like' ? 'text-sport-green' : ''}`}
                        onClick={() => react(c.id, 'like')}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>{c.likes ?? 0}</span>
                      </button>
                      <button
                        className={`flex items-center gap-1 hover:text-sport-green ${c.my_reaction==='dislike' ? 'text-sport-green' : ''}`}
                        onClick={() => react(c.id, 'dislike')}
                      >
                        <ThumbsDown className="w-4 h-4" />
                        <span>{c.dislikes ?? 0}</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-sport-green" onClick={() => { setReplyingId(c.id); setReplyText(""); }}>
                        <MessageSquare className="w-4 h-4" />
                        <span>{replyingId === c.id ? 'إلغاء الرد' : 'رد'}</span>
                      </button>
                      {tree.counts[rootId] > 0 && (
                        <button
                          className="flex items-center gap-1 hover:text-sport-green"
                          onClick={() => setExpanded((prev) => ({ ...prev, [rootId]: !prev[rootId] }))}
                        >
                          <span>{expanded[rootId] ? 'إخفاء الردود' : 'شاهد الردود'} {expanded[rootId] ? '' : tree.counts[rootId]}</span>
                        </button>
                      )}
                      <button
                        className="flex items-center gap-1 hover:text-red-600"
                        onClick={() => setReportOpenId(c.id)}
                        disabled={reportingId === c.id}
                        title="تبليغ عن التعليق"
                      >
                        <Flag className="w-4 h-4" />
                        <span>إبلاغ</span>
                      </button>
                    </div>
                    {replyingId === c.id && (
                      <div className="mt-3">
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-full px-3 py-2">
                          <Input
                            className="bg-transparent border-none focus-visible:ring-0 text-sm"
                            placeholder="اكتب ردك هنا"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                          />
                          <Button size="sm" className="rounded-full" onClick={() => submitReply(c.id)} disabled={!replyText.trim()}>
                            إرسال
                          </Button>
                        </div>
                      </div>
                    )}

                    {expanded[rootId] && tree.flatDesc[rootId].length > 0 && (
                      <div className="mt-4 space-y-4">
                        {tree.flatDesc[rootId].map(({ c: rc, depth: d }) => (
                          <div key={rc.id} className="">
                            <div className="flex items-start gap-3" style={{ marginInlineStart: d * 20 }}>
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-sport-green/15 flex items-center justify-center">
                                {rc.avatar_url
                                  ? <img src={rc.avatar_url} alt={rc.user_name ?? ''} className="w-full h-full object-cover" />
                                  : <span className="text-sport-green font-bold text-xs">{(rc.user_name ?? rc.user_id).charAt(0).toUpperCase()}</span>
                                }
                              </div>
                              <div className={`flex-1 bg-slate-50 dark:bg-slate-800/40 rounded-xl px-3 py-2`}>
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="font-semibold">{rc.user_name ?? `${rc.user_id.slice(0,8)}…`}</span>
                                  <span className="text-slate-400">•</span>
                                  <span className="text-slate-500">{timeAgo(rc.created_at)}</span>
                                  <span className="ms-2 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600">رد</span>
                                </div>
                                <div className="mt-2 text-sm leading-relaxed">{rc.content}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="my-4 h-px bg-slate-200 dark:bg-slate-700" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
    {/* Report Dialog */}
    <Dialog open={!!reportOpenId} onOpenChange={(o) => { setReportOpenId(o ? reportOpenId : null); if (!o) setReportDesc(''); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>سبب التبليغ</DialogTitle>
        </DialogHeader>
        <Textarea
          placeholder="اكتب سبب التبليغ بإيجاز"
          value={reportDesc}
          onChange={(e) => setReportDesc(e.target.value)}
          className="min-h-[120px]"
          dir="auto"
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => { setReportOpenId(null); setReportDesc(''); }} disabled={!!reportingId}>إلغاء</Button>
          <Button
            onClick={() => {
              const d = reportDesc.trim();
              if (!d) {
                toast({ title: 'مطلوب وصف', description: 'يرجى كتابة سبب التبليغ', variant: 'destructive' });
                return;
              }
              if (reportOpenId) reportComment(reportOpenId, d);
            }}
            disabled={!!reportingId}
          >
            {reportingId ? '...' : 'إرسال البلاغ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default CommentsSection;
