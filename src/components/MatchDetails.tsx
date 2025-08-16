import React, { useState } from 'react';
import { 
  Clock, 
  MapPin, 
  Users, 
  Trophy, 
  Calendar,
  ArrowLeft,
  ExternalLink,
  Play,
  Pause,
  Square
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslation } from '../hooks/useTranslation';

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
  const { t, currentLanguage, isRTL, direction } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');

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

  return (
    <div className={`fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 ${isRTL ? 'rtl' : 'ltr'}`} dir={direction}>
      <div className="bg-white dark:bg-slate-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-6 rounded-t-xl">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-4'}`}>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
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
        <div className="p-6">
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-6 items-center">
                {/* Home Team */}
                <div className={`text-center ${isRTL ? 'order-3' : 'order-1'}`}>
                  <Avatar className="w-20 h-20 mx-auto mb-3">
                    <AvatarImage src={match.teams.home.logo} />
                    <AvatarFallback>{match.teams.home.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {match.teams.home.name}
                  </h3>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                    {match.teams.home.score || 0}
                  </div>
                </div>

                {/* Match Info */}
                <div className={`text-center ${isRTL ? 'order-2' : 'order-2'}`}>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    {currentLanguage === 'ar' ? 'VS' : 'VS'}
                  </div>
                  
                  {/* Match Time */}
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <Clock className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {formatMatchTime(match.date, match.time)}
                    </span>
                  </div>

                  {/* Match Date */}
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <Calendar className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {new Date(match.date).toLocaleDateString(
                        currentLanguage === 'ar' ? 'ar-SA' : 'fr-FR',
                        { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        }
                      )}
                    </span>
                  </div>

                  {/* Match Time */}
                  <div className="text-lg font-semibold text-slate-900 dark:text-white">
                    {match.time}
                  </div>

                  {/* Venue */}
                  {match.venue && (
                    <div className="flex items-center justify-center space-x-2 mt-2">
                      <MapPin className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {match.venue}
                      </span>
                    </div>
                  )}
                </div>

                {/* Away Team */}
                <div className={`text-center ${isRTL ? 'order-1' : 'order-3'}`}>
                  <Avatar className="w-20 h-20 mx-auto mb-3">
                    <AvatarImage src={match.teams.away.logo} />
                    <AvatarFallback>{match.teams.away.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {match.teams.away.name}
                  </h3>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                    {match.teams.away.score || 0}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <div className="border-b border-slate-200 dark:border-slate-700 mb-6">
            <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} space-x-8`}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
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
                          <span className="text-slate-600 dark:text-slate-400">{match.referee}</span>
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
                
                {match.goals && match.goals.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-600">
                        {currentLanguage === 'ar' ? 'الأهداف' : 'Buts'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {match.goals.map((goal) => (
                          <div key={goal.id} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-green-600">
                                {goal.minute}'
                              </span>
                              <span className="text-slate-900 dark:text-white">{goal.scorer}</span>
                            </div>
                            <Badge variant="outline" className="text-green-600">
                              {goal.type === 'penalty' ? (currentLanguage === 'ar' ? 'ضربة جزاء' : 'Penalty') :
                               goal.type === 'own_goal' ? (currentLanguage === 'ar' ? 'هدف في مرماه' : 'But contre son camp') :
                               currentLanguage === 'ar' ? 'هدف' : 'But'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {match.cards && match.cards.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-yellow-600">
                        {currentLanguage === 'ar' ? 'البطاقات' : 'Cartons'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {match.cards.map((card) => (
                          <div key={card.id} className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-yellow-600">
                                {card.minute}'
                              </span>
                              <span className="text-slate-900 dark:text-white">{card.player}</span>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={card.type === 'red' ? 'text-red-600 border-red-600' : 'text-yellow-600 border-yellow-600'}
                            >
                              {card.type === 'red' ? (currentLanguage === 'ar' ? 'بطاقة حمراء' : 'Carton rouge') :
                               currentLanguage === 'ar' ? 'بطاقة صفراء' : 'Carton jaune'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {(!match.goals || match.goals.length === 0) && 
                 (!match.cards || match.cards.length === 0) && (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    {currentLanguage === 'ar' ? 'لا توجد أحداث متاحة حالياً' : 'Aucun événement disponible pour le moment'}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'lineups' && (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                {currentLanguage === 'ar' ? 'التشكيلات ستكون متاحة قبل بدء المباراة' : 'Les compositions seront disponibles avant le début du match'}
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                {currentLanguage === 'ar' ? 'الإحصائيات ستكون متاحة بعد انتهاء المباراة' : 'Les statistiques seront disponibles après la fin du match'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchDetails;
