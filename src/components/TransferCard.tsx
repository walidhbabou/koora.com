import React from "react";
import { TransferEnriched } from "@/hooks/useTransfers";
import { useTranslation } from "@/hooks/useTranslation";
import { maybeTransliterateName } from "@/utils/transliterate";
import { getTeamTranslation } from "@/utils/teamNameMap";

type Props = {
  transfer: TransferEnriched;
};

const imgFallback = (e: React.SyntheticEvent<HTMLImageElement>) => {
  (e.target as HTMLImageElement).src = "/placeholder.svg";
};

const TransferCard: React.FC<Props> = ({ transfer }) => {
  const { currentLanguage } = useTranslation();
  const isRTL = currentLanguage === 'ar';
  const dateStr = transfer?.date || transfer?.update || ""; // API date (YYYY-MM-DD)
  const fromTeam = transfer?.teams?.out;
  const toTeam = transfer?.teams?.in;
  const player = transfer?.player;
  const isLoan = String(transfer?.type || "").toLowerCase().includes("loan") || String(transfer?.type || "").includes("إعارة");
  const isFree = String(transfer?.type || "").toLowerCase().includes("free");

  const fromName = isRTL ? getTeamTranslation(fromTeam?.name || '-') : (fromTeam?.name || '-');
  const toName = isRTL ? getTeamTranslation(toTeam?.name || '-') : (toTeam?.name || '-');
  const typeLabel = transfer?.type || (isRTL ? 'انتقال' : 'Transfer');

  // Directional arrow
  const arrow = isRTL ? '←' : '→';

  // Fonction pour formater la date en arabe
  const formatDateArabic = (dateString: string) => {
    if (!dateString) return isRTL ? 'غير محدد' : 'TBD';
    const date = new Date(dateString);
    if (isRTL) {
      const day = date.getDate();
      const month = date.getMonth();
      const year = date.getFullYear();
      
      const arabicMonths = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
      ];
      
      return `${day} ${arabicMonths[month]} ${year}`;
    }
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border-2 border-green-200 dark:border-green-700 p-3 sm:p-4 hover:shadow-lg hover:border-green-300 dark:hover:border-green-600 transition-all">
      {/* Mobile Layout */}
      <div className="block sm:hidden">
        <div className="flex items-center justify-between mb-3">
          {/* Date */}
          <div className="bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold">
            {formatDateArabic(dateStr)}
          </div>
          
          {/* Transfer type */}
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${
            isLoan 
              ? 'bg-yellow-400 text-yellow-900' 
              : 'bg-green-500 text-white'
          }`}>
            {isLoan ? (isRTL ? 'إعارة' : 'Loan') : (isRTL ? 'انتقال' : 'Transfer')}
          </div>
        </div>

        {/* Player name */}
        <div className="text-center mb-3">
          <div className="font-bold text-gray-900 dark:text-white text-base">
            {player?.name ? maybeTransliterateName(String(player.name), currentLanguage) : (isRTL ? 'لاعب' : 'Player')}
          </div>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between">
          {/* From team */}
          <div className="flex flex-col items-center">
            {fromTeam?.logo ? (
              <img
                src={fromTeam.logo}
                onError={imgFallback}
                alt={fromTeam?.name || 'from'}
                className="w-8 h-8 object-contain mb-1"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 mb-1">
                ?
              </div>
            )}
            <span className="font-medium text-gray-800 dark:text-gray-200 text-xs text-center max-w-[60px] truncate">
              {fromName}
            </span>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center">
            <div className="text-green-600 text-2xl font-bold">{arrow}</div>
          </div>

          {/* To team */}
          <div className="flex flex-col items-center">
            {toTeam?.logo ? (
              <img
                src={toTeam.logo}
                onError={imgFallback}
                alt={toTeam?.name || 'to'}
                className="w-8 h-8 object-contain mb-1"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 mb-1">
                ?
              </div>
            )}
            <span className="font-medium text-gray-800 dark:text-gray-200 text-xs text-center max-w-[60px] truncate">
              {toName}
            </span>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className={`hidden sm:flex items-center justify-between gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Date */}
        <div className="flex flex-col items-center min-w-[100px]">
          <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold">
            {formatDateArabic(dateStr)}
          </div>
        </div>

        {/* Transfer details */}
        <div className="flex-1 flex items-center justify-between mx-4">
          {/* From team */}
          <div className="flex items-center gap-3 min-w-0 flex-1 justify-end">
            <span className="font-semibold text-gray-900 dark:text-white text-base truncate">
              {fromName}
            </span>
            {fromTeam?.logo ? (
              <img
                src={fromTeam.logo}
                onError={imgFallback}
                alt={fromTeam?.name || 'from'}
                className="w-8 h-8 flex-shrink-0 object-contain"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
                ?
              </div>
            )}
          </div>

          {/* Transfer type and arrow */}
          <div className="flex flex-col items-center px-4">
            <div className={`px-4 py-2 rounded-full text-sm font-bold ${
              isLoan 
                ? 'bg-yellow-400 text-yellow-900' 
                : 'bg-green-500 text-white'
            }`}>
              {isLoan ? (isRTL ? 'إعارة' : 'Loan') : (isRTL ? 'انتقال' : 'Transfer')}
            </div>
            <div className="text-green-600 text-2xl font-bold mt-2">{arrow}</div>
          </div>

          {/* To team */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {toTeam?.logo ? (
              <img
                src={toTeam.logo}
                onError={imgFallback}
                alt={toTeam?.name || 'to'}
                className="w-8 h-8 flex-shrink-0 object-contain"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
                ?
              </div>
            )}
            <span className="font-semibold text-gray-900 dark:text-white text-base truncate">
              {toName}
            </span>
          </div>
        </div>

        {/* Player name */}
        <div className="flex flex-col items-end min-w-[150px]">
          <div className="font-bold text-gray-900 dark:text-white text-lg truncate">
            {player?.name ? maybeTransliterateName(String(player.name), currentLanguage) : (isRTL ? 'لاعب' : 'Player')}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {isLoan ? (isRTL ? 'إعارة' : 'Loan') : (isRTL ? 'انتقال' : 'Transfer')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferCard;
