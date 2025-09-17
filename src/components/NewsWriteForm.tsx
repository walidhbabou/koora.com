import React, { useState } from "react";
import NewsEditor from "./NewsEditor";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon } from "lucide-react";

interface NewsWriteFormProps {
  title: string;
  setTitle: (v: string) => void;
  content: string;
  setContent: (v: string) => void;
  categoryId: number | null;
  setCategoryId: (v: number | null) => void;
  championId: number | null;
  setChampionId: (v: number | null) => void;
  imageFile: File | null;
  setImageFile: (f: File | null) => void;
  categories: { id: number; name: string; name_ar: string }[];
  champions: { id: number; nom: string; nom_ar: string }[];
  error?: string;
  onSaveDraft: () => void;
  onSubmit: () => void;
  savingDraft: boolean;
  submitting: boolean;
  isRTL: boolean;
  currentLanguage: string;
  setPreviewOpen?: (v: boolean) => void;
}

const NewsWriteForm: React.FC<NewsWriteFormProps> = ({
  title,
  setTitle,
  content,
  setContent,
  categoryId,
  setCategoryId,
  championId,
  setChampionId,
  imageFile,
  setImageFile,
  categories,
  champions,
  error,
  onSaveDraft,
  onSubmit,
  savingDraft,
  submitting,
  isRTL,
  currentLanguage,
  setPreviewOpen,
}) => {
  const [step, setStep] = useState(1);
  const isTitleValid = !!title.trim();
  const isContentValid = !!content.trim() && content !== "{}";

  return (
  <div className="space-y-6 max-w-2xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700" style={{ minHeight: 520 }}>
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-purple-700 dark:text-purple-300 mb-2 text-center">{currentLanguage === "ar" ? "الخطوة 1: العنوان" : "Étape 1 : Titre"}</h2>
          <Input
            placeholder={currentLanguage === "ar" ? "عنوان المقال..." : "Titre de l'article..."}
            className="text-lg font-medium border-2 border-purple-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <div className="flex justify-end mt-4">
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg shadow"
              disabled={!isTitleValid}
              onClick={() => setStep(2)}
            >
              {currentLanguage === "ar" ? "التالي" : "Suivant"}
            </Button>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-purple-700 dark:text-purple-300 mb-2 text-center">{currentLanguage === "ar" ? "الخطوة 2: المحتوى" : "Étape 2 : Contenu"}</h2>
          <div className="border-2 border-purple-400 rounded-lg p-2 bg-slate-50 dark:bg-slate-800" style={{ minHeight: 270, maxHeight: 420, overflowY: 'auto', direction: isRTL ? 'rtl' : 'ltr' }}>
            <NewsEditor
              initialData={content ? JSON.parse(content) : undefined}
              onSave={data => setContent(JSON.stringify(data))}
              placeholder={currentLanguage === "ar" ? "ابدأ الكتابة هنا..." : "Commencez à écrire ici..."}
            />
          </div>
          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              className="px-6 py-2 rounded-lg"
              onClick={() => setStep(1)}
            >
              {currentLanguage === "ar" ? "رجوع" : "Retour"}
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg shadow"
              disabled={!isContentValid}
              onClick={() => setStep(3)}
            >
              {currentLanguage === "ar" ? "التالي" : "Suivant"}
            </Button>
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-purple-700 dark:text-purple-300 mb-2 text-center">{currentLanguage === "ar" ? "الخطوة 3: تفاصيل إضافية" : "Étape 3 : Détails supplémentaires"}</h2>
          <div>
            <label className="block text-sm mb-1 font-semibold">{currentLanguage === "ar" ? "الفئة" : "Catégorie"}</label>
            <select
              className="w-full border rounded-md h-10 px-2"
              value={categoryId ?? ""}
              onChange={e => setCategoryId(e.target.value ? Number(e.target.value) : null)}
              required
            >
              <option value="">{currentLanguage === "ar" ? "اختر الفئة" : "Choisir une catégorie"}</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{currentLanguage === "ar" ? (c.name_ar || c.name) : c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1 font-semibold">{currentLanguage === "ar" ? "البطولة" : "Championnat"}</label>
            <select
              className="w-full border rounded-md h-10 px-2"
              value={championId ?? ""}
              onChange={e => setChampionId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">{currentLanguage === "ar" ? "اختر البطولة (اختياري)" : "Choisir un championnat (optionnel)"}</option>
              {champions.map(c => (
                <option key={c.id} value={c.id}>{currentLanguage === "ar" ? (c.nom_ar || c.nom) : c.nom}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1 font-semibold">{currentLanguage === "ar" ? "الصورة" : "Image"}</label>
            <Input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] ?? null)} />
            {!imageFile && (
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">{currentLanguage === "ar" ? "اختياري" : "Optionnel"}</div>
            )}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
            <Button
              variant="outline"
              className="px-6 py-2 rounded-lg"
              onClick={() => setStep(2)}
            >
              {currentLanguage === "ar" ? "رجوع" : "Retour"}
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto text-white px-6 py-2 rounded-lg shadow"
              disabled={savingDraft || submitting || !categoryId}
              onClick={onSubmit}
            >
              {submitting ? (currentLanguage === "ar" ? "جارٍ الإرسال..." : "Envoi...") : (currentLanguage === "ar" ? "إرسال للمراجعة" : "Soumettre")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsWriteForm;
