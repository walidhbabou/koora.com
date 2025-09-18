import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Lock, Camera, Save } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  created_at: string;
  avatar_url: string | null;
}

const AuthorProfileTab: React.FC = () => {
  const { currentLanguage, isRTL } = useLanguage();
  const { user, updateUser } = useAuth();

  const [myProfile, setMyProfile] = useState<UserProfile | null>(null);
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
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            email: data.email || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
        } else {
          // Don't include the generated 'name' field in upsert since it's auto-generated
          const minimal = {
            id: user.id,
            email: user.email,
            first_name: user.firstName ?? null,
            last_name: user.lastName ?? null,
            role: user.role,
            status: user.status,
            avatar_url: user.avatarUrl ?? null,
          };
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
              firstName: inserted.first_name || '',
              lastName: inserted.last_name || '',
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
  }, [user?.id, user?.avatarUrl, user?.email, user?.firstName, user?.lastName, user?.role, user?.status]);

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

      let avatarUrl = myProfile?.avatar_url;

      // Upload new avatar if selected
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

      // Only update first_name, last_name, and avatar_url (name is auto-generated)
      const firstChanged = profileForm.firstName !== (myProfile?.first_name || '');
      const lastChanged = profileForm.lastName !== (myProfile?.last_name || '');
      const avatarChanged = avatarUrl !== myProfile?.avatar_url;

      const updateData: Record<string, string | null> = {};
      if (firstChanged) updateData.first_name = profileForm.firstName;
      if (lastChanged) updateData.last_name = profileForm.lastName;
      if (avatarChanged && avatarUrl) updateData.avatar_url = avatarUrl;

      const { data: sessionRes } = await supabase.auth.getSession();
      const hasAuthSession = !!sessionRes?.session;

      // Always try to update the database if any field changed
      if (Object.keys(updateData).length > 0) {
        if (hasAuthSession) {
          const { error: updateErr } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', user.id);
          if (updateErr) {
            const msgLower = String(updateErr.message || '').toLowerCase();
            const rlsViolation = msgLower.includes('row-level security');
            if (rlsViolation && avatarChanged) {
              // If RLS blocks update but avatar changed, update local state
              setMyProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : prev);
              updateUser({ avatarUrl });
              setProfileSuccess(currentLanguage === 'ar' ? 'تم تحديث الصورة الشخصية محلياً. قد تحتاج إلى صلاحيات إضافية لحفظها في قاعدة البيانات.' : 'Avatar mis à jour localement. Des autorisations supplémentaires peuvent être nécessaires pour le sauvegarder en base.');
            } else {
              setProfileError((currentLanguage === 'ar' ? 'فشل تحديث بيانات المستخدم: ' : "Échec de mise à jour de l'utilisateur: ") + (updateErr.message || ''));
              return;
            }
          } else {
            // Success - update was persisted
            if (avatarChanged && avatarUrl) {
              setMyProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : prev);
              updateUser({ avatarUrl });
            }
          }
        } else {
          // Use RPC for users without auth session
          if (!profileForm.currentPassword) {
            setProfileError(currentLanguage === 'ar' ? 'كلمة المرور الحالية مطلوبة لحفظ التغييرات' : 'Le mot de passe actuel est requis pour sauvegarder');
            return;
          }

          const payload = {
            p_email: profileForm.email || myProfile?.email || user.email,
            p_password: profileForm.currentPassword,
            p_name: null, // Don't update generated name field
            p_first_name: firstChanged ? profileForm.firstName : null,
            p_last_name: lastChanged ? profileForm.lastName : null,
            p_avatar_url: avatarChanged ? avatarUrl : null,
          };
          
          const { error: rpcErr } = await supabase.rpc('app_update_user_profile', payload);
          if (rpcErr) {
            setProfileError((currentLanguage === 'ar' ? 'فشل تحديث الملف عبر RPC: ' : 'Échec de mise à jour via RPC: ') + (rpcErr.message || ''));
            if (String(rpcErr.message || '').includes('function app_update_user_profile')) {
              setProfileError(currentLanguage === 'ar'
                ? 'الوظيفة app_update_user_profile غير موجودة. يجب إنشاؤها في Supabase.'
                : 'La fonction app_update_user_profile est absente. Créez-la dans Supabase.');
            }
            return;
          } else {
            // Success - update was persisted via RPC
            if (avatarChanged && avatarUrl) {
              setMyProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : prev);
              updateUser({ avatarUrl });
            }
          }
        }
      }

      // Handle password change
      if (profileForm.newPassword) {
        const { data: sessionRes2 } = await supabase.auth.getSession();
        const hasAuthSession2 = !!sessionRes2?.session;
        if (hasAuthSession2) {
          const { error: pwErr } = await supabase.auth.updateUser({ password: profileForm.newPassword });
          if (pwErr) {
            setProfileError((currentLanguage === 'ar' ? 'فشل تغيير كلمة المرور: ' : 'Échec du changement de mot de passe: ') + (pwErr.message || ''));
            return;
          }
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

      // Update local state for the name field (auto-generated from first_name + last_name)
      if (firstChanged || lastChanged) {
        setMyProfile(prev => prev ? {
          ...prev,
          first_name: firstChanged ? profileForm.firstName : prev.first_name,
          last_name: lastChanged ? profileForm.lastName : prev.last_name,
          // The name field will be auto-generated by the database
        } : prev);
      }

      setProfileSuccess(currentLanguage === 'ar' ? 'تم تحديث الملف الشخصي بنجاح' : 'Profil mis à jour avec succès');
      setProfileForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      setProfileImageFile(null);

      // Reload profile data to get the updated auto-generated name
      const { data: refreshedData } = await supabase
        .from('users')
        .select('id, email, name, first_name, last_name, role, status, created_at, avatar_url')
        .eq('id', user.id)
        .maybeSingle();
      if (refreshedData) {
        setMyProfile(refreshedData);
        setProfileForm(prev => ({
          ...prev,
          name: refreshedData.name || '',
          firstName: refreshedData.first_name || '',
          lastName: refreshedData.last_name || '',
        }));
      }

    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      setProfileError((currentLanguage === 'ar' ? 'خطأ غير متوقع: ' : 'Erreur inattendue: ') + errorMessage);
    } finally {
      setEditingProfile(false);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
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
            {/* Profile Header */}
            <div className="flex items-center space-x-6 p-6 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-xl">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={myProfile.avatar_url || '/placeholder.svg'} />
                  <AvatarFallback className="text-2xl">{(myProfile.name || myProfile.email).charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <label className="absolute -bottom-2 -right-2 p-2 bg-teal-600 text-white rounded-full cursor-pointer hover:bg-teal-700 transition-colors">
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
                  <Badge variant="default" className="bg-teal-100 text-teal-800">
                    {myProfile.role}
                  </Badge>
                  <Badge variant={myProfile.status === 'active' ? 'default' : 'secondary'}>
                    {myProfile.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {currentLanguage === 'ar' ? 'الاسم الكامل (تلقائي)' : 'Nom complet (automatique)'}
                </label>
                <Input
                  value={profileForm.name}
                  disabled
                  className="bg-slate-100 dark:bg-slate-800"
                  placeholder={currentLanguage === 'ar' ? 'يتم إنشاؤه تلقائياً من الاسم الأول واسم العائلة' : 'Généré automatiquement à partir du prénom et nom'}
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

            {/* Password Change Section */}
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
                    placeholder={currentLanguage === 'ar' ? 'أعد إدخال كلمة المرور' : 'Retapez le mot de passe'}
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

            <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
              <Button onClick={handleProfileUpdate} disabled={editingProfile} className="bg-teal-600 hover:bg-teal-700">
                <Save className={`${isRTL ? 'ml-2' : 'mr-2'} w-4 h-4`} />
                {editingProfile ? (currentLanguage === 'ar' ? 'جار الحفظ...' : 'Enregistrement...') : (currentLanguage === 'ar' ? 'حفظ التغييرات' : 'Enregistrer les modifications')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-500">{currentLanguage === 'ar' ? 'لا توجد بيانات ملف' : 'Aucune donnée de profil'}</div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthorProfileTab;