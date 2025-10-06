import React from 'react';
import { Card } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { getTeamTranslation } from "@/utils/teamNameMap";
import { useSingleTeamTranslation } from "@/hooks/useTeamTranslation";

interface GroupStanding {
  rank: number;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  points: number;
  goalsDiff: number;
  group: string;
  form: string;
  status: string;
  description: string;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
}

interface GroupStandingsTableProps {
  standings: GroupStanding[];
  leagueName: string;
  leagueLogo: string;
  loading?: boolean;
}

const TeamNameWithTranslation = ({ team }: { team: any }) => {
  const { currentLanguage } = useTranslation();
  const teamName = typeof team === 'string' ? team : team?.name || '';
  const { translatedName, isInitialized } = useSingleTeamTranslation(teamName);
  
  if (currentLanguage === 'ar') {
    return <span>{isInitialized ? translatedName : teamName}</span>;
  }
  
  return <span>{teamName}</span>;
};

const GroupStandingsTable: React.FC<GroupStandingsTableProps> = ({
  standings,
  leagueName,
  leagueLogo,
  loading = false
}) => {
  const { currentLanguage, isRTL } = useTranslation();

  if (loading) {
    return (
      <Card className="p-4 bg-white dark:bg-[#181a20] border-0 shadow-lg">
        <div className="animate-pulse space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!standings || standings.length === 0) {
    return (
      <Card className="p-8 text-center bg-white dark:bg-[#181a20] border-0 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
          {currentLanguage === 'ar' ? 'لا توجد بيانات متاحة' : 'Aucune donnée disponible'}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {currentLanguage === 'ar' 
            ? 'لا يمكن عرض ترتيب المجموعات حالياً' 
            : 'Impossible d\'afficher le classement des groupes actuellement'
          }
        </p>
      </Card>
    );
  }

  // Grouper les équipes par groupe
  const groupedStandings = standings.reduce((acc: { [key: string]: GroupStanding[] }, team) => {
    const groupName = team.group || 'Group A';
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(team);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(groupedStandings).map(([groupName, teams]) => (
        <Card key={groupName} className="overflow-hidden bg-white dark:bg-[#181a20] border-0 shadow-lg">
          {/* En-tête du groupe */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className={`text-lg font-bold text-gray-800 dark:text-gray-100 ${isRTL ? 'text-right' : 'text-left'}`}>
              {groupName}
            </h3>
          </div>

          {/* Tableau du groupe */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr className={`text-gray-600 dark:text-gray-300 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <th className="px-3 py-2 font-medium">
                    {currentLanguage === 'ar' ? 'المركز' : 'Pos'}
                  </th>
                  <th className="px-3 py-2 font-medium">
                    {currentLanguage === 'ar' ? 'الفريق' : 'Équipe'}
                  </th>
                  <th className="px-2 py-2 font-medium text-center">
                    {currentLanguage === 'ar' ? 'ل' : 'J'}
                  </th>
                  <th className="px-2 py-2 font-medium text-center">
                    {currentLanguage === 'ar' ? 'ف' : 'G'}
                  </th>
                  <th className="px-2 py-2 font-medium text-center">
                    {currentLanguage === 'ar' ? 'ت' : 'N'}
                  </th>
                  <th className="px-2 py-2 font-medium text-center">
                    {currentLanguage === 'ar' ? 'خ' : 'P'}
                  </th>
                  <th className="px-2 py-2 font-medium text-center">
                    {currentLanguage === 'ar' ? '+/-' : '+/-'}
                  </th>
                  <th className="px-3 py-2 font-medium text-center">
                    {currentLanguage === 'ar' ? 'النقاط' : 'Pts'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team, index) => (
                  <tr 
                    key={team.team.id} 
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    {/* Position */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          team.rank === 1 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          team.rank === 2 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          team.rank === 3 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {team.rank}
                        </span>
                      </div>
                    </td>

                    {/* Équipe */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={team.team.logo}
                          alt={team.team.name}
                          className="w-6 h-6 object-contain flex-shrink-0"
                        />
                        <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          <TeamNameWithTranslation team={team.team} />
                        </span>
                      </div>
                    </td>

                    {/* Statistiques */}
                    <td className="px-2 py-3 text-center text-gray-600 dark:text-gray-400">
                      {team.all.played}
                    </td>
                    <td className="px-2 py-3 text-center text-gray-600 dark:text-gray-400">
                      {team.all.win}
                    </td>
                    <td className="px-2 py-3 text-center text-gray-600 dark:text-gray-400">
                      {team.all.draw}
                    </td>
                    <td className="px-2 py-3 text-center text-gray-600 dark:text-gray-400">
                      {team.all.lose}
                    </td>
                    <td className="px-2 py-3 text-center">
                      <span className={`font-medium ${
                        team.goalsDiff > 0 ? 'text-green-600 dark:text-green-400' :
                        team.goalsDiff < 0 ? 'text-red-600 dark:text-red-400' :
                        'text-gray-600 dark:text-gray-400'
                      }`}>
                        {team.goalsDiff > 0 ? '+' : ''}{team.goalsDiff}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="font-bold text-gray-900 dark:text-gray-100">
                        {team.points}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Légende des qualifications */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-xs">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  {currentLanguage === 'ar' ? 'التأهل للدور التالي' : 'Qualifié pour le tour suivant'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  {currentLanguage === 'ar' ? 'تأهل مشروط' : 'Qualification conditionnelle'}
                </span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default GroupStandingsTable;