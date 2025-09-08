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
  avatarUrl?: string;
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
  register: (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
    role?: UserRole
  ) => Promise<{ error?: string; needsEmailConfirm?: boolean } | void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateUser: (patch: Partial<AppUser>) => void;

  // compatibility wrappers expected by LoginPage
  loginWithEmail: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ ok: boolean; needsEmailConfirm?: boolean; message?: string }>;
  resetPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Write 'koora_user' to localStorage defensively to avoid QUOTA_EXCEEDED_ERR
function safelyPersistUserToLocalStorage(user: AppUser) {
  try {
    localStorage.setItem('koora_user', JSON.stringify(user));
  } catch (_e) {
    // Attempt to free space by removing known heavy cache namespaces, then retry once
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith('api-cache:') || key.startsWith('koora_cache_')) {
          try { localStorage.removeItem(key); } catch {}
        }
      }
      // Retry once after cleanup
      try { localStorage.setItem('koora_user', JSON.stringify(user)); } catch {}
    } catch {}
  }
}

function purgeHeavyCachesFromLocalStorage() {
  try {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (
        key.startsWith('api-cache:transfers') ||
        key.startsWith('api-cache:standings') ||
        key.startsWith('api-cache:leagues') ||
        key.startsWith('koora_cache_')
      ) {
        try { localStorage.removeItem(key); } catch {}
      }
    }
  } catch {}
}

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

    // 1) Prefer real Supabase auth session (ensures RLS 'authenticated')
    const { data: sessionRes } = await supabase.auth.getSession();
    const session = sessionRes?.session ?? null;
    if (session?.user) {
      const authUser = session.user;
      // Ensure a users row exists for this auth user
      await supabase
        .from('users')
        .upsert({ id: authUser.id, email: authUser.email }, { onConflict: 'id' });

      // Load profile fields (role, name)
      const { data: prof } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, name, role, status')
        .eq('id', authUser.id)
        .maybeSingle();

      const baseUser: AppUser = {
        id: authUser.id,
        email: prof?.email || authUser.email || '',
        firstName: prof?.first_name ?? undefined,
        lastName: prof?.last_name ?? undefined,
        name: prof?.name ?? authUser.user_metadata?.name,
        role: (prof?.role as any) || 'user',
        status: (prof?.status as any) || 'active',
      };
      setUser(baseUser);
      safelyPersistUserToLocalStorage(baseUser);
      setRoleLoaded(true);
      setIsAuthLoading(false);
      return;
    }

    // 2) Fallback to localStorage (legacy mode)
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

    // No session
    setUser(null);
    setRoleLoaded(true);
    setIsAuthLoading(false);
  }, []);

  useEffect(() => {
    // Initial load
    init();
    // Subscribe to auth state changes to keep session in sync
    const { data: sub } = supabase.auth.onAuthStateChange((_event, _session) => {
      init();
    });
    return () => { sub.subscription.unsubscribe(); };
  }, [init]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsAuthLoading(true);
      setRoleLoaded(false);

      // Primary: real Supabase Auth sign-in (gives 'authenticated' JWT for RLS)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        // Fallback to legacy RPC (if you still support custom auth)
        const { data, error } = await supabase.rpc('login_user', { p_email: email, p_password: password });
        if (error || !data || data.length === 0) {
          return { error: error?.message || signInError.message || 'Email ou mot de passe incorrect' };
        }
        const u = data[0];
        const baseUser: AppUser = {
          id: u.id,
          email: u.email,
          firstName: u.first_name,
          lastName: u.last_name,
          name: u.name,
          role: u.role as UserRole,
          status: u.status as any,
        };
        setUser(baseUser);
        safelyPersistUserToLocalStorage(baseUser);
        purgeHeavyCachesFromLocalStorage();
        setRoleLoaded(true);
        return;
      }

      // Ensure users row exists and load profile
      const authUser = signInData.user!;
      await supabase.from('users').upsert({ id: authUser.id, email: authUser.email }, { onConflict: 'id' });
      const { data: prof } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, name, role, status')
        .eq('id', authUser.id)
        .maybeSingle();
      const baseUser: AppUser = {
        id: authUser.id,
        email: prof?.email || authUser.email || '',
        firstName: prof?.first_name ?? undefined,
        lastName: prof?.last_name ?? undefined,
        name: prof?.name ?? authUser.user_metadata?.name,
        role: (prof?.role as any) || 'user',
        status: (prof?.status as any) || 'active',
      };
      setUser(baseUser);
      safelyPersistUserToLocalStorage(baseUser);
      purgeHeavyCachesFromLocalStorage();
      setRoleLoaded(true);
    } catch (e: any) {
      return { error: e?.message ?? 'Erreur de connexion' };
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, firstName?: string, lastName?: string, role: UserRole = 'user') => {
    try {
      // Custom table-based registration via SECURITY DEFINER RPC
      // UTILISEZ LES NOUVEAUX NOMS DE PARAMÈTRES
      const { data, error } = await supabase.rpc('register_user', {
        p_user_email: email,           // Changé de p_email à p_user_email
        p_user_password: password,     // Changé de p_password à p_user_password
        p_first_name: firstName ?? '',
        p_last_name: lastName ?? '',
        p_user_role: role || 'user',   // Changé de p_role à p_user_role
      });
      if (error) {
        console.error('Registration error:', error);
        return { error: error.message || 'Registration failed' };
      }
      
      // Handle case where function might return empty array
      if (!data || (Array.isArray(data) && data.length === 0)) {
        return { error: 'Registration failed - no user returned' };
      }

      const u = Array.isArray(data) ? data[0] : data;
      const baseUser: AppUser = {
        id: u.id,
        email: u.email,
        firstName: u.first_name || undefined,
        lastName: u.last_name || undefined,
        name: u.name || (([firstName, lastName].filter(Boolean).join(' ')) || undefined),
        role: (u.role as UserRole) || 'user',
        status: (u.status as any) || 'active',
      };
      setUser(baseUser);
      setRoleLoaded(true);
      safelyPersistUserToLocalStorage(baseUser);
      return { success: true };
    } catch (e: any) {
      console.error('Registration exception:', e);
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
    return { ok: true, needsEmailConfirm: false }; // Custom auth doesn't use email confirmation
  }, [register]);

  const resetPassword = useCallback(async (_email: string) => {
    // Custom table-based auth: no email reset workflow available here.
    // You can implement your own token email flow later.
    return false;
  }, []);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      // Purge app-related stored data
      try {
        // Remove known user key and any other app namespaced keys
        localStorage.removeItem('koora_user');
        Object.keys(localStorage).forEach((k) => {
          if (k.startsWith('koora_')) {
            try { localStorage.removeItem(k); } catch {}
          }
        });
      } catch {}
      try { sessionStorage.clear(); } catch {}
      setUser(null);
      setRoleLoaded(true);
      // Hard redirect to home page
      if (typeof window !== 'undefined') {
        window.location.replace('/');
      }
    }
  }, []);

  const refresh = useCallback(async () => {
    await init();
  }, [init]);

  const updateUser = useCallback((patch: Partial<AppUser>) => {
    setUser(prev => {
      if (!prev) return prev;
      const merged = { ...prev, ...patch } as AppUser;
      safelyPersistUserToLocalStorage(merged);
      return merged;
    });
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
  }, [user, isAuthLoading, roleLoaded, login, register, logout, refresh, updateUser, loginWithEmail, signUp, resetPassword]);

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