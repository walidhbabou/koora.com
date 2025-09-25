
// Hook qui force la langue arabe partout
export const useTranslation = () => {
  // Traduction arabe uniquement
  const t = (key: string, params?: Record<string, number>) => {
    // Vous pouvez ajouter ici vos traductions arabes
    const translations: Record<string, string> = {
      justNow: 'الآن',
      minutesAgo: params ? `${params.minutes} دقيقة مضت` : 'منذ دقائق',
      hoursAgo: params ? `${params.hours} ساعة مضت` : 'منذ ساعات',
      daysAgo: params ? `${params.days} يوم مضى` : 'منذ أيام',
      home: 'الرئيسية',
      matches: 'المباريات',
      news: 'الأخبار',
      standings: 'الترتيب',
      transfers: 'الانتقالات',
      search: 'بحث',
      // Ajoutez d'autres clés selon vos besoins
    };
    return translations[key] || key;
  };

  const currentLanguage = 'ar';
  const setLanguage = () => {};
  const isRTL = true;
  const direction = 'rtl';

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatNumber = (number: number) => {
    return number.toLocaleString('ar-SA');
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
