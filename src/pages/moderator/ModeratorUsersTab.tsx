import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Ban, CheckCircle, MessageSquare } from 'lucide-react';

export interface ModerationUser {
  id: string;
  name: string;
  email?: string;
  avatar_url?: string | null;
  role: string;
  status: string;
  raw?: Record<string, any>;
}

interface ModeratorUsersTabProps {
  currentLanguage: 'ar' | 'fr' | 'en';
  isRTL: boolean;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  roleFilter: string;
  setRoleFilter: (v: string) => void;
  loadingUsers: boolean;
  users: ModerationUser[];
  onBlock: (id: string) => void;
  onUnblock: (id: string) => void;
  onSelectUserComments: (id: string) => void;
  expandedUserId: string | null;
  setExpandedUserId: (id: string | null) => void;
  usersPage: number;
  setUsersPage: (updater: (p: number) => number) => void;
  usersHasNext: boolean;
}

const ModeratorUsersTab: React.FC<ModeratorUsersTabProps> = ({
  currentLanguage,
  isRTL,
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter,
  loadingUsers,
  users,
  onBlock,
  onUnblock,
  onSelectUserComments,
  expandedUserId,
  setExpandedUserId,
  usersPage,
  setUsersPage,
  usersHasNext,
}) => {
  return (
    <>
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-4'}`}>
          <Input
            placeholder={currentLanguage === 'ar' ? 'ابحث عن المستخدمين...' : 'Rechercher des utilisateurs...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-900"
          >
            <option value="all">{currentLanguage === 'ar' ? 'الكل' : 'Tous'}</option>
            <option value="user">{currentLanguage === 'ar' ? 'مستخدم' : 'Utilisateur'}</option>
            <option value="author">{currentLanguage === 'ar' ? 'كاتب' : 'Auteur'}</option>
            <option value="editor">{currentLanguage === 'ar' ? 'محرر' : 'Éditeur'}</option>
            <option value="moderator">{currentLanguage === 'ar' ? 'مشرف' : 'Modérateur'}</option>
            <option value="admin">{currentLanguage === 'ar' ? 'مدير' : 'Admin'}</option>
          </select>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{currentLanguage === 'ar' ? 'قائمة المستخدمين' : 'Liste des utilisateurs'}</CardTitle>
          <CardDescription>{currentLanguage === 'ar' ? 'عرض المعلومات الشخصية واتخاذ الإجراءات' : 'Afficher les infos personnelles et gérer les actions'}</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingUsers && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-40 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              ))}
            </div>
          )}
          {!loadingUsers && (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-slate-200 dark:border-slate-700 rounded-md bg-white/70 dark:bg-slate-900/70">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">{currentLanguage === 'ar' ? 'المستخدم' : 'Utilisateur'}</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">Email</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">{currentLanguage === 'ar' ? 'الدور' : 'Rôle'}</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">{currentLanguage === 'ar' ? 'الحالة' : 'Statut'}</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">{currentLanguage === 'ar' ? 'أنشئ في' : 'Créé le'}</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">{currentLanguage === 'ar' ? 'إجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <React.Fragment key={u.id}>
                      <tr className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>{(u.name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium truncate max-w-[200px]">{u.name || '—'}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-600 dark:text-slate-300 truncate max-w-[220px]">{u.email || '—'}</td>
                        <td className="px-3 py-2"><Badge variant="outline">{u.role}</Badge></td>
                        <td className="px-3 py-2"><Badge variant={u.status === 'banned' ? 'destructive' : 'secondary'}>{u.status}</Badge></td>
                        <td className="px-3 py-2 text-xs text-slate-500">{u.raw?.created_at ? new Date(u.raw.created_at).toISOString().slice(0,10) : '—'}</td>
                        <td className="px-3 py-2">
                          <div className={`flex ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                            {u.status === 'banned' ? (
                              <Button size="sm" variant="outline" onClick={() => onUnblock(u.id)} className="text-green-600 border-green-200 hover:bg-green-50">
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => onBlock(u.id)} className="text-red-600 border-red-200 hover:bg-red-50">
                                <Ban className="w-4 h-4" />
                              </Button>
                            )}
                            <Button size="sm" variant="outline" onClick={() => onSelectUserComments(u.id)} className="text-slate-700 border-slate-200 hover:bg-slate-50">
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                           
                          </div>
                        </td>
                      </tr>
                      {expandedUserId === u.id && (
                        <tr className="bg-slate-50/60 dark:bg-slate-800/60">
                          <td colSpan={6} className="px-3 py-3">
                            {u.raw ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                                {Object.entries(u.raw)
                                  .filter(([_, v]) => v !== null && typeof v !== 'undefined' && String(v).trim() !== '')
                                  .map(([k, v]) => (
                                    <div key={k} className="flex items-center justify-between rounded bg-white dark:bg-slate-900 px-2 py-1 border border-slate-200 dark:border-slate-700">
                                      <span className="font-medium text-slate-700 dark:text-slate-200">{k}</span>
                                      <span className="truncate ml-2 text-slate-600 dark:text-slate-300">{String(v)}</span>
                                    </div>
                                  ))}
                              </div>
                            ) : (
                              <div className="text-xs text-slate-500">{currentLanguage === 'ar' ? 'لا توجد تفاصيل' : 'Aucun détail'}</div>
                            )}
                          </td>
                        </tr>
                      )}
                  </React.Fragment>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-3 py-4 text-sm text-slate-500">{currentLanguage === 'ar' ? 'لا يوجد مستخدمون' : 'Aucun utilisateur'}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          <div className={`mt-4 flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="text-xs text-slate-500">{currentLanguage === 'ar' ? `صفحة ${usersPage}` : `Page ${usersPage}`}</div>
            <div className={`flex ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
              <Button variant="outline" size="sm" disabled={usersPage <= 1} onClick={() => setUsersPage((p) => Math.max(1, p - 1))}>{currentLanguage === 'ar' ? 'السابق' : 'Précédent'}</Button>
              <Button variant="outline" size="sm" disabled={!usersHasNext} onClick={() => setUsersPage((p) => p + 1)}>{currentLanguage === 'ar' ? 'التالي' : 'Suivant'}</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ModeratorUsersTab;
