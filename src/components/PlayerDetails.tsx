import React, { useState } from 'react';
import { 
  User, 
  Trophy, 
  Target, 
  Calendar,
  ArrowLeft,
  ExternalLink,
  MapPin,
  Flag,
  Shirt,
  Award,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslation } from '../hooks/useTranslation';
import { maybeTransliterateName } from '@/utils/transliterate';

interface PlayerDetailsProps {
  player: {
    id: number;
    name: string;
    photo: string;
    age: number;
    nationality: string;
    countryFlag: string;
    position: string;
    shirtNumber: number;
    team: {
      id: number;
      name: string;
      logo: string;
      league: string;
    };
    stats: {
      goals: number;
      assists: number;
      yellowCards: number;
      redCards: number;
      matches: number;
      minutes: number;
    };
    personalInfo: {
      height: string;
      weight: string;
      birthDate: string;
      birthPlace: string;
    };
    career: Array<{
      id: number;
      season: string;
      team: string;
      teamLogo: string;
      league: string;
      goals: number;
      assists: number;
      matches: number;
    }>;
  };
  onClose: () => void;
}

const PlayerDetails: React.FC<PlayerDetailsProps> = ({ player, onClose }) => {
  const { t, currentLanguage, isRTL, direction } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: currentLanguage === 'ar' ? 'نظرة عامة' : 'Vue d\'ensemble', icon: User },
    { id: 'stats', label: currentLanguage === 'ar' ? 'الإحصائيات' : 'Statistiques', icon: Target },
    { id: 'career', label: currentLanguage === 'ar' ? 'المسيرة' : 'Carrière', icon: Trophy },
    { id: 'personal', label: currentLanguage === 'ar' ? 'معلومات شخصية' : 'Informations personnelles', icon: Calendar }
  ];

  const getPositionColor = (position: string) => {
    switch (position.toLowerCase()) {
      case 'forward':
      case 'attacker':
        return 'bg-red-500';
      case 'midfielder':
        return 'bg-blue-500';
      case 'defender':
        return 'bg-green-500';
      case 'goalkeeper':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPositionText = (position: string) => {
    switch (position.toLowerCase()) {
      case 'forward':
        return currentLanguage === 'ar' ? 'مهاجم' : 'Attaquant';
      case 'midfielder':
        return currentLanguage === 'ar' ? 'لاعب وسط' : 'Milieu';
      case 'defender':
        return currentLanguage === 'ar' ? 'مدافع' : 'Défenseur';
      case 'goalkeeper':
        return currentLanguage === 'ar' ? 'حارس مرمى' : 'Gardien';
      default:
        return position;
    }
  };

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
                  {currentLanguage === 'ar' ? 'تفاصيل اللاعب' : 'Détails du Joueur'}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {player.team.league} • {player.team.name}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Player Info */}
        <div className="p-6">
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Player Photo & Basic Info */}
                <div className="text-center lg:text-left">
                  <Avatar className="w-32 h-32 mx-auto lg:mx-0 mb-4">
                    <AvatarImage src={player.photo} />
                    <AvatarFallback className="text-4xl">{player.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {maybeTransliterateName(player.name, currentLanguage)}
                  </h3>
                  <div className="flex items-center justify-center lg:justify-start space-x-2 mb-3">
                    <Badge className={getPositionColor(player.position)}>
                      {getPositionText(player.position)}
                    </Badge>
                    <Badge variant="outline">
                      #{player.shirtNumber}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start space-x-2 text-sm text-slate-600 dark:text-slate-400">
                    <Flag className="w-4 h-4" />
                    <span>{player.nationality}</span>
                    <span className="text-lg">{player.countryFlag}</span>
                  </div>
                </div>

                {/* Team Info */}
                <div className="text-center lg:text-left">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                    {currentLanguage === 'ar' ? 'النادي الحالي' : 'Club actuel'}
                  </h4>
                  <div className="flex items-center justify-center lg:justify-start space-x-3 mb-4">
                    <img src={player.team.logo} alt={player.team.name} className="w-16 h-16" />
                    <div>
                      <h5 className="font-medium text-slate-900 dark:text-white">
                        {player.team.name}
                      </h5>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {player.team.league}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center justify-center lg:justify-start space-x-2 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span>{currentLanguage === 'ar' ? 'العمر' : 'Âge'}: {player.age}</span>
                    </div>
                    <div className="flex items-center justify-center lg:justify-start space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{player.personalInfo.birthPlace}</span>
                    </div>
                  </div>
                </div>

                {/* Key Stats */}
                <div className="text-center lg:text-left">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                    {currentLanguage === 'ar' ? 'إحصائيات أساسية' : 'Statistiques clés'}
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{player.stats.goals}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {currentLanguage === 'ar' ? 'أهداف' : 'Buts'}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{player.stats.assists}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {currentLanguage === 'ar' ? 'تمريرات' : 'Passes'}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{player.stats.yellowCards}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {currentLanguage === 'ar' ? 'بطاقات صفراء' : 'Cartons jaunes'}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{player.stats.redCards}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {currentLanguage === 'ar' ? 'بطاقات حمراء' : 'Cartons rouges'}
                      </div>
                    </div>
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
                      <TrendingUp className="w-5 h-5 text-teal-600" />
                      <span>{currentLanguage === 'ar' ? 'أداء هذا الموسم' : 'Performance cette saison'}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">
                          {player.stats.matches}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {currentLanguage === 'ar' ? 'مباريات' : 'Matchs'}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">
                          {Math.floor(player.stats.minutes / 90)}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {currentLanguage === 'ar' ? 'مباريات كاملة' : 'Matchs complets'}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">
                          {player.stats.goals > 0 ? (player.stats.goals / player.stats.matches).toFixed(1) : '0'}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {currentLanguage === 'ar' ? 'معدل الأهداف' : 'Ratio buts'}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">
                          {player.stats.assists > 0 ? (player.stats.assists / player.stats.matches).toFixed(1) : '0'}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {currentLanguage === 'ar' ? 'معدل التمريرات' : 'Ratio passes'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="w-5 h-5 text-teal-600" />
                      <span>{currentLanguage === 'ar' ? 'إحصائيات مفصلة' : 'Statistiques détaillées'}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <span className="text-slate-700 dark:text-slate-300">
                          {currentLanguage === 'ar' ? 'إجمالي الدقائق' : 'Minutes totales'}
                        </span>
                        <span className="font-semibold">{player.stats.minutes}'</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <span className="text-slate-700 dark:text-slate-300">
                          {currentLanguage === 'ar' ? 'معدل الدقائق لكل مباراة' : 'Minutes par match'}
                        </span>
                        <span className="font-semibold">
                          {Math.floor(player.stats.minutes / player.stats.matches)}'
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <span className="text-slate-700 dark:text-slate-300">
                          {currentLanguage === 'ar' ? 'معدل الأهداف لكل مباراة' : 'Buts par match'}
                        </span>
                        <span className="font-semibold">
                          {(player.stats.goals / player.stats.matches).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <span className="text-slate-700 dark:text-slate-300">
                          {currentLanguage === 'ar' ? 'معدل التمريرات لكل مباراة' : 'Passes par match'}
                        </span>
                        <span className="font-semibold">
                          {(player.stats.assists / player.stats.matches).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'career' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {currentLanguage === 'ar' ? 'المسيرة المهنية' : 'Carrière professionnelle'}
                </h3>
                
                {player.career && player.career.length > 0 ? (
                  <div className="space-y-4">
                    {player.career.map((season) => (
                      <Card key={season.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <img src={season.teamLogo} alt={season.team} className="w-12 h-12" />
                              <div>
                                <h4 className="font-semibold text-slate-900 dark:text-white">
                                  {season.team}
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  {season.season} • {season.league}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                  <div className="text-lg font-bold text-green-600">{season.goals}</div>
                                  <div className="text-xs text-slate-500">
                                    {currentLanguage === 'ar' ? 'أهداف' : 'Buts'}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-lg font-bold text-blue-600">{season.assists}</div>
                                  <div className="text-xs text-slate-500">
                                    {currentLanguage === 'ar' ? 'تمريرات' : 'Passes'}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-lg font-bold text-slate-600">{season.matches}</div>
                                  <div className="text-xs text-slate-500">
                                    {currentLanguage === 'ar' ? 'مباريات' : 'Matchs'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    {currentLanguage === 'ar' ? 'لا توجد معلومات عن المسيرة المهنية' : 'Aucune information sur la carrière professionnelle'}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'personal' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-teal-600" />
                      <span>{currentLanguage === 'ar' ? 'معلومات شخصية' : 'Informations personnelles'}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                          {currentLanguage === 'ar' ? 'تاريخ الميلاد' : 'Date de naissance'}
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400">
                          {new Date(player.personalInfo.birthDate).toLocaleDateString(
                            currentLanguage === 'ar' ? 'ar-SA' : 'fr-FR',
                            { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            }
                          )}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                          {currentLanguage === 'ar' ? 'مكان الميلاد' : 'Lieu de naissance'}
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400">
                          {player.personalInfo.birthPlace}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                          {currentLanguage === 'ar' ? 'الطول' : 'Taille'}
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400">
                          {player.personalInfo.height}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                          {currentLanguage === 'ar' ? 'الوزن' : 'Poids'}
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400">
                          {player.personalInfo.weight}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerDetails;
