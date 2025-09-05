import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Filter, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'author' | 'moderator';
  status: 'active' | 'inactive' | 'banned';
  joinDate?: string;
  avatar?: string;
}

interface UsersTabProps {
  // creation dialog state + fields
  isCreateUserOpen: boolean;
  onChangeCreateUserOpen: (open: boolean) => void;
  newUserName: string;
  setNewUserName: (v: string) => void;
  newUserEmail: string;
  setNewUserEmail: (v: string) => void;
  newUserPassword: string;
  setNewUserPassword: (v: string) => void;
  newUserRole: UserRow['role'];
  setNewUserRole: (v: UserRow['role']) => void;
  creatingUser: boolean;
  createUserError: string;
  createUserInfo: string;
  onSubmitCreateUser: () => Promise<void> | void;

  // list and actions
  users: UserRow[];
  loadingUsers: boolean;
  onChangeUserRole: (id: string, newRole: UserRow['role']) => Promise<void> | void;
  onChangeUserStatus: (id: string, newStatus: UserRow['status']) => Promise<void> | void;
  onDeleteUser: (id: string) => Promise<void> | void;

  // pagination
  usersPage: number;
  usersTotal: number;
  pageSize: number;
  onPrevPage: () => void;
  onNextPage: () => void;
}

const UsersTab: React.FC<UsersTabProps> = ({
  isCreateUserOpen,
  onChangeCreateUserOpen,
  newUserName,
  setNewUserName,
  newUserEmail,
  setNewUserEmail,
  newUserPassword,
  setNewUserPassword,
  newUserRole,
  setNewUserRole,
  creatingUser,
  createUserError,
  createUserInfo,
  onSubmitCreateUser,
  users,
  loadingUsers,
  onChangeUserRole,
  onChangeUserStatus,
  onDeleteUser,
  usersPage,
  usersTotal,
  pageSize,
  onPrevPage,
  onNextPage,
}) => {
  const { currentLanguage, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.role || '').toLowerCase().includes(q) ||
      (u.status || '').toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top actions row */}
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-4'}`}>
          <Input
            placeholder={currentLanguage === 'ar' ? 'البحث في المستخدمين...' : 'Rechercher des utilisateurs...'}
            className="w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button variant="outline" size="sm">
            <Filter className={`${isRTL ? 'ml-2' : 'mr-2'} w-4 h-4`} />
            {currentLanguage === 'ar' ? 'تصفية' : 'Filtrer'}
          </Button>
        </div>
        {/* Create User Dialog Trigger */}
        <Dialog open={isCreateUserOpen} onOpenChange={onChangeCreateUserOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <Plus className={`${isRTL ? 'ml-2' : 'mr-2'} w-4 h-4`} />
              {currentLanguage === 'ar' ? 'إنشاء مستخدم' : 'Créer un utilisateur'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{currentLanguage === 'ar' ? 'إنشاء مستخدم جديد' : 'Créer un nouvel utilisateur'}</DialogTitle>
              <DialogDescription>
                {currentLanguage === 'ar' ? 'يدعم الإنشاء بواسطة المدير فقط' : 'Disponible pour les administrateurs uniquement'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {currentLanguage === 'ar' ? 'الاسم' : 'Nom'}
                </label>
                <Input value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder={currentLanguage === 'ar' ? 'اسم المستخدم' : "Nom de l'utilisateur"} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {currentLanguage === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <Input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="email@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {currentLanguage === 'ar' ? 'كلمة المرور المؤقتة' : 'Mot de passe temporaire'}
                </label>
                <Input type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} placeholder={currentLanguage === 'ar' ? 'كلمة مرور مؤقتة' : 'Mot de passe temporaire'} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {currentLanguage === 'ar' ? 'الدور' : 'Rôle'}
                </label>
                <Select value={newUserRole} onValueChange={(v) => setNewUserRole(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="author">Author</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {createUserError && (
                <p className="text-sm text-red-600">{createUserError}</p>
              )}
              {createUserInfo && (
                <p className="text-sm text-emerald-600">{createUserInfo}</p>
              )}

              <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} gap-2`}>
                <Button variant="outline" onClick={() => onChangeCreateUserOpen(false)}>
                  {currentLanguage === 'ar' ? 'إلغاء' : 'Annuler'}
                </Button>
                <Button
                  className="bg-teal-600 hover:bg-teal-700"
                  disabled={creatingUser}
                  onClick={() => onSubmitCreateUser()}
                >
                  {creatingUser ? (currentLanguage === 'ar' ? 'جاري الإنشاء...' : 'Création...') : (currentLanguage === 'ar' ? 'إنشاء' : 'Créer')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users list */}
      <Card>
        <CardHeader>
          <CardTitle>{currentLanguage === 'ar' ? 'إدارة المستخدمين' : 'Gestion des Utilisateurs'}</CardTitle>
          <CardDescription>
            {currentLanguage === 'ar' ? 'إدارة جميع مستخدمي المنصة' : 'Gérez tous les utilisateurs de la plateforme'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingUsers && (
            <div className="text-sm text-slate-500">{currentLanguage === 'ar' ? 'جاري تحميل المستخدمين...' : 'Chargement des utilisateurs...'}</div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{currentLanguage === 'ar' ? 'الاسم' : 'Nom'}</TableHead>
                <TableHead>{currentLanguage === 'ar' ? 'البريد' : 'Email'}</TableHead>
                <TableHead className="w-[120px]">{currentLanguage === 'ar' ? 'الدور' : 'Rôle'}</TableHead>
                <TableHead className="w-[120px]">{currentLanguage === 'ar' ? 'الحالة' : 'Statut'}</TableHead>
                <TableHead className="w-[140px]">{currentLanguage === 'ar' ? 'مسجل في' : 'Inscrit le'}</TableHead>
                <TableHead className="w-[160px] text-right">{currentLanguage === 'ar' ? 'إجراءات' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <Avatar className="w-7 h-7">
                      <AvatarImage src={u.avatar} />
                      <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {u.name}
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Select value={u.role} onValueChange={(newRole) => onChangeUserRole(u.id, newRole as any)}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">admin</SelectItem>
                        <SelectItem value="editor">editor</SelectItem>
                        <SelectItem value="author">author</SelectItem>
                        <SelectItem value="moderator">moderator</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select value={u.status} onValueChange={(newStatus) => onChangeUserStatus(u.id, newStatus as any)}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">active</SelectItem>
                        <SelectItem value="inactive">inactive</SelectItem>
                        <SelectItem value="banned">banned</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{u.joinDate}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => onDeleteUser(u.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* Users pagination */}
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''} pt-3`}>
            <div className="text-xs text-slate-500">
              {currentLanguage === 'ar' ? `صفحة ${usersPage}` : `Page ${usersPage}`} · {currentLanguage === 'ar' ? `${usersTotal} إجمالي` : `${usersTotal} au total`}
            </div>
            <div className={`flex ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
              <Button variant="outline" size="sm" disabled={usersPage <= 1 || loadingUsers} onClick={onPrevPage}>
                {currentLanguage === 'ar' ? 'السابق' : 'Précédent'}
              </Button>
              <Button variant="outline" size="sm" disabled={loadingUsers || (usersPage * pageSize >= usersTotal)} onClick={onNextPage}>
                {currentLanguage === 'ar' ? 'التالي' : 'Suivant'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersTab;
