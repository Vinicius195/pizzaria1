'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type UserRole = 'Administrador' | 'Funcionário';

export type UserProfile = {
  key: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar: string;
  fallback: string;
};

export const userProfiles: Record<string, UserProfile> = {
  admin: { key: 'admin', name: 'Sérgio Lemos', email: 'sergio.lemos@belamassa.com', password: 'admin', role: 'Administrador', avatar: 'https://placehold.co/40x40.png', fallback: 'SL' },
  employee1: { key: 'employee1', name: 'Beatriz Costa', email: 'beatriz.costa@belamassa.com', password: 'func', role: 'Funcionário', avatar: 'https://placehold.co/40x40.png', fallback: 'BC' },
  employee2: { key: 'employee2', name: 'Ricardo Neves', email: 'ricardo.neves@belamassa.com', password: 'func', role: 'Funcionário', avatar: 'https://placehold.co/40x40.png', fallback: 'RN' },
};

interface UserContextType {
  currentUser: UserProfile | null;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUserKey, setCurrentUserKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
        const storedUserKey = localStorage.getItem('currentUserKey');
        if (storedUserKey) {
            setCurrentUserKey(storedUserKey);
        }
    } catch (error) {
        console.error("Could not access localStorage.", error);
    } finally {
        setIsLoading(false);
    }
  }, []);
  
  const currentUser = currentUserKey ? userProfiles[currentUserKey] : null;

  const login = (email: string, pass: string): boolean => {
    const user = Object.values(userProfiles).find(
      p => p.email.toLowerCase() === email.toLowerCase() && p.password === pass
    );

    if (user) {
      setCurrentUserKey(user.key);
      try {
        localStorage.setItem('currentUserKey', user.key);
      } catch (error) {
        console.error("Could not access localStorage.", error);
      }
      return true;
    }
    return false;
  };
  
  const logout = () => {
    setCurrentUserKey(null);
    try {
        localStorage.removeItem('currentUserKey');
    } catch (error) {
        console.error("Could not access localStorage.", error);
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, login, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
