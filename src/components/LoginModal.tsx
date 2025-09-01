import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithEmail, logout, isAuthenticated, user } = useAuth();
  const { currentLanguage, isRTL, direction } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await loginWithEmail(email, password);
      if (success) {
        onClose();
        setEmail('');
        setPassword('');
      } else {
        setError('Email ou mot de passe incorrect');
      }
    } catch (error) {
      setError('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-xl border-0 shadow-2xl" dir={direction}>
        {/* Header */}
        <div className="relative bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-800 px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
              <img src="/black koora.png" alt="Koora" className="w-10 h-10 rounded-md bg-white p-1 shadow" />
              <h3 className="text-base sm:text-lg font-bold tracking-wide text-slate-800 dark:text-white">{currentLanguage === 'ar' ? 'تسجيل الدخول' : 'Connexion'}</h3>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,0,0,0.05),transparent_40%),radial-gradient(circle_at_80%_0,rgba(0,0,0,0.04),transparent_30%)]" />
        </div>

        <div className="px-4 sm:px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Feature list */}
            <div className="hidden md:block">
              <div className="space-y-4">
                {[0,1,2].map((i) => (
                  <div key={i} className="rounded-xl border bg-white/90 dark:bg-slate-900/60 p-4 shadow-sm">
                    <div className={`flex items-start ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                      <div className="shrink-0 w-10 h-10 rounded-lg bg-black flex items-center justify-center">
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {currentLanguage === 'ar'
                          ? (i === 0
                              ? 'قم بالتسجيل للحصول على أفضل تجربة في Koora'
                              : i === 1
                                ? 'التسجيل مجاني وجميعك جزء من مجتمع Koora'
                                : 'افتح التحليلات حول اللاعبين والفرق التي تهمك')
                          : (i === 0
                              ? "Inscrivez-vous pour une meilleure expérience sur Koora"
                              : i === 1
                                ? "Inscription gratuite, rejoignez la communauté Koora"
                                : "Accédez aux analyses sur vos joueurs et équipes préférés")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Login form */}
            <div>
              {!isAuthenticated ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {currentLanguage === 'ar' ? 'إيميلك الإلكتروني' : 'Email'}
                    </label>
                    <div className="relative">
                      <Mail className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={currentLanguage === 'ar' ? 'إيميلك الإلكتروني' : 'votre@email.com'}
                        className={`${isRTL ? 'pr-10' : 'pl-10'} focus-visible:ring-sport-green/40`}
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {currentLanguage === 'ar' ? 'كلمة السر الخاصة بك' : 'Mot de passe'}
                    </label>
                    <div className="relative">
                      <Lock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={currentLanguage === 'ar' ? 'كلمة السر الخاصة بك' : 'Votre mot de passe'}
                        className={`${isRTL ? 'pr-10' : 'pl-10'} ${isRTL ? 'pl-10' : 'pr-10'} focus-visible:ring-sport-green/40`}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={`absolute top-0 h-full px-3 py-2 hover:bg-transparent ${isRTL ? 'left-0' : 'right-0'}`}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-slate-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-slate-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="w-full bg-sport-green hover:bg-emerald-700"
                    disabled={isLoading}
                  >
                    {currentLanguage === 'ar' ? 'تسجيل الدخول' : 'Se connecter'}
                  </Button>

                  {/* Helper text */}
                  <div className={`text-xs ${isRTL ? 'text-right' : 'text-left'} text-slate-600 dark:text-slate-400`}>
                    {currentLanguage === 'ar' ? 'نسيت كلمة السر؟ إعادة الضبط هنا' : 'Mot de passe oublié ? Réinitialiser ici'}
                  </div>

                  {/* Social buttons */}
                  <div className="pt-2">
                    <p className="text-center text-sm text-slate-500 mb-2">
                      {currentLanguage === 'ar' ? 'طرق أخرى لتسجيل الدخول' : 'Autres méthodes de connexion'}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <Button type="button" variant="outline" className="justify-center"> Apple</Button>
                      <Button type="button" variant="outline" className="justify-center">G Google</Button>
                    </div>
                  </div>

                  {/* Sign up prompt */}
                  <div className="text-center text-sm">
                    {currentLanguage === 'ar' ? 'لست مستخدمًا؟ سجل هنا' : "Pas de compte ? S'inscrire"}
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-3">
                      <User className="w-8 h-8 text-sport-green" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {currentLanguage === 'ar' ? 'متصل كـ' : 'Connecté en tant que'}
                    </h3>
                    <p className="text-teal-600 font-medium">{user?.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {currentLanguage === 'ar' ? 'الدور: ' : 'Rôle: '}{user?.role}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="w-full"
                    >
                      {currentLanguage === 'ar' ? 'تسجيل الخروج' : 'Se déconnecter'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
