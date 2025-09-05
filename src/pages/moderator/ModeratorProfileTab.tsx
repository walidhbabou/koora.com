import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, User, Save, Camera } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const ModeratorProfileTab: React.FC = () => {
  const { currentLanguage, isRTL } = useLanguage();
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
  const [avatarUploading, setAvatarUploading] = useState(false);
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
            first_name: (user as any).firstName ?? null,
            last_name: (user as any).lastName ?? null,
            role: (user as any).role ?? 'moderator',
            status: (user as any).status ?? 'active',
            avatar_url: null as string | null,
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
        setAvatarUploading(true);
        const ext = profileImageFile.name.split('.').pop();
        const bucketName = (import.meta as any).env?.VITE_SUPABASE_AVATAR_BUCKET || 'avatars';
        const timestamp = Date.now();
        const filePath = `users/${user.id}/avatar_${timestamp}.${ext}`;
        const { error: upErr } = await supabase
          .storage
          .from(bucketName)
          .upload(filePath, profileImageFile, { upsert: true, cacheControl: '3600' });
        setAvatarUploading(false);
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

      const onlyAvatarChanged = !!profileImageFile && !nameChanged && !firstChanged && !lastChanged && !profileForm.newPassword;

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Personal Info Editable */}
      <Card className="hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-white to-orange-50 dark:from-slate-800 dark:to-orange-900/20 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5 text-orange-600" />
            <span>{currentLanguage === 'ar' ? 'المعلومات الشخصية' : 'Informations personnelles'}</span>
          </CardTitle>
          <CardDescription>{currentLanguage === 'ar' ? 'قم بتحديث معلوماتك' : 'Mettez à jour vos informations'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'} mb-4`}>
            <div className="relative">
              <Avatar className="w-20 h-20 ring-2 ring-orange-200">
                <AvatarImage src={(myProfile?.avatar_url as string) || (user as any)?.avatar_url || undefined} onError={(e)=>{(e.target as HTMLImageElement).style.display='none';}} />
                <AvatarFallback>{(myProfile?.name || user?.name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <label htmlFor="avatarUpload" className="absolute bottom-0 right-0 bg-orange-600 hover:bg-orange-700 text-white text-xs px-2 py-1 rounded cursor-pointer flex items-center space-x-1">
                <Camera className="w-3 h-3" />
                <span>{avatarUploading ? (currentLanguage === 'ar' ? 'جارٍ…' : 'Charg…') : (currentLanguage === 'ar' ? 'تغيير' : 'Changer')}</span>
              </label>
              <input id="avatarUpload" type="file" accept="image/*" className="hidden" onChange={(e)=>{ const f=e.target.files?.[0]; if (f) setProfileImageFile(f); e.currentTarget.value=''; }} />
            </div>
            <div>
              <div className="font-bold text-lg">{myProfile?.name || user?.name || '—'}</div>
              <div className="text-sm text-slate-500">{myProfile?.email || user?.email || '—'}</div>
              <Badge variant="outline" className="mt-1">{myProfile?.role || (user as any)?.role || 'moderator'}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="firstName">{currentLanguage === 'ar' ? 'الاسم' : 'Prénom'}</Label>
              <Input id="firstName" value={profileForm.firstName} onChange={(e)=>setProfileForm(prev => ({ ...prev, firstName: e.target.value }))} placeholder={currentLanguage === 'ar' ? 'أدخل الاسم' : 'Entrez le prénom'} />
            </div>
            <div>
              <Label htmlFor="lastName">{currentLanguage === 'ar' ? 'اللقب' : 'Nom'}</Label>
              <Input id="lastName" value={profileForm.lastName} onChange={(e)=>setProfileForm(prev => ({ ...prev, lastName: e.target.value }))} placeholder={currentLanguage === 'ar' ? 'أدخل اللقب' : 'Entrez le nom'} />
            </div>
            <div>
              <Label htmlFor="displayName">{currentLanguage === 'ar' ? 'الاسم المعروض' : 'Nom affiché'}</Label>
              <Input id="displayName" value={profileForm.name} onChange={(e)=>setProfileForm(prev => ({ ...prev, name: e.target.value }))} placeholder={currentLanguage === 'ar' ? 'أدخل الاسم المعروض' : 'Entrez le nom affiché'} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profileForm.email} disabled className="bg-slate-100 dark:bg-slate-800" />
            </div>
            <div className={`${isRTL ? 'flex-row-reverse' : ''} flex justify-end`}>
              <Button onClick={handleProfileUpdate} disabled={editingProfile} className="bg-orange-600 hover:bg-orange-700 text-white flex items-center space-x-2">
                <Save className="w-4 h-4" />
                <span>
                  {editingProfile ? (currentLanguage === 'ar' ? 'جارٍ الحفظ…' : 'Enregistrement…') : (currentLanguage === 'ar' ? 'حفظ التغييرات' : 'Enregistrer les modifications')}
                </span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card className="hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-white to-red-50 dark:from-slate-800 dark:to-red-900/20 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-red-600" />
            <span>{currentLanguage === 'ar' ? 'تغيير كلمة المرور' : 'Changer le mot de passe'}</span>
          </CardTitle>
          <CardDescription>{currentLanguage === 'ar' ? 'قم بتحديث كلمة مرور حسابك' : 'Mettez à jour le mot de passe de votre compte'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="currentPassword">{currentLanguage === 'ar' ? 'كلمة المرور الحالية (للتحقق)' : 'Mot de passe actuel (pour vérification)'}</Label>
              <Input id="currentPassword" type="password" value={profileForm.currentPassword} onChange={(e)=>setProfileForm(prev => ({ ...prev, currentPassword: e.target.value }))} placeholder={currentLanguage === 'ar' ? '••••••••' : '••••••••'} />
              <p className="text-xs text-slate-500 mt-1">
                {currentLanguage === 'ar'
                  ? 'ملاحظة: تُستخدم كلمة المرور الحالية عند عدم توفر جلسة دخول لحفظ التغييرات بأمان عبر RPC.'
                  : 'Remarque: le mot de passe actuel est utilisé quand la session est absente pour sécuriser la sauvegarde via RPC.'}
              </p>
            </div>
            <div>
              <Label htmlFor="newPassword">{currentLanguage === 'ar' ? 'كلمة المرور الجديدة' : 'Nouveau mot de passe'}</Label>
              <Input id="newPassword" type="password" value={profileForm.newPassword} onChange={(e)=>setProfileForm(prev => ({ ...prev, newPassword: e.target.value }))} placeholder={currentLanguage === 'ar' ? '••••••••' : '••••••••'} />
            </div>
            <div>
              <Label htmlFor="confirmPassword">{currentLanguage === 'ar' ? 'تأكيد كلمة المرور' : 'Confirmer le mot de passe'}</Label>
              <Input id="confirmPassword" type="password" value={profileForm.confirmPassword} onChange={(e)=>setProfileForm(prev => ({ ...prev, confirmPassword: e.target.value }))} placeholder={currentLanguage === 'ar' ? '••••••••' : '••••••••'} />
            </div>
            <div className={`${isRTL ? 'flex-row-reverse' : ''} flex justify-end`}>
              <Button onClick={handleProfileUpdate} disabled={editingProfile} className="bg-red-600 hover:bg-red-700 text-white">
                {editingProfile ? (currentLanguage === 'ar' ? 'جارٍ التغيير…' : 'Modification…') : (currentLanguage === 'ar' ? 'تحديث كلمة المرور' : 'Mettre à jour le mot de passe')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {(profileError || profileSuccess || profileImageFile) && (
        <div className="lg:col-span-2 space-y-3">
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
        </div>
      )}
    </div>
  );
};

export default ModeratorProfileTab;
