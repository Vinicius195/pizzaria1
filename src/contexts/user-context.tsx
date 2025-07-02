'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { UserProfile, UserRole, UserStatus } from '@/types';

// Mock initial data. In a real app, this might be an empty array.
const initialUserProfiles: UserProfile[] = [
  { key: 'admin', name: 'Sérgio Lemos', email: 'sergio.lemos@belamassa.com', password: 'admin', role: 'Administrador', status: 'Aprovado', avatar: 'https://placehold.co/40x40.png', fallback: 'SL' },
  { key: 'employee1', name: 'Beatriz Costa', email: 'beatriz.costa@belamassa.com', password: 'func', role: 'Funcionário', status: 'Aprovado', avatar: 'https://placehold.co/40x40.png', fallback: 'BC' },
];


export type LoginResult = {
  success: boolean;
  message: string;
};

export type RegisterResult = {
    success: boolean;
    message: string;
};

interface UserContextType {
  currentUser: UserProfile | null;
  users: UserProfile[];
  login: (email: string, pass: string) => LoginResult;
  logout: () => void;
  registerUser: (details: Omit<UserProfile, 'key' | 'status' | 'avatar' | 'fallback'>) => RegisterResult;
  updateUserStatus: (key: string, status: UserStatus) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'pizzafast-users';
const CURRENT_USER_STORAGE_KEY = 'currentUserKey';

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUserKey, setCurrentUserKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
        const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
        if (storedUsers) {
            setUsers(JSON.parse(storedUsers));
        } else {
            // First time load, seed with initial data
            setUsers(initialUserProfiles);
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUserProfiles));
        }

        const storedUserKey = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
        if (storedUserKey) {
            setCurrentUserKey(storedUserKey);
        }
    } catch (error) {
        console.error("Could not access localStorage.", error);
        setUsers(initialUserProfiles); // fallback
    } finally {
        setIsLoading(false);
    }
  }, []);

  const saveUsers = (updatedUsers: UserProfile[]) => {
    setUsers(updatedUsers);
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    } catch (error) {
      console.error("Could not access localStorage.", error);
    }
  };

  const currentUser = currentUserKey ? users.find(u => u.key === currentUserKey) ?? null : null;

  const login = (email: string, pass: string): LoginResult => {
    const user = users.find(
      p => p.email.toLowerCase() === email.toLowerCase() && p.password === pass
    );

    if (!user) {
      return { success: false, message: "E-mail ou senha inválidos. Tente novamente." };
    }

    if (user.status === 'Pendente') {
        return { success: false, message: "Sua conta está pendente de aprovação." };
    }
    
    if (user.status === 'Reprovado') {
        return { success: false, message: "Sua conta foi reprovada. Entre em contato com o administrador." };
    }

    if (user.status === 'Aprovado') {
      setCurrentUserKey(user.key);
      try {
        localStorage.setItem(CURRENT_USER_STORAGE_KEY, user.key);
      } catch (error) {
        console.error("Could not access localStorage.", error);
      }
      return { success: true, message: "Login bem-sucedido!" };
    }

    return { success: false, message: "Ocorreu um erro desconhecido." };
  };
  
  const logout = () => {
    setCurrentUserKey(null);
    try {
        localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    } catch (error) {
        console.error("Could not access localStorage.", error);
    }
  };

  const registerUser = (details: Omit<UserProfile, 'key' | 'status' | 'avatar' | 'fallback'>): RegisterResult => {
      if (users.some(u => u.email.toLowerCase() === details.email.toLowerCase())) {
          return { success: false, message: 'Este e-mail já está cadastrado.' };
      }

      const adminExists = users.some(u => u.role === 'Administrador' && u.status === 'Aprovado');
      let newUserStatus: UserStatus = 'Pendente';
      let message = 'Cadastro realizado! Sua conta precisa ser aprovada por um administrador.';

      if (!adminExists && details.role === 'Administrador') {
          newUserStatus = 'Aprovado';
          message = 'Primeiro administrador cadastrado com sucesso! Você já pode fazer login.';
      }

      const fallback = details.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
      const newUser: UserProfile = {
          ...details,
          key: `user-${Date.now()}`,
          status: newUserStatus,
          avatar: 'https://placehold.co/40x40.png',
          fallback,
      };

      saveUsers([...users, newUser]);
      return { success: true, message };
  };

  const updateUserStatus = (key: string, status: UserStatus) => {
    const updatedUsers = users.map(user =>
      user.key === key ? { ...user, status } : user
    );
    saveUsers(updatedUsers);
  };

  return (
    <UserContext.Provider value={{ currentUser, users, login, logout, isLoading, registerUser, updateUserStatus }}>
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
