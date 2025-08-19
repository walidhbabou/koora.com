import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'author' | 'moderator';
  status: 'active' | 'inactive' | 'banned';
  joinDate: string;
  lastLogin: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  isEditor: boolean;
  isAuthor: boolean;
  login: (userData: User) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Mock users for demonstration
  const mockUsers: User[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'admin@koora.com',
      role: 'admin',
      status: 'active',
      joinDate: '2023-01-01',
      lastLogin: '2024-01-15',
      avatar: '/placeholder.svg'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'editor@koora.com',
      role: 'editor',
      status: 'active',
      joinDate: '2023-02-01',
      lastLogin: '2024-01-14',
      avatar: '/placeholder.svg'
    },
    {
      id: '3',
      name: 'Ahmed Hassan',
      email: 'author@koora.com',
      role: 'author',
      status: 'active',
      joinDate: '2023-03-15',
      lastLogin: '2024-01-13',
      avatar: '/placeholder.svg'
    },
    {
      id: '4',
      name: 'Sarah Wilson',
      email: 'moderator@koora.com',
      role: 'moderator',
      status: 'active',
      joinDate: '2023-04-10',
      lastLogin: '2024-01-12',
      avatar: '/placeholder.svg'
    }
  ];

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('koora_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('koora_user');
      }
    }
  }, []);

  const login = async (userData: User): Promise<boolean> => {
    try {
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('koora_user', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('koora_user');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('koora_user', JSON.stringify(updatedUser));
    }
  };

  const isAdmin = user?.role === 'admin';
  const isModerator = user?.role === 'moderator' || user?.role === 'admin';
  const isEditor = user?.role === 'editor' || user?.role === 'admin';
  const isAuthor = user?.role === 'author' || user?.role === 'editor' || user?.role === 'admin';

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isAdmin,
    isModerator,
    isEditor,
    isAuthor,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
