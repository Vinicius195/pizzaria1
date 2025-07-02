'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'Administrador' | 'Garçom' | 'Entregador';

export type UserProfile = {
  key: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  fallback: string;
};

export const userProfiles: Record<string, UserProfile> = {
  admin: { key: 'admin', name: 'Administrador', email: 'admin@pizzafast.com', role: 'Administrador', avatar: 'https://placehold.co/40x40.png', fallback: 'A' },
  waiter: { key: 'waiter', name: 'Garçom', email: 'garcom@pizzafast.com', role: 'Garçom', avatar: 'https://placehold.co/40x40.png', fallback: 'G' },
  delivery: { key: 'delivery', name: 'Entregador', email: 'entregador@pizzafast.com', role: 'Entregador', avatar: 'https://placehold.co/40x40.png', fallback: 'E' },
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
