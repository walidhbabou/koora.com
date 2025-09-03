import React from "react";
import { TransferEnriched } from "@/hooks/useTransfers";
import { useTranslation } from "@/hooks/useTranslation";
import { maybeTransliterateName } from "@/utils/transliterate";
import { getArabicTeamName } from "@/utils/teamNameMap";

type Props = {
  transfer: TransferEnriched;
};

const imgFallback = (e: React.SyntheticEvent<HTMLImageElement>) => {
  (e.target as HTMLImageElement).src = "/placeholder.svg";
};

const TransferCard: React.FC<Props> = ({ transfer }) => {
  const { currentLanguage } = useTranslation();
  const isRTL = currentLanguage === 'ar';
  const dateStr = transfer?.date || ""; // Keep API date (YYYY-MM-DD) like reference
  const fromTeam = transfer?.teams?.out;
  const toTeam = transfer?.teams?.in;
  const player = transfer?.player;
  const isLoan = String(transfer?.type || "").toLowerCase().includes("loan") || String(transfer?.type || "").includes("إعارة");
  const isFree = String(transfer?.type || "").toLowerCase().includes("free");

  const fromName = isRTL ? getArabicTeamName(fromTeam?.name || '-') : (fromTeam?.name || '-');
  const toName = isRTL ? getArabicTeamName(toTeam?.name || '-') : (toTeam?.name || '-');

  return (
    <div className="rounded-xl px-4 py-3 bg-white dark:bg-[#181a20] text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-[#23262f] shadow-sm hover:shadow-md transition-all">
      <div className={`flex flex-col md:flex-row items-center gap-4 ${isRTL ? '' : ''}`}>
        {/* Date (left) */}
        <div className="hidden md:flex items-center justify-center rounded-lg px-3 py-1.5 text-xs min-w-[92px] bg-gray-50 text-gray-700 dark:bg-[#23262f] dark:text-gray-300">
          {dateStr}
        </div>

        {/* From team */}
        <div className="flex items-center gap-3 md:w-[26%] min-w-[150px]">
          {fromTeam?.logo ? (
            <img src={fromTeam.logo} onError={imgFallback} alt={fromTeam?.name || "from"} className="w-8 h-8 rounded bg-white p-1 dark:bg-white/90" />
          ) : (
            <img src="/placeholder.svg" alt="from" className="w-8 h-8 rounded bg-white p-1 dark:bg-white/90" />
          )}
          <div className="truncate text-sm font-medium opacity-95">{fromName}</div>
        </div>

        {/* Middle line with type badge */}
        <div className="relative w-full md:flex-1 flex items-center">
          <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className={`absolute left-1/2 -translate-x-1/2 -top-2.5 px-3 py-0.5 text-xs rounded-full ${isLoan ? 'bg-yellow-200 text-yellow-900 dark:bg-yellow-400 dark:text-black' : isFree ? 'bg-green-200 text-green-900 dark:bg-green-400 dark:text-black' : 'bg-gray-100 text-gray-900 dark:bg-white dark:text-black'} shadow-sm`}>
            {transfer?.type || (isRTL ? 'انتقال' : 'Transfer')}
          </div>
        </div>

        {/* To team */}
        <div className="flex items-center gap-3 md:w-[26%] min-w-[150px]">
          {toTeam?.logo ? (
            <img src={toTeam.logo} onError={imgFallback} alt={toTeam?.name || "to"} className="w-8 h-8 rounded bg-white p-1 dark:bg-white/90" />
          ) : (
            <img src="/placeholder.svg" alt="to" className="w-8 h-8 rounded bg-white p-1 dark:bg-white/90" />
          )}
          <div className="truncate text-sm font-medium opacity-95">{toName}</div>
        </div>

        {/* Player (right) - transliterate personal name in Arabic */}
        <div className="flex items-center gap-3 md:ml-2 min-w-[180px]">
          <div className="leading-tight">
            <div className="text-sm font-semibold truncate max-w-[200px]">{player?.name ? maybeTransliterateName(String(player.name), currentLanguage) : (isRTL ? 'لاعب' : '-')}</div>
            <div className="text-[11px] opacity-90 truncate max-w-[220px]">{isRTL ? `${toName}  ←  ${fromName}` : `${fromName} → ${toName}`}</div>
            {dateStr && (
              <div className="mt-0.5 text-[10px] opacity-90">{dateStr}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferCard;
