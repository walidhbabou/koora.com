import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Flag, CheckCircle, XCircle } from 'lucide-react';

export interface ModReport {
  id: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'resolved' | 'dismissed';
  target: string;
  reason: string;
}

export interface ModComment {
  id: string;
  author: string;
  content: string;
  status: 'approved' | 'pending' | 'rejected';
  reports: number;
}

interface ModeratorOverviewTabProps {
  reports: ModReport[];
  comments: ModComment[];
  currentLanguage: 'ar' | 'fr' | 'en';
  isRTL: boolean;
  onApproveComment: (id: string) => void;
  onRejectComment: (id: string) => void;
  getStatusBadge: (status: string) => { label: string; variant: any };
}

const ModeratorOverviewTab: React.FC<ModeratorOverviewTabProps> = ({
  reports,
  comments,
  currentLanguage,
  isRTL,
  onApproveComment,
  onRejectComment,
  getStatusBadge,
}) => {
  return (
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
            {reports
              .filter((r) => r.priority === 'high' && r.status === 'pending')
              .map((report) => (
                <div
                  key={report.id}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border border-red-200 dark:border-red-800"
                >
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
            {comments
              .filter((c) => c.status === 'pending')
              .slice(0, 3)
              .map((comment) => (
                <div key={comment.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-slate-900 dark:text-white text-sm">{comment.author}</h4>
                      <Badge variant={getStatusBadge(comment.status).variant}>{getStatusBadge(comment.status).label}</Badge>
                      {comment.reports > 0 && <Badge variant="destructive">{comment.reports}</Badge>}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{comment.content}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Button size="sm" variant="outline" onClick={() => onApproveComment(comment.id)} className="text-green-600 border-green-200 hover:bg-green-50">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {currentLanguage === 'ar' ? 'موافقة' : 'Approuver'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => onRejectComment(comment.id)} className="text-red-600 border-red-200 hover:bg-red-50">
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
  );
};

export default ModeratorOverviewTab;
