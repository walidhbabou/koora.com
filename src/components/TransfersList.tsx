import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { footballAPI, TransferResponseItem, TransferRecord } from '@/config/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';

interface TransfersListProps {
  playerId?: number;
  teamId?: number;
  title?: string;
  seasonStart?: number; // e.g., 2025 means season 2025/2026
}

type EnrichedTransfer = TransferRecord & { player?: { id?: number; name?: string; photo?: string } };

const TransfersList: React.FC<TransfersListProps> = ({ playerId, teamId, title, seasonStart = 2025 }) => {
  const { currentLanguage } = useTranslation();
  const [items, setItems] = useState<TransferResponseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const onImgError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    // Prevent infinite loop
    if (img.dataset.fallbackApplied === 'true') return;
    img.dataset.fallbackApplied = 'true';
    img.src = '/placeholder.svg';
  }, []);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      // Need at least one of playerId or teamId
      if (!playerId && !teamId) return;
      try {
        setLoading(true);
        setError(null);
        const res = await footballAPI.getTransfers({ player: playerId, team: teamId });
        const list: TransferResponseItem[] = Array.isArray(res?.response) ? res.response : [];
        if (mounted) setItems(list);
      } catch (e) {
        if (!mounted) return;
        // Always Arabic per request
        setError('فشل تحميل الانتقالات');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, [playerId, teamId, currentLanguage]);

  const transfersSeason = useMemo(() => {
    const all: EnrichedTransfer[] = [];
    for (const it of items) {
      if (Array.isArray(it.transfers)) {
        for (const tr of it.transfers) {
          all.push({ ...tr, player: it.player });
        }
      }
    }
    const years = [seasonStart, seasonStart + 1];
    const filtered = all.filter(t => {
      if (!t?.date) return false;
      const y = new Date(t.date).getFullYear();
      return years.includes(y);
    });
    // Sort by date desc
    filtered.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    return filtered;
  }, [items, seasonStart]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {/* Always show Arabic labels inside this widget */}
          {title || `انتقالات ${seasonStart}/${seasonStart + 1}`}
        </CardTitle>
      </CardHeader>
      <CardContent dir="rtl" className="rtl">
        {loading && (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            {'جارٍ التحميل...'}
          </div>
        )}
        {error && (
          <div className="text-center py-8 text-red-500">{error}</div>
        )}
        {!loading && !error && transfersSeason.length === 0 && (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            {'لا توجد انتقالات في هذا العام'}
          </div>
        )}
        {!loading && !error && transfersSeason.length > 0 && (
          <ul className="space-y-5">
            {transfersSeason.map((t, idx) => {
              const rawType = (t.type || '').toLowerCase();
              const typeAr = rawType.includes('loan') ? 'إعارة' : rawType.includes('free') ? 'انتقال حر' : rawType ? 'انتقال' : 'غير محدد';
              const typeStyle = rawType.includes('loan')
                ? 'bg-amber-100 text-amber-800 border-amber-200'
                : rawType.includes('free')
                ? 'bg-slate-100 text-slate-800 border-slate-200'
                : 'bg-emerald-100 text-emerald-800 border-emerald-200';

              return (
                <li key={`${t.date}-${idx}`} className="relative">
                  {/* timeline line */}
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                  {/* center badge */}
                  <div className="relative z-10 w-full flex items-center justify-center">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-semibold border shadow-sm ${typeStyle}`}>{typeAr}</span>
                  </div>

                  {/* row content */}
                  <div className="mt-3 flex items-center justify-between gap-3">
                    {/* From team */}
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={t.teams?.out?.logo || ''} alt={t.teams?.out?.name || 'team-out'} onError={onImgError} />
                        <AvatarFallback>{t.teams?.out?.name?.charAt(0) || '?'}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-slate-700 dark:text-slate-100 truncate max-w-[140px]">{t.teams?.out?.name}</span>
                    </div>

                    {/* Arrow */}
                    <span className="mx-1 text-slate-500">←</span>

                    {/* To team */}
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={t.teams?.in?.logo || ''} alt={t.teams?.in?.name || 'team-in'} onError={onImgError} />
                        <AvatarFallback>{t.teams?.in?.name?.charAt(0) || '?'}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-slate-700 dark:text-slate-100 truncate max-w-[140px]">{t.teams?.in?.name}</span>
                    </div>

                    {/* Player + meta */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={t.player?.photo || ''} alt={t.player?.name || 'player'} onError={onImgError} />
                          <AvatarFallback>{t.player?.name?.charAt(0) || 'P'}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-slate-700 dark:text-slate-100 truncate max-w-[160px]">{t.player?.name || 'لاعب'}</span>
                      </div>
                      <span className="text-xs text-slate-500 whitespace-nowrap">{t.date}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default TransfersList;
