import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useLanguage } from '@/contexts/LanguageContext';
import type { NewsItem, ChampionRow } from '@/types/admin';

type EditableStatus = NonNullable<NewsItem['status']>;
type EditingNews = {
  id: string | number;
  title: string;
  content: string;
  category?: string;
  status: EditableStatus;
  championId: number | null;
};

export interface EditNewsFormProps {
  news: EditingNews;
  champions: ChampionRow[];
  onSubmit: (data: Partial<NewsItem>) => void;
  onPublish?: (id: string | number) => void;
}

const EditNewsForm: React.FC<EditNewsFormProps> = ({ news, champions, onSubmit, onPublish }) => {
  const { currentLanguage, isRTL } = useLanguage();
  const [formData, setFormData] = useState<EditingNews>({
    id: news.id,
    title: news.title,
    content: news.content,
    category: news.category,
    status: news.status,
    championId: news.championId || null
  });

  const quillModules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ script: 'sub' }, { script: 'super' }],
        ['blockquote', 'code-block'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ direction: isRTL ? 'rtl' : 'ltr' }, { align: [] }],
        ['link', 'image'],
        ['clean'],
      ],
    },
  } as const;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert to the shape expected by AdminDashboard
    const payload: Partial<NewsItem> = {
      id: String(formData.id),
      title: formData.title,
      content: formData.content,
      status: formData.status,
      // category maps to categoryId externally if needed; keep category string for UI
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {currentLanguage === 'ar' ? 'العنوان' : 'Titre'}
        </label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder={currentLanguage === 'ar' ? 'عنوان الخبر' : 'Titre de la news'}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {currentLanguage === 'ar' ? 'المحتوى' : 'Contenu'}
        </label>
        <div className="border rounded-md">
          <ReactQuill
            theme="snow"
            value={formData.content}
            onChange={(content) => setFormData({ ...formData, content })}
            placeholder={currentLanguage === 'ar' ? 'محتوى الخبر' : 'Contenu de la news'}
            modules={quillModules}
            className={isRTL ? 'rtl' : 'ltr'}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {currentLanguage === 'ar' ? 'الفئة' : 'Catégorie'}
          </label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="General">{currentLanguage === 'ar' ? 'عام' : 'Général'}</SelectItem>
              <SelectItem value="Transfers">{currentLanguage === 'ar' ? 'انتقالات' : 'Transferts'}</SelectItem>
              <SelectItem value="Matches">{currentLanguage === 'ar' ? 'مباريات' : 'Matchs'}</SelectItem>
              <SelectItem value="Infrastructure">{currentLanguage === 'ar' ? 'بنية تحتية' : 'Infrastructure'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {currentLanguage === 'ar' ? 'الحالة' : 'Statut'}
          </label>
          <Select value={formData.status} onValueChange={(value: EditableStatus) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">{currentLanguage === 'ar' ? 'مسودة' : 'Brouillon'}</SelectItem>
              <SelectItem value="published">{currentLanguage === 'ar' ? 'منشور' : 'Publié'}</SelectItem>
              <SelectItem value="archived">{currentLanguage === 'ar' ? 'مؤرشف' : 'Archivé'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {currentLanguage === 'ar' ? 'البطولة' : 'Championnat'} <span className="text-red-500">*</span>
          </label>
          <Select 
            value={formData.championId !== null ? String(formData.championId) : undefined} 
            onValueChange={(value) => setFormData({ ...formData, championId: value === 'none' ? null : Number(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder={currentLanguage === 'ar' ? 'اختر البطولة (اختياري)' : 'Choisir un championnat (optionnel)'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{currentLanguage === 'ar' ? 'لا شيء' : 'Aucun'}</SelectItem>
              {champions.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.nom}{c.nom_ar ? ` • ${c.nom_ar}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
        <Button 
          type="button" 
          variant="outline"
          onClick={(e) => {
            e.preventDefault();
            if (onPublish) onPublish(news.id);
          }}
          className="w-full sm:w-auto"
        >
          {currentLanguage === 'ar' ? 'نشر' : 'Publier'}
        </Button>
        <Button type="submit" className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto">
          {currentLanguage === 'ar' ? 'تحديث' : 'Mettre à jour'}
        </Button>
      </div>
    </form>
  );
};

export default EditNewsForm;
