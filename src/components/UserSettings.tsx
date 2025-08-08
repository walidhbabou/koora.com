import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Settings, Globe, Check } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../hooks/useLanguageHooks';
import { LANGUAGES, LanguageCode } from '../config/constants';

interface UserSettingsProps {
  className?: string;
}

export const UserSettings: React.FC<UserSettingsProps> = ({ className = '' }) => {
  const { t, isRTL } = useTranslation();
  const { currentLanguage, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [tempLanguage, setTempLanguage] = useState(currentLanguage);

  const handleSaveSettings = () => {
    setLanguage(tempLanguage);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempLanguage(currentLanguage);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`hover:bg-sport-green/10 hover:text-sport-green transition-all duration-300 ${className}`}
        >
          <Settings className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className={`sm:max-w-[425px] ${isRTL ? 'text-right' : 'text-left'}`}>
        <DialogHeader className={isRTL ? 'text-right' : 'text-left'}>
          <DialogTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Settings className="w-5 h-5" />
            {isRTL ? 'إعدادات المستخدم' : 'Paramètres utilisateur'}
          </DialogTitle>
          <DialogDescription>
            {isRTL 
              ? 'قم بتخصيص إعدادات حسابك وتفضيلاتك الشخصية'
              : 'Personnalisez les paramètres de votre compte et vos préférences'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Language Selection */}
          <div className="space-y-3">
            <Label className={`text-sm font-medium flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Globe className="w-4 h-4" />
              {isRTL ? 'اللغة المفضلة' : 'Langue préférée'}
            </Label>
            <RadioGroup
              value={tempLanguage}
              onValueChange={(value) => setTempLanguage(value as LanguageCode)}
              className="grid grid-cols-1 gap-3"
            >
              {Object.entries(LANGUAGES).map(([code, language]) => (
                <div key={code} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={code}
                    id={code}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={code}
                    className={`
                      flex items-center justify-between w-full p-3 rounded-lg border-2 border-border
                      peer-checked:border-sport-green peer-checked:bg-sport-green/5
                      hover:border-sport-green/50 cursor-pointer transition-all duration-200
                      ${isRTL ? 'flex-row-reverse' : ''}
                    `}
                  >
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="text-2xl">
                        {code === 'ar' ? '🇸🇦' : '🇫🇷'}
                      </div>
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <div className="font-medium">{language.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {code === 'ar' ? 'العربية' : 'Français'}
                        </div>
                      </div>
                    </div>
                    {tempLanguage === code && (
                      <Check className="w-5 h-5 text-sport-green" />
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Additional Settings Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground">
              {isRTL ? 'إعدادات إضافية' : 'Paramètres supplémentaires'}
            </Label>
            <div className="text-sm text-muted-foreground p-3 rounded-lg bg-muted/30">
              {isRTL 
                ? 'المزيد من الإعدادات قادمة قريباً...'
                : 'Plus de paramètres bientôt disponibles...'
              }
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`flex gap-3 pt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Button
            onClick={handleSaveSettings}
            className="flex-1 bg-gradient-to-r from-sport-green to-sport-blue hover:shadow-lg transition-all duration-300"
          >
            {isRTL ? 'حفظ التغييرات' : 'Sauvegarder'}
          </Button>
          <Button
            onClick={handleCancel}
            variant="outline"
            className="flex-1"
          >
            {isRTL ? 'إلغاء' : 'Annuler'}
          </Button>
        </div>

        {/* Language Change Notice */}
        {tempLanguage !== currentLanguage && (
          <div className={`
            text-xs text-muted-foreground p-3 rounded-lg bg-sport-green/5 border border-sport-green/20
            ${isRTL ? 'text-right' : 'text-left'}
          `}>
            {isRTL 
              ? '💡 سيتم تطبيق تغيير اللغة فوراً بعد الحفظ'
              : '💡 Le changement de langue sera appliqué immédiatement après la sauvegarde'
            }
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
