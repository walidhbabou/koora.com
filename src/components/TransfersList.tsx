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
        setError(currentLanguage === 'ar' ? 'فشل تحميل الانتقالات' : 'Échec du chargement des transferts');
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
          {title || (currentLanguage === 'ar' 
            ? `انتقالات ${seasonStart}/${seasonStart + 1}` 
            : `Transferts ${seasonStart}/${seasonStart + 1}`)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            {currentLanguage === 'ar' ? 'جارٍ التحميل...' : 'Chargement...'}
          </div>
        )}
        {error && (
          <div className="text-center py-8 text-red-500">{error}</div>
        )}
        {!loading && !error && transfersSeason.length === 0 && (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            {currentLanguage === 'ar' ? 'لا توجد انتقالات في هذا العام' : 'Aucun transfert pour cette année'}
          </div>
        )}
        {!loading && !error && transfersSeason.length > 0 && (
          <ul className="space-y-3">
            {transfersSeason.map((t, idx) => (
              <li
                key={`${t.date}-${idx}`}
                className="rounded-2xl px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={t.teams?.out?.logo || ''} alt={t.teams?.out?.name || 'team-out'} onError={onImgError} />
                      <AvatarFallback>{t.teams?.out?.name?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm opacity-95 truncate max-w-[140px]">{t.teams?.out?.name}</span>
                    <span className="mx-2 opacity-80">{currentLanguage === 'ar' ? '←' : '→'}</span>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={t.teams?.in?.logo || ''} alt={t.teams?.in?.name || 'team-in'} onError={onImgError} />
                      <AvatarFallback>{t.teams?.in?.name?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm opacity-95 truncate max-w-[140px]">{t.teams?.in?.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Player */}
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={t.player?.photo || ''} alt={t.player?.name || 'player'} onError={onImgError} />
                        <AvatarFallback>{t.player?.name?.charAt(0) || 'P'}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm opacity-95 max-w-[160px] truncate">{t.player?.name || (currentLanguage === 'ar' ? 'لاعب' : 'Player')}</span>
                    </div>
                    {/* Meta */}
                    <span className="px-2 py-0.5 rounded-full text-xs bg-white text-black">
                      {t.type || (currentLanguage === 'ar' ? 'غير محدد' : 'N/A')}
                    </span>
                    <span className="text-xs opacity-80">{t.date}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default TransfersList;
