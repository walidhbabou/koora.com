import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Camera, Lock, Save, User } from 'lucide-react';

const ProfileTab: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const { user, updateUser } = useAuth();

  const [myProfile, setMyProfile] = useState<Record<string, any> | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      setLoadingProfile(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, email, name, first_name, last_name, role, status, created_at, avatar_url')
          .eq('id', user.id)
          .maybeSingle();
        if (!error && data) {
          setMyProfile(data);
          setProfileForm({
            name: data.name || '',
            firstName: data.first_name || (data as any).firstName || '',
            lastName: data.last_name || (data as any).lastName || '',
            email: data.email || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
        } else {
          const minimal = {
            id: user.id,
            email: user.email,
            name: user.name ?? [user.firstName, user.lastName].filter(Boolean).join(' '),
            first_name: user.firstName ?? null,
            last_name: user.lastName ?? null,
            role: user.role,
            status: user.status,
            avatar_url: null as string | null,
          };
          // Perform upsert first, then select with proper filter typing
          await supabase.from('users').upsert(minimal, { onConflict: 'id' });
          const { data: inserted } = await supabase
            .from('users')
            .select('id, email, name, first_name, last_name, role, status, created_at, avatar_url')
            .eq('id', user.id)
            .maybeSingle();
          if (inserted) {
            setMyProfile(inserted);
            setProfileForm({
              name: inserted.name || '',
              firstName: (inserted as any).first_name || '',
              lastName: (inserted as any).last_name || '',
              email: inserted.email || '',
              currentPassword: '',
              newPassword: '',
              confirmPassword: ''
            });
          }
        }
      } finally {
        setLoadingProfile(false);
      }
    };
    loadProfile();
  }, [user?.id]);

  const handleProfileUpdate = async () => {
    setProfileError('');
    setProfileSuccess('');
    setEditingProfile(true);

    try {
      if (!user?.id) {
        setProfileError(currentLanguage === 'ar' ? 'جلسة غير صالحة' : 'Session invalide');
        return;
      }

      if (profileForm.newPassword) {
        if (profileForm.newPassword !== profileForm.confirmPassword) {
          setProfileError(currentLanguage === 'ar' ? 'كلمات المرور غير متطابقة' : 'Les mots de passe ne correspondent pas');
          return;
        }
        if (profileForm.newPassword.length < 6) {
          setProfileError(currentLanguage === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Le mot de passe doit contenir au moins 6 caractères');
          return;
        }
      }

      let avatarUrl = myProfile?.avatar_url as string | undefined;

      if (profileImageFile) {
        const ext = profileImageFile.name.split('.').pop();
        const bucketName = 'avatars';
        const timestamp = Date.now();
        const filePath = `users/${user.id}/avatar_${timestamp}.${ext}`;
        const { error: upErr } = await supabase
          .storage
          .from(bucketName)
          .upload(filePath, profileImageFile, { upsert: true });
        if (upErr) {
          if (String(upErr.message || '').toLowerCase().includes('bucket not found')) {
            setProfileError(currentLanguage === 'ar' ? 'لم يتم العثور على حاوية الصور "avatars" في Supabase. أنشئها من قسم Storage واجعلها عامة أو أضف سياسات مناسبة.' : 'Le bucket de stockage "avatars" est introuvable dans Supabase. Créez-le dans Storage et rendez-le public ou ajoutez des policies.');
            return;
          }
          setProfileError((currentLanguage === 'ar' ? 'فشل رفع الصورة: ' : 'Échec de téléversement: ') + (upErr.message || ''));
          return;
        }
        const { data: pub } = supabase.storage.from(bucketName).getPublicUrl(filePath);
        avatarUrl = pub?.publicUrl;
      }

      // Compute changed fields only to avoid triggering DB restrictions on name columns
      const nameChanged = profileForm.name !== (myProfile?.name || '');
      const firstChanged = profileForm.firstName !== (myProfile?.first_name || '');
      const lastChanged = profileForm.lastName !== (myProfile?.last_name || '');

      const updateData: any = {};
      if (nameChanged) updateData.name = profileForm.name;
      if (firstChanged) updateData.first_name = profileForm.firstName;
      if (lastChanged) updateData.last_name = profileForm.lastName;

      if (avatarUrl !== myProfile?.avatar_url) {
        updateData.avatar_url = avatarUrl;
      }

      const { data: sessionRes } = await supabase.auth.getSession();
      const hasAuthSession = !!sessionRes?.session;

      const onlyAvatarChanged = !!profileImageFile &&
        (profileForm.name === (myProfile?.name || '') &&
         profileForm.firstName === (myProfile?.first_name || '') &&
         profileForm.lastName === (myProfile?.last_name || '')) &&
        !profileForm.newPassword;

      if (onlyAvatarChanged && avatarUrl) {
        setMyProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : prev);
        updateUser({ avatarUrl });
        try {
          if (hasAuthSession) {
            const { error: updErr } = await supabase
              .from('users')
              .update({ avatar_url: avatarUrl })
              .eq('id', user.id);
            if (updErr) throw updErr;
            setProfileSuccess(currentLanguage === 'ar' ? 'تم تحديث الصورة الشخصية وتم حفظها في قاعدة البيانات' : 'Avatar mis à jour et enregistré dans la base');
          } else {
            if (!profileForm.currentPassword) {
              setProfileSuccess(currentLanguage === 'ar'
                ? 'تم تحديث الصورة محلياً. أدخل كلمة المرور الحالية ثم احفظ مرة أخرى لحفظ الرابط في قاعدة البيانات.'
                : "Avatar mis à jour localement. Saisissez le mot de passe actuel puis enregistrez à nouveau pour l'écrire en base.");
            } else {
              const { error: rpcErr } = await supabase.rpc('app_update_user_profile', {
                p_email: profileForm.email || myProfile?.email || user.email,
                p_password: profileForm.currentPassword,
                p_name: null,
                p_first_name: null,
                p_last_name: null,
                p_avatar_url: avatarUrl,
              });
              if (rpcErr) throw rpcErr;
              setProfileSuccess(currentLanguage === 'ar' ? 'تم حفظ رابط الصورة في قاعدة البيانات' : "URL de l'avatar enregistrée en base");
            }
          }
        } catch (e: any) {
          setProfileError((currentLanguage === 'ar' ? 'تعذر حفظ رابط الصورة في قاعدة البيانات: ' : "Impossible d'enregistrer l'URL de l’avatar en base: ") + (e?.message || ''));
        }
        setProfileImageFile(null);
        return;
      }

      if (hasAuthSession) {
        let { error: updateErr } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', user.id);
        if (updateErr) {
          const msg = String(updateErr.message || '').toLowerCase();
          const blocksName = msg.includes('can only be updated to default') && msg.includes('name');
          if (blocksName && 'name' in updateData) {
            const { name, ...withoutName } = updateData;
            const retry = await supabase
              .from('users')
              .update(withoutName)
              .eq('id', user.id);
            if (retry.error) throw retry.error;
          } else {
            const msgLower = String(updateErr.message || '').toLowerCase();
            const rlsViolation = msgLower.includes('row-level security');
            if (rlsViolation && avatarUrl && avatarUrl !== myProfile?.avatar_url) {
              setMyProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : prev);
              updateUser({ avatarUrl });
              setProfileSuccess(currentLanguage === 'ar' ? 'تم تحديث الصورة الشخصية. لم يتم حفظ معلومات الاسم بسبب صلاحيات قاعدة البيانات.' : 'Avatar mis à jour. Les champs du nom n’ont pas été enregistrés à cause des règles RLS.');
              setProfileImageFile(null);
              return;
            }
            setProfileError((currentLanguage === 'ar' ? 'فشل تحديث بيانات المستخدم: ' : "Échec de mise à jour de l’utilisateur: ") + (updateErr.message || ''));
            return;
          }
        }
      } else {
        // Build RPC payload: send null for unchanged fields
        const payload: any = {
          p_email: profileForm.email || myProfile?.email || user.email,
          p_password: profileForm.currentPassword || null,
          p_name: nameChanged ? profileForm.name : null,
          p_first_name: firstChanged ? profileForm.firstName : null,
          p_last_name: lastChanged ? profileForm.lastName : null,
          p_avatar_url: updateData.avatar_url ?? null,
        };
        let { error: rpcErr } = await supabase.rpc('app_update_user_profile', payload);
        if (rpcErr) {
          const msg = String(rpcErr.message || '').toLowerCase();
          const blocksName = msg.includes('can only be updated to default') && msg.includes('name');
          if (blocksName && payload.p_name !== null) {
            // Retry without name if DB forbids updating it
            const { p_name, ...withoutName } = payload;
            const retry = await supabase.rpc('app_update_user_profile', { ...withoutName, p_name: null });
            if (retry.error) {
              setProfileError((currentLanguage === 'ar' ? 'فشل تحديث الملف عبر RPC: ' : 'Échec de mise à jour via RPC: ') + (retry.error.message || ''));
              return;
            }
          } else {
            setProfileError((currentLanguage === 'ar' ? 'فشل تحديث الملف عبر RPC: ' : 'Échec de mise à jour via RPC: ') + (rpcErr.message || ''));
            if (msg.includes('function app_update_user_profile')) {
              setProfileError(currentLanguage === 'ar'
                ? 'الوظيفة app_update_user_profile غير موجودة. يجب إنشاؤها في Supabase.'
                : 'La fonction app_update_user_profile est absente. Créez-la dans Supabase.');
            }
            return;
          }
        }
      }

      if (profileForm.newPassword) {
        const { data: sessionRes2 } = await supabase.auth.getSession();
        const hasAuthSession2 = !!sessionRes2?.session;
        if (hasAuthSession2) {
          const { error: pwErr } = await supabase.auth.updateUser({ password: profileForm.newPassword });
          if (pwErr) throw pwErr;
        } else {
          const { error: cpErr } = await supabase.rpc('app_change_password', {
            p_email: profileForm.email || myProfile?.email || user.email,
            p_current_password: profileForm.currentPassword,
            p_new_password: profileForm.newPassword,
          });
          if (cpErr) {
            setProfileError((currentLanguage === 'ar' ? 'فشل تغيير كلمة المرور عبر RPC: ' : 'Échec du changement de mot de passe via RPC: ') + (cpErr.message || ''));
            return;
          }
        }
      }

      // Local state updates after successful persistence
      if (avatarUrl && avatarUrl !== myProfile?.avatar_url) {
        setMyProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : prev);
        updateUser({ avatarUrl });
      }
      if (nameChanged || firstChanged || lastChanged) {
        setMyProfile(prev => prev ? {
          ...prev,
          name: nameChanged ? profileForm.name : prev.name,
          first_name: firstChanged ? profileForm.firstName : prev.first_name,
          last_name: lastChanged ? profileForm.lastName : prev.last_name,
        } : prev);
      }

      setProfileSuccess(currentLanguage === 'ar' ? 'تم تحديث الملف الشخصي بنجاح' : 'Profil mis à jour avec succès');
      setProfileForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      setProfileImageFile(null);

      const { data } = await supabase
        .from('users')
        .select('id, email, name, first_name, last_name, role, status, created_at, avatar_url')
        .eq('id', user.id)
        .maybeSingle();
      if (data) setMyProfile(data);

    } catch (e: any) {
      setProfileError((currentLanguage === 'ar' ? 'خطأ غير متوقع: ' : 'Erreur inattendue: ') + (e?.message || (currentLanguage === 'ar' ? 'فشل في تحديث الملف الشخصي' : 'Échec de mise à jour du profil')));
    } finally {
      setEditingProfile(false);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="w-5 h-5 text-blue-600" />
          <span>{currentLanguage === 'ar' ? 'الملف الشخصي' : 'Profil Personnel'}</span>
        </CardTitle>
        <CardDescription>
          {currentLanguage === 'ar' ? 'إدارة معلوماتك الشخصية وإعدادات الحساب' : 'Gérez vos informations personnelles et paramètres de compte'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loadingProfile ? (
          <div className="text-center py-8">
            <div className="text-sm text-slate-500">{currentLanguage === 'ar' ? 'جار التحميل...' : 'Chargement...'}</div>
          </div>
        ) : myProfile ? (
          <div className="space-y-6">
            <div className="flex items-center space-x-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={myProfile.avatar_url || '/placeholder.svg'} />
                  <AvatarFallback className="text-2xl">{(myProfile.name || myProfile.email).charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <label className="absolute -bottom-2 -right-2 p-2 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setProfileImageFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {myProfile.name || [myProfile.first_name, myProfile.last_name].filter(Boolean).join(' ') || myProfile.email}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">{myProfile.email}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge variant="default" className="bg-blue-100 text-blue-800">
                    {myProfile.role}
                  </Badge>
                  <Badge variant={myProfile.status === 'active' ? 'default' : 'secondary'}>
                    {myProfile.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {currentLanguage === 'ar' ? 'الاسم الكامل' : 'Nom complet'}
                </label>
                <Input
                  value={profileForm.name}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={currentLanguage === 'ar' ? 'أدخل الاسم الكامل' : 'Entrez le nom complet'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {currentLanguage === 'ar' ? 'الاسم الأول' : 'Prénom'}
                </label>
                <Input
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder={currentLanguage === 'ar' ? 'أدخل الاسم الأول' : 'Entrez le prénom'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {currentLanguage === 'ar' ? 'اسم العائلة' : 'Nom de famille'}
                </label>
                <Input
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder={currentLanguage === 'ar' ? 'أدخل اسم العائلة' : 'Entrez le nom de famille'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {currentLanguage === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <Input
                  value={profileForm.email}
                  disabled
                  className="bg-slate-100 dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
                <Lock className="w-5 h-5" />
                <span>{currentLanguage === 'ar' ? 'تغيير كلمة المرور' : 'Changer le mot de passe'}</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {currentLanguage === 'ar' ? 'كلمة المرور الحالية' : 'Mot de passe actuel'}
                  </label>
                  <Input
                    type="password"
                    value={profileForm.currentPassword}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder={currentLanguage === 'ar' ? 'أدخل كلمة المرور الحالية' : 'Entrez le mot de passe actuel'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {currentLanguage === 'ar' ? 'كلمة المرور الجديدة' : 'Nouveau mot de passe'}
                  </label>
                  <Input
                    type="password"
                    value={profileForm.newPassword}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder={currentLanguage === 'ar' ? 'أدخل كلمة المرور الجديدة' : 'Entrez le nouveau mot de passe'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {currentLanguage === 'ar' ? 'تأكيد كلمة المرور' : 'Confirmer le mot de passe'}
                  </label>
                  <Input
                    type="password"
                    value={profileForm.confirmPassword}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder={currentLanguage === 'ar' ? 'أعد إدخال كلمة المرور' : 'Répétez le mot de passe'}
                  />
                </div>
              </div>
            </div>

            {profileError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{profileError}</p>
              </div>
            )}
            {profileSuccess && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">{profileSuccess}</p>
              </div>
            )}
            {profileImageFile && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-600">
                  {currentLanguage === 'ar' ? 'صورة جديدة محددة:' : 'Nouvelle image sélectionnée:'} {profileImageFile.name}
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                onClick={handleProfileUpdate}
                disabled={editingProfile}
                className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>
                  {editingProfile 
                    ? (currentLanguage === 'ar' ? 'جار الحفظ...' : 'Enregistrement...') 
                    : (currentLanguage === 'ar' ? 'حفظ التغييرات' : 'Enregistrer les modifications')
                  }
                </span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-sm text-slate-500">{currentLanguage === 'ar' ? 'لا توجد بيانات ملف شخصي' : 'Aucune donnée de profil'}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileTab;
