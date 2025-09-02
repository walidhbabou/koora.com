import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ThumbsUp, ThumbsDown, ChevronLeft, MoreHorizontal, MessageSquare } from "lucide-react";

interface CommentRow {
  id: string;
  user_id: string;
  user_name?: string | null;
  avatar_url?: string | null;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

const CommentsSection: React.FC<{ newsId: number }> = ({ newsId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [newComment, setNewComment] = useState("");

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
      setComments((data || []).map((c: any) => ({
        id: String(c.id),
        user_id: c.user_id,
        user_name: c.user_name,
        avatar_url: c.avatar_url,
        content: c.content,
        status: c.status,
        created_at: c.created_at
      })));
    } catch (e) {
      console.error('load comments failed', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComments(); }, [newsId, user?.id]);

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

  return (
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
          {comments.map((c) => (
            <div key={c.id} className="">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-sport-green/15 flex items-center justify-center">
                  {c.avatar_url
                    ? <img src={c.avatar_url} alt={c.user_name ?? ''} className="w-full h-full object-cover" />
                    : <span className="text-sport-green font-bold">{(c.user_name ?? c.user_id).charAt(0).toUpperCase()}</span>
                  }
                </div>
                <div className="flex-1">
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
                    <button className="flex items-center gap-1 hover:text-sport-green">
                      <ThumbsUp className="w-4 h-4" />
                      <span>0</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-sport-green">
                      <ThumbsDown className="w-4 h-4" />
                      <span>0</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-sport-green">
                      <MessageSquare className="w-4 h-4" />
                      <span>شاهد التعليق</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="my-4 h-px bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommentsSection;
