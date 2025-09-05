import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Filter, FileText, Edit as EditIcon, Trash2 } from 'lucide-react';
import type { EditorArticle } from './EditorOverviewTab';

interface EditorArticlesTabProps {
  articles: EditorArticle[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  isRTL: boolean;
  currentLanguage: 'ar' | 'fr' | 'en';
  getStatusBadge: (status: string) => { label: string; variant: any };
  setPreviewId: (id: string) => void;
  approveArticle: (id: string) => Promise<void> | void;
  rejectArticle: (id: string) => Promise<void> | void;
  openEdit: (article: EditorArticle) => void;
  setConfirmDeleteId: (id: string) => void;
}

const EditorArticlesTab: React.FC<EditorArticlesTabProps> = ({
  articles,
  loading,
  searchTerm,
  setSearchTerm,
  isRTL,
  currentLanguage,
  getStatusBadge,
  setPreviewId,
  approveArticle,
  rejectArticle,
  openEdit,
  setConfirmDeleteId,
}) => {
  return (
    <div className="space-y-6">
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-4'}`}>
          <Input
            placeholder={currentLanguage === 'ar' ? 'البحث في المقالات...' : 'Rechercher des articles...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Button variant="outline" size="sm">
            <Filter className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {currentLanguage === 'ar' ? 'تصفية' : 'Filtrer'}
          </Button>
        </div>
        {/* New Article button is managed by the parent EditorDashboard */}
      </div>

      <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-0 shadow-xl">
        <CardHeader>
          <CardTitle>{currentLanguage === 'ar' ? 'إدارة المقالات' : 'Gestion des Articles'}</CardTitle>
          <CardDescription>
            {currentLanguage === 'ar' ? 'إدارة جميع المقالات والمحتوى' : 'Gérez tous vos articles et contenus'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading && (
              <div className="text-sm text-slate-500">
                {currentLanguage === 'ar' ? 'جاري التحميل...' : 'Chargement...'}
              </div>
            )}
            {articles
              .filter((a) => !searchTerm || a.title.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((article) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between p-4 border-0 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-slate-700 dark:hover:to-blue-900/20 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] bg-white dark:bg-slate-800/50 shadow-md mb-3"
                >
                  <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center overflow-hidden shadow-inner">
                      {article.imageUrl ? (
                        <img src={article.imageUrl} alt={article.title} className="w-16 h-16 object-cover" />
                      ) : (
                        <FileText className="w-8 h-8 text-slate-600 dark:text-slate-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white">{article.title}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{article.category} • {article.author}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-500">
                        {currentLanguage === 'ar' ? 'آخر تعديل:' : 'Modifié:'} {article.lastModified}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                    <Badge variant={(getStatusBadge(article.status) as any).variant}>
                      {(getStatusBadge(article.status) as any).label}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => setPreviewId(article.id)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    {article.status === 'submitted' && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => approveArticle(article.id)}>
                          {currentLanguage === 'ar' ? 'نشر' : 'Publier'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => rejectArticle(article.id)}>
                          {currentLanguage === 'ar' ? 'رفض' : 'Rejeter'}
                        </Button>
                      </>
                    )}
                    <Button variant="outline" size="sm" onClick={() => openEdit(article)}>
                      <EditIcon className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setConfirmDeleteId(article.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    {article.status === 'rejected' && (
                      <Badge variant="destructive">{currentLanguage === 'ar' ? 'مرفوض' : 'Rejeté'}</Badge>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditorArticlesTab;
