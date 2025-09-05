import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText, TrendingUp } from 'lucide-react';

export interface EditorArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  date: string;
  status: 'published' | 'draft' | 'review' | 'scheduled' | 'submitted' | 'rejected' | 'approved';
  imageUrl?: string;
  views?: number;
  lastModified: string;
}

interface EditorOverviewTabProps {
  articles: EditorArticle[];
  currentLanguage: 'ar' | 'fr' | 'en';
  isRTL: boolean;
}

const EditorOverviewTab: React.FC<EditorOverviewTabProps> = ({ articles, currentLanguage, isRTL }) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <span>{currentLanguage === 'ar' ? 'قيد المراجعة' : 'En Attente de Révision'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {articles.filter(a => a.status === 'review').map((article) => (
              <div key={article.id} className="flex items-center space-x-3 p-4 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 dark:hover:from-slate-700 dark:hover:to-orange-900/20 transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900 dark:text-white">{article.title}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{article.author}</p>
                </div>
                <Badge variant="secondary">
                  {currentLanguage === 'ar' ? 'مراجعة' : 'Révision'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditorOverviewTab;
