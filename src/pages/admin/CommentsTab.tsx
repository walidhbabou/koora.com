import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';

export interface CommentRow {
  id: number;
  content: string;
  user_id: string | null;
  news_id: string | null;
  created_at?: string | null;
}

interface CommentsTabProps {
  comments: CommentRow[];
  loadingComments: boolean;
  commentsPage: number;
  commentsTotal: number;
  pageSize: number;
  onPrevPage: () => void;
  onNextPage: () => void;
}

const CommentsTab: React.FC<CommentsTabProps> = ({
  comments,
  loadingComments,
  commentsPage,
  commentsTotal,
  pageSize,
  onPrevPage,
  onNextPage,
}) => {
  const { currentLanguage, isRTL } = useLanguage();
  const [usersById, setUsersById] = useState<Record<string, { id: string; name: string | null; first_name: string | null; last_name: string | null; email: string | null; role: string | null; avatar_url: string | null }>>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch user profiles for the user_ids present in comments
  useEffect(() => {
    const loadUsers = async () => {
      const ids = Array.from(new Set((comments || []).map(c => c.user_id).filter(Boolean))) as string[];
      if (!ids.length) {
        setUsersById({});
        return;
      }
      const { data, error } = await supabase
        .from('users')
        .select('id, name, first_name, last_name, email, role, avatar_url')
        .in('id', ids);
      if (!error && data) {
        const map: Record<string, any> = {};
        for (const u of data as any[]) map[u.id] = u;
        setUsersById(map);
      }
    };
    loadUsers();
  }, [comments]);

  const formatUser = (uid: string | null) => {
    if (!uid) return '-';
    const u = usersById[uid];
    if (!u) return uid; // fallback to id until loaded
    const displayName = u.name || [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email || uid;
    return displayName;
  };

  const filteredComments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return comments;
    return comments.filter((cm) => {
      const content = (cm.content || '').toLowerCase();
      const uid = (cm.user_id || '').toLowerCase();
      const u = cm.user_id ? usersById[cm.user_id] : null;
      const name = (u?.name || '').toLowerCase();
      const full = [u?.first_name, u?.last_name].filter(Boolean).join(' ').toLowerCase();
      const email = (u?.email || '').toLowerCase();
      const role = (u?.role || '').toLowerCase();
      return (
        content.includes(q) ||
        uid.includes(q) ||
        name.includes(q) ||
        full.includes(q) ||
        email.includes(q) ||
        role.includes(q)
      );
    });
  }, [comments, searchQuery, usersById]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{currentLanguage === 'ar' ? 'التعليقات' : 'Commentaires'}</CardTitle>
          <CardDescription>
            {currentLanguage === 'ar' ? 'قائمة التعليقات من قاعدة البيانات' : 'Liste des commentaires depuis la base de données'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`mb-4 flex ${isRTL ? 'flex-row-reverse' : ''} items-center gap-3`}>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={currentLanguage === 'ar' ? 'ابحث في المحتوى أو المستخدم أو الدور' : 'Rechercher dans le contenu, utilisateur ou rôle'}
              className="max-w-md"
            />
            {searchQuery && (
              <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
                {currentLanguage === 'ar' ? 'مسح' : 'Effacer'}
              </Button>
            )}
          </div>
          {loadingComments && (
            <div className="text-sm text-slate-500">{currentLanguage === 'ar' ? 'جاري التحميل...' : 'Chargement...'}</div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                  {currentLanguage === 'ar' ? 'المحتوى' : 'Contenu'}
                </TableHead>
                {/* Removed News column intentionally */}
                <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                  {currentLanguage === 'ar' ? 'المستخدم' : 'Utilisateur'}
                </TableHead>
                <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                  {currentLanguage === 'ar' ? 'الدور' : 'Rôle'}
                </TableHead>
                <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                  {currentLanguage === 'ar' ? 'التاريخ' : 'Date'}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComments.map((cm) => (
                <TableRow key={cm.id}>
                  <TableCell className="max-w-[500px] whitespace-pre-wrap break-words text-slate-700 dark:text-slate-300">
                    {cm.content || '-'}
                  </TableCell>
                  <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                    {formatUser(cm.user_id)}
                  </TableCell>
                  <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                    {cm.user_id && usersById[cm.user_id]?.role ? (
                      <Badge variant="default" className="capitalize">
                        {usersById[cm.user_id]?.role}
                      </Badge>
                    ) : '-'}
                  </TableCell>
                  <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                    {cm.created_at ? new Date(cm.created_at).toISOString().slice(0,16).replace('T',' ') : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* Comments pagination */}
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''} pt-3`}>
            <div className="text-xs text-slate-500">
              {currentLanguage === 'ar' ? `صفحة ${commentsPage}` : `Page ${commentsPage}`} · {currentLanguage === 'ar' ? `${commentsTotal} إجمالي` : `${commentsTotal} au total`}
            </div>
            <div className={`flex ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
              <Button variant="outline" size="sm" disabled={commentsPage <= 1 || loadingComments} onClick={onPrevPage}>
                {currentLanguage === 'ar' ? 'السابق' : 'Précédent'}
              </Button>
              <Button variant="outline" size="sm" disabled={loadingComments || (commentsPage * pageSize >= commentsTotal)} onClick={onNextPage}>
                {currentLanguage === 'ar' ? 'التالي' : 'Suivant'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommentsTab;
