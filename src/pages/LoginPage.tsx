import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
// Inline alerts replaced by toasts
import { Eye, EyeOff, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
// No supabase direct calls here; we use custom table-based auth via AuthContext

import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const LoginPage: React.FC = () => {
  const { loginWithEmail, signUp, resetPassword, user, register } = useAuth();
  const navigate = useNavigate();
  const { currentLanguage, isRTL, direction } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Basic validations
        if (!email.trim()) {
          const m = currentLanguage === 'ar' ? 'البريد الإلكتروني مطلوب' : "L'email est requis";
          setError(m); toast({ variant: 'destructive', description: m }); setIsLoading(false); return;
        }
        if (!password) {
          const m = currentLanguage === 'ar' ? 'كلمة المرور مطلوبة' : 'Mot de passe requis';
          setError(m); toast({ variant: 'destructive', description: m }); setIsLoading(false); return;
        }
        if (password.length < 6) {
          const m = currentLanguage === 'ar' ? 'الحد الأدنى لطول كلمة المرور هو 6' : 'Mot de passe min 6 caractères';
          setError(m); toast({ variant: 'destructive', description: m }); setIsLoading(false); return;
        }
        if (confirmPassword !== password) {
          const m = currentLanguage === 'ar' ? 'تأكيد كلمة المرور غير مطابق' : 'La confirmation du mot de passe ne correspond pas';
          setError(m); toast({ variant: 'destructive', description: m }); setIsLoading(false); return;
        }

        // Prefer sending first/last directly to backend RPC via register()
        const res = await register(
          email.trim(),
          password,
          firstName?.trim() || undefined,
          lastName?.trim() || undefined,
          'user'
        );
        if (res && 'error' in res && res.error) {
          let msg = res.error || (currentLanguage === 'ar' ? 'فشل التسجيل' : "Échec de l'inscription");
          const m = (msg || '').toLowerCase();
          if (m.includes('gen_salt') || m.includes('crypt')) {
            msg = currentLanguage === 'ar'
              ? 'يجب تفعيل pgcrypto في قاعدة البيانات: نفّذ create extension if not exists pgcrypto; ثم أعد المحاولة'
              : "Activez l'extension pgcrypto dans Supabase: exécutez create extension if not exists pgcrypto; puis réessayez";
          }
          setError(msg);
          toast({ variant: 'destructive', description: msg });
          return;
        }
        if (res.needsEmailConfirm) {
          const msg = currentLanguage === 'ar' ? 'تحقق من بريدك لتأكيد الحساب' : 'Vérifiez votre email pour confirmer votre compte';
          setInfo(msg);
          toast({ description: msg });
        } else {
          const msg = currentLanguage === 'ar' ? 'تم إنشاء الحساب وتسجيل الدخول' : 'Compte créé et connecté';
          setInfo(msg);
          toast({ description: msg });
        }
      } else {
        // Authentification via nos RPCs dans AuthContext
        const res = await loginWithEmail(email, password);
        if (!res.ok) {
          const fallback = currentLanguage === 'ar' ? 'تعذر تسجيل الدخول' : 'Connexion impossible';
          const msg = res.message || fallback;
          setError(msg);
          toast({ variant: 'destructive', description: msg });
          return;
        }

        // Redirection selon le rôle déjà chargé dans le contexte/localStorage
        const u = user || (() => {
          try { return JSON.parse(localStorage.getItem('koora_user') || 'null'); } catch { return null; }
        })();
        const role = u?.role as 'admin'|'editor'|'author'|'moderator'|'user'|undefined;
        if (role === 'admin') navigate('/admin', { replace: true });
        else if (role === 'editor') navigate('/editor', { replace: true });
        else if (role === 'author') navigate('/author', { replace: true });
        else if (role === 'moderator') navigate('/moderator', { replace: true });
        else if (role === 'user') navigate('/news', { replace: true });
        else navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      const msg = currentLanguage === 'ar' ? 'حدث خطأ' : 'Une erreur est survenue';
      setError(msg);
      toast({ variant: 'destructive', description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  // Aucun compte de démonstration: suppression du pré-remplissage

  const handleForgotPassword = async () => {
    setError('');
    setInfo('');
    if (!email) {
      const msg = currentLanguage === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Entrez votre email';
      setError(msg);
      toast({ variant: 'destructive', description: msg });
      return;
    }
    setIsLoading(true);
    const ok = await resetPassword(email);
    setIsLoading(false);
    if (ok) {
      const msg = currentLanguage === 'ar' ? 'تم إرسال رسالة إعادة التعيين' : 'Email de réinitialisation envoyé';
      setInfo(msg);
      toast({ description: msg });
    } else {
      const msg = currentLanguage === 'ar' ? 'تعذر إرسال البريد' : "Impossible d'envoyer l'email";
      setError(msg);
      toast({ variant: 'destructive', description: msg });
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-0 ${isRTL ? 'rtl' : 'ltr'}`} dir={direction}>
      <div className="w-full max-w-xl">
        {/* Brand header */}
        <div className="relative bg-gradient-to-br from-sport-green to-emerald-600 text-white px-6 py-8">
          <div className="flex items-center justify-center gap-3">
            <img src="/black koora.png" alt="Koora" className="w-12 h-12 rounded-md bg-white/95 p-1" />
            <div>
              <h1 className="text-2xl font-extrabold tracking-wide">Koora</h1>
              <p className="text-xs/5 opacity-95">
                {currentLanguage === 'ar' ? 'سجّل الدخول لمتابعة آخر أخبار كرة القدم' : 'Connectez-vous pour suivre toute l’actualité du football'}
              </p>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.2),transparent_40%),radial-gradient(circle_at_80%_0,rgba(255,255,255,0.15),transparent_30%)]" />
        </div>

        {/* Formulaire de connexion */}
        <Card className="mx-4 -mt-6 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-center">
              {currentLanguage === 'ar' ? 'تسجيل الدخول' : 'Se connecter'}
            </CardTitle>
            <CardDescription className="text-center">
              {currentLanguage === 'ar' ? 'أدخل بياناتك للوصول إلى موقع كرة القدم' : 'Entrez vos identifiants pour accéder au site de football'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">
                        {currentLanguage === 'ar' ? 'الاسم الشخصي' : 'Prénom'}
                      </Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder={currentLanguage === 'ar' ? 'أدخل اسمك الشخصي' : 'Entrez votre prénom'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">
                        {currentLanguage === 'ar' ? 'اللقب' : 'Nom de famille'}
                      </Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder={currentLanguage === 'ar' ? 'أدخل لقبك' : 'Entrez votre nom de famille'}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      {currentLanguage === 'ar' ? 'الاسم الكامل (اختياري)' : 'Nom complet (optionnel)'}
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={currentLanguage === 'ar' ? 'إن لم تُدخل الاسم واللقب' : "Si vous n'indiquez pas prénom/nom"}
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">
                  {currentLanguage === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={currentLanguage === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Entrez votre email'}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  {currentLanguage === 'ar' ? 'كلمة المرور' : 'Mot de passe'}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={currentLanguage === 'ar' ? 'أدخل كلمة المرور' : 'Entrez votre mot de passe'}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} h-full px-3 py-2 hover:bg-transparent`}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-500" />
                    )}
                  </Button>
                </div>
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    {currentLanguage === 'ar' ? 'تأكيد كلمة المرور' : 'Confirmer le mot de passe'}
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={currentLanguage === 'ar' ? 'أعد إدخال كلمة المرور' : 'Retapez votre mot de passe'}
                    required
                  />
                </div>
              )}

              {/* Toasts will display feedback; no inline alerts */}

              <Button
                type="submit"
                className="w-full bg-sport-green hover:bg-emerald-700"
                disabled={isLoading}
              >
                {isLoading
                  ? (isSignUp
                      ? (currentLanguage === 'ar' ? 'جاري إنشاء الحساب...' : 'Création du compte...')
                      : (currentLanguage === 'ar' ? 'جاري تسجيل الدخول...' : 'Connexion en cours...'))
                  : (isSignUp
                      ? (currentLanguage === 'ar' ? 'إنشاء حساب' : 'Créer un compte')
                      : (currentLanguage === 'ar' ? 'تسجيل الدخول' : 'Se connecter'))}
              </Button>

              {!isSignUp && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className={`mt-2 text-sm flex items-center gap-2 ${isRTL ? 'justify-start' : 'justify-end'} text-emerald-600`}
                >
                  <Mail className="w-4 h-4" />
                  {currentLanguage === 'ar' ? 'هل نسيت كلمة المرور؟' : 'Mot de passe oublié ?'}
                </button>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Section démo supprimée */}

        {/* Toggle Sign In / Sign Up */}
        <div className="text-center text-sm text-slate-600 dark:text-slate-400">
          {isSignUp ? (
            <>
              {currentLanguage === 'ar' ? 'لديك حساب بالفعل؟' : 'Vous avez déjà un compte ?'}{' '}
              <button className="text-emerald-600 font-semibold" onClick={() => setIsSignUp(false)}>
                {currentLanguage === 'ar' ? 'تسجيل الدخول' : 'Se connecter'}
              </button>
            </>
          ) : (
            <>
              {currentLanguage === 'ar' ? 'مستخدم جديد؟' : 'Nouveau sur Koora ?'}{' '}
              <button className="text-emerald-600 font-semibold" onClick={() => setIsSignUp(true)}>
                {currentLanguage === 'ar' ? 'إنشاء حساب' : 'Créer un compte'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
