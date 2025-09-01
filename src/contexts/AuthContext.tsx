import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';

// Roles supported across the app
export type UserRole = 'admin' | 'editor' | 'author' | 'moderator' | 'user';

export interface AppUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'banned';
}

interface AuthContextValue {
  user: AppUser | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  roleLoaded: boolean;

  // role helpers
  isAdmin: boolean;
  isEditor: boolean;
  isAuthor: boolean;
  isModerator: boolean;

  // actions
  login: (email: string, password: string) => Promise<{ error?: string } | void>;
  register: (email: string, password: string, firstName?: string, lastName?: string, role?: UserRole) => Promise<{ error?: string } | void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateUser: (patch: Partial<AppUser>) => void;

  // compatibility wrappers expected by LoginPage
  loginWithEmail: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ ok: boolean; needsEmailConfirm?: boolean; message?: string }>;
  resetPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [roleLoaded, setRoleLoaded] = useState(false);

  const fetchProfile = useCallback(async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role,name')
        .eq('id', uid)
        .single();

      if (error) {
        // If no row or error, keep role undefined
        setUser(prev => prev ? { ...prev } : prev);
        setRoleLoaded(true);
        return;
      }

      setUser(prev => prev ? { ...prev, role: data?.role as UserRole | undefined, name: data?.name ?? prev.name } : prev);
      setRoleLoaded(true);
    } catch {
      setRoleLoaded(true);
    }
  }, []);

  const init = useCallback(async () => {
    setIsAuthLoading(true);
    setRoleLoaded(false);
    
    // Try to load user from localStorage first
    const storedUser = localStorage.getItem('koora_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && typeof parsedUser === 'object' && parsedUser.id && parsedUser.email && parsedUser.role && parsedUser.status) {
          setUser(parsedUser as AppUser);
          setRoleLoaded(true);
          setIsAuthLoading(false);
          return;
        }
      } catch (e) {
        localStorage.removeItem('koora_user');
      }
    }

    // If no stored user, set to null
    setUser(null);
    setRoleLoaded(true);
    setIsAuthLoading(false);
  }, []);

  useEffect(() => {
    // Initial load
    init();
  }, [init]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsAuthLoading(true);
      setRoleLoaded(false);

      // Pour le débogage : essayons d'abord sans hash
      console.log('🔍 Tentative de connexion pour:', email);

      const { data, error } = await supabase.rpc('login_user', {
        p_email: email,
        p_password: password, // Mot de passe en clair pour la version simplifiée
      });

      console.log('📊 Réponse RPC:', { data, error });

      if (error) {
        console.error('❌ Erreur RPC:', error);
        return { error: error.message };
      }

      if (data && data.length > 0) {
        console.log('✅ Utilisateur trouvé:', data[0]);
        const userData = data[0];
        const baseUser: AppUser = {
          id: userData.id,
          email: userData.email,
          firstName: userData.first_name,
          lastName: userData.last_name,
          name: userData.name,
          role: userData.role as UserRole,
          status: userData.status as 'active' | 'inactive' | 'banned',
        };
        setUser(baseUser);
        setRoleLoaded(true);

        // Store user in localStorage for persistence
        localStorage.setItem('koora_user', JSON.stringify(baseUser));
        console.log('💾 Utilisateur sauvegardé dans localStorage');
      } else {
        console.log('⚠️ Aucun utilisateur trouvé');
        return { error: 'Email ou mot de passe incorrect' };
      }
    } catch (e: any) {
      console.error('💥 Erreur lors de la connexion:', e);
      return { error: e?.message ?? 'Erreur de connexion' };
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, firstName?: string, lastName?: string, role: UserRole = 'user') => {
    try {
      const { data, error } = await supabase.rpc('register_user', {
        p_email: email,
        p_password: password,
        p_first_name: firstName,
        p_last_name: lastName,
        p_role: role,
      });

      if (error) {
        return { error: error.message };
      }

      if (data && data.length > 0) {
        const userData = data[0];
        const newUser: AppUser = {
          id: userData.id,
          email: userData.email,
          firstName: userData.first_name,
          lastName: userData.last_name,
          name: userData.name,
          role: userData.role as UserRole,
          status: userData.status as 'active' | 'inactive' | 'banned',
        };
        
        // Auto-login after registration
        setUser(newUser);
        setRoleLoaded(true);
        localStorage.setItem('koora_user', JSON.stringify(newUser));
      } else {
        return { error: 'Registration failed' };
      }
    } catch (e: any) {
      return { error: e?.message ?? 'Registration failed' };
    }
  }, []);

  // --- Compatibility wrappers for LoginPage ---
  const loginWithEmail = useCallback(async (email: string, password: string) => {
    const res = await login(email, password);
    if (res && 'error' in res) {
      return { ok: false, message: res.error };
    }
    return { ok: true };
  }, [login]);

  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    // If a single name is provided, split into first/last naively
    const first = name?.split(' ')[0];
    const last = name && name.includes(' ') ? name.substring(name.indexOf(' ') + 1) : undefined;
    const res = await register(email, password, first, last, 'user');
    if (res && 'error' in res) {
      return { ok: false, message: res.error };
    }
    return { ok: true, needsEmailConfirm: false };
  }, [register]);

  const resetPassword = useCallback(async (_email: string) => {
    // Custom table-based auth: no email reset workflow available here.
    // You can implement your own token email flow later.
    return false;
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setRoleLoaded(true);
    localStorage.removeItem('koora_user');
  }, []);

  const refresh = useCallback(async () => {
    await init();
  }, [init]);

  const updateUser = useCallback((patch: Partial<AppUser>) => {
    setUser(prev => prev ? { ...prev, ...patch } : prev);
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const isAuthenticated = !!user;
    const role = user?.role;
    return {
      user,
      isAuthenticated,
      isAuthLoading,
      roleLoaded,
      isAdmin: role === 'admin',
      isEditor: role === 'editor',
      isAuthor: role === 'author',
      isModerator: role === 'moderator',
      login,
      register,
      logout,
      refresh,
      updateUser,
      // wrappers for LoginPage compatibility
      loginWithEmail,
      signUp,
      resetPassword,
    };
  }, [user, isAuthLoading, roleLoaded, login, register, logout, refresh, updateUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
