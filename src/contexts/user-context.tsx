'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'Administrador' | 'Funcionário';

export type UserProfile = {
  key: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  fallback: string;
};

export const userProfiles: Record<string, UserProfile> = {
  admin: { key: 'admin', name: 'Sérgio Lemos', email: 'sergio.lemos@belamassa.com', role: 'Administrador', avatar: 'https://placehold.co/40x40.png', fallback: 'SL' },
  employee1: { key: 'employee1', name: 'Beatriz Costa', email: 'beatriz.costa@belamassa.com', role: 'Funcionário', avatar: 'https://placehold.co/40x40.png', fallback: 'BC' },
  employee2: { key: 'employee2', name: 'Ricardo Neves', email: 'ricardo.neves@belamassa.com', role: 'Funcionário', avatar: 'https://placehold.co/40x40.png', fallback: 'RN' },
};

interface UserContextType {
  currentUser: UserProfile;
  setCurrentUser: (userKey: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUserKey, setCurrentUserKey] = useState('admin');
  const currentUser = userProfiles[currentUserKey];

  const setCurrentUser = (userKey: string) => {
    if (userProfiles[userKey]) {
      setCurrentUserKey(userKey);
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
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
