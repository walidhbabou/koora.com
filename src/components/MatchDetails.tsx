import React, { useEffect, useMemo, useState } from 'react';
import { 
  Clock, 
  MapPin, 
  Users, 
  Trophy, 
  Calendar,
  ArrowLeft,
  ExternalLink,
  Play,
  Square
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslation } from '../hooks/useTranslation';
import { maybeTransliterateName } from '@/utils/transliterate';
import { footballAPI, FixtureEventItem, FixtureStatisticItem, FixtureLineupItem } from '@/config/api';
import { getTeamTranslation } from "@/utils/teamNameMap";
import { translateEventDetail, translateStatType } from '@/utils/footballTranslations';

interface MatchDetailsProps {
  match: {
    id: number;
    date: string;
    time: string;
    status: string;
    venue?: string;
    referee?: string;
    league: {
      id: number;
      name: string;
      logo: string;
      country: string;
    };
    teams: {
      home: {
        id: number;
        name: string;
        logo: string;
        score?: number;
      };
      away: {
        id: number;
        name: string;
        logo: string;
        score?: number;
      };
    };
    goals?: Array<{
      id: number;
      minute: number;
      scorer: string;
      team: 'home' | 'away';
      type: 'goal' | 'penalty' | 'own_goal';
    }>;
    cards?: Array<{
      id: number;
      minute: number;
      player: string;
      team: 'home' | 'away';
      type: 'yellow' | 'red';
    }>;
    substitutions?: Array<{
      id: number;
      minute: number;
      playerIn: string;
      playerOut: string;
      team: 'home' | 'away';
    }>;
  };
  onClose: () => void;
}

