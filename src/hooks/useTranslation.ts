import { useLanguage } from './useLanguageHooks';

export const useTranslation = () => {
  const { t, currentLanguage, setLanguage, isRTL, direction } = useLanguage();
  
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const locale = currentLanguage === 'ar' ? 'ar-SA' : 'fr-FR';
    
    return dateObj.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const locale = currentLanguage === 'ar' ? 'ar-SA' : 'fr-FR';
    
    return dateObj.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatNumber = (number: number) => {
    const locale = currentLanguage === 'ar' ? 'ar-SA' : 'fr-FR';
    return number.toLocaleString(locale);
  };

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const diffInMinutes = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return t('justNow');
    if (diffInMinutes < 60) return t('minutesAgo', { minutes: diffInMinutes });
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return t('hoursAgo', { hours: diffInHours });
    
    const diffInDays = Math.floor(diffInHours / 24);
    return t('daysAgo', { days: diffInDays });
  };
  
  return {
    t,
    currentLanguage,
    setLanguage,
    isRTL,
    direction,
    formatDate,
    formatTime,
    formatNumber,
    formatTimeAgo
  };
};
