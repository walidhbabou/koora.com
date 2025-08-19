import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';

import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { currentLanguage, isRTL, direction } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Utilisateurs de démonstration
  const demoUsers = [
    { email: 'admin@koora.com', password: 'admin123', role: 'admin', name: 'John Doe' },
    { email: 'editor@koora.com', password: 'editor123', role: 'editor', name: 'Jane Smith' },
    { email: 'author@koora.com', password: 'author123', role: 'author', name: 'Ahmed Hassan' },
    { email: 'moderator@koora.com', password: 'moderator123', role: 'moderator', name: 'Sarah Wilson' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simuler une authentification
      const user = demoUsers.find(u => u.email === email && u.password === password);
      
      if (user) {
        await login({
          id: Math.random().toString(),
          name: user.name,
          email: user.email,
          role: user.role as any,
          status: 'active',
          joinDate: '2023-01-01',
          lastLogin: new Date().toISOString().split('T')[0],
          avatar: '/placeholder.svg'
        });
        // Redirection selon le rôle
        switch (user.role) {
          case 'admin':
            navigate('/admin', { replace: true });
            break;
          case 'editor':
            navigate('/editor', { replace: true });
            break;
          case 'author':
            navigate('/author', { replace: true });
            break;
          case 'moderator':
            navigate('/moderator', { replace: true });
            break;
          default:
            navigate('/dashboard', { replace: true });
        }
      } else {
        setError(currentLanguage === 'ar' ? 'بيانات الدخول غير صحيحة' : 'Identifiants incorrects');
      }
    } catch (err) {
      setError(currentLanguage === 'ar' ? 'خطأ في تسجيل الدخول' : 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (user: typeof demoUsers[0]) => {
    setEmail(user.email);
    setPassword(user.password);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4 ${isRTL ? 'rtl' : 'ltr'}`} dir={direction}>
      <div className="w-full max-w-md space-y-6">
        {/* Logo et titre */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {currentLanguage === 'ar' ? 'تسجيل الدخول' : 'Connexion'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            {currentLanguage === 'ar' ? 'ادخل إلى لوحة التحكم' : 'Accédez à votre dashboard'}
          </p>
        </div>

        {/* Formulaire de connexion */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {currentLanguage === 'ar' ? 'تسجيل الدخول' : 'Se connecter'}
            </CardTitle>
            <CardDescription className="text-center">
              {currentLanguage === 'ar' ? 'أدخل بياناتك للوصول إلى حسابك' : 'Entrez vos identifiants pour accéder à votre compte'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  currentLanguage === 'ar' ? 'جاري تسجيل الدخول...' : 'Connexion en cours...'
                ) : (
                  currentLanguage === 'ar' ? 'تسجيل الدخول' : 'Se connecter'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Comptes de démonstration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              {currentLanguage === 'ar' ? 'حسابات تجريبية' : 'Comptes de démonstration'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {demoUsers.map((user) => (
                <Button
                  key={user.role}
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin(user)}
                  className="text-xs"
                >
                  {user.role === 'admin' ? (currentLanguage === 'ar' ? 'مدير' : 'Admin') :
                   user.role === 'editor' ? (currentLanguage === 'ar' ? 'محرر' : 'Editor') :
                   user.role === 'author' ? (currentLanguage === 'ar' ? 'كاتب' : 'Author') :
                   currentLanguage === 'ar' ? 'مشرف' : 'Moderator'}
                </Button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              {currentLanguage === 'ar' ? 'انقر لملء البيانات تلقائياً' : 'Cliquez pour remplir automatiquement'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