const MatchDetails: React.FC<MatchDetailsProps> = ({ match, onClose }) => {
  const { currentLanguage, isRTL, direction } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Events state
  const [events, setEvents] = useState<FixtureEventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState<boolean>(false);
  const [eventsError, setEventsError] = useState<string | null>(null);

  // Stats state
  const [statsHome, setStatsHome] = useState<FixtureStatisticItem | null>(null);
  const [statsAway, setStatsAway] = useState<FixtureStatisticItem | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Lineups state
  const [lineups, setLineups] = useState<FixtureLineupItem[]>([]);
  const [loadingLineups, setLoadingLineups] = useState<boolean>(false);
  const [lineupsError, setLineupsError] = useState<string | null>(null);

  // Fetch events when Events tab becomes active
  useEffect(() => {
    let isMounted = true;
    const fetchEvents = async () => {
      if (activeTab !== 'events' || !match?.id) return;
      try {
        setLoadingEvents(true);
        setEventsError(null);
        const res = await footballAPI.getFixtureEvents(match.id);
        const list: FixtureEventItem[] = Array.isArray(res?.response) ? res.response : [];
        if (isMounted) setEvents(list);
      } catch (e) {
        if (isMounted) setEventsError(currentLanguage === 'ar' ? 'تعذر تحميل الأحداث' : 'Impossible de charger les événements');
      } finally {
        if (isMounted) setLoadingEvents(false);
      }
    };
    fetchEvents();
    return () => { isMounted = false; };
  }, [activeTab, match?.id, currentLanguage]);

  // Team display names (Arabic mapping if needed)
  const homeTeamName = currentLanguage === 'ar' ? getTeamTranslation(match.teams.home.name) : match.teams.home.name;
  const awayTeamName = currentLanguage === 'ar' ? getTeamTranslation(match.teams.away.name) : match.teams.away.name;

  // Fetch stats when Stats tab becomes active
  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      if (activeTab !== 'stats' || !match?.id) return;
      try {
        setLoadingStats(true);
        setStatsError(null);
        const res = await footballAPI.getFixtureStatistics(match.id, match.teams.home.id, match.teams.away.id);
        const homeItem: FixtureStatisticItem | null = res?.home?.response?.[0] || null;
        const awayItem: FixtureStatisticItem | null = res?.away?.response?.[0] || null;
        if (isMounted) {
          setStatsHome(homeItem);
          setStatsAway(awayItem);
        }
      } catch (e) {
        if (isMounted) setStatsError(currentLanguage === 'ar' ? 'تعذر تحميل الإحصائيات' : 'Impossible de charger les statistiques');
      } finally {
        if (isMounted) setLoadingStats(false);
      }
    };
    fetchStats();
    return () => { isMounted = false; };
  }, [activeTab, match?.id, match?.teams?.home?.id, match?.teams?.away?.id, currentLanguage]);

  // Fetch lineups when Lineups tab becomes active
  useEffect(() => {
    let isMounted = true;
    const fetchLineups = async () => {
      if (activeTab !== 'lineups' || !match?.id) return;
      try {
        setLoadingLineups(true);
        setLineupsError(null);
        const res = await footballAPI.getFixtureLineups(match.id);
        const list: FixtureLineupItem[] = Array.isArray(res?.response) ? res.response : [];
        if (isMounted) setLineups(list);
      } catch (e) {
        if (isMounted) setLineupsError(currentLanguage === 'ar' ? 'تعذر تحميل التشكيلات' : 'Impossible de charger les compositions');
      } finally {
        if (isMounted) setLoadingLineups(false);
      }
    };
    fetchLineups();
    return () => { isMounted = false; };
  }, [activeTab, match?.id, currentLanguage]);

  const mergedStats = useMemo(() => {
    const map = new Map<string, { type: string; home: number | string | null; away: number | string | null }>();
    const add = (side: 'home' | 'away', items?: { type: string; value: any }[]) => {
      if (!items) return;
      for (const it of items) {
        const key = it.type;
        const current = map.get(key) || { type: key, home: null, away: null };
        current[side] = it.value;
        map.set(key, current);
      }
    };
    add('home', statsHome?.statistics);
    add('away', statsAway?.statistics);
    return Array.from(map.values());
  }, [statsHome, statsAway]);

  // Safety check for required match data
  if (!match || !match.teams || !match.league) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">
          {currentLanguage === 'ar' ? 'بيانات المباراة غير متوفرة' : 'Données du match non disponibles'}
        </p>
        <Button onClick={onClose} className="mt-4">
          {currentLanguage === 'ar' ? 'إغلاق' : 'Fermer'}
        </Button>
      </div>
    );
  }

  const formatMatchTime = (date: string, time: string) => {
    const matchDate = new Date(`${date}T${time}`);
    const now = new Date();
    const diffInMinutes = Math.floor((matchDate.getTime() - now.getTime()) / (1000 * 60));
    
    if (diffInMinutes > 0) {
      const hours = Math.floor(diffInMinutes / 60);
      const minutes = diffInMinutes % 60;
      if (hours > 0) {
        return currentLanguage === 'ar' 
          ? `يبدأ في ${hours} ساعة و ${minutes} دقيقة`
          : `Commence dans ${hours}h ${minutes}m`;
      } else {
        return currentLanguage === 'ar' 
          ? `يبدأ في ${minutes} دقيقة`
          : `Commence dans ${minutes}m`;
      }
    } else if (diffInMinutes > -90) {
      return currentLanguage === 'ar' ? 'جاري الآن' : 'En cours';
    } else {
      return currentLanguage === 'ar' ? 'انتهى' : 'Terminé';
    }
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'bg-blue-500'; // Default color for undefined status
    
    switch (status.toLowerCase()) {
      case 'live':
      case '1h':
      case '2h':
        return 'bg-red-500';
      case 'finished':
      case 'ft':
        return 'bg-gray-500';
      case 'scheduled':
      case 'ns':
        return 'bg-green-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getStatusText = (status: string | undefined) => {
    if (!status) return currentLanguage === 'ar' ? 'غير محدد' : 'Non défini';
    
    switch (status.toLowerCase()) {
      case 'live':
      case '1h':
      case '2h':
        return currentLanguage === 'ar' ? 'مباشر' : 'En direct';
      case 'finished':
      case 'ft':
        return currentLanguage === 'ar' ? 'منتهي' : 'Terminé';
      case 'scheduled':
      case 'ns':
        return currentLanguage === 'ar' ? 'مجدول' : 'Programmé';
      default:
        return status;
    }
  };

  const tabs = [
    { id: 'overview', label: currentLanguage === 'ar' ? 'نظرة عامة' : 'Vue d\'ensemble', icon: Trophy },
    { id: 'events', label: currentLanguage === 'ar' ? 'الأحداث' : 'Événements', icon: Play },
    { id: 'lineups', label: currentLanguage === 'ar' ? 'التشكيلات' : 'Compositions', icon: Users },
    { id: 'stats', label: currentLanguage === 'ar' ? 'الإحصائيات' : 'Statistiques', icon: Calendar }
  ];

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className={`fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 ${isRTL ? 'rtl' : 'ltr'}`}
      dir={direction}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-4 sm:p-6 rounded-t-xl">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2 sm:space-x-4'}`}>
              <Button variant="ghost" size="sm" onClick={onClose} aria-label={currentLanguage === 'ar' ? 'رجوع' : 'Retour'}>
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {currentLanguage === 'ar' ? 'تفاصيل المباراة' : 'Détails du Match'}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {match.league.name} • {match.league.country}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(match.status)}>
                {getStatusText(match.status)}
              </Badge>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Match Info */}
        <div className="p-4 sm:p-6">
          {(() => {
            const homeScore = match.teams.home.score ?? 0;
            const awayScore = match.teams.away.score ?? 0;
            const statusShort = (match.status || '').toString().toUpperCase();
            const isLive = ['LIVE','1H','2H','HT','ET'].includes(statusShort);
            const isFinished = ['FT','AET','PEN','FINISHED'].includes(statusShort);
            const statusLabel = isLive
              ? (currentLanguage === 'ar' ? 'مباشر' : 'En direct')
              : isFinished
                ? (currentLanguage === 'ar' ? 'انتهت المباراة' : 'Terminé')
                : (currentLanguage === 'ar' ? 'موعد المباراة' : 'Heure du match');
            const homeWin = homeScore > awayScore;
            const awayWin = awayScore > homeScore;
            const scoreClassHome = `text-3xl sm:text-4xl font-extrabold ${homeWin ? 'text-teal-600' : 'text-slate-900 dark:text-white'}`;
            const scoreClassAway = `text-3xl sm:text-4xl font-extrabold ${awayWin ? 'text-teal-600' : 'text-slate-900 dark:text-white'}`;
            return (
              <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800/40 p-4 sm:p-6 sm:p-8">
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {/* Home side */}
                  <div className="flex-1 flex flex-col items-center">
                    <div className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 mb-1 sm:mb-2 truncate max-w-[100px] sm:max-w-[160px] text-center">{homeTeamName}</div>
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-white/70 dark:bg-slate-900/60 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
                      <img src={match.teams.home.logo} alt={homeTeamName} className="w-12 h-12 sm:w-16 sm:h-16 object-contain" />
                    </div>
                  </div>

                  {/* Center: score with status */}
                  <div className="flex-1 min-w-[120px] sm:min-w-[220px] flex items-center justify-center px-1 sm:px-2">
                    {isRTL ? (
                      <div className="flex items-center gap-2 sm:gap-3 text-center">
                        <span className={scoreClassAway}>{awayScore}</span>
                        <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{statusLabel}</span>
                        <span className={scoreClassHome}>{homeScore}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 sm:gap-3 text-center">
                        <span className={scoreClassHome}>{homeScore}</span>
                        <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{statusLabel}</span>
                        <span className={scoreClassAway}>{awayScore}</span>
                      </div>
                    )}
                  </div>

                  {/* Away side */}
                  <div className="flex-1 flex flex-col items-center">
                    <div className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 mb-1 sm:mb-2 truncate max-w-[100px] sm:max-w-[160px] text-center">{awayTeamName}</div>
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-white/70 dark:bg-slate-900/60 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
                      <img src={match.teams.away.logo} alt={awayTeamName} className="w-12 h-12 sm:w-16 sm:h-16 object-contain" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

          {/* Tabs */}
          <div className="mb-4 sm:mb-6 px-2">
            <div className={`flex items-center justify-center ${isRTL ? 'flex-row-reverse' : ''} gap-1 sm:gap-3 overflow-x-auto py-1`}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1 sm:gap-2 py-1 px-2 sm:py-2 sm:px-3 rounded-full text-xs sm:text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="truncate max-w-[60px] sm:max-w-none">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Trophy className="w-5 h-5 text-teal-600" />
                      <span>{currentLanguage === 'ar' ? 'معلومات المباراة' : 'Informations du Match'}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                          {currentLanguage === 'ar' ? 'البطولة' : 'Compétition'}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <img src={match.league.logo} alt={match.league.name} className="w-6 h-6" />
                          <span className="text-slate-600 dark:text-slate-400">{match.league.name}</span>
                        </div>
                      </div>
                      {match.referee && (
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                            {currentLanguage === 'ar' ? 'الحكم' : 'Arbitre'}
                          </h4>
                          <span className="text-slate-600 dark:text-slate-400">{maybeTransliterateName(match.referee, currentLanguage)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'events' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {currentLanguage === 'ar' ? 'أحداث المباراة' : 'Événements du Match'}
                </h3>
                {loadingEvents && (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    {currentLanguage === 'ar' ? 'جارٍ تحميل الأحداث...' : 'Chargement des événements...'}
                  </div>
                )}
                {eventsError && (
                  <div className="text-center py-8 text-red-500">
                    {eventsError}
                  </div>
                )}
                {!loadingEvents && !eventsError && events.length === 0 && (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    {currentLanguage === 'ar' ? 'لا توجد أحداث متاحة حالياً' : 'Aucun événement disponible pour le moment'}
                  </div>
                )}
                {!loadingEvents && !eventsError && events.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {currentLanguage === 'ar' ? 'الجدول الزمني' : 'Chronologie'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {events.map((ev, idx) => {
                          const minute = ev?.time?.elapsed ?? 0;
                          const isHome = ev?.team?.id === match.teams.home.id;
                          const isCard = ev.type === 'Card';
                          const isGoal = ev.type === 'Goal' || ev.detail?.toLowerCase().includes('goal');
                          const badgeClass = isCard ? (ev.detail?.toLowerCase().includes('red') ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800') : (isGoal ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700');
                          const detailLabelRaw = ev.detail || ev.type;
                          const detailLabel = currentLanguage === 'ar' ? translateEventDetail(detailLabelRaw, 'ar') : detailLabelRaw;
                          return (
                            <div key={idx} className={`flex items-start justify-between p-3 rounded-lg ${isCard ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-white dark:bg-slate-800'}`}>
                              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-10 text-center text-sm font-semibold ${isCard ? 'text-yellow-700' : 'text-slate-700 dark:text-slate-300'}`}>{isRTL ? '' : `${minute}'`}{isRTL ? `${minute}'` : ''}</div>
                                <div>
                                  <div className="text-sm font-medium text-slate-900 dark:text-white">{ev.player?.name ? maybeTransliterateName(ev.player.name, currentLanguage) : ''}</div>
                                  {ev.assist?.name && <div className="text-xs text-slate-500 dark:text-slate-400">{currentLanguage === 'ar' ? `مساعدة: ${maybeTransliterateName(ev.assist.name, currentLanguage)}` : `Assist: ${maybeTransliterateName(ev.assist.name, currentLanguage)}`}</div>}
                                </div>
                              </div>
                              <div className="shrink-0">
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>{detailLabel}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'lineups' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {currentLanguage === 'ar' ? 'تشكيلات الفريقين' : 'Compositions des équipes'}
                </h3>
                {loadingLineups && (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    {currentLanguage === 'ar' ? 'جارٍ تحميل التشكيلات...' : 'Chargement des compositions...'}
                  </div>
                )}
                {lineupsError && (
                  <div className="text-center py-8 text-red-500">{lineupsError}</div>
                )}
                {!loadingLineups && !lineupsError && lineups.length === 0 && (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    {currentLanguage === 'ar' ? 'لا توجد تشكيلات متاحة بعد' : 'Aucune composition disponible pour le moment'}
                  </div>
                )}
                {!loadingLineups && !lineupsError && lineups.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {currentLanguage === 'ar' ? 'التشكيلات' : 'Compositions'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {lineups.map((lu) => {
                          const isHome = lu.team.id === match.teams.home.id;
                          return (
                            <div key={lu.team.id} className="border rounded-lg p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                              <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2 mb-2`}>
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={lu.team.logo} />
                                  <AvatarFallback>{lu.team.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="font-semibold text-slate-900 dark:text-white">{currentLanguage === 'ar' ? getTeamTranslation(lu.team.name) : lu.team.name}</div>
                              </div>
                              <div className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                {(currentLanguage === 'ar' ? 'الخطة: ' : 'Formation: ') + (lu.formation || '-')}
                              </div>
                              <div className="mb-3">
                                <div className="font-medium text-slate-800 dark:text-slate-200 mb-1">
                                  {currentLanguage === 'ar' ? 'التشكيلة الأساسية' : 'Titulaire'}
                                </div>
                                <ul className="space-y-1">
                                  {lu.startXI?.map((p, idx) => (
                                    <li key={idx} className="flex items-center justify-between text-sm">
                                      <span className="text-slate-900 dark:text-white">{p.player.number ? `#${p.player.number} ` : ''}{maybeTransliterateName(p.player.name, currentLanguage)}</span>
                                      <span className="text-slate-500 dark:text-slate-400">{p.player.pos}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <div className="font-medium text-slate-800 dark:text-slate-200 mb-1">
                                  {currentLanguage === 'ar' ? 'البدلاء' : 'Remplaçants'}
                                </div>
                                <ul className="space-y-1 max-h-48 overflow-auto pr-1">
                                  {lu.substitutes?.map((p, idx) => (
                                    <li key={idx} className="flex items-center justify-between text-sm">
                                      <span className="text-slate-900 dark:text-white">{p.player.number ? `#${p.player.number} ` : ''}{maybeTransliterateName(p.player.name, currentLanguage)}</span>
                                      <span className="text-slate-500 dark:text-slate-400">{p.player.pos}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {currentLanguage === 'ar' ? 'إحصائيات المباراة' : 'Statistiques du Match'}
                </h3>
                {loadingStats && (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    {currentLanguage === 'ar' ? 'جارٍ تحميل الإحصائيات...' : 'Chargement des statistiques...'}
                  </div>
                )}
                {statsError && (
                  <div className="text-center py-8 text-red-500">{statsError}</div>
                )}
                {!loadingStats && !statsError && (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {currentLanguage === 'ar' ? 'مقارنة الفريقين' : 'Comparaison des équipes'}
                      </CardTitle>
                      <CardDescription>
                        {currentLanguage === 'ar' 
                          ? getTeamTranslation(statsHome?.team?.name || match.teams.home.name)
                          : (statsHome?.team?.name || match.teams.home.name)
                        } 
                        vs 
                        {currentLanguage === 'ar' 
                          ? getTeamTranslation(statsAway?.team?.name || match.teams.away.name)
                          : (statsAway?.team?.name || match.teams.away.name)
                        }
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {mergedStats.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                          {currentLanguage === 'ar' ? 'لا توجد إحصائيات متاحة' : 'Aucune statistique disponible'}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {mergedStats.map((st) => (
                            <div key={st.type} className="grid grid-cols-5 items-center gap-2">
                              <div className="text-right font-semibold text-slate-900 dark:text-white">{typeof st.home === 'number' ? st.home : (st.home ?? '-')}</div>
                              <div className="col-span-3 flex items-center">
                                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded h-2 overflow-hidden">
                                  {(() => {
                                    const parseVal = (v: any) => typeof v === 'string' && v.endsWith('%') ? Number(v.replace('%','')) : (typeof v === 'number' ? v : 0);
                                    const hv = parseVal(st.home);
                                    const av = parseVal(st.away);
                                    const total = hv + av || 1;
                                    const hw = Math.round((hv / total) * 100);
                                    return (
                                      <div className="flex w-full h-full">
                                        <div className="bg-teal-500 h-full" style={{ width: `${hw}%` }} />
                                        <div className="bg-slate-400 h-full" style={{ width: `${100 - hw}%` }} />
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                              <div className="text-left font-semibold text-slate-900 dark:text-white">{typeof st.away === 'number' ? st.away : (st.away ?? '-')}</div>
                              <div className="col-span-5 text-center text-sm text-slate-600 dark:text-slate-400 mt-1">{currentLanguage === 'ar' ? translateStatType(st.type, 'ar') : st.type}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    
  );
};

export default MatchDetails;
