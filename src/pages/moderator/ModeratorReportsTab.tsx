import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Eye, Filter, Flag } from 'lucide-react';

export interface ModReport {
  id: string;
  target: string;
  reason: string;
  date: string;
  status: 'pending' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high';
  reportedBy: string;
}

interface ModeratorReportsTabProps {
  currentLanguage: 'ar' | 'fr' | 'en';
  isRTL: boolean;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  reports: ModReport[];
  userNameMap: Record<string, string>;
  extractUUID: (v?: string | null) => string | null;
  newsTitleMap: Record<string, string>;
  commentTextMap: Record<string, string>;
  openViewReported: (rep: ModReport) => void;
  getPriorityBadge: (p: string) => { label: string; variant: any };
  getStatusBadge: (s: string) => { label: string; variant: any };
  reportsPage: number;
  setReportsPage: (updater: (p: number) => number) => void;
  reportsHasNext: boolean;
}

const ModeratorReportsTab: React.FC<ModeratorReportsTabProps> = ({
  currentLanguage,
  isRTL,
  searchTerm,
  setSearchTerm,
  reports,
  userNameMap,
  extractUUID,
  newsTitleMap,
  commentTextMap,
  openViewReported,
  getPriorityBadge,
  getStatusBadge,
  reportsPage,
  setReportsPage,
  reportsHasNext,
}) => {
  return (
    <>
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
                      {(() => {
                        const target = String(report.target).toLowerCase();
                        const mNews = target.match(/news[:#\s-]?(\d+)/);
                        if (mNews) return newsTitleMap[mNews[1]] || report.target;
                        const uuid = target.match(/comment[:#\s-]?([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
                        if (uuid) return commentTextMap[uuid[1]] || (currentLanguage === 'ar' ? 'تعليق' : 'Commentaire');
                        return report.target;
                      })()}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{report.reason}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      {currentLanguage === 'ar' ? 'بلغ من قبل:' : 'Signalé par:'} {userNameMap[extractUUID(report.reportedBy) || report.reportedBy] || '—'} • {report.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" onClick={() => openViewReported(report)} className="text-slate-700 border-slate-200 hover:bg-slate-50">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Badge variant={getPriorityBadge(report.priority).variant}>{getPriorityBadge(report.priority).label}</Badge>
                  <Badge variant={getStatusBadge(report.status).variant}>{getStatusBadge(report.status).label}</Badge>
                </div>
              </div>
            ))}
          </div>
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''} pt-2`}>
            <div className="text-xs text-slate-500">{currentLanguage === 'ar' ? `صفحة ${reportsPage}` : `Page ${reportsPage}`}</div>
            <div className={`flex ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
              <Button variant="outline" size="sm" disabled={reportsPage <= 1} onClick={() => setReportsPage((p) => Math.max(1, p - 1))}>
                {currentLanguage === 'ar' ? 'السابق' : 'Précédent'}
              </Button>
              <Button variant="outline" size="sm" disabled={!reportsHasNext} onClick={() => setReportsPage((p) => p + 1)}>
                {currentLanguage === 'ar' ? 'التالي' : 'Suivant'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ModeratorReportsTab;
