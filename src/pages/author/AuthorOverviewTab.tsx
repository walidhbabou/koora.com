import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, FileText, BookOpen, Edit } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Article {
  id: string;
  title: string;
  category: string;
  status: 'draft' | 'submitted' | 'published' | 'rejected';
  feedback?: string;
}

interface AuthorOverviewTabProps {
  articles: Article[];
}

const AuthorOverviewTab: React.FC<AuthorOverviewTabProps> = ({ articles }) => {
  const { currentLanguage } = useLanguage();

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <Card className="hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="w-5 h-5 text-blue-600" />
              <span>{currentLanguage === 'ar' ? 'قيد المراجعة' : 'En Attente de Révision'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {articles.filter(a => a.status === 'submitted').slice(0, 3).map((article) => (
                <div key={article.id} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-white hover:to-purple-50 dark:hover:from-slate-700 dark:hover:to-purple-900/20 transition-all duration-300 hover:shadow-md hover:scale-[1.02] bg-white dark:bg-slate-800/60 shadow-md mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-md">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900 dark:text-white text-sm">{article.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{article.category}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {currentLanguage === 'ar' ? 'مرسل' : 'Soumis'}
                  </Badge>
                </div>
              ))}
              {articles.filter(a => a.status === 'submitted').length === 0 && (
                <div className="text-sm text-slate-500 text-center py-4">
                  {currentLanguage === 'ar' ? 'لا توجد مقالات قيد المراجعة' : 'Aucun article en attente'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <span>{currentLanguage === 'ar' ? 'إحصائيات الكتابة' : "Statistiques d'Écriture"}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {currentLanguage === 'ar' ? 'مقالات هذا الشهر' : 'Articles ce mois'}
                </span>
                <span className="font-semibold text-purple-600">4</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {currentLanguage === 'ar' ? 'معدل القبول' : "Taux d'acceptation"}
                </span>
                <span className="font-semibold text-green-600">75%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {currentLanguage === 'ar' ? 'متوسط المشاهدات' : 'Vues moyennes'}
                </span>
                <span className="font-semibold text-blue-600">850</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Feedback */}
      {articles.some(a => a.feedback) && (
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Edit className="w-5 h-5 text-orange-600" />
              <span>{currentLanguage === 'ar' ? 'ملاحظات حديثة' : 'Commentaires Récents'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {articles.filter(a => a.feedback).map((article) => (
                <div key={article.id} className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
                  <h4 className="font-medium text-slate-900 dark:text-white mb-2">{article.title}</h4>
                  <p className="text-sm text-red-700 dark:text-red-300">{article.feedback}</p>
                  <Badge variant="destructive" className="mt-2">
                    {currentLanguage === 'ar' ? 'مرفوض' : 'Rejeté'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default AuthorOverviewTab;
