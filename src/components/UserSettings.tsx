import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Settings, User as UserIcon, LogOut, ChevronLeft } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../hooks/useLanguageHooks';
import { LANGUAGES, LanguageCode } from '../config/constants';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';
import { useSettings } from '@/contexts/SettingsContext';

interface UserSettingsProps {
  className?: string;
}

export const UserSettings: React.FC<UserSettingsProps> = ({ className = '' }) => {
  const { t, isRTL } = useTranslation();
  const { currentLanguage, setLanguage } = useLanguage();
  const { timezone, setTimezone, hourFormat, setHourFormat } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [tempLanguage, setTempLanguage] = useState(currentLanguage);
  const [tempTimezone, setTempTimezone] = useState<string>(timezone);
  const [tempHourFormat, setTempHourFormat] = useState<'12' | '24'>(hourFormat);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState<boolean>(false);
  const [showLangList, setShowLangList] = useState<boolean>(false);

  // sync theme switch with document
  React.useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('theme') : null;
    const dark = stored ? stored === 'dark' : window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(dark);
  }, []);

  const toggleDark = (val: boolean) => {
    setIsDark(val);
    if (val) {
      document.documentElement.classList.add('dark');
      window.localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      window.localStorage.setItem('theme', 'light');
    }
  };

  const handleSaveSettings = () => {
    setLanguage(tempLanguage);
    setTimezone(tempTimezone);
    setHourFormat(tempHourFormat);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempLanguage(currentLanguage);
    setTempTimezone(timezone);
    setTempHourFormat(hourFormat);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`
            group relative h-10 w-10 rounded-full
            text-slate-600 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-200
            bg-slate-100 dark:bg-slate-700
            hover:bg-slate-200 dark:hover:bg-slate-600
            border border-slate-200 dark:border-slate-600
            transition-all duration-200 hover:scale-105
            ${isOpen ? 'ring-2 ring-slate-300 dark:ring-slate-500' : 'ring-0'}
            ${className}
          `}
          aria-label={isRTL ? 'إعدادات' : 'Paramètres'}
          title={isRTL ? 'إعدادات' : 'Paramètres'}
        >
          <Settings className="w-5 h-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align={isRTL ? 'start' : 'end'}
        side="bottom"
        sideOffset={8}
        className={`
          w-[360px] sm:w-[420px]
          ${isRTL ? 'text-right' : 'text-left'}
          rounded-2xl p-0 overflow-hidden
          border border-slate-200 dark:border-slate-800
          bg-white dark:bg-slate-900
        `}
      >
        <div className="px-4 pt-4 pb-2">
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Settings className="w-5 h-5" />
              <h3 className="text-base font-semibold">{isRTL ? 'إعدادات المستخدم' : 'Paramètres utilisateur'}</h3>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {isRTL
                ? 'قم بتخصيص إعدادات حسابك وتفضيلاتك الشخصية'
                : 'Personnalisez les paramètres de votre compte et vos préférences'}
            </p>
          </div>
        </div>

        <div className="px-3 pb-4">
          {/* Account Section */}
          <div className="space-y-3">
            <Label className={`text-sm font-medium flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <UserIcon className="w-4 h-4" />
              {isRTL ? 'حساب المستخدم' : 'Compte utilisateur'}
            </Label>
            {isAuthenticated ? (
              <div className={`flex items-center justify-between p-3 rounded-xl border bg-muted/30 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-9 h-9 rounded-full bg-sport-10 dark:bg-sport-20 flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-sport" />
                  </div>
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <div className="text-sm font-semibold">{user?.name}</div>
                    <div className="text-xs text-muted-foreground">{user?.email}</div>
                  </div>
                </div>
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
                    {isRTL ? 'الملف الشخصي' : 'Profil'}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={logout} aria-label={isRTL ? 'تسجيل الخروج' : 'Déconnexion'}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className={`flex items-center justify-between p-3 rounded-xl border bg-muted/30 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-9 h-9 rounded-full bg-sport-10 dark:bg-sport-20 flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-sport" />
                  </div>
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <div className="text-sm font-medium">{isRTL ? 'لم تقم بتسجيل الدخول' : "Vous n'êtes pas connecté"}</div>
                    <div className="text-xs text-muted-foreground">{isRTL ? 'سجّل الدخول للوصول إلى ملفك' : 'Connectez-vous pour accéder à votre profil'}</div>
                  </div>
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full" size="sm" onClick={() => navigate('/login')}>
                  {isRTL ? 'تسجيل الدخول' : 'Connexion'}
                </Button>
              </div>
            )}
          </div>

          {/* Appearance / Theme */}
          <div className="mt-5">
            <div className="flex items-center justify-between py-3">
              <div className="text-sm text-slate-500 dark:text-slate-400">{isRTL ? 'المظهر' : 'Apparence'}</div>
              <div className="text-sm font-semibold">{isRTL ? 'الوضع الليلي' : 'Mode sombre'}</div>
            </div>
            <div className={`flex items-center justify-between pb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Switch checked={isDark} onCheckedChange={toggleDark} className="data-[state=checked]:bg-emerald-600" />
            </div>
            <hr className="border-slate-200 dark:border-slate-800" />
          </div>

          {/* Language Selection compact row */}
          <div className="mt-3">
            <div className="flex items-center justify-between py-3">
              <div className="text-sm text-slate-500 dark:text-slate-400">{isRTL ? 'اللغة' : 'Langue'}</div>
              <button onClick={() => setShowLangList(!showLangList)} className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-emerald-600 font-semibold">{LANGUAGES[tempLanguage].name}</span>
                <ChevronLeft className={`w-4 h-4 text-slate-400 transition-transform ${showLangList ? 'rotate-90' : ''}`} />
              </button>
            </div>
            {showLangList && (
              <div className="pb-3">
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(LANGUAGES).map(([code, language]) => (
                    <button
                      key={code}
                      className={`text-sm rounded-lg px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 ${isRTL ? 'text-right' : 'text-left'} ${tempLanguage === code ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20' : ''}`}
                      onClick={() => setTempLanguage(code as LanguageCode)}
                    >
                      {language.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <hr className="border-slate-200 dark:border-slate-800" />
          </div>

          {/* Timezone */}
          <div className="mt-3">
            <div className="flex items-center justify-between py-3">
              <div className="text-sm text-slate-500 dark:text-slate-400">{isRTL ? 'منطقتك الزمنية' : 'Fuseau horaire'}</div>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <select
                  value={tempTimezone}
                  onChange={(e) => setTempTimezone(e.target.value)}
                  className="text-emerald-700 dark:text-emerald-300 font-semibold bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-sm"
                >
                  {/* Small curated list plus current */}
                  {![tempTimezone].includes('UTC') && <option value={tempTimezone}>{tempTimezone}</option>}
                  <option value="Africa/Casablanca">Africa/Casablanca</option>
                  <option value="Europe/Paris">Europe/Paris</option>
                  <option value="UTC">UTC</option>
                </select>
                <ChevronLeft className="w-4 h-4 text-slate-400" />
              </div>
            </div>
            <hr className="border-slate-200 dark:border-slate-800" />
          </div>

          {/* Time format */}
          <div className="mt-3">
            <div className="flex items-center justify-between py-3">
              <div className="text-sm text-slate-500 dark:text-slate-400">{isRTL ? 'صيغة الوقت' : 'Format de l\'heure'}</div>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <select
                  value={tempHourFormat}
                  onChange={(e) => setTempHourFormat(e.target.value as '12' | '24')}
                  className="text-emerald-700 dark:text-emerald-300 font-semibold bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-sm"
                >
                  <option value="12">{isRTL ? '12 ساعة' : '12h'}</option>
                  <option value="24">{isRTL ? '24 ساعة' : '24h'}</option>
                </select>
                <ChevronLeft className="w-4 h-4 text-slate-400" />
              </div>
            </div>
            <hr className="border-slate-200 dark:border-slate-800" />
          </div>

          {/* Apply / Cancel */}
          <div className={`flex gap-3 pt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button
              onClick={handleSaveSettings}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full"
            >
              {isRTL ? 'حفظ التغييرات' : 'Sauvegarder'}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1 rounded-full"
            >
              {isRTL ? 'إلغاء' : 'Annuler'}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
