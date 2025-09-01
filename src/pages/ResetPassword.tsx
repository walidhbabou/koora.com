import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { currentLanguage, isRTL, direction } = useTranslation();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ready, setReady] = useState(false);

  // When arriving from the email link, Supabase sets a recovery session in the URL.
  // We just need to render the form and call updateUser with the new password.
  useEffect(() => {
    // Try to recover a session automatically (in case hash params present)
    const init = async () => {
      try {
        // getSession will create session if hash is present (v2 handles internally)
        const { data, error } = await supabase.auth.getSession();
        if (error) console.warn('Supabase getSession warning:', error.message);
        // We can proceed even if session is null; updateUser requires a valid recovery session.
        setReady(true);
      } catch (e) {
        setReady(true);
      }
    };
    init();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!password || password.length < 6) {
      setError(currentLanguage === 'ar' ? 'يجب أن تكون كلمة المرور 6 أحرف على الأقل' : 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (password !== confirm) {
      setError(currentLanguage === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsLoading(false);

    if (error) {
      setError(currentLanguage === 'ar' ? 'تعذر تحديث كلمة المرور' : 'Impossible de mettre à jour le mot de passe');
      return;
    }

    setInfo(currentLanguage === 'ar' ? 'تم تحديث كلمة المرور بنجاح' : 'Mot de passe mis à jour avec succès');
    // Short delay then navigate to login
    setTimeout(() => navigate('/login', { replace: true }), 1200);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4 ${isRTL ? 'rtl' : 'ltr'}`} dir={direction}>
      <div className="w-full max-w-md space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {currentLanguage === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Réinitialiser le mot de passe'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ready ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">{currentLanguage === 'ar' ? 'كلمة المرور الجديدة' : 'Nouveau mot de passe'}</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">{currentLanguage === 'ar' ? 'تأكيد كلمة المرور' : 'Confirmer le mot de passe'}</Label>
                  <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {info && (
                  <Alert>
                    <AlertDescription>{info}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={isLoading}>
                  {isLoading
                    ? (currentLanguage === 'ar' ? 'جاري التحديث...' : 'Mise à jour...')
                    : (currentLanguage === 'ar' ? 'تحديث كلمة المرور' : 'Mettre à jour le mot de passe')}
                </Button>
              </form>
            ) : (
              <p className="text-center text-slate-600 dark:text-slate-400">
                {currentLanguage === 'ar' ? 'جاري التحميل...' : 'Chargement...'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
