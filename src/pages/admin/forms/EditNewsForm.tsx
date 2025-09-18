
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import NewsEditor from '@/components/NewsEditor';
import type { NewsItem, ChampionRow } from '@/types/admin';

export interface EditNewsFormProps {
  news: {
    id: string | number;
    title: string;
    content: string;
    status: string;
    // Ajoutez ici les champs compétitions, transferts, image si besoin
    competitionInternationaleId?: number | null;
    competitionMondialeId?: number | null;
    competitionContinentaleId?: number | null;
    competitionLocaleId?: number | null;
    transfertNewsId?: number | null;
    imageFile?: File | null;
  };
  champions?: ChampionRow[];
  onSubmit: (data: Partial<NewsItem>) => void;
  onPublish?: (id: string | number) => void;
}

const EditNewsForm: React.FC<EditNewsFormProps> = ({ news, champions = [], onSubmit, onPublish }) => {
  const { currentLanguage, isRTL } = useLanguage();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState(news.title);
  const [content, setContent] = useState(news.content);
  const [status, setStatus] = useState(news.status);
  const [competitionInternationaleId, setCompetitionInternationaleId] = useState<number | null>(news.competitionInternationaleId ?? null);
  const [competitionMondialeId, setCompetitionMondialeId] = useState<number | null>(news.competitionMondialeId ?? null);
  const [competitionContinentaleId, setCompetitionContinentaleId] = useState<number | null>(news.competitionContinentaleId ?? null);
  const [competitionLocaleId, setCompetitionLocaleId] = useState<number | null>(news.competitionLocaleId ?? null);
  const [transfertNewsId, setTransfertNewsId] = useState<number | null>(news.transfertNewsId ?? null);
  const [imageFile, setImageFile] = useState<File | null>(news.imageFile ?? null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // N'envoyer que les champs existants dans la table news
    onSubmit({
      id: news.id,
      title,
      content,
      status,
      imageFile,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {step === 1 && (
        <>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              {currentLanguage === 'ar' ? 'العنوان' : 'Titre'} <span className="text-red-500">*</span>
            </label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={currentLanguage === 'ar' ? 'عنوان الخبر' : 'Titre de la news'}
              required
              className="w-full text-base h-12 border-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
            />
          </div>
          {/* Competitions Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 border-b pb-2">
              {currentLanguage === 'ar' ? 'المسابقات' : 'Compétitions'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {currentLanguage === 'ar' ? 'المسابقات الدولية' : 'Compétitions Internationales'}
                </label>
                <Select value={competitionInternationaleId !== null ? String(competitionInternationaleId) : undefined} onValueChange={v => setCompetitionInternationaleId(v === 'none' ? null : Number(v))}>
                  <SelectTrigger className="h-12 border-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200">
                    <SelectValue placeholder={currentLanguage === 'ar' ? 'اختر مسابقة دولية (اختياري)' : 'Choisir une compétition internationale (optionnel)'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{currentLanguage === 'ar' ? 'لا شيء' : 'Aucun'}</SelectItem>
                    {/* Ajoutez ici la liste des compétitions internationales si disponible */}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {currentLanguage === 'ar' ? 'المسابقات العالمية' : 'Compétitions Mondiales'}
                </label>
                <Select value={competitionMondialeId !== null ? String(competitionMondialeId) : undefined} onValueChange={v => setCompetitionMondialeId(v === 'none' ? null : Number(v))}>
                  <SelectTrigger className="h-12 border-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200">
                    <SelectValue placeholder={currentLanguage === 'ar' ? 'اختر مسابقة عالمية (اختياري)' : 'Choisir une compétition mondiale (optionnel)'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{currentLanguage === 'ar' ? 'لا شيء' : 'Aucun'}</SelectItem>
                    {/* Ajoutez ici la liste des compétitions mondiales si disponible */}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {currentLanguage === 'ar' ? 'المسابقات القارية' : 'Compétitions Continentales'}
                </label>
                <Select value={competitionContinentaleId !== null ? String(competitionContinentaleId) : undefined} onValueChange={v => setCompetitionContinentaleId(v === 'none' ? null : Number(v))}>
                  <SelectTrigger className="h-12 border-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200">
                    <SelectValue placeholder={currentLanguage === 'ar' ? 'اختر مسابقة قارية (اختياري)' : 'Choisir une compétition continentale (optionnel)'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{currentLanguage === 'ar' ? 'لا شيء' : 'Aucun'}</SelectItem>
                    {/* Ajoutez ici la liste des compétitions continentales si disponible */}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {currentLanguage === 'ar' ? 'المسابقات المحلية' : 'Compétitions Locales'}
                </label>
                <Select value={competitionLocaleId !== null ? String(competitionLocaleId) : undefined} onValueChange={v => setCompetitionLocaleId(v === 'none' ? null : Number(v))}>
                  <SelectTrigger className="h-12 border-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200">
                    <SelectValue placeholder={currentLanguage === 'ar' ? 'اختر مسابقة محلية (اختياري)' : 'Choisir une compétition locale (optionnel)'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{currentLanguage === 'ar' ? 'لا شيء' : 'Aucun'}</SelectItem>
                    {/* Ajoutez ici la liste des compétitions locales si disponible */}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {currentLanguage === 'ar' ? 'أخبار الانتقالات' : 'News Transferts'}
                </label>
                <Select value={transfertNewsId !== null ? String(transfertNewsId) : undefined} onValueChange={v => setTransfertNewsId(v === 'none' ? null : Number(v))}>
                  <SelectTrigger className="h-12 border-2 focus:border-teal-500 focus:ring-2 focus:ring-teal-200">
                    <SelectValue placeholder={currentLanguage === 'ar' ? 'اختر نوع الانتقال (اختياري)' : 'Choisir un type de transfert (optionnel)'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{currentLanguage === 'ar' ? 'لا شيء' : 'Aucun'}</SelectItem>
                    {/* Ajoutez ici la liste des transferts si disponible */}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          {/* Image Upload Section */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              {currentLanguage === 'ar' ? 'صورة' : 'Image'}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all duration-200">
              <input
                type="file"
                accept="image/*"
                onChange={e => setImageFile(e.target.files?.[0] ?? null)}
                className="hidden"
                id="edit-image-upload"
              />
              <label htmlFor="edit-image-upload" className="cursor-pointer block">
                {/* Ajoutez une icône si besoin */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {imageFile ? imageFile.name : (currentLanguage === 'ar' ? 'انقر لاختيار صورة' : 'Cliquez pour choisir une image')}
                </p>
                <p className="text-xs text-gray-500">
                  {currentLanguage === 'ar' ? 'PNG, JPG, GIF حتى 10MB' : 'PNG, JPG, GIF up to 10MB'}
                </p>
              </label>
            </div>
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              {currentLanguage === 'ar' ? 'المحتوى' : 'Contenu'} <span className="text-red-500">*</span>
            </label>
            <div className="border rounded-md">
              <NewsEditor
                initialData={content ? JSON.parse(content) : undefined}
                onSave={data => setContent(JSON.stringify(data))}
                placeholder={currentLanguage === 'ar' ? 'اكتب محتوى الخبر هنا...' : 'Écrivez le contenu de la news ici...'}
              />
            </div>
          </div>
        </>
      )}
      <div className={`flex-shrink-0 flex ${isRTL ? 'justify-start' : 'justify-end'} gap-3 pt-4`}>
        <Button
          variant="outline"
          type="button"
          onClick={() => setStep(1)}
          className="min-w-[120px] h-11 text-base font-medium"
          disabled={step === 1}
        >
          {currentLanguage === 'ar' ? 'معلومات' : 'Infos'}
        </Button>
        <Button
          variant="outline"
          type="button"
          onClick={() => setStep(2)}
          className="min-w-[120px] h-11 text-base font-medium"
          disabled={step === 2 || !title.trim()}
        >
          {currentLanguage === 'ar' ? 'المحتوى' : 'Contenu'}
        </Button>
        <Button
          type="submit"
          className="bg-teal-600 hover:bg-teal-700 min-w-[120px] h-11 text-base font-medium"
        >
          {currentLanguage === 'ar' ? 'تحديث' : 'Mettre à jour'}
        </Button>
        {onPublish && (
          <Button
            type="button"
            variant="outline"
            onClick={() => onPublish(news.id)}
            className="min-w-[120px] h-11 text-base font-medium"
          >
            {currentLanguage === 'ar' ? 'نشر' : 'Publier'}
          </Button>
        )}
      </div>
    </form>
  );
};

export default EditNewsForm;
