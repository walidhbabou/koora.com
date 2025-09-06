import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Clock, ArrowRight, Flag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import CommentsSection from "@/components/CommentsSection";
import { useToast } from "@/hooks/use-toast";
import DOMPurify from 'dompurify';
import { useAuth } from "@/contexts/AuthContext";

interface NewsRow {
  id: number;
  title: string;
  content: string;
  created_at: string;
  image_url?: string | null;
  status?: string | null;
}

const NewsDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<NewsRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [reporting, setReporting] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const [reportOpen, setReportOpen] = useState(false);
  const [reportDesc, setReportDesc] = useState('');

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('news')
        .select('id, title, content, created_at, image_url, status')
        .eq('id', Number(id))
        .single();
      if (error) throw error;
      setNews(data as any);
    } catch (e: any) {
      setError(e?.message || 'Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const reportThisNews = async (description: string) => {
    if (!id) return;
    if (reporting) return;
    if (!isAuthenticated || !user?.id) {
      toast({ title: 'يرجى تسجيل الدخول', description: 'يجب تسجيل الدخول لإرسال البلاغ', variant: 'destructive' });
      return;
    }
    setReporting(true);
    try {
      // Prefer RPC; fallback ONLY if function is missing
      try {
        const { error } = await supabase.rpc('create_report', {
          p_type: 'content',
          p_target: `news:${id}`,
          p_reason: 'inappropriate',
          p_description: description,
          p_reported_by: user.id
        });
        if (error) throw error;
      } catch (rpcErr: any) {
        const msg: string = rpcErr?.message || '';
        const code: string | undefined = rpcErr?.code;
        // Only fallback if the function TRULY does not exist (e.g., Postgres 42883)
        const fnMissing = (code === '42883') || /function\s+create_report\s*\(.*\)\s+does not exist/i.test(msg) || /does not exist/i.test(msg);
        if (!fnMissing) throw rpcErr; // avoid fallback on permission/RLS errors
        // Fallback direct insert when RPC is missing
        const { error: insErr } = await supabase.from('reports').insert({
          type: 'content',
          target: `news:${id}`,
          reason: 'inappropriate',
          description,
          reported_by: user.id
        });
        if (insErr) throw insErr;
      }
      toast({ description: 'تم إرسال البلاغ بنجاح' });
      setReportOpen(false);
      setReportDesc('');
    } catch (e: any) {
      toast({ title: 'Erreur', description: e?.message || 'تعذر إرسال البلاغ', variant: 'destructive' });
    } finally {
      setReporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-sport-light/20 to-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sport-green">
            <ArrowRight className="w-4 h-4" />
            <Link to="/news" className="text-sm hover:underline">العودة إلى الأخبار</Link>
          </div>
          <Button size="sm" variant="outline" className="gap-2" onClick={() => setReportOpen(true)} disabled={reporting}>
            <Flag className="w-4 h-4" />
            {reporting ? '...' : 'تبليغ عن الخبر'}
          </Button>
        </div>

        {loading && (
          <div className="text-sm text-muted-foreground">جار التحميل…</div>
        )}
        {error && (
          <div className="text-sm text-red-600">{error}</div>
        )}
        {news && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="overflow-hidden p-0">
                {news.image_url && (
                  <img src={news.image_url} alt={news.title} className="w-full h-64 md:h-96 object-cover" />
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{news.created_at ? new Date(news.created_at).toISOString().slice(0,10) : ''}</span>
                    <Badge variant="secondary">أخبار</Badge>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-extrabold mb-4">{news.title}</h1>
                  <div
                    className="prose prose-slate dark:prose-invert max-w-none leading-relaxed"
                    dir="auto"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(news.content || '') }}
                  />
                </div>
              </Card>

              {/* Comments */}
              <CommentsSection newsId={Number(id)} />
            </div>

            {/* Sidebar placeholder (related news, categories, etc.) */}
            <div className="space-y-6">
              <Card className="p-5">
                <h3 className="font-bold mb-3">قد يهمك</h3>
                <p className="text-sm text-muted-foreground">سنضيف أخبارًا ذات صلة هنا لاحقًا.</p>
              </Card>
            </div>
          </div>
        )}
      </div>
      <Footer />

      {/* Report Dialog */}
      <Dialog open={reportOpen} onOpenChange={(o) => { setReportOpen(o); if (!o) setReportDesc(''); }}>
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
            <Button variant="outline" onClick={() => setReportOpen(false)} disabled={reporting}>إلغاء</Button>
            <Button
              onClick={() => {
                const d = reportDesc.trim();
                if (!d) {
                  toast({ title: 'مطلوب وصف', description: 'يرجى كتابة سبب التبليغ', variant: 'destructive' });
                  return;
                }
                reportThisNews(d);
              }}
              disabled={reporting}
            >
              {reporting ? '...' : 'إرسال البلاغ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewsDetails;
