import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trophy, Search, Star, Medal, Award, Crown } from "lucide-react";
import TeamsLogos from "@/components/TeamsLogos";
import { useLanguage } from "@/contexts/LanguageContext";

const Standings = () => {
  const { t, isRTL, currentLanguage } = useLanguage();

  // Données des championnats avec logos et noms traduits
  const leagues = [
    { 
      id: 'world-cup',
      nameKey: 'worldCup',
      country: 'قطر',
      flag: '🇶🇦',
      logo: '⚽',
      icon: <Crown className="w-5 h-5" />,
      color: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
      active: false
    },
    { 
      id: 'champions-league',
      nameKey: 'championsLeague', 
      country: 'أوروبا',
      flag: '🇪🇺',
      logo: '🏆',
      icon: <Star className="w-5 h-5" />,
      color: 'bg-gradient-to-r from-blue-500 to-blue-700',
      active: false
    },
    { 
      id: 'premier-league',
      nameKey: 'premierLeague',
      country: 'إنجلترا',
      flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      logo: '👑',
      icon: <Crown className="w-5 h-5" />,
      color: 'bg-gradient-to-r from-purple-500 to-purple-700',
      active: true
    },
    { 
      id: 'la-liga',
      nameKey: 'laLiga',
      country: 'إسبانيا',
      flag: '🇪🇸',
      logo: '🦅',
      icon: <Award className="w-5 h-5" />,
      color: 'bg-gradient-to-r from-red-500 to-orange-500',
      active: false
    },
    { 
      id: 'serie-a',
      nameKey: 'serieA',
      country: 'إيطاليا',
      flag: '🇮�',
      logo: '🛡️',
      icon: <Medal className="w-5 h-5" />,
      color: 'bg-gradient-to-r from-green-500 to-blue-500',
      active: false
    },
    { 
      id: 'bundesliga',
      nameKey: 'bundesliga',
      country: 'ألمانيا',
      flag: '🇩🇪',
      logo: '🦅',
      icon: <Trophy className="w-5 h-5" />,
      color: 'bg-gradient-to-r from-red-600 to-yellow-500',
      active: false
    },
    { 
      id: 'ligue-1',
      nameKey: 'ligue1',
      country: 'فرنسا',
      flag: '🇫🇷',
      logo: '⚜️',
      icon: <Star className="w-5 h-5" />,
      color: 'bg-gradient-to-r from-blue-600 to-red-500',
      active: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-sport-light/20 to-background">
      <Header />
      <TeamsLogos />
      <div className={`container mx-auto px-4 py-6 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-sport-dark to-sport-green bg-clip-text text-transparent mb-2">
                  {t('standings')} - {t('tournaments')}
                </h1>
                <p className="text-muted-foreground text-sm md:text-base">
                  {t('standingsDescription', { version: '2024/2025' })}
                </p>
              </div>
              
              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <Search className={`absolute top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 ${isRTL ? 'right-3' : 'left-3'}`} />
                <Input
                  placeholder={t('searchTournament')}
                  className={`${isRTL ? 'pr-10 text-right' : 'pl-10'} bg-white/70 backdrop-blur-sm border-sport-light/50 focus:border-sport-green`}
                />
              </div>
            </div>

            {/* Tournaments Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {leagues.map((league) => (
                <Card 
                  key={league.id}
                  className={`group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 ${
                    league.active 
                      ? 'border-sport-green shadow-lg bg-white' 
                      : 'border-transparent hover:border-sport-green/30 bg-white/80 backdrop-blur-sm'
                  }`}
                >
                  <div className="p-6 space-y-4">
                    {/* League Header */}
                    <div className="flex items-center justify-between">
                      <div className={`${league.color} p-3 rounded-full text-white shadow-lg`}>
                        {league.icon}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{league.flag}</span>
                        {league.active && (
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            {t('active')}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* League Info */}
                    <div className="space-y-2">
                      <h3 className={`font-bold text-lg text-sport-dark group-hover:text-sport-green transition-colors ${isRTL ? 'text-right' : 'text-left'}`}>
                        {t(league.nameKey)}
                      </h3>
                      <p className={`text-sm text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
                        {league.country}
                      </p>
                    </div>

                    {/* League Stats */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">{t('teams')}</p>
                        <p className="font-bold text-sport-dark">20</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">{t('season')}</p>
                        <p className="font-bold text-sport-dark">24/25</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">{t('matchday')}</p>
                        <p className="font-bold text-sport-green">15</p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button 
                      className="w-full bg-gradient-to-r from-sport-green to-sport-blue hover:from-sport-green/90 hover:to-sport-blue/90 text-white shadow-md group-hover:shadow-lg transition-all"
                      size="sm"
                    >
                      <Trophy className="w-4 h-4 mr-2" />
                      {t('viewStandings')}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Featured Tournaments Section */}
            <Card className="mt-8 bg-gradient-to-r from-sport-green/5 to-sport-blue/5 border-sport-green/20">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-sport-green to-sport-blue rounded-full">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-sport-dark">
                    {t('featuredTournaments')}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* World Cup Card */}
                  <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8"></div>
                    <div className="relative z-10">
                      <Crown className="w-8 h-8 mb-3" />
                      <h3 className="font-bold text-lg mb-2">{t('worldCup')}</h3>
                      <p className="text-sm opacity-90 mb-4">قطر 2022</p>
                      <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                        {t('viewResults')}
                      </Button>
                    </div>
                  </div>

                  {/* Champions League Card */}
                  <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
                    <div className="relative z-10">
                      <Star className="w-8 h-8 mb-3" />
                      <h3 className="font-bold text-lg mb-2">{t('championsLeague')}</h3>
                      <p className="text-sm opacity-90 mb-4">UEFA 2024/25</p>
                      <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                        {t('viewStandings')}
                      </Button>
                    </div>
                  </div>

                  {/* Premier League Card */}
                  <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-white relative overflow-hidden md:col-span-2 lg:col-span-1">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
                    <div className="relative z-10">
                      <Crown className="w-8 h-8 mb-3" />
                      <h3 className="font-bold text-lg mb-2">{t('premierLeague')}</h3>
                      <p className="text-sm opacity-90 mb-4">England 2024/25</p>
                      <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                        {t('viewStandings')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <Card className="p-4 text-center bg-white/80 backdrop-blur-sm">
                <Trophy className="w-8 h-8 mx-auto text-sport-green mb-2" />
                <p className="text-2xl font-bold text-sport-dark">127</p>
                <p className="text-xs text-muted-foreground">{t('tournaments')}</p>
              </Card>
              <Card className="p-4 text-center bg-white/80 backdrop-blur-sm">
                <Star className="w-8 h-8 mx-auto text-sport-blue mb-2" />
                <p className="text-2xl font-bold text-sport-dark">2,840</p>
                <p className="text-xs text-muted-foreground">{t('teams')}</p>
              </Card>
              <Card className="p-4 text-center bg-white/80 backdrop-blur-sm">
                <Medal className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                <p className="text-2xl font-bold text-sport-dark">15,692</p>
                <p className="text-xs text-muted-foreground">{t('matches')}</p>
              </Card>
              <Card className="p-4 text-center bg-white/80 backdrop-blur-sm">
                <Award className="w-8 h-8 mx-auto text-orange-500 mb-2" />
                <p className="text-2xl font-bold text-sport-dark">45</p>
                <p className="text-xs text-muted-foreground">{t('countries')}</p>
              </Card>
            </div>
          </div>

        
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Standings;
