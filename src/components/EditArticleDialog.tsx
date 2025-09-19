import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';

interface Article {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  status: 'published' | 'draft' | 'review' | 'scheduled' | 'submitted' | 'rejected' | 'approved';
  imageUrl?: string;
  views?: number;
  lastModified: string;
}

interface Competition {
  id: number;
  nom: string;
}

interface EditArticleDialogProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const EditArticleDialog: React.FC<EditArticleDialogProps> = ({
  article,
  isOpen,
  onClose,
  onSave
}) => {
  const { currentLanguage, isRTL } = useLanguage();
  
  // Form states
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editStatus, setEditStatus] = useState<Article['status']>('draft');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Competition states
  const [competitionInternationaleId, setCompetitionInternationaleId] = useState<number | null>(null);
  const [competitionMondialeId, setCompetitionMondialeId] = useState<number | null>(null);
  const [competitionContinentaleId, setCompetitionContinentaleId] = useState<number | null>(null);
  const [competitionLocaleId, setCompetitionLocaleId] = useState<number | null>(null);
  const [transfertNewsId, setTransfertNewsId] = useState<number | null>(null);

  // Competition options
  const [competitionsInternationales, setCompetitionsInternationales] = useState<Competition[]>([]);
  const [competitionsMondiales, setCompetitionsMondiales] = useState<Competition[]>([]);
  const [competitionsContinentales, setCompetitionsContinentales] = useState<Competition[]>([]);
  const [competitionsLocales, setCompetitionsLocales] = useState<Competition[]>([]);
  const [transfertsNews, setTransfertsNews] = useState<Competition[]>([]);

  // Load competitions data
  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const [intRes, mondRes, contRes, locRes, transRes] = await Promise.all([
          supabase.from('competitions_internationales').select('id, nom').order('id'),
          supabase.from('competitions_mondiales').select('id, nom').order('id'),
          supabase.from('competitions_continentales').select('id, nom').order('id'),
          supabase.from('competitions_locales').select('id, nom').order('id'),
          supabase.from('transferts_news').select('id, nom').order('id')
        ]);

        if (intRes.data) setCompetitionsInternationales(intRes.data);
        if (mondRes.data) setCompetitionsMondiales(mondRes.data);
        if (contRes.data) setCompetitionsContinentales(contRes.data);
        if (locRes.data) setCompetitionsLocales(locRes.data);
        if (transRes.data) setTransfertsNews(transRes.data);
      } catch (e) {
        console.error('Failed to load competitions:', e);
      }
    };

    if (isOpen) {
      fetchCompetitions();
    }
  }, [isOpen]);

  // Initialize form when article changes
  useEffect(() => {
    if (article) {
      setEditTitle(article.title);
      setEditContent(article.content);
      setEditStatus(article.status);
      setError('');
      setEditImageFile(null);
      
      // Reset competition selections
      setCompetitionInternationaleId(null);
      setCompetitionMondialeId(null);
      setCompetitionContinentaleId(null);
      setCompetitionLocaleId(null);
      setTransfertNewsId(null);
    }
  }, [article]);

  const uploadImageIfAny = async (): Promise<string | undefined> => {
    if (!editImageFile) return undefined;
    
    const ext = editImageFile.name.split('.').pop();
    const filePath = `articles/${Date.now()}.${ext}`;
    
    const { error: upErr } = await supabase.storage
      .from('news-images')
      .upload(filePath, editImageFile, { upsert: false });
    
    if (upErr) throw upErr;
    
    const { data: pub } = supabase.storage.from('news-images').getPublicUrl(filePath);
    return pub?.publicUrl;
  };

  const handleSave = async () => {
    if (!article) return;
    
    if (!editTitle.trim() || !editContent.trim()) {
      setError(currentLanguage === 'ar' ? 'العنوان والمحتوى إجباريان' : 'Titre et contenu requis');
      return;
    }

    setSaving(true);
    setError('');

    try {
      let imageUrl = article.imageUrl;
      
      // Upload new image if provided
      if (editImageFile) {
        imageUrl = await uploadImageIfAny();
      }

      // Update the article
      const updateData = {
        title: editTitle,
        content: editContent,
        status: editStatus,
        image_url: imageUrl || null,
        competition_internationale_id: competitionInternationaleId,
        competition_mondiale_id: competitionMondialeId,
        competition_continentale_id: competitionContinentaleId,
        competition_locale_id: competitionLocaleId,
        transfert_news_id: transfertNewsId,
      };

      const { error } = await supabase
        .from('news_submissions')
        .update(updateData)
        .eq('id', Number(article.id));

      if (error) throw error;

      onSave();
      onClose();
    } catch (e: unknown) {
      console.error('Save error:', e);
      setError((e as Error)?.message || (currentLanguage === 'ar' ? 'فشل الحفظ' : 'Échec de la sauvegarde'));
    } finally {
      setSaving(false);
    }
  };

  const statusOptions = [
    { value: 'draft', label: currentLanguage === 'ar' ? 'مسودة' : 'Brouillon' },
    { value: 'review', label: currentLanguage === 'ar' ? 'مراجعة' : 'Révision' },
    { value: 'published', label: currentLanguage === 'ar' ? 'منشور' : 'Publié' },
    { value: 'scheduled', label: currentLanguage === 'ar' ? 'مجدول' : 'Programmé' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader className={isRTL ? 'text-right' : 'text-left'}>
          <DialogTitle className="text-xl font-bold">
            {currentLanguage === 'ar' ? 'تعديل المقال' : 'Modifier l\'Article'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-title">
              {currentLanguage === 'ar' ? 'العنوان' : 'Titre'}
            </Label>
            <Input
              id="edit-title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder={currentLanguage === 'ar' ? 'أدخل عنوان المقال' : 'Entrez le titre de l\'article'}
              className={isRTL ? 'text-right' : 'text-left'}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="edit-status">
              {currentLanguage === 'ar' ? 'الحالة' : 'Statut'}
            </Label>
            <Select value={editStatus} onValueChange={(value: Article['status']) => setEditStatus(value)}>
              <SelectTrigger className={isRTL ? 'text-right' : 'text-left'}>
                <SelectValue placeholder={currentLanguage === 'ar' ? 'اختر الحالة' : 'Choisir le statut'} />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="edit-image">
              {currentLanguage === 'ar' ? 'الصورة' : 'Image'}
            </Label>
            <Input
              id="edit-image"
              type="file"
              accept="image/*"
              onChange={(e) => setEditImageFile(e.target.files?.[0] || null)}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {/* Competitions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Competition Internationale */}
            <div className="space-y-2">
              <Label>{currentLanguage === 'ar' ? 'المسابقة الدولية' : 'Compétition Internationale'}</Label>
              <Select value={competitionInternationaleId?.toString() || 'none'} onValueChange={(v) => setCompetitionInternationaleId(v === 'none' ? null : Number(v))}>
                <SelectTrigger>
                  <SelectValue placeholder={currentLanguage === 'ar' ? 'اختر مسابقة' : 'Choisir une compétition'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{currentLanguage === 'ar' ? 'بدون' : 'Aucune'}</SelectItem>
                  {competitionsInternationales.map((comp) => (
                    <SelectItem key={comp.id} value={comp.id.toString()}>{comp.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Competition Mondiale */}
            <div className="space-y-2">
              <Label>{currentLanguage === 'ar' ? 'المسابقة العالمية' : 'Compétition Mondiale'}</Label>
              <Select value={competitionMondialeId?.toString() || 'none'} onValueChange={(v) => setCompetitionMondialeId(v === 'none' ? null : Number(v))}>
                <SelectTrigger>
                  <SelectValue placeholder={currentLanguage === 'ar' ? 'اختر مسابقة' : 'Choisir une compétition'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{currentLanguage === 'ar' ? 'بدون' : 'Aucune'}</SelectItem>
                  {competitionsMondiales.map((comp) => (
                    <SelectItem key={comp.id} value={comp.id.toString()}>{comp.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Competition Continentale */}
            <div className="space-y-2">
              <Label>{currentLanguage === 'ar' ? 'المسابقة القارية' : 'Compétition Continentale'}</Label>
              <Select value={competitionContinentaleId?.toString() || 'none'} onValueChange={(v) => setCompetitionContinentaleId(v === 'none' ? null : Number(v))}>
                <SelectTrigger>
                  <SelectValue placeholder={currentLanguage === 'ar' ? 'اختر مسابقة' : 'Choisir une compétition'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{currentLanguage === 'ar' ? 'بدون' : 'Aucune'}</SelectItem>
                  {competitionsContinentales.map((comp) => (
                    <SelectItem key={comp.id} value={comp.id.toString()}>{comp.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Competition Locale */}
            <div className="space-y-2">
              <Label>{currentLanguage === 'ar' ? 'المسابقة المحلية' : 'Compétition Locale'}</Label>
              <Select value={competitionLocaleId?.toString() || 'none'} onValueChange={(v) => setCompetitionLocaleId(v === 'none' ? null : Number(v))}>
                <SelectTrigger>
                  <SelectValue placeholder={currentLanguage === 'ar' ? 'اختر مسابقة' : 'Choisir une compétition'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{currentLanguage === 'ar' ? 'بدون' : 'Aucune'}</SelectItem>
                  {competitionsLocales.map((comp) => (
                    <SelectItem key={comp.id} value={comp.id.toString()}>{comp.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Transfert News */}
            <div className="space-y-2 md:col-span-2">
              <Label>{currentLanguage === 'ar' ? 'أخبار الانتقالات' : 'Transferts News'}</Label>
              <Select value={transfertNewsId?.toString() || 'none'} onValueChange={(v) => setTransfertNewsId(v === 'none' ? null : Number(v))}>
                <SelectTrigger>
                  <SelectValue placeholder={currentLanguage === 'ar' ? 'اختر فئة' : 'Choisir une catégorie'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{currentLanguage === 'ar' ? 'بدون' : 'Aucune'}</SelectItem>
                  {transfertsNews.map((trans) => (
                    <SelectItem key={trans.id} value={trans.id.toString()}>{trans.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="edit-content">
              {currentLanguage === 'ar' ? 'المحتوى' : 'Contenu'}
            </Label>
            <Textarea
              id="edit-content"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder={currentLanguage === 'ar' ? 'أدخل محتوى المقال' : 'Entrez le contenu de l\'article'}
              rows={10}
              className={`resize-none ${isRTL ? 'text-right' : 'text-left'}`}
            />
          </div>
        </div>

        {/* Actions */}
        <div className={`flex gap-3 pt-4 border-t ${isRTL ? 'justify-start' : 'justify-end'}`}>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            <X className="w-4 h-4 mr-2" />
            {currentLanguage === 'ar' ? 'إلغاء' : 'Annuler'}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saving ? 
              (currentLanguage === 'ar' ? 'جاري الحفظ...' : 'Sauvegarde...') : 
              (currentLanguage === 'ar' ? 'حفظ' : 'Sauvegarder')
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditArticleDialog;