import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CheckCircle, Trash, XCircle } from 'lucide-react';

export interface ModComment {
  id: string;
  author: string;
  content: string;
  status: 'approved' | 'pending' | 'rejected';
  reports: number;
}

interface ModeratorCommentsTabProps {
  currentLanguage: 'ar' | 'fr' | 'en';
  isRTL: boolean;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  loadingComments: boolean;
  comments: ModComment[];
  getStatusBadge: (s: string) => { label: string; variant: any };
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
  commentsPage: number;
  setCommentsPage: (updater: (p: number) => number) => void;
  commentsHasNext: boolean;
}

const ModeratorCommentsTab: React.FC<ModeratorCommentsTabProps> = ({
  currentLanguage,
  isRTL,
  searchTerm,
  setSearchTerm,
  loadingComments,
  comments,
  getStatusBadge,
  onApprove,
  onReject,
  onDelete,
  commentsPage,
  setCommentsPage,
  commentsHasNext,
}) => {
  return (
    <>
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
                  <Button size="sm" variant="outline" onClick={() => onApprove(c.id)} className="text-green-600 border-green-200 hover:bg-green-50">
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onReject(c.id)} className="text-red-600 border-red-200 hover:bg-red-50">
                    <XCircle className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onDelete(c.id)} className="text-slate-700 border-slate-200 hover:bg-slate-50">
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {!loadingComments && comments.length === 0 && (
              <div className="text-sm text-slate-500">{currentLanguage === 'ar' ? 'لا توجد تعليقات' : 'Aucun commentaire'}</div>
            )}
          </div>
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''} pt-2`}>
            <div className="text-xs text-slate-500">{currentLanguage === 'ar' ? `صفحة ${commentsPage}` : `Page ${commentsPage}`}</div>
            <div className={`flex ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
              <Button variant="outline" size="sm" disabled={commentsPage <= 1} onClick={() => setCommentsPage((p) => Math.max(1, p - 1))}>{currentLanguage === 'ar' ? 'السابق' : 'Précédent'}</Button>
              <Button variant="outline" size="sm" disabled={!commentsHasNext} onClick={() => setCommentsPage((p) => p + 1)}>{currentLanguage === 'ar' ? 'التالي' : 'Suivant'}</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ModeratorCommentsTab;
