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

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-sm hover:shadow-md transition-all bg-gradient-to-r from-indigo-500/90 via-purple-500/90 to-pink-500/90 text-white">
      <div className={`flex items-stretch ${isRTL ? 'flex-row-reverse' : 'flex-row'} p-3 sm:p-4 gap-3 sm:gap-4`}>
        {/* Date chip */}
        <div className="flex flex-col items-center justify-center px-2 sm:px-3">
          <div className="text-[11px] sm:text-xs font-medium bg-white/20 rounded-full px-2.5 py-1 leading-none">
            {dateStr || (isRTL ? 'غير محدد' : 'TBD')}
          </div>
          <div className="mt-2 hidden sm:flex w-10 h-10 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
            {fromTeam?.logo ? (
              <img src={fromTeam.logo} onError={imgFallback} alt={fromTeam?.name || 'from'} className="w-6 h-6 object-contain" />
            ) : (
              <img src="/placeholder.svg" alt="from" className="w-6 h-6 object-contain" />
            )}
          </div>
        </div>

        {/* Middle: from – connector – to */}
        <div className="flex-1 flex flex-col justify-center">
          <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'} gap-3 sm:gap-4`}>
            {/* From team name (compact on mobile) */}
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-semibold truncate opacity-95">{fromName}</div>
            </div>

            {/* Connector with type badge and arrow */}
            <div className="relative flex-1 flex items-center">
              <div className="w-full h-1 bg-white/25 rounded-full" />
              <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
                {!isRTL && <span className="text-white/90 text-base sm:text-lg">{arrow}</span>}
                <span className={`px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold shadow-sm ${isLoan ? 'bg-yellow-300 text-black' : isFree ? 'bg-emerald-300 text-black' : 'bg-white text-black'}`}>
                  {typeLabel}
                </span>
                {isRTL && <span className="text-white/90 text-base sm:text-lg">{arrow}</span>}
              </div>
            </div>

            {/* To team name */}
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-semibold truncate opacity-95">{toName}</div>
            </div>
          </div>

          {/* Sub line with from -> to and date for extra clarity on mobile */}
          <div className="mt-1 text-[11px] sm:text-xs opacity-90 truncate">
            {isRTL ? `${toName}  ${arrow}  ${fromName}` : `${fromName}  ${arrow}  ${toName}`}
            {dateStr ? `  •  ${dateStr}` : ''}
          </div>
        </div>

        {/* Player block */}
        <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'} gap-3 min-w-[150px]`}>
          <div className="relative">
           
            {toTeam?.logo && (
              <img
                src={toTeam.logo}
                onError={imgFallback}
                alt={toTeam?.name || 'club'}
                className={`absolute ${isRTL ? '-left-1' : '-right-1'} -bottom-1 w-5 h-5 rounded-full ring-2 ring-white object-contain bg-white`}
              />)
            }
          </div>
          <div className={`leading-tight ${isRTL ? 'text-right' : 'text-left'} max-w-[180px] sm:max-w-[220px]`}>
            <div className="text-sm sm:text-base font-bold truncate">
              {player?.name ? maybeTransliterateName(String(player.name), currentLanguage) : (isRTL ? 'لاعب' : '-')}
            </div>
            <div className="text-[11px] sm:text-xs opacity-95 truncate">
              {isLoan ? (isRTL ? 'إعارة' : 'Loan') : isFree ? (isRTL ? 'مجانا' : 'Free') : (isRTL ? 'انتقال' : 'Transfer')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferCard;
