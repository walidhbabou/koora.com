import React from "react";
import { TransferEnriched } from "@/hooks/useTransfers";
import { useTranslation } from "@/hooks/useTranslation";

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

  return (
    <div className="rounded-xl px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md hover:shadow-lg transition-all">
      <div className={`flex items-center gap-4 ${isRTL ? '' : ''}`}>
        {/* Date (left) */}
        <div className="hidden md:flex items-center justify-center bg-white/15 rounded-lg px-3 py-1.5 text-xs min-w-[92px]">
          {dateStr}
        </div>

        {/* From team */}
        <div className="flex items-center gap-3 w-[26%] min-w-[150px]">
          {fromTeam?.logo ? (
            <img src={fromTeam.logo} onError={imgFallback} alt={fromTeam?.name || "from"} className="w-8 h-8 rounded bg-white/90 p-1" />
          ) : (
            <img src="/placeholder.svg" alt="from" className="w-8 h-8 rounded bg-white/90 p-1" />
          )}
          <div className="truncate text-sm font-medium opacity-95">{fromTeam?.name || "-"}</div>
        </div>

        {/* Middle line with type badge */}
        <div className="relative flex-1 flex items-center">
          <div className="w-full h-1 bg-white/30 rounded-full" />
          <div className={`absolute left-1/2 -translate-x-1/2 -top-2.5 px-3 py-0.5 text-xs rounded-full ${isLoan ? 'bg-yellow-300 text-black' : isFree ? 'bg-green-300 text-black' : 'bg-white text-black'} shadow-sm`}> 
            {transfer?.type || (isRTL ? 'انتقال' : 'Transfer')}
          </div>
        </div>

        {/* To team */}
        <div className="flex items-center gap-3 w-[26%] min-w-[150px]">
          {toTeam?.logo ? (
            <img src={toTeam.logo} onError={imgFallback} alt={toTeam?.name || "to"} className="w-8 h-8 rounded bg-white/90 p-1" />
          ) : (
            <img src="/placeholder.svg" alt="to" className="w-8 h-8 rounded bg-white/90 p-1" />
          )}
          <div className="truncate text-sm font-medium opacity-95">{toTeam?.name || "-"}</div>
        </div>

        {/* Player (right) */}
        <div className="flex items-center gap-3 ml-2 min-w-[180px]">
          {player?.photo ? (
            <img src={player.photo} onError={imgFallback} alt={player?.name || "player"} className="w-10 h-10 rounded-full bg-white/90 object-cover" />
          ) : (
            <img src="/placeholder.svg" alt="player" className="w-10 h-10 rounded-full bg-white/90" />
          )}
          <div className="leading-tight">
            <div className="text-sm font-semibold truncate max-w-[160px]">{player?.name || (isRTL ? 'لاعب' : '-')}</div>
            <div className="text-[11px] opacity-90 truncate max-w-[160px]">{isRTL ? `${toTeam?.name}  ←  ${fromTeam?.name}` : `${fromTeam?.name} → ${toTeam?.name}`}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferCard;
